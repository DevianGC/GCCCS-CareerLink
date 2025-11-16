import { adminDb } from '../../../../../lib/firebaseAdmin';
import { getAuthenticatedUser } from '../../../../../lib/dbHelpers';
import admin from 'firebase-admin';

export async function GET(req, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser(req, ['alumni', 'career_office', 'admin']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Verify group ownership for alumni
    if (user.role === 'alumni') {
      const groupDoc = await adminDb.collection('mentorshipGroups').doc(id).get();
      if (!groupDoc.exists || groupDoc.data().alumniId !== user.uid) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Fetch applications for this group
    const applicationsSnapshot = await adminDb.collection('mentorshipGroupApplications')
      .where('groupId', '==', id)
      .get();
    
    const applications = applicationsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        const dateA = a.appliedAt?.seconds ? new Date(a.appliedAt.seconds * 1000) : new Date(a.appliedAt || 0);
        const dateB = b.appliedAt?.seconds ? new Date(b.appliedAt.seconds * 1000) : new Date(b.appliedAt || 0);
        return dateB - dateA;
      });

    return new Response(JSON.stringify({ applications }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch applications' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser(req, ['student']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    // Check if group exists and is active
    const groupDoc = await adminDb.collection('mentorshipGroups').doc(id).get();
    if (!groupDoc.exists) {
      return new Response(JSON.stringify({ error: 'Group not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const groupData = groupDoc.data();
    if (groupData.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Group is not accepting applications' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if group is full
    const membersSnapshot = await adminDb.collection('mentorshipGroupMembers')
      .where('groupId', '==', id)
      .where('status', '==', 'active')
      .get();
    
    if (membersSnapshot.size >= groupData.maxMembers) {
      return new Response(JSON.stringify({ error: 'Group is full' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if student already applied or is a member
    const existingApplication = await adminDb.collection('mentorshipGroupApplications')
      .where('groupId', '==', id)
      .where('studentId', '==', user.uid)
      .where('status', 'in', ['pending', 'accepted'])
      .get();
    
    if (!existingApplication.empty) {
      return new Response(JSON.stringify({ error: 'You have already applied to this group' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch student profile
    const studentDoc = await adminDb.collection('users').doc(user.uid).get();
    const studentData = studentDoc.data();
    const studentName = studentData?.fullName || `${studentData?.firstName || ''} ${studentData?.lastName || ''}`.trim() || 'Student';

    const applicationData = {
      groupId: id,
      groupTitle: groupData.title,
      studentId: user.uid,
      studentName: studentName,
      studentEmail: studentData?.email || '',
      major: studentData?.program || studentData?.major || 'N/A',
      yearLevel: studentData?.yearLevel || studentData?.year || 'N/A',
      message: body.message || '',
      status: 'pending',
      appliedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await adminDb.collection('mentorshipGroupApplications').add(applicationData);
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: docRef.id 
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return new Response(JSON.stringify({ error: 'Failed to create application' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
