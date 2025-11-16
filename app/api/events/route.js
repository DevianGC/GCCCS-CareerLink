import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';
import { z } from 'zod';

// Validation schema for event creation
const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  organizer: z.string().min(1).max(200),
  date: z.string().min(1),
  time: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().min(1).max(200),
  type: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional(),
  status: z.enum(['active', 'inactive', 'cancelled', 'Draft', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled']).optional(),
  capacity: z.number().optional(),
  registrations: z.number().optional(),
  featured: z.boolean().optional(),
});

// GET - Fetch all events from Firestore
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const cursor = searchParams.get('cursor');
    
    let query = adminDb.collection('events');
    
    // Filter by status if provided
    if (status) {
      query = adminDb.collection('events').where('status', '==', status);
    }
    
    // Apply cursor for pagination
    if (cursor) {
      const cursorDoc = await adminDb.collection('events').doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }
    
    const snapshot = await query.limit(limit + 1).get();
    const hasMore = snapshot.docs.length > limit;
    const events = snapshot.docs.slice(0, limit).map(d => ({ 
      id: d.id, 
      ...d.data() 
    }));
    
    const nextCursor = hasMore ? snapshot.docs[limit - 1].id : null;
    
    return NextResponse.json({
      success: true,
      data: events,
      total: events.length,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Create new event (Admin only)
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createEventSchema.parse(body);
    
    // Use Firestore auto-generated ID
    const docRef = adminDb.collection('events').doc();
    const now = new Date().toISOString();
    
    const newEvent = {
      ...validatedData,
      status: validatedData.status || 'active',
      featured: validatedData.featured || false,
      capacity: validatedData.capacity || 0,
      registrations: validatedData.registrations || 0,
      createdAt: now,
      updatedAt: now,
    };
    
    await docRef.set(newEvent);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newEvent },
      message: 'Event created successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PUT - Update event (Admin only)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    const docRef = adminDb.collection('events').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Update event
    const updatedEvent = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    await docRef.update(updatedEvent);
    
    return NextResponse.json({
      success: true,
      data: { id, ...doc.data(), ...updatedEvent },
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Delete event (Admin only)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    const docRef = adminDb.collection('events').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Delete event
    await docRef.delete();
    
    return NextResponse.json({
      success: true,
      data: { id, ...doc.data() },
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
