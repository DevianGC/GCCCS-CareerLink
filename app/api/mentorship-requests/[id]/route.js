import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { getAuthenticatedUser, getUserProfile } from '../../../../lib/dbHelpers';

// PUT - Update mentorship request status (approve/reject by mentor)
export async function PUT(req, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(user.uid);
    if (profile?.role !== 'faculty-mentor') {
      return NextResponse.json({ error: 'Only faculty mentors can update requests' }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();
    const { status, scheduledDate, scheduledTime, notes } = data;

    if (!status || !['approved', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid
    };

    if (status === 'approved' && scheduledDate) {
      updateData.scheduledDate = scheduledDate;
      updateData.scheduledTime = scheduledTime || '';
    }

    if (notes) {
      updateData.mentorNotes = notes;
    }

    await adminDb.collection('mentorshipRequests').doc(id).update(updateData);

    return NextResponse.json(
      { success: true, message: 'Request updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating mentorship request:', error);
    return NextResponse.json(
      { error: 'Failed to update mentorship request' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel mentorship request
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the request to verify ownership
    const doc = await adminDb.collection('mentorshipRequests').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const requestData = doc.data();
    
    // Only student who created it can delete
    if (requestData.studentId !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized to delete this request' }, { status: 403 });
    }

    await adminDb.collection('mentorshipRequests').doc(id).delete();

    return NextResponse.json(
      { success: true, message: 'Request cancelled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting mentorship request:', error);
    return NextResponse.json(
      { error: 'Failed to cancel mentorship request' },
      { status: 500 }
    );
  }
}
