import { adminDb } from '../../../../lib/firebaseAdmin';
import { getAuthenticatedUser } from '../../../../lib/dbHelpers';

export async function GET(req) {
  try {
    // Authenticate - only students can view their applications
    const { user, error } = await getAuthenticatedUser(req, ['student']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch all applications by this student
    const applicationsSnapshot = await adminDb.collection('mentorshipGroupApplications')
      .where('studentId', '==', user.uid)
      .get();

    const applications = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
      const appData = doc.data();
      
      // Fetch the group details
      const groupDoc = await adminDb.collection('mentorshipGroups').doc(appData.groupId).get();
      const groupData = groupDoc.exists ? groupDoc.data() : null;
      
      return {
        id: doc.id,
        ...appData,
        groupTitle: groupData?.title || 'Unknown Group',
        groupCategory: groupData?.category || '',
        alumniName: groupData?.alumniName || ''
      };
    }));

    // Sort by applied date
    applications.sort((a, b) => {
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
