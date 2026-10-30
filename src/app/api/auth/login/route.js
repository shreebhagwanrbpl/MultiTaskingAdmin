import { NextResponse } from 'next/server';
import { getUsersCollection, readLocalUsers, verifyPassword, generateSessionToken } from '../../../../lib/auth';
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
    const { identifier, email, phone, password } = body;

    const queryKey = (identifier || email || phone || '').trim().toLowerCase();
    const rawPass = (password || '').trim();

    if (!queryKey) {
      return NextResponse.json(
        { success: false, error: 'Email or Mobile number is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!rawPass) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    let foundUser = null;

    // Try MongoDB first
    try {
      const collection = await getUsersCollection();
      if (collection) {
        foundUser = await collection.findOne({
          $or: [
            { email: { $regex: new RegExp(`^${queryKey}$`, 'i') } },
            { phone: queryKey.replace(/[^0-9]/g, '') }
          ]
        });
      }
    } catch (e) {
      console.warn('MongoDB lookup failed, falling back to local users:', e.message);
    }

    // Fallback to local users
    if (!foundUser) {
      const localUsers = readLocalUsers();
      foundUser = localUsers.find(u => {
        const emailMatch = u.email && u.email.toLowerCase() === queryKey;
        const phoneMatch = u.phone && u.phone.replace(/[^0-9]/g, '') === queryKey.replace(/[^0-9]/g, '');
        return emailMatch || phoneMatch;
      });
    }

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: 'No account found with this Email or Phone number' },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Check account status if suspended
    if (foundUser.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended. Please contact HQ Admin.' },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    // Verify Password
    const isValid = verifyPassword(rawPass, foundUser.passwordHash, foundUser.passwordSalt);
    if (!isValid) {
      // Check if user was pre-seeded with plain password
      if (foundUser.password !== rawPass) {
        return NextResponse.json(
          { success: false, error: 'Incorrect password. Please try again.' },
          { status: 401, headers: CORS_HEADERS }
        );
      }
    }

    // Generate token
    const token = generateSessionToken(foundUser);
    const roleDef = getRoleById(foundUser.role || 'sales');

    // Safe user object to return
    const userProfile = {
      id: String(foundUser.id || foundUser._id),
      fullName: foundUser.fullName,
      email: foundUser.email,
      phone: foundUser.phone,
      role: roleDef.id,
      roleTitle: roleDef.name,
      roleShort: roleDef.shortTitle,
      roleBadge: roleDef.badge,
      state: foundUser.state || 'Rajasthan',
      organization: foundUser.organization || 'Raj Biosis Biomedical Division',
      designation: foundUser.designation || (roleDef.id === 'admin' ? 'Central Administrator' : 'Biomedical Sales Executive'),
      avatar: foundUser.avatar || (roleDef.id === 'admin' ? '👑' : '💼'),
      lastLoginAt: new Date().toISOString()
    };

    // Update lastLogin in background
    try {
      const col = await getUsersCollection();
      if (col && foundUser._id) {
        col.updateOne({ _id: foundUser._id }, { $set: { lastLoginAt: new Date().toISOString() } });
      }
    } catch (e) {
      // non-fatal
    }

    const response = NextResponse.json(
      {
        success: true,
        message: `Welcome back, ${userProfile.fullName}!`,
        user: userProfile,
        token
      },
      { status: 200, headers: CORS_HEADERS }
    );

    // Set cookie for session persistence
    response.cookies.set('rbpl_auth_token', token, {
      httpOnly: false, // accessible to client for instant hydrate
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

