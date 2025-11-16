import { adminDb, adminAuth } from './firebaseAdmin';
import { cookies } from 'next/headers';

/**
 * Get authenticated user from session cookie
 * @returns {Promise<{uid: string, email: string, role?: string} | null>}
 */
export async function getAuthenticatedUser() {
  try {
    const session = cookies().get('session')?.value;
    if (!session) return null;
    
    const decoded = await adminAuth.verifySessionCookie(session, false);
    return {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || decoded.customClaims?.role,
    };
  } catch {
    return null;
  }
}

/**
 * Check if user has admin/career office role
 * @param {Object} user - User object from getAuthenticatedUser
 * @returns {boolean}
 */
export function isAdmin(user) {
  return user?.role === 'career_office' || user?.role === 'admin';
}

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object | null>}
 */
export async function getUserProfile(uid) {
  try {
    const snap = await adminDb.collection('users').doc(uid).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

/**
 * Update or create user profile
 * @param {string} uid - User ID
 * @param {Object} data - Profile data
 * @returns {Promise<Object>}
 */
export async function upsertUserProfile(uid, data) {
  const now = new Date().toISOString();
  const updates = {
    ...data,
    uid,
    updatedAt: now,
  };
  
  // Set createdAt only on first creation
  const doc = await adminDb.collection('users').doc(uid).get();
  if (!doc.exists) {
    updates.createdAt = now;
  }
  
  await adminDb.collection('users').doc(uid).set(updates, { merge: true });
  return getUserProfile(uid);
}

/**
 * Build paginated query with cursor
 * @param {string} collectionName - Firestore collection name
 * @param {Object} options - Query options
 * @returns {Promise<{items: Array, nextCursor: string|null, hasMore: boolean}>}
 */
export async function paginatedQuery(collectionName, options = {}) {
  const {
    orderByField = 'createdAt',
    orderDirection = 'desc',
    limit = 50,
    cursor = null,
    filters = [], // Array of {field, operator, value}
  } = options;
  
  const maxLimit = Math.min(limit, 100);
  
  let query = adminDb.collection(collectionName);
  
  // Apply filters
  for (const filter of filters) {
    query = query.where(filter.field, filter.operator, filter.value);
  }
  
  // Apply ordering
  query = query.orderBy(orderByField, orderDirection);
  
  // Apply cursor
  if (cursor) {
    const cursorDoc = await adminDb.collection(collectionName).doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }
  
  // Fetch one extra to check if there are more results
  const snapshot = await query.limit(maxLimit + 1).get();
  const hasMore = snapshot.docs.length > maxLimit;
  const docs = snapshot.docs.slice(0, maxLimit);
  
  const items = docs.map(d => ({ id: d.id, ...d.data() }));
  const nextCursor = hasMore && docs.length > 0 ? docs[docs.length - 1].id : null;
  
  return { items, nextCursor, hasMore };
}

/**
 * Create standardized API response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
export function apiResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Response}
 */
export function apiError(message, status = 500, details = null) {
  const errorData = { error: message };
  if (details) {
    errorData.details = details;
  }
  return apiResponse(errorData, status);
}
