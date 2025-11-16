'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import styles from './faculty-mentor-dashboard.module.css';

export default function FacultyMentorDashboard() {
  const [mentorData, setMentorData] = useState({
    name: 'Armilyn Martinez',
    totalMentees: 0,
    activeSessions: 0,
    completedSessions: 0,
    pendingFeedback: 0
  });

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [myMentees, setMyMentees] = useState([]);

  // Function to load and process sessions data
  const loadSessionsData = () => {
    // Load sessions from localStorage
    const savedSessions = localStorage.getItem('facultyMentorSessions');
    let allSessions = { upcoming: [], completed: [] };
    
    if (savedSessions) {
      allSessions = JSON.parse(savedSessions);
    }

    // Set upcoming sessions (limit to 3 for dashboard)
    setUpcomingSessions(allSessions.upcoming.slice(0, 3).map(session => ({
      id: session.id,
      studentName: session.studentName,
      topic: session.topic,
      date: session.date,
      time: session.time,
      type: session.type
    })));

    // Derive unique mentees from all sessions (both upcoming and completed)
    const allSessionsArray = [...allSessions.upcoming, ...allSessions.completed];
    const menteeMap = new Map();

    allSessionsArray.forEach(session => {
      const key = session.studentId || session.studentName;
      if (!menteeMap.has(key)) {
        // Find the most recent session for this student
        const studentSessions = allSessionsArray.filter(
          s => (s.studentId || s.studentName) === key
        );
        
        // Sort by date to get the most recent
        const sortedSessions = studentSessions.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        const completedCount = studentSessions.filter(s => 
          allSessions.completed.some(cs => cs.id === s.id)
        ).length;
        
        const totalCount = studentSessions.length;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        menteeMap.set(key, {
          id: key,
          name: session.studentName,
          year: '3rd Year', // Default - would come from student profile in real app
          major: 'Information Technology', // Default - would come from student profile
          ojtStatus: progress > 75 ? 'Completed' : progress > 30 ? 'In Progress' : 'Not Started',
          lastSession: sortedSessions[0].date,
          progress: progress
        });
      }
    });

    setMyMentees(Array.from(menteeMap.values()));

    // Update stats
    setMentorData(prev => ({
      ...prev,
      totalMentees: menteeMap.size,
      activeSessions: allSessions.upcoming.length,
      completedSessions: allSessions.completed.length,
      pendingFeedback: allSessions.completed.filter(s => !s.feedback || s.feedback === 'No feedback provided').length
    }));
  };

  useEffect(() => {
    // Load data on mount
    loadSessionsData();

    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const user = data?.user;
          if (user) {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            const fullName = user.fullName || `${firstName} ${lastName}`.trim();
            const displayName = fullName || user.email || 'Faculty Mentor';
            
            setMentorData(prev => ({
              ...prev,
              name: displayName
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();

    // Listen for storage changes (when sessions are updated in another tab/page)
    const handleStorageChange = (e) => {
      if (e.key === 'facultyMentorSessions') {
        loadSessionsData();
      }
    };

    // Listen for custom event when returning to this page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSessionsData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus event
    window.addEventListener('focus', loadSessionsData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadSessionsData);
    };
  }, []);

  const getStatusClass = (status) => {
    switch(status) {
      case 'Completed': return styles.statusCompleted;
      case 'In Progress': return styles.statusInProgress;
      case 'Not Started': return styles.statusNotStarted;
      default: return '';
    }
  };

  return (
    <DashboardLayout userType="faculty-mentor">
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>Welcome, {mentorData.name}</h1>
          <p>Manage your mentees and track mentorship sessions</p>
        </div>

        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>{mentorData.totalMentees}</h3>
              <p>Total Mentees</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>{mentorData.activeSessions}</h3>
              <p>Active Sessions</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>{mentorData.completedSessions}</h3>
              <p>Completed Sessions</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>{mentorData.pendingFeedback}</h3>
              <p>Pending Feedback</p>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className={styles.section}>
          <h2>Upcoming Sessions</h2>
          <div className={styles.sessionsList}>
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <h3>{session.studentName}</h3>
                    <span className={styles.sessionType}>{session.type}</span>
                  </div>
                  <p className={styles.sessionTopic}>{session.topic}</p>
                  <div className={styles.sessionFooter}>
                    <span className={styles.sessionDate}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {session.date}
                    </span>
                    <span className={styles.sessionTime}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {session.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyState}>No upcoming sessions</p>
            )}
          </div>
        </div>

        {/* My Mentees */}
        <div className={styles.section}>
          <h2>My Mentees</h2>
          <div className={styles.tableContainer}>
            <table className={styles.menteesTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Year</th>
                  <th>Major</th>
                  <th>OJT Status</th>
                  <th>Last Session</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {myMentees.map((mentee) => (
                  <tr key={mentee.id}>
                    <td className={styles.menteeName}>{mentee.name}</td>
                    <td>{mentee.year}</td>
                    <td>{mentee.major}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(mentee.ojtStatus)}`}>
                        {mentee.ojtStatus}
                      </span>
                    </td>
                    <td>{mentee.lastSession}</td>
                    <td>
                      <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${mentee.progress}%` }}
                          />
                        </div>
                        <span className={styles.progressText}>{mentee.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
