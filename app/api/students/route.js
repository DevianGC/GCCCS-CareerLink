import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';
import { getAuthenticatedUser, getUserProfile } from '../../../lib/dbHelpers';

// GET - Fetch all students (for faculty mentors and career office)
export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser();
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const profile = await getUserProfile(user.uid);
    const userRole = profile?.role;

    // Only allow faculty mentors and career office to view students
    if (userRole !== 'faculty-mentor' && userRole !== 'career_office' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection('users')
      .where('role', '==', 'student')
      .get();

    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      uid: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
