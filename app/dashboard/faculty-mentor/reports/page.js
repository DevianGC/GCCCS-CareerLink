'use client';

import { useState } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './reports.module.css';

export default function ReportsActivityLog() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState('thisMonth');

  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'session',
      studentName: 'Mike Johnson',
      studentId: 'S2021003',
      action: 'Completed mentoring session',
      topic: 'Academic Advising',
      date: '2024-01-15',
      time: '11:00 AM',
      duration: '1 hour',
      feedback: 'Student is well-prepared and shows strong academic interest.',
      rating: 5
    },
    {
      id: 2,
      type: 'feedback',
      studentName: 'Sarah Williams',
      studentId: 'S2021004',
      action: 'Provided feedback',
      topic: 'OJT Application Review',
      date: '2024-01-12',
      time: '2:30 PM',
      feedback: 'Resume needs improvement. Suggested adding more technical skills.',
      rating: 4
    },
    {
      id: 3,
      type: 'session',
      studentName: 'John Doe',
      studentId: 'S2021001',
      action: 'Completed mentoring session',
      topic: 'Career Path Discussion',
      date: '2024-01-10',
      time: '10:00 AM',
      duration: '1 hour',
      feedback: 'Discussed various career options in software development.',
      rating: 5
    },
    {
      id: 4,
      type: 'meeting',
      studentName: 'Jane Smith',
      studentId: 'S2021002',
      action: 'Scheduled meeting',
      topic: 'OJT Progress Review',
      date: '2024-01-22',
      time: '2:00 PM',
      duration: '45 mins',
      status: 'upcoming'
    },
    {
      id: 5,
      type: 'session',
      studentName: 'Emily Davis',
      studentId: 'S2021005',
      action: 'Completed mentoring session',
      topic: 'Technical Interview Preparation',
      date: '2024-01-08',
      time: '3:00 PM',
      duration: '1.5 hours',
      feedback: 'Practiced coding problems. Student needs more practice with algorithms.',
      rating: 4
    }
  ]);

  const [statistics, setStatistics] = useState({
    totalSessions: 15,
    totalHours: 22.5,
    averageRating: 4.6,
    activeMentees: 8,
    completedThisMonth: 5,
    upcomingThisWeek: 3
  });

  const filteredActivities = activities.filter(activity => {
    if (activeFilter === 'all') return true;
    return activity.type === activeFilter;
  });

  const getActivityIcon = (type) => {
    switch(type) {
      case 'session':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'feedback':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case 'meeting':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeClass = (type) => {
    switch(type) {
      case 'session': return styles.typeSession;
      case 'feedback': return styles.typeFeedback;
      case 'meeting': return styles.typeMeeting;
      default: return '';
    }
  };

  return (
    <DashboardLayout userType="faculty-mentor">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Reports & Activity Log</h1>
            <p>Track your mentoring sessions and feedback history</p>
          </div>
          <div className={styles.headerActions}>
            <select 
              className={styles.dateSelect}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
            </select>
            <button className={styles.exportBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total Sessions</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3>{statistics.totalSessions}</h3>
            <p className={styles.statChange}>+{statistics.completedThisMonth} this month</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total Hours</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>{statistics.totalHours}</h3>
            <p className={styles.statChange}>Mentoring time</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Average Rating</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3>{statistics.averageRating}/5</h3>
            <p className={styles.statChange}>Session feedback</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Active Mentees</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3>{statistics.activeMentees}</h3>
            <p className={styles.statChange}>{statistics.upcomingThisWeek} sessions this week</p>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Activities
          </button>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'session' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('session')}
          >
            Sessions
          </button>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'feedback' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('feedback')}
          >
            Feedback
          </button>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'meeting' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('meeting')}
          >
            Meetings
          </button>
        </div>

        {/* Activity Timeline */}
        <div className={styles.timeline}>
          {filteredActivities.map((activity) => (
            <div key={activity.id} className={styles.activityCard}>
              <div className={`${styles.activityIcon} ${getTypeClass(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className={styles.activityContent}>
                <div className={styles.activityHeader}>
                  <div>
                    <h3>{activity.action}</h3>
                    <p className={styles.studentInfo}>
                      {activity.studentName} ({activity.studentId})
                    </p>
                  </div>
                  <div className={styles.activityMeta}>
                    <span className={styles.activityDate}>{activity.date}</span>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>

                <div className={styles.activityDetails}>
                  <div className={styles.detailItem}>
                    <strong>Topic:</strong> {activity.topic}
                  </div>
                  {activity.duration && (
                    <div className={styles.detailItem}>
                      <strong>Duration:</strong> {activity.duration}
                    </div>
                  )}
                  {activity.feedback && (
                    <div className={styles.detailItem}>
                      <strong>Notes:</strong> {activity.feedback}
                    </div>
                  )}
                  {activity.rating && (
                    <div className={styles.rating}>
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill={i < activity.rating ? "currentColor" : "none"}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                  )}
                  {activity.status === 'upcoming' && (
                    <span className={styles.upcomingBadge}>Upcoming</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <p className={styles.emptyState}>No activities found</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
