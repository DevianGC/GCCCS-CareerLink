import { adminDb } from '../../../lib/firebaseAdmin';
import { getAuthenticatedUser } from '../../../lib/dbHelpers';

export async function GET(req) {
  try {
    // Authenticate the request
    const { user, error } = await getAuthenticatedUser(req, ['student', 'faculty-mentor', 'career_office', 'admin']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    // If studentId is provided, get specific student's OJT data
    // Otherwise, get current user's OJT data
    const targetUserId = studentId || user.uid;

    // Fetch OJT data from database
    const ojtSnapshot = await adminDb.collection('ojtRecords')
      .where('studentId', '==', targetUserId)
      .limit(1)
      .get();
    
    let ojtData = null;
    if (!ojtSnapshot.empty) {
      const doc = ojtSnapshot.docs[0];
      ojtData = {
        id: doc.id,
        ...doc.data()
      };
    }

    return new Response(JSON.stringify({ ojtData }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching OJT data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch OJT data' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req) {
  try {
    // Authenticate the request
    const { user, error } = await getAuthenticatedUser(req, ['student']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    
    const ojtData = {
      studentId: user.uid,
      status: body.status || 'Not Started',
      company: body.company || '',
      position: body.position || '',
      startDate: body.startDate || '',
      endDate: body.endDate || '',
      supervisor: body.supervisor || '',
      notes: body.notes || '',
      lastContact: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      createdAt: body.createdAt || new Date().toISOString()
    };

    // Check if student already has an OJT record
    const existingSnapshot = await adminDb.collection('ojtRecords')
      .where('studentId', '==', user.uid)
      .limit(1)
      .get();

    let docRef;
    if (!existingSnapshot.empty) {
      // Update existing record
      docRef = existingSnapshot.docs[0].ref;
      await docRef.update({
        ...ojtData,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new record
      docRef = await adminDb.collection('ojtRecords').add(ojtData);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: docRef.id 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving OJT data:', error);
    return new Response(JSON.stringify({ error: 'Failed to save OJT data' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(req) {
  return POST(req); // Reuse POST logic for updates
}
