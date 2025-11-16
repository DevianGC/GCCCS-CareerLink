import { adminAuth, adminDb } from '../../../../lib/firebaseAdmin';

// Dev-only endpoint to create/register an admin (career office) user
export async function POST(req) {
  try {
    // Restrict to development unless explicitly allowed via header secret
    const isDev = process.env.NODE_ENV !== 'production';
    const secretHeader = req.headers.get('x-admin-setup-secret');
    const allowInProd = secretHeader && secretHeader === process.env.ADMIN_SETUP_SECRET;
    if (!isDev && !allowInProd) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}));
    const email = (body.email || 'Admin@gmail.com').trim();
    const password = body.password || 'Admin123';
    const role = 'career_office';

    // Try to find user by email; create if not exists
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (_) {
      userRecord = await adminAuth.createUser({ email, password, displayName: 'Admin User', emailVerified: true, disabled: false });
    }

    // Ensure custom claims include role
    const existingClaims = userRecord.customClaims || {};
    if (existingClaims.role !== role) {
      await adminAuth.setCustomUserClaims(userRecord.uid, { ...existingClaims, role });
      // Fetch updated user
      userRecord = await adminAuth.getUser(userRecord.uid);
    }

    // Upsert Firestore profile document
    const nowIso = new Date().toISOString();
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      role,
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      updatedAt: nowIso,
      createdAt: nowIso,
    }, { merge: true });

    return new Response(
      JSON.stringify({
        ok: true,
        uid: userRecord.uid,
        email: userRecord.email,
        role,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}


