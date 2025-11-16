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

    // Ensure user profile document exists/updated
    const uid = decoded.uid;
    if (profile && typeof profile === 'object') {
      const { firstName, lastName, email, role = 'student' } = profile;
      await adminDb.collection('users').doc(uid).set({
        uid,
        firstName: firstName || '',
        lastName: lastName || '',
        fullName: `${firstName || ''} ${lastName || ''}`.trim(),
        email: email || decoded.email || '',
        role,
        createdAt: decoded.auth_time ? new Date(decoded.auth_time * 1000).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE() {
  // Clear cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}


