'use client';
import { useState } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import Card, { CardHeader, CardBody, CardFooter } from '../../../../components/UI/Card/Card';
import Button from '../../../../components/UI/Button/Button';
import styles from './mentorship.module.css';

// Example mentor data (replace with API in real app)
const MENTORS = [
  {
    id: 1,
    name: 'Maria Santos',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp',
    expertise: ['React', 'UI/UX', 'Career Growth'],
    bio: '10+ years in web development, passionate about mentoring new grads.',
    availableSlots: ['2025-11-10 10:00', '2025-11-12 14:00'],
  },
  {
    id: 2,
    name: 'John Lee',
    title: 'Data Analyst Lead',
    company: 'DataViz',
    expertise: ['SQL', 'Python', 'Analytics'],
    bio: 'Data enthusiast and analytics mentor.',
    availableSlots: ['2025-11-11 09:00', '2025-11-13 16:00'],
  },
  {
    id: 3,
    name: 'Aisha Gomez',
    title: 'UX Designer',
    company: 'Creative Solutions',
    expertise: ['UX', 'Figma', 'Portfolio Review'],
    bio: 'Helping students break into UX design.',
    availableSlots: ['2025-11-14 11:00', '2025-11-15 15:00'],
  },
];


export default function MentorshipPage() {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledSlot, setScheduledSlot] = useState('');

  // Simulate getting student info (replace with real user/profile fetch)
  const student = { name: 'Student User', email: 'student@example.com' };

  // POST mentorship request to API endpoint for Gmail integration
  const handleRequest = async () => {
    if (!selectedMentor) return;
    setRequestError('');
    setRequestSent('sending');
    try {
      const res = await fetch('/api/mentorship-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          mentorName: selectedMentor.name,
          mentorEmail: selectedMentor.email || '', // add mentor email if available
          studentName: student.name,
          studentEmail: student.email,
          message: `Mentorship request for ${selectedMentor.name} from ${student.name}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to send request');
      setRequestSent(true);
      setTimeout(() => setRequestSent(false), 2000);
    } catch (e) {
      setRequestError('Failed to send mentorship request. Please try again.');
      setRequestSent(false);
    }
  };

  const handleSchedule = (slot) => {
    setScheduledSlot(slot);
  };


  return (
    <DashboardLayout userType="student">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Mentorship</h1>
        <p className={styles.subtitle}>Find mentors, send mentorship requests, schedule sessions, and message mentors.</p>
      </div>
      <div className={styles.flexRow}>
        <div className={styles.mentorListCol}>
          <Card className={styles.mentorListCard}>
            <CardHeader>
              <h2 className={styles.sectionTitle}>Available Mentors</h2>
            </CardHeader>
            <CardBody>
              <ul className={styles.mentorList}>
                {MENTORS.map((mentor) => (
                  <li key={mentor.id} className={styles.mentorItem}>
                    <div className={styles.mentorInfo}>
                      <div className={styles.mentorName}>{mentor.name}</div>
                      <div className={styles.mentorTitle}>{mentor.title} @ {mentor.company}</div>
                      <div className={styles.mentorExpertise}>Expertise: {mentor.expertise.join(', ')}</div>
                      <div className={styles.mentorBio}>{mentor.bio}</div>
                    </div>
                    <Button
                      variant={selectedMentor?.id === mentor.id ? 'secondary' : 'primary'}
                      onClick={() => setSelectedMentor(mentor)}
                      className={styles.selectButton}
                    >
                      {selectedMentor?.id === mentor.id ? 'Selected' : 'View'}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
        <div className={styles.mentorDetailCol}>
          {selectedMentor && (
            <Card className={styles.mentorDetailCard}>
              <CardHeader>
                <h2 className={styles.mentorName}>{selectedMentor.name}</h2>
                <div className={styles.mentorTitle}>{selectedMentor.title} @ {selectedMentor.company}</div>
              </CardHeader>
              <CardBody>
                <div className={styles.mentorExpertise}><b>Expertise:</b> {selectedMentor.expertise.join(', ')}</div>
                <div className={styles.mentorBio}>{selectedMentor.bio}</div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Available Sessions</h3>
                  <ul className={styles.slotList}>
                    {selectedMentor.availableSlots.map((slot, i) => (
                      <li key={i} className={styles.slotItem}>
                        <span className={styles.sessionTime}>{slot}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.sessionNote}>
                    <em>Mentors set their available times. Students can view but not schedule directly.</em>
                  </div>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Mentorship Request</h3>
                  <Button
                    variant="primary"
                    onClick={handleRequest}
                    disabled={requestSent === true || requestSent === 'sending'}
                    className={styles.requestButton}
                  >
                    {requestSent === 'sending' ? 'Sending…' : requestSent === true ? 'Request Sent!' : 'Send Request'}
                  </Button>
                  {requestError && <div style={{ color: 'red', marginTop: 6 }}>{requestError}</div>}
                </div>
                {/* Message Mentor section removed as requested */}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
