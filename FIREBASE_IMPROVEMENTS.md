# Firebase Architecture Improvements

This document outlines the improvements made to the Firebase integration in the 3rdPresentation project.

## Changes Made

### 1. **Input Validation with Zod**
- Added `zod` library for runtime schema validation
- Created validation schemas for:
  - Job creation and updates (`/api/jobs`)
  - Application creation (`/api/applications`)
  - Profile updates (`/api/profile`)
- All API endpoints now validate input and return detailed error messages for invalid data

### 2. **Pagination Support**
- Implemented cursor-based pagination for list endpoints:
  - `GET /api/jobs?limit=50&cursor=<docId>&status=Active`
  - `GET /api/applications?limit=50&cursor=<docId>&status=Applied`
- Responses now include:
  - `items` or `jobs`/`applications`: Array of results
  - `nextCursor`: ID of last document (for next page)
  - `hasMore`: Boolean indicating if more results exist
- Maximum limit enforced at 100 items per request
- Prevents unbounded queries that would become expensive at scale

### 3. **Firestore Auto-Generated IDs**
- Replaced unsafe sequential numeric ID generation with Firestore auto-IDs
- Old approach had race condition risks and required querying for max ID
- New approach:
  - Jobs: Use `adminDb.collection('jobs').doc()` for auto-ID
  - Applications: Use `adminDb.collection('applications').doc()` for auto-ID
- Document IDs are now strings (Firestore standard) instead of numbers
- Added `createdAt` and `updatedAt` timestamps to all documents

### 4. **Enhanced Security Rules**
- Comprehensive Firestore security rules added:
  - **Users**: Users can read/write their own profile; admins can read all
  - **Jobs**: Public read for active jobs; admin-only create/update/delete
  - **Applications**: Users can only access their own applications; admins can read all
- Helper functions in rules for role checking:
  - `isAuthenticated()`: Check if user is logged in
  - `isOwner(userId)`: Check if user owns the resource
  - `hasRole(role)`: Check user's custom claim role
  - `isAdmin()`: Check if user is career_office or admin

### 5. **Authorization in API Routes**
- Added user authentication checks to protected endpoints
- Applications endpoints now:
  - Require session cookie for all operations
  - Filter by `userId` to show only user's own applications
  - Verify ownership before update/delete operations
- Profile endpoints require valid session
- Job endpoints can be called by admins (future: add admin check)

### 6. **Firestore Indexes**
- Created composite indexes for common queries:
  - Jobs by status + createdAt
  - Applications by userId + createdAt
  - Applications by userId + status + createdAt
  - Applications by status + createdAt
- Prevents slow queries and runtime index creation errors

### 7. **Shared Helper Utilities** (`lib/dbHelpers.js`)
- `getAuthenticatedUser()`: Extract user from session cookie
- `isAdmin(user)`: Check if user has admin role
- `getUserProfile(uid)`: Fetch user profile from Firestore
- `upsertUserProfile(uid, data)`: Create or update user profile
- `paginatedQuery(collection, options)`: Generic pagination helper
- `apiResponse(data, status)`: Standardized JSON responses
- `apiError(message, status, details)`: Standardized error responses

## API Changes

### Jobs API (`/api/jobs`)

**GET /api/jobs**
```javascript
// Request
GET /api/jobs?limit=20&cursor=abc123&status=Active

// Response
{
  "jobs": [...],
  "nextCursor": "xyz789",
  "hasMore": true
}
```

**POST /api/jobs**
```javascript
// Request body (validated with zod)
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Remote",
  "type": "Full-time",
  "salary": "$100k-$150k",
  "description": "...",
  "status": "Active"
}

// Response (201 Created)
{
  "id": "auto-generated-id",
  "title": "Software Engineer",
  ...
  "createdAt": "2025-11-15T10:30:00.000Z",
  "updatedAt": "2025-11-15T10:30:00.000Z"
}
```

### Applications API (`/api/applications`)

**GET /api/applications**
```javascript
// Request (requires session cookie)
GET /api/applications?limit=20&cursor=abc123&status=Interview

// Response (filtered by authenticated user)
{
  "applications": [...],
  "nextCursor": "xyz789",
  "hasMore": true
}
```

