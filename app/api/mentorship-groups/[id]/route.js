import { adminDb } from '../../../../lib/firebaseAdmin';
import { getAuthenticatedUser } from '../../../../lib/dbHelpers';

export async function GET(req, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser(req, ['student', 'alumni', 'career_office', 'admin']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const groupDoc = await adminDb.collection('mentorshipGroups').doc(id).get();
    
    if (!groupDoc.exists) {
      return new Response(JSON.stringify({ error: 'Group not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const groupData = groupDoc.data();
    
    // Count members
    const membersSnapshot = await adminDb.collection('mentorshipGroupMembers')
      .where('groupId', '==', id)
      .where('status', '==', 'active')
      .get();
    
    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return new Response(JSON.stringify({ 
      group: {
        id: groupDoc.id,
        ...groupData,
        currentMembers: members.length,
        members
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch group' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(req, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser(req, ['alumni']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    // Verify ownership
    const groupDoc = await adminDb.collection('mentorshipGroups').doc(id).get();
    if (!groupDoc.exists) {
      return new Response(JSON.stringify({ error: 'Group not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (groupDoc.data().alumniId !== user.uid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateData = {
      title: body.title,
      description: body.description,
      category: body.category,
      maxMembers: body.maxMembers,
      status: body.status,
      updatedAt: new Date().toISOString()
    };

    await adminDb.collection('mentorshipGroups').doc(id).update(updateData);
    
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return new Response(JSON.stringify({ error: 'Failed to update group' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser(req, ['alumni']);
    
    if (error) {
      return new Response(JSON.stringify({ error }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Verify ownership
    const groupDoc = await adminDb.collection('mentorshipGroups').doc(id).get();
    if (!groupDoc.exists) {
      return new Response(JSON.stringify({ error: 'Group not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (groupDoc.data().alumniId !== user.uid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Soft delete - just set status to closed
    await adminDb.collection('mentorshipGroups').doc(id).update({
      status: 'closed',
      updatedAt: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete group' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
