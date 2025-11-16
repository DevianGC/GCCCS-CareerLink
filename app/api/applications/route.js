import { adminDb } from '../../../lib/firebaseAdmin';
import { cookies } from 'next/headers';
import { adminAuth } from '../../../lib/firebaseAdmin';
import { z } from 'zod';

// Validation schema for application creation
const createApplicationSchema = z.object({
  jobId: z.string().min(1),
  jobTitle: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  status: z.enum(['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected']).optional(),
  notes: z.string().optional(),
  resumeName: z.string().optional(),
  resumeData: z.string().optional(),
});

export async function GET(req) {
  try {
    // Get authenticated user from session
    const session = cookies().get('session')?.value;
    let userId = null;
    
    if (session) {
      try {
        const decoded = await adminAuth.verifySessionCookie(session, false);
        userId = decoded.uid;
      } catch {}
    }
    
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const cursor = searchParams.get('cursor');
    const status = searchParams.get('status');

    let query = adminDb.collection('applications');
    
    // Filter by user if authenticated (students see only their applications)
    if (userId) {
      query = adminDb.collection('applications').where('userId', '==', userId);
    }
    
    // Filter by status if provided
    if (status && ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'].includes(status)) {
      // Need to rebuild query with status filter
      if (userId) {
        query = adminDb.collection('applications')
          .where('userId', '==', userId)
          .where('status', '==', status);
      } else {
        query = adminDb.collection('applications')
          .where('status', '==', status);
      }
    }
    
    // Apply cursor for pagination
    if (cursor) {
      const cursorDoc = await adminDb.collection('applications').doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }
    
    const snapshot = await query.limit(limit + 1).get();
    const hasMore = snapshot.docs.length > limit;
    const apps = snapshot.docs.slice(0, limit).map(d => ({ 
      id: d.id, 
      ...d.data() 
    }));
    
    const nextCursor = hasMore ? snapshot.docs[limit - 1].id : null;
    
    return new Response(JSON.stringify({ 
      applications: apps, 
      nextCursor, 
      hasMore 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req) {
  try {
    // Get authenticated user from session
    const session = cookies().get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const decoded = await adminAuth.verifySessionCookie(session, false);
    const userId = decoded.uid;
    
    const body = await req.json();
    
    // Validate input
    const validatedData = createApplicationSchema.parse(body);
    
    // Use Firestore auto-generated ID
    const docRef = adminDb.collection('applications').doc();
    const now = new Date().toISOString();
    
    const newApp = {
      ...validatedData,
      userId,
      status: validatedData.status || 'Applied',
      date: now.split('T')[0],
      createdAt: now,
      updatedAt: now,
    };
    
    await docRef.set(newApp);
    
    return new Response(JSON.stringify({ id: docRef.id, ...newApp }), { 
      status: 201, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed', 
        details: err.errors 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}


// Optional bulk update/delete using body payload for convenience
export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const decoded = await adminAuth.verifySessionCookie(session, false);
    const userId = decoded.uid;
    
    const body = await req.json();
    const id = body?.id;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Verify ownership
    const docRef = adminDb.collection('applications').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Application not found' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const appData = doc.data();
    if (appData.userId !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const { jobTitle, company, status, notes } = body;
    const updates = { 
      ...(jobTitle !== undefined && { jobTitle }),
      ...(company !== undefined && { company }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      updatedAt: new Date().toISOString(),
    };
    
    await docRef.set(updates, { merge: true });
    const saved = await docRef.get();
    
    return new Response(JSON.stringify({ id, ...saved.data() }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function DELETE(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const decoded = await adminAuth.verifySessionCookie(session, false);
    const userId = decoded.uid;
    
    const body = await req.json().catch(() => ({}));
    const id = body?.id;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Verify ownership
    const docRef = adminDb.collection('applications').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Application not found' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const appData = doc.data();
    if (appData.userId !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    await docRef.delete();
    
    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}