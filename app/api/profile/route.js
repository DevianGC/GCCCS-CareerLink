import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '../../../lib/firebaseAdmin';
import { z } from 'zod';

// Validation schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  degree: z.string().max(100).optional(),
  major: z.string().max(100).optional(),
  university: z.string().max(200).optional(),
  graduationDate: z.string().optional(),
  gpa: z.string().max(10).optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  bio: z.string().max(1000).optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  jobTypes: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  salary: z.string().optional(),
});

export async function GET() {
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
    const uid = decoded.uid;
    const snap = await adminDb.collection('users').doc(uid).get();
    
    if (!snap.exists) {
      return new Response(JSON.stringify({ 
        profile: { uid, email: decoded.email } 
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ profile: snap.data() }), { 
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
    const uid = decoded.uid;
    const body = await req.json();
    
    // Validate input
    const validatedData = updateProfileSchema.parse(body);
    
    // Build update object
    const update = { ...validatedData };
    
    if (update.firstName || update.lastName) {
      const first = update.firstName ?? '';
      const last = update.lastName ?? '';
      update.fullName = `${first} ${last}`.trim();
    }
    
    update.updatedAt = new Date().toISOString();
    
    await adminDb.collection('users').doc(uid).set({ 
      uid, 
      email: decoded.email, 
      ...update 
    }, { merge: true });
    
    const saved = await adminDb.collection('users').doc(uid).get();
    
    return new Response(JSON.stringify({ profile: saved.data() }), { 
      status: 200, 
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


