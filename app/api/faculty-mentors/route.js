import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../lib/firebaseAdmin';
import { getAuthenticatedUser, isAdmin } from '../../../lib/dbHelpers';

// GET - Fetch all faculty mentors
export async function POST(req) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching faculty mentors for user:', user.uid, 'role:', user.role);

    // Allow students, faculty mentors, and admins to view faculty mentors
    const allowedRoles = ['student', 'faculty-mentor', 'career_office', 'admin'];
    if (!allowedRoles.includes(user.role)) {
      console.log('Unauthorized role:', user.role);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection('users')
      .where('role', '==', 'faculty-mentor')
      .get();

    console.log('Found faculty mentors:', snapshot.size);

    const mentors = snapshot.docs.map(doc => ({
      uid: doc.id,
      id: doc.id,
      ...doc.data()
    }));

    console.log('Returning mentors:', mentors.length);

    return NextResponse.json({ mentors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching faculty mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faculty mentors' },
      { status: 500 }
    );
  }
}

// POST - Create a new faculty mentor account
export async function POST(request) {
  let createdUserUid = null;
  
  try {
    const user = await getAuthenticatedUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      email,
      firstName,
      lastName,
      department,
      facultyId,
      phone,
      officeLocation,
      specialization,
      yearsOfExperience,
      bio,
      maxMenteesPerSemester,
      password
    } = data;

    // Validate required fields
    if (!email || !firstName || !lastName || !department || !facultyId || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      emailVerified: false
    });

    createdUserUid = userRecord.uid; // Store UID for rollback if needed

    // Create user profile in Firestore
    const profile = {
      uid: userRecord.uid,
      email,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      role: 'faculty-mentor',
      department,
      facultyId,
      phone: phone || '',
      officeLocation: officeLocation || '',
      specialization: specialization || '',
      yearsOfExperience: yearsOfExperience || '',
      bio: bio || '',
      maxMenteesPerSemester: maxMenteesPerSemester || 10,
      accountStatus: 'approved',
      initialPassword: password, // Store password for career office reference
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.uid
    };

    // Save to Firestore database
    await adminDb.collection('users').doc(userRecord.uid).set(profile);

    return NextResponse.json(
      {
        success: true,
        message: 'Faculty mentor account created successfully',
        mentor: profile
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating faculty mentor:', error);
    
    // Rollback: Delete the Auth user if Firestore save failed
    if (createdUserUid) {
      try {
        await adminAuth.deleteUser(createdUserUid);
        console.log('Rolled back: Deleted auth user after Firestore failure');
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }
    
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create faculty mentor account' },
      { status: 500 }
    );
  }
}
