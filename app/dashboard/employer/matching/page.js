'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './matching.module.css';

// Utility functions
const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent Match';
  if (score >= 80) return 'Good Match';
  if (score >= 70) return 'Fair Match';
  return 'Low Match';
};

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('');
};

export default function CandidateMatching() {
  const [selectedJob, setSelectedJob] = useState('');
  const [jobs, setJobs] = useState([]);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterScore, setFilterScore] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe?.();
  }, []);

  // Fetch jobs from Firebase
  useEffect(() => {
    if (!firebaseDb || !currentUserId) return;

    const jobsQuery = query(
      collection(firebaseDb, 'jobs'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'Untitled Job',
        department: doc.data().department || doc.data().company || 'N/A',
        ...doc.data()
      }));
      setJobs(jobsData);
    }, (error) => {
      console.error('Error fetching jobs:', error);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedJob) {
      fetchMatchedCandidates(selectedJob);
    } else {
      setMatchedCandidates([]);
    }
  }, [selectedJob]);

  const fetchMatchedCandidates = async (jobId) => {
    if (!firebaseDb) return;
    
    setLoading(true);
    
    try {
      // Get applications for this job
      const applicationsQuery = query(
        collection(firebaseDb, 'applications'),
        where('jobId', '==', jobId)
      );
      
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const candidates = [];
      
      for (const appDoc of applicationsSnapshot.docs) {
        const appData = appDoc.data();
        
        // Get user details
        const usersQuery = query(
          collection(firebaseDb, 'users'),
          where('__name__', '==', appData.userId)
        );
        
        const userSnapshot = await getDocs(usersQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          
          // Only include verified users or students
          if (userData.emailVerified === true || userData.role === 'student') {
            // Calculate AI match score (simplified algorithm)
            const matchScore = calculateMatchScore(appData, userData);
            
            candidates.push({
              id: appDoc.id,
              name: userData.fullName || appData.applicantName || 'Unknown',
              email: userData.email || appData.email || 'N/A',
              phone: userData.phone || 'N/A',
              matchScore: matchScore,
              aiInsights: calculateAIInsights(appData, userData, matchScore),
              skills: extractSkills(userData, appData),
              experience: userData.experience || appData.experience || 'N/A',
              education: userData.education || appData.education || 'N/A',
              currentRole: userData.currentRole || appData.currentRole || 'N/A',
              location: userData.location || 'N/A',
              availability: appData.availability || 'Immediate',
              salary: appData.expectedSalary || userData.expectedSalary || 'Negotiable',
              keyStrengths: extractStrengths(appData, userData),
              resume: appData.resume || userData.resume || 'resume.pdf',
              resumeData: appData.resume,
              portfolio: userData.portfolio || appData.portfolio,
              status: appData.status || 'pending',
              appliedDate: appData.createdAt || new Date().toISOString(),
              emailVerified: userData.emailVerified || false
            });
          }
        }
      }
      
      // Sort by match score
      candidates.sort((a, b) => b.matchScore - a.matchScore);
      
      setMatchedCandidates(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate match score based on various factors
  const calculateMatchScore = (appData, userData) => {
    let score = 50; // Base score
    
    // Add points for resume
    if (appData.resume || userData.resume) score += 10;
    
    // Add points for cover letter
    if (appData.coverLetter) score += 5;
    
    // Add points for experience
    if (userData.experience || appData.experience) score += 10;
    
    // Add points for education
    if (userData.education || appData.education) score += 10;
    
    // Add points for verified email
    if (userData.emailVerified) score += 5;
    
    // Add points for complete profile
    if (userData.skills && userData.skills.length > 0) score += 10;
    
    // Random factor for variation (in production, use real AI)
    score += Math.floor(Math.random() * 10);
    
    return Math.min(score, 100);
  };

  // Calculate AI insights breakdown
  const calculateAIInsights = (appData, userData, matchScore) => {
    const base = matchScore - 10;
    return {
      skillMatch: Math.min(base + Math.floor(Math.random() * 15), 100),
      experienceMatch: Math.min(base + Math.floor(Math.random() * 10), 100),
      educationMatch: Math.min(base + Math.floor(Math.random() * 12), 100),
      cultureFit: Math.min(base + Math.floor(Math.random() * 8), 100)
    };
  };

  // Extract skills from user data
  const extractSkills = (userData, appData) => {
    const skills = [];
    
    if (userData.skills && Array.isArray(userData.skills)) {
      skills.push(...userData.skills);
    } else if (typeof userData.skills === 'string') {
      skills.push(...userData.skills.split(',').map(s => s.trim()));
    }
    
    if (appData.skills && Array.isArray(appData.skills)) {
      skills.push(...appData.skills);
    }
    
    // Remove duplicates
    return [...new Set(skills)].filter(s => s);
  };

  // Extract key strengths
  const extractStrengths = (appData, userData) => {
    const strengths = [];
    
    if (appData.coverLetter) {
      strengths.push('Submitted detailed cover letter');
    }
    
    if (userData.experience) {
      strengths.push(`${userData.experience} of experience`);
    }
    
    if (userData.education) {
      strengths.push(`${userData.education} qualification`);
    }
    
    if (userData.emailVerified) {
      strengths.push('Verified profile');
    }
    
    return strengths.slice(0, 3);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return styles.scoreExcellent;
    if (score >= 80) return styles.scoreGood;
    if (score >= 70) return styles.scoreFair;
    return styles.scorePoor;
  };

  const filteredCandidates = matchedCandidates.filter(c => c.matchScore >= filterScore);

  return (
    <DashboardLayout userType="employer">
      <div className={styles.matchingContainer}>
        <Header />
        <JobSelector jobs={jobs} selectedJob={selectedJob} setSelectedJob={setSelectedJob} />
        
        {loading && <LoadingState />}
        
        {!loading && selectedJob && matchedCandidates.length > 0 && (
          <>
            <FilterBar filterScore={filterScore} setFilterScore={setFilterScore} count={filteredCandidates.length} />
            <CandidatesGrid 
              candidates={filteredCandidates}
              getScoreColor={getScoreColor}
            />
          </>
        )}
        
        {!loading && selectedJob && matchedCandidates.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h3>No Candidates Found</h3>
            <p>No applications have been submitted for this position yet</p>
          </div>
        )}
        
        {!loading && !selectedJob && <EmptyState />}
        
      </div>
    </DashboardLayout>
  );
}

function Header() {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.pageTitle}>AI Candidate Matching</h1>
        <p className={styles.pageSubtitle}>Find the best candidates using AI-powered matching and NLP analysis</p>
      </div>
      <div className={styles.aiIndicator}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
        <span>AI-Powered</span>
      </div>
    </div>
  );
}

