'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import Card, { CardHeader, CardBody, CardFooter } from '../../../../components/UI/Card/Card';
import Button from '../../../../components/UI/Button/Button';
import styles from './mentorship.module.css';

export default function MentorshipPage() {
  const [mentors, setMentors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    topic: '',
    preferredDate: '',
    preferredTime: '',
    duration: '1 hour',
    sessionType: 'In-person',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMentors();
    fetchMyRequests();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/faculty-mentors');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched mentors:', data.mentors);
        setMentors(data.mentors || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch mentors:', response.status, errorData);
        alert(`Failed to load mentors: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      alert('Error loading mentors. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await fetch('/api/mentorship-requests');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched requests:', data.requests);
        setMyRequests(data.requests || []);
      } else {
        console.error('Failed to fetch requests:', response.status);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleRequestMentorship = (mentor) => {
    setSelectedMentor(mentor);
    setShowRequestModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/mentorship-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: selectedMentor.uid,
          ...requestForm
        })
      });

      if (response.ok) {
        alert('Mentorship request sent successfully!');
        setShowRequestModal(false);
        setRequestForm({
          topic: '',
          preferredDate: '',
          preferredTime: '',
          duration: '1 hour',
          sessionType: 'In-person',
          message: ''
        });
        fetchMyRequests();
      } else {
        alert('Failed to send request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      const response = await fetch(`/api/mentorship-requests/${requestId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Request cancelled successfully');
        fetchMyRequests();
      } else {
        alert('Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('An error occurred');
    }
  };


  return (
    <DashboardLayout userType="student">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Mentorship</h1>
        <p className={styles.subtitle}>Request mentorship sessions from faculty mentors</p>
      </div>

      {/* My Requests Section */}
      <Card className={styles.requestsCard}>
        <CardHeader>
          <h2>My Mentorship Requests</h2>
        </CardHeader>
        <CardBody>
          {myRequests.length === 0 ? (
            <p>No mentorship requests yet. Select a mentor below to request a session.</p>
          ) : (
            <div className={styles.requestsList}>
              {myRequests.map((request) => (
                <div key={request.id} className={styles.requestItem}>
                  <div className={styles.requestHeader}>
                    <h3>{request.topic}</h3>
                    <span className={`${styles.statusBadge} ${styles[request.status]}`}>
                      {request.status}
                    </span>
                  </div>
                  <p><strong>Mentor:</strong> {request.mentorName}</p>
                  <p><strong>Preferred Date:</strong> {request.preferredDate} {request.preferredTime}</p>
                  <p><strong>Duration:</strong> {request.duration}</p>
                  <p><strong>Type:</strong> {request.sessionType}</p>
                  {request.scheduledDate && (
                    <p className={styles.scheduled}>
                      <strong>Scheduled:</strong> {request.scheduledDate} {request.scheduledTime}
                    </p>
                  )}
                  {request.status === 'pending' && (
                    <Button 
                      variant="secondary" 
                      onClick={() => handleCancelRequest(request.id)}
                      className={styles.cancelBtn}
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Available Mentors */}
      <Card className={styles.mentorsCard}>
        <CardHeader>
          <h2>Available Faculty Mentors</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p>Loading mentors...</p>
          ) : mentors.length === 0 ? (
            <p>No faculty mentors available at the moment.</p>
          ) : (
            <div className={styles.mentorsList}>
              {mentors.map((mentor) => (
                <div key={mentor.uid} className={styles.mentorCard}>
                  <h3>{mentor.fullName || `${mentor.firstName} ${mentor.lastName}`}</h3>
                  <p><strong>Department:</strong> {mentor.department}</p>
                  <p><strong>Specialization:</strong> {mentor.specialization}</p>
                  {mentor.bio && <p className={styles.bio}>{mentor.bio}</p>}
                  {mentor.officeLocation && <p><strong>Office:</strong> {mentor.officeLocation}</p>}
                  <Button onClick={() => handleRequestMentorship(mentor)}>
                    Request Mentorship
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Request Modal */}
      {showRequestModal && selectedMentor && (
        <div className={styles.modal} onClick={() => setShowRequestModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Request Mentorship Session</h2>
            <p><strong>Mentor:</strong> {selectedMentor.fullName || `${selectedMentor.firstName} ${selectedMentor.lastName}`}</p>
            
            <form onSubmit={handleSubmitRequest} className={styles.requestForm}>
              <div className={styles.formGroup}>
                <label>Topic/Purpose *</label>
                <input
                  type="text"
                  name="topic"
                  value={requestForm.topic}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Career Guidance, OJT Concerns"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Preferred Date *</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={requestForm.preferredDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Preferred Time</label>
                <input
                  type="time"
                  name="preferredTime"
                  value={requestForm.preferredTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Duration</label>
                <select
                  name="duration"
                  value={requestForm.duration}
                  onChange={handleInputChange}
                >
                  <option value="30 mins">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="1.5 hours">1.5 hours</option>
                  <option value="2 hours">2 hours</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Session Type</label>
                <select
                  name="sessionType"
                  value={requestForm.sessionType}
                  onChange={handleInputChange}
                >
                  <option value="In-person">In-person</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Additional Message</label>
                <textarea
                  name="message"
                  value={requestForm.message}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional information for your mentor"
                />
              </div>

              <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
