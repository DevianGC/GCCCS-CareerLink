import { adminDb } from '../../../lib/firebaseAdmin';

export async function GET(req) {
  try {
    // Fetch career tips from database
    const tipsSnapshot = await adminDb.collection('careerTips')
      .orderBy('createdAt', 'desc')
      .get();
    
    const tips = tipsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return new Response(JSON.stringify({ tips }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching career tips:', error);
    
    // Return empty array instead of error to prevent page crashes
    return new Response(JSON.stringify({ tips: [] }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    const tipData = {
      title: body.title,
      category: body.category,
      author: body.author || 'Career Office',
      authorRole: body.authorRole || '',
      content: body.content,
      readTime: body.readTime || '5 min read',
      image: body.image || '',
      featured: body.featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('careerTips').add(tipData);
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: docRef.id 
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating career tip:', error);
    return new Response(JSON.stringify({ error: 'Failed to create career tip' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