**POST /api/applications**
```javascript
// Request (requires session cookie)
{
  "jobId": "job-doc-id",
  "jobTitle": "Software Engineer",
  "company": "Tech Corp",
  "status": "Applied"
}

// Response (userId automatically added from session)
{
  "id": "auto-generated-id",
  "userId": "user-uid-from-session",
  "jobId": "job-doc-id",
  ...
  "createdAt": "2025-11-15T10:30:00.000Z"
}
```

**PUT /api/applications**
- Requires session cookie
- Verifies user owns the application before updating
- Returns 403 Forbidden if ownership check fails

**DELETE /api/applications**
- Requires session cookie
- Verifies user owns the application before deleting
- Returns 403 Forbidden if ownership check fails

### Profile API (`/api/profile`)

**GET /api/profile**
- Returns authenticated user's profile
- Requires session cookie

**PUT /api/profile**
- Updates authenticated user's profile
- Input validated with zod
- Automatically updates `fullName` if firstName/lastName changed

## Firestore Collections Structure

### `users/{uid}`
```javascript
{
  uid: string,
  email: string,
  role: string, // 'student', 'alumni', 'employer', 'career_office', 'faculty_mentor'
  firstName: string,
  lastName: string,
  fullName: string,
  phone?: string,
  // ... other profile fields
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

### `jobs/{autoId}`
```javascript
{
  title: string,
  company: string,
  location: string,
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship',
  salary?: string,
  description: string,
  requirements?: string | string[],
  status: 'Active' | 'Closed' | 'Draft',
  featured: boolean,
  posted: string (date),
  deadline?: string,
  applications: number,
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

### `applications/{autoId}`
```javascript
{
  userId: string,
  jobId: string,
  jobTitle: string,
  company: string,
  status: 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected',
  date: string (date),
  notes?: string,
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

## Deployment Checklist

1. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Firestore Indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Environment Variables**
   Ensure the following are set in your production environment:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (store securely in secret manager)

4. **Update Frontend Code**
   Frontend components currently expect numeric IDs and arrays without pagination. Update:
   - Job listing components to use new pagination format
   - Application tracking to use string IDs
   - Forms to handle validation errors from API

## Migration Notes

### Existing Data Migration
If you have existing data with numeric IDs:

1. **Option A: Keep existing data, new data uses auto-IDs**
   - Old documents will work (IDs are strings like "1", "2")
   - New documents will have auto-generated IDs
   - Update frontend to handle both formats

2. **Option B: Migrate existing data**
   - Create a migration script to copy old docs to new auto-ID docs
   - Delete old numeric-ID documents
   - Update all references

### Frontend Updates Required
- Update job/application list components to handle pagination
- Change ID handling from numbers to strings
- Add "Load More" or infinite scroll UI for paginated lists
- Handle validation errors from API (display `error.details`)

## Security Best Practices

✅ **Implemented:**
- Input validation on all write endpoints
- Session-based authentication
- Ownership checks before update/delete
- Firestore security rules for client SDK access
- Role-based access control (RBAC) in rules

🔄 **Recommended Next Steps:**
- Add rate limiting to prevent abuse
- Implement CSRF token validation for state-changing operations
- Add request logging and monitoring
- Set up alerts for failed authentication attempts
- Rotate Firebase service account credentials periodically
- Add field-level encryption for sensitive data (SSN, etc.)

## Performance Improvements

✅ **Implemented:**
- Cursor-based pagination (reduces query cost)
- Composite indexes for filtered queries
- Auto-generated IDs (no max-ID lookup needed)
- Proper timestamps for sorting

🔄 **Future Optimizations:**
- Add caching layer (Redis) for frequently accessed data
- Implement real-time listeners (`onSnapshot`) for dashboard updates
- Use Firestore bundles for initial data loading
- Add CDN caching for public job listings
- Consider Algolia/Typesense for full-text job search

## Testing

Run the API endpoints:

```bash
# Get jobs (paginated)
curl http://localhost:3000/api/jobs?limit=10

# Create a job (requires admin session)
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job",
    "company": "Test Corp",
    "location": "Remote",
    "type": "Full-time",
    "description": "Test description"
  }'

# Get applications (requires session)
curl http://localhost:3000/api/applications \
  -H "Cookie: session=<your-session-cookie>"
```

## Questions or Issues?

If you encounter any issues with the new implementation:
1. Check browser console for detailed error messages
2. Verify Firestore rules are deployed
3. Ensure indexes are created (Firebase will show link in error if missing)
4. Check that session cookies are being set correctly
5. Validate input matches zod schemas