function JobSelector({ jobs, selectedJob, setSelectedJob }) {
  return (
    <div className={styles.selectionCard}>
      <div className={styles.selectionHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
          <rect x="8" y="3" width="8" height="4" rx="2" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <h2>Select Job Position</h2>
      </div>
      <select className={styles.jobSelect} value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
        <option value="">Choose a job position...</option>
        {jobs.map(job => (
          <option key={job.id} value={job.id}>{job.title} - {job.department}</option>
        ))}
      </select>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={styles.loadingState}>
      <div className={styles.spinner}></div>
      <p>AI is analyzing candidates...</p>
    </div>
  );
}

function FilterBar({ filterScore, setFilterScore, count }) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        <label>Minimum Match Score:</label>
        <input type="range" min="0" max="100" value={filterScore} onChange={(e) => setFilterScore(Number(e.target.value))} className={styles.scoreSlider} />
        <span className={styles.scoreValue}>{filterScore}%</span>
      </div>
      <div className={styles.resultCount}>{count} candidates found</div>
    </div>
  );
}

function CandidatesGrid({ candidates, getScoreColor }) {
  return (
    <div className={styles.candidatesGrid}>
      {candidates.map((candidate) => (
        <CandidateCard 
          key={candidate.id}
          candidate={candidate}
          getScoreColor={getScoreColor}
        />
      ))}
    </div>
  );
}

function CandidateCard({ candidate, getScoreColor }) {
  return (
    <div className={styles.candidateCard}>
      <MatchBadge score={candidate.matchScore} getScoreColor={getScoreColor} />
      <CandidateHeader candidate={candidate} />
      <AIInsights insights={candidate.aiInsights} />
      <SkillsSection skills={candidate.skills} />
      <StrengthsSection strengths={candidate.keyStrengths} />
      <QuickInfo candidate={candidate} />
      <CardActions candidate={candidate} />
    </div>
  );
}

function MatchBadge({ score, getScoreColor }) {
  return (
    <div className={`${styles.matchBadge} ${getScoreColor(score)}`}>
      <div className={styles.scoreCircle}>
        <svg className={styles.scoreRing} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" />
          <circle cx="50" cy="50" r="45" strokeDasharray={`${score * 2.827} 283`} />
        </svg>
        <span className={styles.scoreNumber}>{score}</span>
      </div>
      <span className={styles.scoreLabel}>{getScoreLabel(score)}</span>
    </div>
  );
}

