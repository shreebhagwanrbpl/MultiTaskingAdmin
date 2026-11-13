import { NextResponse } from 'next/server';
import { getUsersCollection, readLocalUsers, writeLocalUsers } from '../../../../lib/auth';
import { getRoleById } from '../../../../data/roles';
import { findStateForDistrict } from '../../../../data/indianDistricts';
import { ObjectId } from 'mongodb';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  try {
    let users = [];

    try {
      const collection = await getUsersCollection();
      if (collection) {
        users = await collection.find({}).sort({ createdAt: -1 }).toArray();
      }
    } catch (e) {
      console.warn('MongoDB failed in /api/auth/users:', e.message);
    }

    if (users.length === 0) {
      users = readLocalUsers();
    }

    const now = Date.now();
    const sanitizedUsers = users.map(u => {
      const roleDef = getRoleById(u.role || 'sales');
      
      // Determine online/active status
      let isOnline = false;
      if (u.sessionStatus === 'active' && !u.isForceLoggedOut) {
        isOnline = true;
      } else if (u.lastLoginAt && !u.isForceLoggedOut) {
        const lastLoginTime = new Date(u.lastLoginAt).getTime();
        // If logged in within last 2 hours and not logged out
        if (now - lastLoginTime < 1000 * 60 * 60 * 2 && u.sessionStatus !== 'logged_out') {
          isOnline = true;
        }
      }

      return {
        id: String(u.id || u._id),
        _id: u._id ? String(u._id) : undefined,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.role || 'sales',
        roleTitle: roleDef.name,
        roleShort: roleDef.shortTitle,
        roleBadge: roleDef.badge,
        district: u.district || 'Jaipur',
        state: u.state || findStateForDistrict(u.district || 'Jaipur') || 'Rajasthan',
        organization: u.organization || 'Raj Biosis Biomedical Sales Network',
        designation: u.designation || roleDef.shortTitle,
        status: u.status || 'active',
        isOnline,
        sessionStatus: u.sessionStatus || (isOnline ? 'active' : 'offline'),
        isForceLoggedOut: Boolean(u.isForceLoggedOut),
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        lastLoggedOutAt: u.lastLoggedOutAt
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: sanitizedUsers.length,
        users: sanitizedUsers
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, role, district, state, designation, status, action, forceLogout } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updates = { updatedAt: new Date().toISOString() };

    // Case 1: Force Logout Action
    if (action === 'force_logout' || forceLogout) {
      updates.sessionStatus = 'logged_out';
      updates.isForceLoggedOut = true;
      updates.lastLoggedOutAt = new Date().toISOString();
    } else {
      // Case 2: Update role, state, etc.
      if (role) updates.role = role;
      if (state) {
        updates.state = state;
        updates.district = state;
      } else if (district) {
        updates.district = district;
        updates.state = findStateForDistrict(district) || district;
      }
      if (designation) updates.designation = designation;
      if (status) updates.status = status;
      if (action === 'reactivate') {
        updates.isForceLoggedOut = false;
        updates.sessionStatus = 'active';
      }
    }

    let updated = false;

    // MongoDB update
    try {
      const collection = await getUsersCollection();
      if (collection) {
        let query = { $or: [{ id: userId }, { email: userId }] };
        if (ObjectId.isValid(userId)) {
          query.$or.push({ _id: new ObjectId(userId) });
        }
        const res = await collection.updateOne(query, { $set: updates });
        if (res.matchedCount > 0) updated = true;
      }
    } catch (e) {
      console.warn('MongoDB update failed in PUT /api/auth/users:', e.message);
    }

    // Also update local cache
    const localUsers = readLocalUsers();
    const idx = localUsers.findIndex(u => u.id === userId || u.email === userId || String(u._id) === userId);
    if (idx !== -1) {
      localUsers[idx] = { ...localUsers[idx], ...updates };
      writeLocalUsers(localUsers);
      updated = true;
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'User not found in database or local cache' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: action === 'force_logout' ? 'User successfully force logged out' : 'User updated successfully',
        updates
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('id') || searchParams.get('userId');

    if (!userId) {
      try {
        const body = await request.json();
        userId = body.id || body.userId;
      } catch (e) {}
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required for deletion' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Protect master super admin from accidental deletion
    if (userId === 'usr_super_admin' || userId === 'admin@rajbiosis.com') {
      return NextResponse.json(
        { success: false, error: 'Primary Master Super Admin account cannot be deleted.' },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    let deletedCount = 0;

    // Delete from MongoDB
    try {
      const collection = await getUsersCollection();
      if (collection) {
        let query = { $or: [{ id: userId }, { email: userId }] };
        if (ObjectId.isValid(userId)) {
          query.$or.push({ _id: new ObjectId(userId) });
        }
        const res = await collection.deleteOne(query);
        deletedCount += res.deletedCount;
      }
    } catch (e) {
      console.warn('MongoDB delete failed in /api/auth/users:', e.message);
    }

    // Delete from local cache
    const localUsers = readLocalUsers();
    const initialLen = localUsers.length;
    const filtered = localUsers.filter(u => u.id !== userId && u.email !== userId && String(u._id) !== userId);
    if (filtered.length !== initialLen) {
      writeLocalUsers(filtered);
      deletedCount += (initialLen - filtered.length);
    }

    if (deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User account not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, message: 'User account permanently deleted successfully' },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
