'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './sessions.module.css';

export default function MentorshipSessions() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveForm, setApproveForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mentorship-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setApproveForm({
      scheduledDate: request.preferredDate || '',
      scheduledTime: request.preferredTime || '',
      notes: ''
    });
    setShowApproveModal(true);
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm('Are you sure you want to reject this request?')) return;

    try {
      const response = await fetch(`/api/mentorship-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        alert('Request rejected');
        fetchRequests();
      } else {
        alert('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('An error occurred');
    }
  };

  const handleSubmitApproval = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/mentorship-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          ...approveForm
        })
      });

      if (response.ok) {
        alert('Request approved successfully!');
        setShowApproveModal(false);
        fetchRequests();
      } else {
        alert('Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('An error occurred');
    }
  };

  const handleCompleteRequest = async (requestId) => {
    const notes = prompt('Add session notes (optional):');
    const feedback = prompt('Add feedback for student (optional):');

    try {
      const response = await fetch(`/api/mentorship-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          completionNotes: notes || '',
          feedback: feedback || 'Session completed successfully.'
        })
      });

      if (response.ok) {
        alert('Session marked as completed!');
        fetchRequests();
      } else {
        alert('Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      alert('An error occurred');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(`/api/mentorship-requests/${requestId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Request deleted successfully');
        fetchRequests();
      } else {
        alert('Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('An error occurred');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', color: '#ffc107' },
      approved: { text: 'Approved', color: '#28a745' },
      rejected: { text: 'Rejected', color: '#dc3545' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span style={{ 
        padding: '4px 12px', 
        borderRadius: '12px', 
        backgroundColor: badge.color,
        color: 'white',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <DashboardLayout userType="faculty-mentor">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Mentorship Sessions</h1>
            <p>Manage mentorship requests and track your sessions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'approved' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved Sessions ({approvedRequests.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({completedRequests.length})
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <>
              {/* Pending Requests */}
              {activeTab === 'requests' && (
                <div className={styles.requestsList}>
                  {pendingRequests.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No pending requests</p>
                    </div>
                  ) : (
                    pendingRequests.map((request) => (
                      <div key={request.id} className={styles.requestCard}>
                        <div className={styles.requestHeader}>
                          <div>
                            <h3>{request.studentName}</h3>
                            <span className={styles.studentId}>ID: {request.studentIdNumber}</span>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className={styles.requestBody}>
                          <div className={styles.requestField}>
                            <strong>Topic:</strong>
                            <p>{request.topic}</p>
                          </div>

                          <div className={styles.requestField}>
                            <strong>Preferred Date & Time:</strong>
                            <p>{formatDate(request.preferredDate)} at {request.preferredTime || 'Not specified'}</p>
                          </div>

                          <div className={styles.requestField}>
                            <strong>Duration:</strong>
                            <p>{request.duration}</p>
                          </div>

                          <div className={styles.requestField}>
                            <strong>Session Type:</strong>
                            <p>{request.sessionType}</p>
                          </div>

                          {request.message && (
                            <div className={styles.requestField}>
                              <strong>Message:</strong>
                              <p>{request.message}</p>
                            </div>
                          )}

                          <div className={styles.requestField}>
                            <strong>Requested on:</strong>
                            <p>{formatDate(request.createdAt)}</p>
                          </div>
                        </div>

                        <div className={styles.requestActions}>
                          <button 
                            className={styles.approveBtn}
                            onClick={() => handleApproveRequest(request)}
                          >
                            Approve
                          </button>
                          <button 
                            className={styles.rejectBtn}
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Approved Sessions */}
              {activeTab === 'approved' && (
                <div className={styles.sessionsList}>
                  {approvedRequests.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No approved sessions</p>
                    </div>
                  ) : (
                    approvedRequests.map((request) => (
                      <div key={request.id} className={styles.sessionCard}>
                        <div className={styles.sessionHeader}>
                          <div>
                            <h3>{request.studentName}</h3>
                            <span className={styles.studentId}>ID: {request.studentIdNumber}</span>
                          </div>
                          <span className={styles.sessionType}>{request.sessionType}</span>
                        </div>

                        <p className={styles.sessionTopic}>{request.topic}</p>

                        <div className={styles.sessionDetails}>
                          <div className={styles.detail}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {request.scheduledDate}
                          </div>
                          <div className={styles.detail}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {request.scheduledTime}
                          </div>
                          <div className={styles.detail}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {request.duration}
                          </div>
                        </div>

                        {request.notes && (
                          <div className={styles.notes}>
                            <strong>Notes:</strong>
                            <p>{request.notes}</p>
                          </div>
                        )}

                        <div className={styles.sessionActions}>
                          <button 
                            className={styles.completeBtn}
                            onClick={() => handleCompleteRequest(request.id)}
                          >
                            Mark as Completed
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Completed Sessions */}
              {activeTab === 'completed' && (
                <div className={styles.sessionsList}>
                  {completedRequests.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No completed sessions</p>
                    </div>
                  ) : (
                    completedRequests.map((request) => (
                      <div key={request.id} className={styles.sessionCard}>
                        <div className={styles.sessionHeader}>
                          <div>
                            <h3>{request.studentName}</h3>
                            <span className={styles.studentId}>ID: {request.studentIdNumber}</span>
                          </div>
                          <span className={styles.completedBadge}>Completed</span>
                        </div>

                        <p className={styles.sessionTopic}>{request.topic}</p>

                        <div className={styles.sessionDetails}>
                          <div className={styles.detail}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {request.scheduledDate}
                          </div>
                          <div className={styles.detail}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {request.scheduledTime}
                          </div>
                          <div className={styles.detail}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {request.duration}
                          </div>
                        </div>

                        {request.completionNotes && (
                          <div className={styles.notes}>
                            <strong>Session Notes:</strong>
                            <p>{request.completionNotes}</p>
                          </div>
                        )}

                        {request.feedback && (
                          <div className={styles.feedback}>
                            <strong>Feedback:</strong>
                            <p>{request.feedback}</p>
                          </div>
                        )}

                        <div className={styles.sessionActions}>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Approve Request Modal */}
      {showApproveModal && selectedRequest && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Approve Mentorship Request</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowApproveModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitApproval}>
              <div className={styles.formGroup}>
                <label>Student:</label>
                <p><strong>{selectedRequest.studentName}</strong> (ID: {selectedRequest.studentIdNumber})</p>
              </div>

              <div className={styles.formGroup}>
                <label>Topic:</label>
                <p>{selectedRequest.topic}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Scheduled Date *</label>
                <input
                  type="date"
                  value={approveForm.scheduledDate}
                  onChange={(e) => setApproveForm({...approveForm, scheduledDate: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Scheduled Time *</label>
                <input
                  type="time"
                  value={approveForm.scheduledTime}
                  onChange={(e) => setApproveForm({...approveForm, scheduledTime: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Notes (optional)</label>
                <textarea
                  value={approveForm.notes}
                  onChange={(e) => setApproveForm({...approveForm, notes: e.target.value})}
                  placeholder="Add any additional notes for this session..."
                  rows={3}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.approveBtn}>
                  Confirm Approval
                </button>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowApproveModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
