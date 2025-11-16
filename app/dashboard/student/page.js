'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '../../../lib/firebaseClient';
import Link from 'next/link';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import Card from '../../../components/UI/Card/Card';
import Button from '../../../components/UI/Button/Button';
import styles from './student-dashboard.module.css';

export default function StudentDashboard() {
  // Real-time data from Firestore
  const [recentJobs, setRecentJobs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch recent jobs with real-time updates
  useEffect(() => {
    if (!firebaseDb) return;
    
    const jobsQuery = query(
      collection(firebaseDb, 'jobs'),
      where('status', '==', 'Active'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          postedDate: doc.data().posted || doc.data().createdAt?.split('T')[0] || ''
        }))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 3);
      setRecentJobs(jobsData);
    }, (error) => {
      console.error('Error fetching jobs:', error);
      // Fallback: fetch all jobs and filter client-side
      const fallbackQuery = query(
        collection(firebaseDb, 'jobs'),
        limit(10)
      );
      const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
        const jobsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            postedDate: doc.data().posted || doc.data().createdAt?.split('T')[0] || ''
          }))
          .filter(job => job.status === 'Active')
          .slice(0, 3);
        setRecentJobs(jobsData);
      });
      return () => fallbackUnsubscribe();
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch upcoming events with real-time updates
  useEffect(() => {
    if (!firebaseDb) return;
    
    const eventsQuery = query(
      collection(firebaseDb, 'events'),
      where('status', 'in', ['Upcoming', 'Ongoing']),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateA - dateB;
        })
        .slice(0, 2);
      setUpcomingEvents(eventsData);
    }, (error) => {
      console.error('Error fetching events:', error);
      // Fallback: fetch all events and filter client-side
      const fallbackQuery = query(
        collection(firebaseDb, 'events'),
        limit(5)
      );
      const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
        const eventsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(event => event.status === 'Upcoming' || event.status === 'Ongoing')
          .slice(0, 2);
        setUpcomingEvents(eventsData);
      });
      return () => fallbackUnsubscribe();
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch applications with real-time updates
  useEffect(() => {
    if (!firebaseDb || !currentUserId) return;
    
    const appsQuery = query(
      collection(firebaseDb, 'applications'),
      where('userId', '==', currentUserId),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(appsQuery, (snapshot) => {
      const appsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.split('T')[0] || ''
        }))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 2);
      setApplications(appsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching applications:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUserId]);

  const careerTips = [
    { id: 1, title: 'How to Ace Your Technical Interview', category: 'Interviews' },
    { id: 2, title: 'Building a Professional Portfolio', category: 'Career Development' },
    { id: 3, title: 'Networking Tips for New Graduates', category: 'Networking' },
  ];

  return (
    <DashboardLayout userType="student">
      <div className={styles.dashboardGrid}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <Card>
            <CardHeader>
              <h2 className={styles.welcomeTitle}>Welcome back!</h2>
            </CardHeader>
            <CardBody>
              <Button variant="primary" href="/dashboard/student/profile">
                Complete Profile
              </Button>
            </CardBody>
          </Card>
        </section>

        {/* Job Applications */}
        <section className={styles.applicationsSection}>
          <Card>
            <CardHeader>
              <h2 className={styles.sectionTitle}>My Applications</h2>
              <Link href="/dashboard/student/applications" className={styles.viewAllLink}>
                View All
              </Link>
            </CardHeader>
            <CardBody>
              {applications.length > 0 ? (
                <ul className={styles.applicationsList}>
                  {applications.map((app) => (
                    <li key={app.id} className={styles.applicationItem}>
                      <div className={styles.applicationInfo}>
                        <h3 className={styles.applicationTitle}>{app.jobTitle}</h3>
                        <p className={styles.applicationCompany}>{app.company}</p>
                      </div>
                      <div className={styles.applicationMeta}>
                        <span className={`${styles.applicationStatus} ${styles[app.status.toLowerCase()]}`}>{app.status}</span>
                        <span className={styles.applicationDate}>{app.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyState}>You haven't applied to any jobs yet.</p>
              )}
            </CardBody>
          </Card>
        </section>

        {/* Recent Jobs */}
        <section className={styles.jobsSection}>
          <Card>
            <CardHeader>
              <h2 className={styles.sectionTitle}>Recent Job Postings</h2>
              <Link href="/dashboard/student/jobs" className={styles.viewAllLink}>
                View All
              </Link>
            </CardHeader>
            <CardBody>
              <ul className={styles.jobsList}>
                {recentJobs.map((job) => (
                  <li key={job.id} className={styles.jobItem}>
                    <Link href={`/jobs/${job.id}`} className={styles.jobLink}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <p className={styles.jobCompany}>{job.company}</p>
                      <span className={styles.jobLocation}>{job.location}</span>
                      <span className={styles.jobPostedDate}>{job.postedDate}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </section>

        {/* Events */}
        <section className={styles.eventsSection}>
          <Card>
            <CardHeader>
              <h2 className={styles.sectionTitle}>Upcoming Events</h2>
              <Link href="/dashboard/student/events" className={styles.viewAllLink}>
                View All
              </Link>
            </CardHeader>
            <CardBody>
              <ul className={styles.eventsList}>
                {upcomingEvents.map((event) => (
                  <li key={event.id} className={styles.eventItem}>
                    <div className={styles.eventInfo}>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      <p className={styles.eventTime}>{event.time}</p>
                      <p className={styles.eventLocation}>{event.location}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

// Card components for use within the dashboard
function CardHeader({ children }) {
  return <div className={styles.cardHeader}>{children}</div>;
}

function CardBody({ children }) {
  return <div className={styles.cardBody}>{children}</div>;
}