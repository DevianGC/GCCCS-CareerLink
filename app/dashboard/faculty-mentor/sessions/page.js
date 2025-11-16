'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './sessions.module.css';

export default function MentorshipSessions() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const [sessions, setSessions] = useState({
    upcoming: [
      {
        id: 1,
        studentName: 'John Ian Ormides',
        studentId: '202311310',
        topic: 'Career Development Discussion',
        date: '2025-11-20',
        time: '10:00 AM',
        duration: '1 hour',
        type: 'In-person',
        notes: '',
        materials: []
      },
      {
        id: 2,
        studentName: 'Janico Sorio',
        studentId: '202311111',
        topic: 'OJT Progress Review',
        date: '2025-11-13',
        time: '2:00 PM',
        duration: '45 mins',
        type: 'Online',
        meetingLink: 'https://meet.google.com/xyz',
        notes: '',
        materials: []
      }
    ],
    completed: [
      {
        id: 3,
        studentName: 'John Ian',
        studentId: '202100323',
        topic: 'Academic Advising',
        date: '2024-01-15',
        time: '11:00 AM',
        duration: '1 hour',
        type: 'In-person',
        notes: 'Discussed course selection for next semester. Student is interested in advanced database management.',
        materials: ['Course Catalog.pdf', 'Degree Requirements.pdf'],
        feedback: 'Student is well-prepared and shows strong academic interest.'
      }
    ]
  });

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('facultyMentorSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('facultyMentorSessions', JSON.stringify(sessions));
  }, [sessions]);

  const [newSession, setNewSession] = useState({
    studentName: '',
    studentId: '',
    topic: '',
    date: '',
    time: '',
    duration: '1 hour',
    type: 'In-person',
    meetingLink: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSession(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    const session = {
      id: Date.now(),
      ...newSession,
      notes: '',
      materials: []
    };

    // Check if session is already in the past
    if (isSessionPast(session)) {
      // Add directly to completed with default feedback
      setSessions(prev => ({
        ...prev,
        completed: [{
          ...session,
          notes: 'Session time has passed',
          feedback: 'No feedback provided'
        }, ...prev.completed]
      }));
    } else {
      // Add to upcoming
      setSessions(prev => ({
        ...prev,
        upcoming: [...prev.upcoming, session]
      }));
    }

    setShowNewSessionModal(false);
    setNewSession({
      studentName: '',
      studentId: '',
      topic: '',
      date: '',
      time: '',
      duration: '1 hour',
      type: 'In-person',
      meetingLink: ''
    });
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
    setShowNewSessionModal(false);
  };

  const handleSaveNotes = (sessionId, notes, feedback) => {
    // Move to completed if feedback is provided
    const sessionToUpdate = sessions.upcoming.find(s => s.id === sessionId);
    if (sessionToUpdate && feedback) {
      const updatedSession = {
        ...sessionToUpdate,
        notes,
        feedback
      };
      setSessions(prev => ({
        upcoming: prev.upcoming.filter(s => s.id !== sessionId),
        completed: [updatedSession, ...prev.completed]
      }));
      setSelectedSession(null);
    }
  };

  const handleDeleteSession = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      setSessions(prev => ({
        ...prev,
        completed: prev.completed.filter(s => s.id !== sessionId)
      }));
    }
  };

  // Helper function to check if session date/time has passed
  const isSessionPast = (session) => {
    const sessionDateTime = new Date(`${session.date} ${session.time}`);
    return sessionDateTime < new Date();
  };

  // Automatically move past sessions to completed
  useEffect(() => {
    const checkAndMovePastSessions = () => {
      setSessions(prev => {
        const pastSessions = prev.upcoming.filter(session => isSessionPast(session));
        const upcomingSessions = prev.upcoming.filter(session => !isSessionPast(session));
        
        if (pastSessions.length > 0) {
          // Move past sessions to completed with default notes
          const movedSessions = pastSessions.map(session => ({
            ...session,
            notes: session.notes || 'Session time has passed',
            feedback: session.feedback || 'No feedback provided'
          }));
          
          return {
            upcoming: upcomingSessions,
            completed: [...movedSessions, ...prev.completed]
          };
        }
        
        return prev;
      });
    };

    // Check immediately on mount
    checkAndMovePastSessions();

    // Check every minute
    const interval = setInterval(checkAndMovePastSessions, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout userType="faculty-mentor">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Mentorship Sessions</h1>
            <p>Manage and track your mentoring sessions</p>
          </div>
          <button 
            className={styles.newSessionBtn}
            onClick={() => setShowNewSessionModal(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Schedule New Session
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({sessions.upcoming.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({sessions.completed.length})
          </button>
        </div>

        {/* Sessions List */}
        <div className={styles.sessionsList}>
          {sessions[activeTab].map((session) => (
            <div key={session.id} className={styles.sessionCard}>
              <div className={styles.sessionHeader}>
                <div>
                  <h3>{session.studentName}</h3>
                  <span className={styles.studentId}>{session.studentId}</span>
                </div>
                <span className={styles.sessionType}>{session.type}</span>
              </div>

              <p className={styles.sessionTopic}>{session.topic}</p>

              <div className={styles.sessionDetails}>
                <div className={styles.detail}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {session.date}
                </div>
                <div className={styles.detail}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {session.time}
                </div>
                <div className={styles.detail}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {session.duration}
                </div>
              </div>

              {session.meetingLink && (
                <a href={session.meetingLink} className={styles.meetingLink} target="_blank" rel="noopener noreferrer">
                  Join Meeting
                </a>
              )}

              <div className={styles.sessionActions}>
                <button 
                  className={styles.viewBtn}
                  onClick={() => handleViewSession(session)}
                >
                  {activeTab === 'upcoming' ? 'Add Notes & Feedback' : 'View Details'}
                </button>
                {activeTab === 'completed' && (
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}

          {sessions[activeTab].length === 0 && (
            <p className={styles.emptyState}>No {activeTab} sessions</p>
          )}
        </div>

        {/* New Session Modal */}
        {showNewSessionModal && (
          <div className={styles.modal} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Schedule New Session</h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
              </div>

              <form onSubmit={handleCreateSession}>
                <div className={styles.formGroup}>
                  <label>Student Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={newSession.studentName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={newSession.studentId}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={newSession.topic}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={newSession.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Time</label>
                    <input
                      type="time"
                      name="time"
                      value={newSession.time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Duration</label>
                    <select
                      name="duration"
                      value={newSession.duration}
                      onChange={handleInputChange}
                    >
                      <option>30 mins</option>
                      <option>45 mins</option>
                      <option>1 hour</option>
                      <option>1.5 hours</option>
                      <option>2 hours</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Type</label>
                    <select
                      name="type"
                      value={newSession.type}
                      onChange={handleInputChange}
                    >
                      <option>In-person</option>
                      <option>Online</option>
                    </select>
                  </div>
                </div>

                {newSession.type === 'Online' && (
                  <div className={styles.formGroup}>
                    <label>Meeting Link</label>
                    <input
                      type="url"
                      name="meetingLink"
                      value={newSession.meetingLink}
                      onChange={handleInputChange}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Schedule Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Session Details Modal */}
        {selectedSession && (
          <SessionDetailsModal
            session={selectedSession}
            onClose={handleCloseModal}
            onSave={handleSaveNotes}
            isCompleted={activeTab === 'completed'}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function SessionDetailsModal({ session, onClose, onSave, isCompleted }) {
  const [notes, setNotes] = useState(session.notes || '');
  const [feedback, setFeedback] = useState(session.feedback || '');
  const [uploadedFiles, setUploadedFiles] = useState(session.materials || []);

  const handleSave = () => {
    onSave(session.id, notes, feedback);
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Session Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.sessionInfo}>
          <h3>{session.studentName}</h3>
          <p className={styles.studentId}>{session.studentId}</p>
          <p className={styles.sessionTopic}>{session.topic}</p>
          <div className={styles.sessionMeta}>
            <span>{session.date} at {session.time}</span>
            <span>•</span>
            <span>{session.duration}</span>
            <span>•</span>
            <span>{session.type}</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Meeting Notes</label>
          <textarea
            rows="6"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record discussion points, key topics covered..."
            disabled={isCompleted}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Materials</label>
          <div className={styles.materialsSection}>
            {uploadedFiles.length > 0 && (
              <div className={styles.filesList}>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className={styles.fileItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {file}
                  </div>
                ))}
              </div>
            )}
            {!isCompleted && (
              <button className={styles.uploadBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Materials
              </button>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Student Feedback</label>
          <textarea
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide feedback on student's progress, strengths, areas for improvement..."
            disabled={isCompleted}
          />
        </div>

        {!isCompleted && (
          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.submitBtn} onClick={handleSave}>
              Save & Complete Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
