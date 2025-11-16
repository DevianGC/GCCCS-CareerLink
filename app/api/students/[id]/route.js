import { adminDb } from '../../../../lib/firebaseAdmin';
import { getAuthenticatedUser } from '../../../../lib/dbHelpers';

export async function GET(req, { params }) {
  try {
    // Authenticate the request
    const { user, error } = await getAuthenticatedUser(req, ['faculty-mentor', 'career_office', 'admin']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    // Fetch student from database
    const userDoc = await adminDb.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return new Response(JSON.stringify({ error: 'Student not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userData = userDoc.data();
    
    // Verify this is a student
    if (userData.role !== 'student') {
      return new Response(JSON.stringify({ error: 'User is not a student' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const student = {
      id: userDoc.id,
      uid: userDoc.id,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      fullName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      role: userData.role,
      studentId: userData.studentId || '',
      program: userData.program || '',
      yearLevel: userData.yearLevel || '',
      contactNumber: userData.contactNumber || '',
      createdAt: userData.createdAt || null
    };

    return new Response(JSON.stringify({ student }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch student' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
