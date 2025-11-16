'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './reports.module.css';

export default function ReportsActivityLog() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalSessions: 0,
    totalHours: 0,
    averageRating: 0,
    activeMentees: 0,
    completedThisMonth: 0,
    upcomingThisWeek: 0
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mentorship-requests');
      if (response.ok) {
        const data = await response.json();
        const requests = data.requests || [];
        
        // Convert requests to activities format
        const formattedActivities = requests.map(req => ({
          id: req.id,
          type: req.status === 'completed' ? 'session' : 'meeting',
          studentName: req.studentName,
          studentId: req.studentIdNumber,
          action: req.status === 'completed' ? 'Completed mentoring session' : 
                  req.status === 'approved' ? 'Scheduled meeting' : 
                  'Pending request',
          topic: req.topic,
          date: req.status === 'completed' ? req.scheduledDate : 
                req.status === 'approved' ? req.scheduledDate : req.preferredDate,
          time: req.status === 'completed' ? req.scheduledTime : 
                req.status === 'approved' ? req.scheduledTime : req.preferredTime,
          duration: req.duration,
          feedback: req.feedback || '',
          notes: req.completionNotes || '',
          rating: req.rating || 0,
          status: req.status
        }));

        setActivities(formattedActivities);
        calculateStatistics(formattedActivities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (activities) => {
    const completed = activities.filter(a => a.status === 'completed');
    const approved = activities.filter(a => a.status === 'approved');
    
    // Calculate total hours from duration strings
    const totalHours = completed.reduce((sum, activity) => {
      const duration = activity.duration || '0 hour';
      const hours = parseFloat(duration) || 0;
      return sum + hours;
    }, 0);

    // Calculate average rating
    const ratedSessions = completed.filter(a => a.rating > 0);
    const averageRating = ratedSessions.length > 0 
      ? ratedSessions.reduce((sum, a) => sum + a.rating, 0) / ratedSessions.length 
      : 0;

    // Get unique students
    const uniqueStudents = new Set(activities.map(a => a.studentId));

    // Calculate this month's completed sessions
    const now = new Date();
    const thisMonth = completed.filter(a => {
      const activityDate = new Date(a.date);
      return activityDate.getMonth() === now.getMonth() && 
             activityDate.getFullYear() === now.getFullYear();
    });

    // Calculate upcoming this week
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    const upcomingThisWeek = approved.filter(a => {
      const activityDate = new Date(a.date);
      return activityDate >= now && activityDate <= oneWeekFromNow;
    });

    setStatistics({
      totalSessions: completed.length,
      totalHours: totalHours.toFixed(1),
      averageRating: averageRating.toFixed(1),
      activeMentees: uniqueStudents.size,
      completedThisMonth: thisMonth.length,
      upcomingThisWeek: upcomingThisWeek.length
    });
  };

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
          {loading ? (
            <p className={styles.loading}>Loading activities...</p>
          ) : filteredActivities.length === 0 ? (
            <p className={styles.emptyState}>No activities found</p>
          ) : (
            filteredActivities.map((activity) => (
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
                    {activity.notes && (
                      <div className={styles.detailItem}>
                        <strong>Notes:</strong> {activity.notes}
                      </div>
                    )}
                    {activity.feedback && (
                      <div className={styles.detailItem}>
                        <strong>Feedback:</strong> {activity.feedback}
                      </div>
                    )}
                    {activity.rating > 0 && (
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
                    {activity.status === 'approved' && (
                      <span className={styles.upcomingBadge}>Upcoming</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
