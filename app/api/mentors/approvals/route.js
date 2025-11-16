import { adminDb } from '../../../../lib/firebaseAdmin';
import { z } from 'zod';

// GET - Fetch all mentors grouped by status
export async function GET(req) {
  try {
    const usersRef = adminDb.collection('users');
    const mentorsSnapshot = await usersRef.where('role', '==', 'faculty-mentor').get();

    const pending = [];
    const approved = [];
    const rejected = [];

    mentorsSnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      const status = data.accountStatus || 'approved'; // Default to approved for existing mentors

      if (status === 'pending') {
        pending.push(data);
      } else if (status === 'approved') {
        approved.push(data);
      } else if (status === 'rejected') {
        rejected.push(data);
      }
    });

    return new Response(
      JSON.stringify({ pending, approved, rejected }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch mentors' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PUT - Approve or reject a mentor
export async function PUT(req) {
  try {
    const body = await req.json();
    
    const schema = z.object({
      mentorId: z.string(),
      action: z.enum(['approve', 'reject'])
    });

    const { mentorId, action } = schema.parse(body);

    const mentorRef = adminDb.collection('users').doc(mentorId);
    const mentorDoc = await mentorRef.get();

    if (!mentorDoc.exists) {
      return new Response(
        JSON.stringify({ error: 'Mentor not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updateData = {
      accountStatus: action === 'approve' ? 'approved' : 'rejected',
      updatedAt: new Date().toISOString()
    };

    if (action === 'approve') {
      updateData.approvedAt = new Date().toISOString();
    } else {
      updateData.rejectedAt = new Date().toISOString();
    }

    await mentorRef.update(updateData);

    // TODO: Send email notification to mentor about approval/rejection

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Mentor ${action}d successfully` 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating mentor status:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to update mentor status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
