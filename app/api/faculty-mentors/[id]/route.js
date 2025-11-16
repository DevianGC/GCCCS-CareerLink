import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../../lib/firebaseAdmin';
import { getAuthenticatedUser, isAdmin } from '../../../../lib/dbHelpers';

// PUT - Update faculty mentor
export async function PUT(request, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user || !isAdmin(user)) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Update Firestore profile
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid
    };

    // Update full name if first or last name changed
    if (data.firstName || data.lastName) {
      const docRef = adminDb.collection('users').doc(id);
      const doc = await docRef.get();
      const currentData = doc.data();
      
      const firstName = data.firstName || currentData.firstName;
      const lastName = data.lastName || currentData.lastName;
      updateData.fullName = `${firstName} ${lastName}`;
    }

    // If password is being updated, store it
    if (data.password) {
      updateData.initialPassword = data.password;
    }

    await adminDb.collection('users').doc(id).update(updateData);

    // Prepare Auth updates
    const authUpdates = {};
    
    // Update email in Firebase Auth if changed
    if (data.email) {
      authUpdates.email = data.email;
    }
    
    // Update password in Firebase Auth if provided
    if (data.password) {
      authUpdates.password = data.password;
    }
    
    // Update display name if name changed
    if (updateData.fullName) {
      authUpdates.displayName = updateData.fullName;
    }

    // Apply auth updates if any
    if (Object.keys(authUpdates).length > 0) {
      await adminAuth.updateUser(id, authUpdates);
    }

    return NextResponse.json(
      { success: true, message: 'Faculty mentor updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating faculty mentor:', error);
    return NextResponse.json(
      { error: 'Failed to update faculty mentor' },
      { status: 500 }
    );
  }
}

// DELETE - Delete faculty mentor
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Delete from Firebase Auth
    await adminAuth.deleteUser(id);

    // Delete from Firestore
    await adminDb.collection('users').doc(id).delete();

    return NextResponse.json(
      { success: true, message: 'Faculty mentor deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting faculty mentor:', error);
    return NextResponse.json(
      { error: 'Failed to delete faculty mentor' },
      { status: 500 }
    );
  }
}
