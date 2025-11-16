import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '../../../lib/firebaseAdmin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    
    if (!session) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoded = await adminAuth.verifySessionCookie(session, false);
    const uid = decoded.uid;
    
    // Get user profile from Firestore
    const snap = await adminDb.collection('users').doc(uid).get();
    const profile = snap.exists ? snap.data() : null;
    
    return new Response(JSON.stringify({
      user: {
        uid: decoded.uid,
        email: decoded.email,
        role: profile?.role || decoded.customClaims?.role || 'student',
        ...profile,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
