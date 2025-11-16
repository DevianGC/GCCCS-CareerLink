import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';
import { getAuthenticatedUser, getUserProfile } from '../../../lib/dbHelpers';

// GET - Fetch mentorship requests (for faculty mentors and students)
export async function GET(req) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(user.uid);
    
    // Faculty mentors see requests assigned to them
    if (profile?.role === 'faculty-mentor') {
      const snapshot = await adminDb
        .collection('mentorshipRequests')
        .where('mentorId', '==', user.uid)
        .get();

      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return NextResponse.json({ requests }, { status: 200 });
    }

    // Students see their own requests
    if (profile?.role === 'student') {
      const snapshot = await adminDb
        .collection('mentorshipRequests')
        .where('studentId', '==', user.uid)
        .get();

      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return NextResponse.json({ requests }, { status: 200 });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentorship requests', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new mentorship request
export async function POST(req) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(user.uid);
    if (profile?.role !== 'student') {
      return NextResponse.json({ error: 'Only students can request mentorship' }, { status: 403 });
    }

    const data = await request.json();
    const { mentorId, topic, preferredDate, preferredTime, duration, sessionType, message } = data;

    if (!mentorId || !topic || !preferredDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify mentor exists
    const mentorProfile = await getUserProfile(mentorId);
    if (!mentorProfile || mentorProfile.role !== 'faculty-mentor') {
      return NextResponse.json({ error: 'Invalid mentor' }, { status: 400 });
    }

    // Create the request
    const requestData = {
      studentId: user.uid,
      studentName: profile.fullName || `${profile.firstName} ${profile.lastName}`,
      studentEmail: profile.email,
      studentIdNumber: profile.studentId || 'N/A',
      mentorId,
      mentorName: mentorProfile.fullName || `${mentorProfile.firstName} ${mentorProfile.lastName}`,
      mentorEmail: mentorProfile.email,
      topic,
      preferredDate,
      preferredTime: preferredTime || '',
      duration: duration || '1 hour',
      sessionType: sessionType || 'In-person',
      message: message || '',
      status: 'pending', // pending, approved, rejected, completed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('mentorshipRequests').add(requestData);

    return NextResponse.json(
      {
        success: true,
        message: 'Mentorship request sent successfully',
        requestId: docRef.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    return NextResponse.json(
      { error: 'Failed to create mentorship request' },
      { status: 500 }
    );
  }
}
