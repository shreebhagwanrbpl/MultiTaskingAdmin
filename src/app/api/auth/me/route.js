import { NextResponse } from 'next/server';
import { getUsersCollection, readLocalUsers } from '../../../../lib/auth';
import { getRoleById } from '../../../../data/roles';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const cookieToken = request.cookies.get('rbpl_auth_token')?.value;
    const token = authHeader.replace(/^Bearer\s+/i, '') || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'No active session token' },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    let payload = null;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      payload = JSON.parse(decoded);
    } catch (e) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Invalid token format' },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    if (!payload || !payload.id || (payload.exp && Date.now() > payload.exp)) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Session expired. Please log in again.' },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    let user = null;
    try {
      const collection = await getUsersCollection();
      if (collection) {
        user = await collection.findOne({
          $or: [
            { id: payload.id },
            { email: payload.email }
          ]
        });
      }
    } catch (e) {
      console.warn('MongoDB lookup in /me failed:', e.message);
    }

    if (!user) {
      const localUsers = readLocalUsers();
      user = localUsers.find(u => u.id === payload.id || (u.email && u.email === payload.email));
    }

    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'User profile no longer exists' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const roleDef = getRoleById(user.role || 'sales_executive');

    const userProfile = {
      id: String(user.id || user._id),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role || 'sales_executive',
      roleTitle: roleDef.name,
      roleShort: roleDef.shortTitle,
      roleBadge: roleDef.badge,
      district: user.district || 'Jaipur',
      state: user.state || 'Rajasthan',
      organization: user.organization || 'Raj Biosis Biomedical Division',
      designation: user.designation || roleDef.shortTitle,
      avatar: user.avatar || '👨‍⚕️'
    };

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: userProfile
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, authenticated: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

