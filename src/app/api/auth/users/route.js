import { NextResponse } from 'next/server';
import { getUsersCollection, readLocalUsers, writeLocalUsers } from '../../../../lib/auth';
import { getRoleById } from '../../../../data/roles';
import { findStateForDistrict } from '../../../../data/indianDistricts';

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

    const sanitizedUsers = users.map(u => {
      const roleDef = getRoleById(u.role || 'sales_executive');
      return {
        id: String(u.id || u._id),
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.role || 'sales_executive',
        roleTitle: roleDef.name,
        roleShort: roleDef.shortTitle,
        roleBadge: roleDef.badge,
        district: u.district || 'Jaipur',
        state: u.state || findStateForDistrict(u.district || 'Jaipur'),
        organization: u.organization || 'Raj Biosis',
        designation: u.designation || roleDef.shortTitle,
        status: u.status || 'active',
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt
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
    const { userId, role, district, state, designation, status } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updates = { updatedAt: new Date().toISOString() };
    if (role) updates.role = role;
    if (district) {
      updates.district = district;
      updates.state = state || findStateForDistrict(district);
    }
    if (designation) updates.designation = designation;
    if (status) updates.status = status;

    let updated = false;

    try {
      const collection = await getUsersCollection();
      if (collection) {
        const res = await collection.updateOne(
          { $or: [{ id: userId }, { email: userId }] },
          { $set: updates }
        );
        if (res.matchedCount > 0) updated = true;
      }
    } catch (e) {
      console.warn('MongoDB update failed:', e.message);
    }

    // Also update local cache
    const localUsers = readLocalUsers();
    const idx = localUsers.findIndex(u => u.id === userId || u.email === userId);
    if (idx !== -1) {
      localUsers[idx] = { ...localUsers[idx], ...updates };
      writeLocalUsers(localUsers);
      updated = true;
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, message: 'User updated successfully', updates },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

