import { NextResponse } from 'next/server';
import { getUsersCollection, readLocalUsers, writeLocalUsers, hashPassword, generateSessionToken } from '../../../../lib/auth';
import { getRoleById } from '../../../../data/roles';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      password,
      role = 'sales',
      state = 'Rajasthan',
      district,
      organization = 'Raj Biosis Biomedical Sales Network',
      designation
    } = body;

    // Validation
    const cleanName = (fullName || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const cleanPassword = (password || '').trim();
    const resolvedState = (state || 'Rajasthan').trim();
    const cleanDistrict = district ? district.trim() : resolvedState;

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full name is required (minimum 2 characters)' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid official email address' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!resolvedState) {
      return NextResponse.json(
        { success: false, error: 'Please select an assigned state territory' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Check if user already exists
    let existingUser = null;
    let collection = null;

    try {
      collection = await getUsersCollection();
      if (collection) {
        existingUser = await collection.findOne({
          $or: [
            { email: cleanEmail },
            { phone: cleanPhone }
          ]
        });
      }
    } catch (e) {
      console.warn('MongoDB check failed in signup:', e.message);
    }

    if (!existingUser) {
      const localUsers = readLocalUsers();
      existingUser = localUsers.find(u =>
        (u.email && u.email.toLowerCase() === cleanEmail) ||
        (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone)
      );
    }

    if (existingUser) {
      const isEmailDup = existingUser.email && existingUser.email.toLowerCase() === cleanEmail;
      return NextResponse.json(
        {
          success: false,
          error: isEmailDup
            ? `An account with email "${cleanEmail}" already exists. Please sign in.`
            : `An account with mobile number "${cleanPhone}" is already registered.`
        },
        { status: 409, headers: CORS_HEADERS }
      );
    }

    // Role definition (Admin or Sales)
    const roleDef = getRoleById(role);

    // Hash password
    const { hash, salt } = hashPassword(cleanPassword);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newUserDoc = {
      id: userId,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash: hash,
      passwordSalt: salt,
      role: roleDef.id,
      state: resolvedState,
      district: cleanDistrict,
      organization: organization.trim() || 'Raj Biosis Biomedical Sales Network',
      designation: designation ? designation.trim() : (roleDef.id === 'admin' ? 'Central Administrator' : 'Biomedical Sales Executive'),
      avatar: roleDef.id === 'admin' ? '👑' : '💼',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to MongoDB
    let savedToMongo = false;
    if (collection) {
      try {
        const result = await collection.insertOne(newUserDoc);
        if (result.acknowledged) {
          savedToMongo = true;
        }
      } catch (err) {
        console.warn('Failed to insert user into MongoDB, saving to local:', err.message);
      }
    }

    // Always sync with local persistent fallback
    const localUsers = readLocalUsers();
    localUsers.push(newUserDoc);
    writeLocalUsers(localUsers);

    // Generate session token
    const token = generateSessionToken(newUserDoc);

    const userProfile = {
      id: userId,
      fullName: newUserDoc.fullName,
      email: newUserDoc.email,
      phone: newUserDoc.phone,
      role: newUserDoc.role,
      roleTitle: roleDef.name,
      roleShort: roleDef.shortTitle,
      roleBadge: roleDef.badge,
      state: newUserDoc.state,
      district: newUserDoc.district,
      organization: newUserDoc.organization,
      designation: newUserDoc.designation,
      avatar: newUserDoc.avatar,
      createdAt: newUserDoc.createdAt
    };

    const response = NextResponse.json(
      {
        success: true,
        message: `Account created successfully! Welcome, ${userProfile.fullName}.`,
        user: userProfile,
        token,
        savedTo: savedToMongo ? 'mongodb' : 'local_storage'
      },
      { status: 201, headers: CORS_HEADERS }
    );

    // Set cookie
    response.cookies.set('rbpl_auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create user account' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
