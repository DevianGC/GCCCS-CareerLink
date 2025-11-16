import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '../../../../lib/firebaseAdmin';

const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(req) {
  try {
    const body = await req.json();
    const { idToken, profile } = body || {};
    if (!idToken) {
      return new Response(JSON.stringify({ error: 'Missing idToken' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    
    // Ensure user profile document exists/updated and get role
    const uid = decoded.uid;
    let userRole = 'student'; // default role
    
    if (profile && typeof profile === 'object') {
      userRole = profile.role || 'student';
      
      // Prepare the profile data, keeping all fields from registration
      const profileData = {
        uid,
        email: profile.email || decoded.email || '',
        role: userRole,
        createdAt: decoded.auth_time ? new Date(decoded.auth_time * 1000).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...profile // Spread all profile fields to preserve employer/student/faculty data
      };
      
      await adminDb.collection('users').doc(uid).set(profileData, { merge: true });
    } else {
      // Fetch existing role from Firestore
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (userDoc.exists) {
        userRole = userDoc.data()?.role || 'student';
      }
    }
    
    // Set custom claims with role
    await adminAuth.setCustomUserClaims(uid, { role: userRole });
    
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN_MS });

    // Set HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
      path: '/',
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Session creation error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE() {
  // Clear cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}


