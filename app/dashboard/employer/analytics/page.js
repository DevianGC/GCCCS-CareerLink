'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './analytics.module.css';

export default function EmployerAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedJob, setSelectedJob] = useState('all');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalViews: 0,
      totalApplications: 0,
      conversionRate: 0,
      avgTimeToHire: 0
    },
    jobPerformance: [],
    applicationTrends: [],
    sourceBreakdown: [],
    hiringFunnel: []
  });

  // Get current user ID
  useEffect(() => {
    const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe?.();
  }, []);

  // Fetch jobs from Firebase - only employer's jobs
  useEffect(() => {
    if (!firebaseDb || !currentUserId) return;

    const jobsQuery = query(
      collection(firebaseDb, 'jobs'),
      where('employerId', '==', currentUserId)
    );
    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Fetch applications from Firebase - only for employer's jobs
  useEffect(() => {
    if (!firebaseDb || !currentUserId) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        // First get all employer's job IDs
        const jobsSnapshot = await getDocs(
          query(collection(firebaseDb, 'jobs'), where('employerId', '==', currentUserId))
        );
        
        const jobIds = jobsSnapshot.docs.map(doc => doc.id);
        
        if (jobIds.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }

        // Fetch applications for those jobs (in batches of 10 due to Firestore 'in' limit)
        const allApplications = [];
        
        for (let i = 0; i < jobIds.length; i += 10) {
          const batchJobIds = jobIds.slice(i, i + 10);
          const applicationsQuery = query(
            collection(firebaseDb, 'applications'),
            where('jobId', 'in', batchJobIds)
          );

          const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
            const appsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            // Merge with existing applications
            allApplications.push(...appsData);
            setApplications(allApplications);
            setLoading(false);
          });
          
          return () => unsubscribe();
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUserId]);

  // Calculate analytics when data changes
  useEffect(() => {
    if (jobs.length === 0) return;

    // Calculate job performance
    const jobPerformance = jobs.map(job => {
      const jobApps = applications.filter(app => app.jobId === job.id);
      const views = job.views || 0; // Use real views from job data
      const appCount = jobApps.length;
      const conversionRate = views > 0 ? ((appCount / views) * 100).toFixed(1) : 0;

      return {
        id: job.id,
        title: job.title,
        views: views,
        applications: appCount,
        conversionRate: parseFloat(conversionRate),
        status: job.status || 'Active'
      };
    });

    // Calculate overview stats
    const totalViews = jobPerformance.reduce((sum, job) => sum + job.views, 0);
    const totalApplications = applications.length;
    const conversionRate = totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : 0;

    // Calculate hiring funnel
    const screeningCount = applications.filter(app => 
      ['Under Review', 'Shortlisted', 'Interview', 'Offer', 'Hired'].includes(app.status)
    ).length;
    const interviewCount = applications.filter(app => 
      ['Interview', 'Offer', 'Hired'].includes(app.status)
    ).length;
    const offerCount = applications.filter(app => 
      ['Offer', 'Hired'].includes(app.status)
    ).length;
    const hiredCount = applications.filter(app => app.status === 'Hired').length;

    const hiringFunnel = [
      { stage: 'Applications', count: totalApplications, percentage: 100 },
      { stage: 'Screening', count: screeningCount, percentage: totalApplications > 0 ? ((screeningCount / totalApplications) * 100).toFixed(1) : 0 },
      { stage: 'Interviews', count: interviewCount, percentage: totalApplications > 0 ? ((interviewCount / totalApplications) * 100).toFixed(1) : 0 },
      { stage: 'Offers', count: offerCount, percentage: totalApplications > 0 ? ((offerCount / totalApplications) * 100).toFixed(1) : 0 },
      { stage: 'Hired', count: hiredCount, percentage: totalApplications > 0 ? ((hiredCount / totalApplications) * 100).toFixed(1) : 0 }
    ];

    // Calculate application trends based on actual dates (last 4 weeks)
    const now = new Date();
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const applicationTrends = weeks.map((week, index) => {
      const weekStart = new Date(now.getTime() - (4 - index) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - (3 - index) * 7 * 24 * 60 * 60 * 1000);
      
      const weekApps = applications.filter(app => {
        const appDate = new Date(app.createdAt || app.date);
        return appDate >= weekStart && appDate < weekEnd;
      });

      const weekJobs = jobs.filter(job => {
        const jobDate = new Date(job.createdAt || job.posted);
        return jobDate >= weekStart && jobDate < weekEnd;
      });

      const weekViews = weekJobs.reduce((sum, job) => sum + (job.views || 0), 0);

      return {
        period: week,
        applications: weekApps.length,
        views: weekViews
      };
    });

    // Calculate average time to hire
    const hiredApps = applications.filter(app => app.status === 'Hired' && app.hiredAt && app.createdAt);
    const avgTimeToHire = hiredApps.length > 0
      ? Math.round(hiredApps.reduce((sum, app) => {
          const created = new Date(app.createdAt);
          const hired = new Date(app.hiredAt);
          return sum + (hired - created) / (1000 * 60 * 60 * 24);
        }, 0) / hiredApps.length)
      : 0;

    setAnalyticsData({
      overview: {
        totalViews,
        totalApplications,
        conversionRate: parseFloat(conversionRate),
        avgTimeToHire
      },
      jobPerformance,
      applicationTrends,
      sourceBreakdown: [
        { source: 'Career Portal', applications: Math.floor(totalApplications * 0.6), percentage: 60 },
        { source: 'Direct Applications', applications: Math.floor(totalApplications * 0.25), percentage: 25 },
        { source: 'Referrals', applications: Math.floor(totalApplications * 0.1), percentage: 10 },
        { source: 'Social Media', applications: Math.floor(totalApplications * 0.05), percentage: 5 }
      ],
      hiringFunnel
    });
  }, [jobs, applications]);

  const getPerformanceColor = (rate) => {
    if (rate >= 6) return styles.performanceHigh;
    if (rate >= 4) return styles.performanceMedium;
    return styles.performanceLow;
  };

  const exportReport = () => {
    // Here you would typically generate and download a report
    console.log('Exporting analytics report...');
  };

  return (
    <DashboardLayout userType="employer">
      <div className={styles.analyticsContainer}>
        <div className={styles.analyticsHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Analytics & Reports</h1>
            <p className={styles.pageSubtitle}>Track your job posting performance and hiring metrics</p>
          </div>
          <div className={styles.headerActions}>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={styles.periodSelect}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
            <button className={styles.exportButton} onClick={exportReport}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 9V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 10L8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5 5L8 2L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className={styles.overviewGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>
                {loading ? '...' : analyticsData.overview.totalViews.toLocaleString()}
              </h3>
              <p className={styles.statLabel}>Total Views</p>
              <span className={styles.statTrend}>+12% from last period</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>
                {loading ? '...' : analyticsData.overview.totalApplications}
              </h3>
              <p className={styles.statLabel}>Total Applications</p>
              <span className={styles.statTrend}>+8% from last period</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{analyticsData.overview.conversionRate}%</h3>
              <p className={styles.statLabel}>Conversion Rate</p>
              <span className={styles.statTrend}>+0.3% from last period</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{analyticsData.overview.avgTimeToHire}</h3>
              <p className={styles.statLabel}>Avg. Days to Hire</p>
              <span className={styles.statTrend}>-2 days from last period</span>
            </div>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          {/* Job Performance Table */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Job Performance</h2>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className={styles.jobSelect}
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.performanceTable}>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Views</th>
                    <th>Applications</th>
                    <th>Conversion Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.jobPerformance.map(job => (
                    <tr key={job.id}>
                      <td className={styles.jobTitle}>{job.title}</td>
                      <td>{job.views.toLocaleString()}</td>
                      <td>{job.applications}</td>
                      <td>
                        <span className={`${styles.conversionRate} ${getPerformanceColor(job.conversionRate)}`}>
                          {job.conversionRate}%
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.jobStatus} ${job.status === 'Active' ? styles.statusActive : styles.statusClosed}`}>
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Application Trends Chart */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Application Trends</h2>
            </div>
            <div className={styles.chartContainer}>
              <div className={styles.trendChart}>
                {analyticsData.applicationTrends.map((data, index) => (
                  <div key={index} className={styles.trendBar}>
                    <div className={styles.barContainer}>
                      <div 
                        className={styles.applicationBar}
                        style={{ height: `${(data.applications / 35) * 100}%` }}
                      ></div>
                      <div 
                        className={styles.viewBar}
                        style={{ height: `${(data.views / 600) * 100}%` }}
                      ></div>
                    </div>
                    <span className={styles.barLabel}>{data.period}</span>
                  </div>
                ))}
              </div>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: 'var(--primary-color)' }}></div>
                  <span>Applications</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: 'var(--gray-400)' }}></div>
                  <span>Views</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          {/* Application Sources */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Application Sources</h2>
            </div>
            <div className={styles.sourcesList}>
              {analyticsData.sourceBreakdown.map((source, index) => (
                <div key={index} className={styles.sourceItem}>
                  <div className={styles.sourceInfo}>
                    <span className={styles.sourceName}>{source.source}</span>
                    <span className={styles.sourceCount}>{source.applications} applications</span>
                  </div>
                  <div className={styles.sourceBar}>
                    <div 
                      className={styles.sourceProgress}
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className={styles.sourcePercentage}>{source.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Funnel */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Hiring Funnel</h2>
            </div>
            <div className={styles.funnelContainer}>
              {analyticsData.hiringFunnel.map((stage, index) => (
                <div key={index} className={styles.funnelStage}>
                  <div className={styles.stageInfo}>
                    <span className={styles.stageName}>{stage.stage}</span>
                    <span className={styles.stageCount}>{stage.count}</span>
                  </div>
                  <div className={styles.funnelBar}>
                    <div 
                      className={styles.funnelProgress}
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                  <span className={styles.stagePercentage}>{stage.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className={styles.insightsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Key Insights</h2>
          </div>
          <div className={styles.insightsList}>
            <div className={styles.insightItem}>
              <div className={styles.insightIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2L13 8L19 9L14 14L16 20L10 17L4 20L6 14L1 9L7 8L10 2Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className={styles.insightContent}>
                <h4 className={styles.insightTitle}>High Performing Job</h4>
                <p className={styles.insightText}>Your "Data Analyst" position has the highest conversion rate at 7.1%</p>
              </div>
            </div>
            
            <div className={styles.insightItem}>
              <div className={styles.insightIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.insightContent}>
                <h4 className={styles.insightTitle}>Faster Hiring Process</h4>
                <p className={styles.insightText}>Your average time to hire has improved by 2 days compared to last period</p>
              </div>
            </div>
            
            <div className={styles.insightItem}>
              <div className={styles.insightIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.insightContent}>
                <h4 className={styles.insightTitle}>Strong Application Growth</h4>
                <p className={styles.insightText}>Applications have increased by 8% this period, showing growing interest</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