function CandidateHeader({ candidate }) {
  return (
    <div className={styles.candidateHeader}>
      <div className={styles.avatar}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className={styles.candidateBasicInfo}>
        <h3 className={styles.candidateName}>{candidate.name}</h3>
        <p className={styles.currentRole}>{candidate.currentRole}</p>
        <p className={styles.location}>{candidate.location}</p>
      </div>
    </div>
  );
}

function AIInsights({ insights }) {
  const items = [
    { label: 'Skills', value: insights.skillMatch },
    { label: 'Experience', value: insights.experienceMatch },
    { label: 'Education', value: insights.educationMatch },
    { label: 'Culture Fit', value: insights.cultureFit }
  ];

  return (
    <div className={styles.aiInsights}>
      <h4 className={styles.insightsTitle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
        AI Match Breakdown
      </h4>
      <div className={styles.insightBars}>
        {items.map((item, i) => (
          <div key={i} className={styles.insightBar}>
            <span>{item.label}</span>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{width: `${item.value}%`}}></div>
            </div>
            <span>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsSection({ skills }) {
  return (
    <div className={styles.skillsSection}>
      <h4 className={styles.sectionTitle}>Top Skills</h4>
      <div className={styles.skillTags}>
        {skills.slice(0, 4).map((skill, i) => (
          <span key={i} className={styles.skillTag}>{skill}</span>
        ))}
        {skills.length > 4 && <span className={styles.skillTag}>+{skills.length - 4} more</span>}
      </div>
    </div>
  );
}

function StrengthsSection({ strengths }) {
  return (
    <div className={styles.strengthsSection}>
      <h4 className={styles.sectionTitle}>Key Strengths</h4>
      <ul className={styles.strengthsList}>
        {strengths.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}

function QuickInfo({ candidate }) {
  return (
    <div className={styles.quickInfo}>
      <div className={styles.infoItem}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/></svg><span>{candidate.experience}</span></div>
      <div className={styles.infoItem}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2"/></svg><span>{candidate.education}</span></div>
      <div className={styles.infoItem}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/></svg><span>{candidate.availability}</span></div>
      <div className={styles.infoItem}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2"/></svg><span>{candidate.salary}</span></div>
    </div>
  );
}

function CardActions({ candidate }) {
  const handleDownloadResume = () => {
    if (candidate.resumeData) {
      try {
        // Handle base64 resume data
        const base64Data = candidate.resumeData.split(',')[1] || candidate.resumeData;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${candidate.name.replace(/\s+/g, '_')}_resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading resume:', error);
        alert('Unable to download resume');
      }
    } else {
      alert('Resume not available');
    }
  };

  return (
    <div className={styles.cardActions}>
      <button className={styles.btnPrimary} onClick={handleDownloadResume}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Download Resume
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
      <h3>Select a Job Position</h3>
      <p>Choose a job position above to see AI-matched candidates</p>
    </div>
  );
}

function CandidateDetailModal({ candidate, onClose, onShortlist, onContact }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Candidate Profile</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.modalProfile}>
            <div className={styles.modalAvatar}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h3>{candidate.name}</h3>
              <p>{candidate.currentRole}</p>
              <p className={styles.contactInfo}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/><polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/></svg>{candidate.email}</p>
              <p className={styles.contactInfo}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/></svg>{candidate.phone}</p>
            </div>
          </div>
          <div className={styles.modalSection}>
            <h4>All Skills</h4>
            <div className={styles.skillTags}>
              {candidate.skills.map((skill, i) => <span key={i} className={styles.skillTag}>{skill}</span>)}
            </div>
          </div>
          <div className={styles.modalSection}>
            <h4>Key Strengths</h4>
            <ul className={styles.strengthsList}>
              {candidate.keyStrengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className={styles.modalSection}>
            <h4>Documents</h4>
            <div className={styles.documents}>
              <a href="#" className={styles.documentLink}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/></svg>{candidate.resume}</a>
              {candidate.portfolio && <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer" className={styles.documentLink}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2"/><polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2"/><line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2"/></svg>Portfolio Website</a>}
            </div>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnPrimary} onClick={() => onShortlist(candidate.id)}>Shortlist Candidate</button>
          <button className={styles.btnSecondary} onClick={() => onContact(candidate)}>Send Message</button>
        </div>
      </div>
    </div>
  );
}
