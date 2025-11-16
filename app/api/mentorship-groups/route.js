import { adminDb } from '../../../lib/firebaseAdmin';
import { getAuthenticatedUser } from '../../../lib/dbHelpers';
import admin from 'firebase-admin';

export async function GET(req) {
  try {
    // Authenticate the request - allow students and alumni to view groups
    const { user, error } = await getAuthenticatedUser(req, ['student', 'alumni', 'career_office', 'admin']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { searchParams } = new URL(req.url);
    const alumniId = searchParams.get('alumniId');
    const myGroups = searchParams.get('myGroups') === 'true';

    let groupsQuery = adminDb.collection('mentorshipGroups');

    // If requesting own groups (for alumni)
    if (myGroups && user.role === 'alumni') {
      groupsQuery = groupsQuery.where('alumniId', '==', user.uid);
    } 
    // If filtering by specific alumni
    else if (alumniId) {
      groupsQuery = groupsQuery.where('alumniId', '==', alumniId);
    }
    // Otherwise, show only active groups
    else {
      groupsQuery = groupsQuery.where('status', '==', 'active');
    }

    const snapshot = await groupsQuery.get();
    
    const groups = await Promise.all(snapshot.docs.map(async (doc) => {
      const groupData = doc.data();
      
      // Count pending applications for this group
      const applicationsSnapshot = await adminDb.collection('mentorshipGroupApplications')
        .where('groupId', '==', doc.id)
        .where('status', '==', 'pending')
        .get();
      
      const pendingApplications = applicationsSnapshot.size;
      
      // Count current members
      const membersSnapshot = await adminDb.collection('mentorshipGroupMembers')
        .where('groupId', '==', doc.id)
        .where('status', '==', 'active')
        .get();
      
      const currentMembers = membersSnapshot.size;
      
      return {
        id: doc.id,
        ...groupData,
        pendingApplications,
        currentMembers
      };
    }));

    // Sort by createdAt on client side to avoid index requirements
    groups.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    return new Response(JSON.stringify({ groups }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching mentorship groups:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch mentorship groups' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req) {
  try {
    console.log('POST /api/mentorship-groups - Starting...');
    
    // Authenticate - only alumni can create groups
    const { user, error } = await getAuthenticatedUser(req, ['alumni']);
    
    console.log('Authentication result:', { user: user?.uid, role: user?.role, error });
    
    if (error) {
      console.error('Authentication error:', error);
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    console.log('Request body:', body);
    
    // Fetch alumni profile for name
    const alumniDoc = await adminDb.collection('users').doc(user.uid).get();
    const alumniData = alumniDoc.data();
    console.log('Alumni data fetched:', { exists: alumniDoc.exists, name: alumniData?.fullName });
    const alumniName = alumniData?.fullName || `${alumniData?.firstName || ''} ${alumniData?.lastName || ''}`.trim() || 'Alumni';
    
    const groupData = {
      title: body.title,
      description: body.description || '',
      category: body.category || 'General',
      alumniId: user.uid,
      alumniName: alumniName,
      alumniEmail: alumniData?.email || '',
      maxMembers: body.maxMembers || 10,
      currentMembers: 0,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await adminDb.collection('mentorshipGroups').add(groupData);
    
    console.log('Group created successfully:', docRef.id);
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: docRef.id,
      group: { id: docRef.id, ...groupData }
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating mentorship group:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'Failed to create mentorship group', details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
