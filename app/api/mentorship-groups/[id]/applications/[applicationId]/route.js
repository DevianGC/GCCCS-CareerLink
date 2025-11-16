import { adminDb } from '../../../../../../lib/firebaseAdmin';
import { getAuthenticatedUser } from '../../../../../../lib/dbHelpers';
import admin from 'firebase-admin';

export async function PUT(req, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser(req, ['alumni']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Await params in Next.js 15
    const resolvedParams = await params;
    const { id, applicationId } = resolvedParams;
    const body = await req.json();

    // Verify group ownership
    const groupDoc = await adminDb.collection('mentorshipGroups').doc(id).get();
    if (!groupDoc.exists || groupDoc.data().alumniId !== user.uid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch application
    const applicationDoc = await adminDb.collection('mentorshipGroupApplications').doc(applicationId).get();
    if (!applicationDoc.exists) {
      return new Response(JSON.stringify({ error: 'Application not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const applicationData = applicationDoc.data();
    const newStatus = body.status; // 'accepted' or 'declined'

    if (!['accepted', 'declined'].includes(newStatus)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update application status
    await adminDb.collection('mentorshipGroupApplications').doc(applicationId).update({
      status: newStatus,
      respondedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // If accepted, add student to group members
    if (newStatus === 'accepted') {
      const memberData = {
        groupId: id,
        groupTitle: applicationData.groupTitle,
        studentId: applicationData.studentId,
        studentName: applicationData.studentName,
        studentEmail: applicationData.studentEmail,
        major: applicationData.major,
        yearLevel: applicationData.yearLevel,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      };

      await adminDb.collection('mentorshipGroupMembers').add(memberData);

      // Update current members count
      const membersSnapshot = await adminDb.collection('mentorshipGroupMembers')
        .where('groupId', '==', id)
        .where('status', '==', 'active')
        .get();
      
      await adminDb.collection('mentorshipGroups').doc(id).update({
        currentMembers: membersSnapshot.size
      });
    }
    
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return new Response(JSON.stringify({ error: 'Failed to update application' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
