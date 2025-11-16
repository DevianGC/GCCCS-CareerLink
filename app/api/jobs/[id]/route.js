import { adminDb } from '../../../../lib/firebaseAdmin';
import { z } from 'zod';

// Validation schema for job updates
const updateJobSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  company: z.string().min(1).max(200).optional(),
  location: z.string().min(1).max(200).optional(),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']).optional(),
  salary: z.string().optional(),
  deadline: z.string().optional(),
  description: z.string().min(1).optional(),
  requirements: z.union([z.string(), z.array(z.string())]).optional(),
  featured: z.boolean().optional(),
  status: z.enum(['Active', 'Closed', 'Draft']).optional(),
  applications: z.number().optional(),
});

export async function GET(req, { params }) {
  try {
    const id = params.id;
    const doc = await adminDb.collection('jobs').doc(id).get();
    
    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ id: doc.id, ...doc.data() }), { 
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

export async function PATCH(req, { params }) {
  try {
    const id = params.id;
    const body = await req.json();
    
    // Validate input
    const validatedData = updateJobSchema.parse(body);
    
    const docRef = adminDb.collection('jobs').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const updates = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    await docRef.set(updates, { merge: true });
    const updated = await docRef.get();
    
    return new Response(JSON.stringify({ id: doc.id, ...updated.data() }), { 
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

export async function DELETE(req, { params }) {
  try {
    const id = params.id;
    const docRef = adminDb.collection('jobs').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    await docRef.delete();
    
    return new Response(JSON.stringify({ success: true }), { 
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
