'use client';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import Card, { CardBody, CardHeader, CardFooter } from '../../../../components/UI/Card/Card';
import Button from '../../../../components/UI/Button/Button';
import Toast from '../../../../components/UI/Toast/Toast';
import styles from './matching.module.css';

// Simple similarity scoring between profile and a job
function scoreMatch(profile, job) {
  if (!job) return 0;
  const skills = toArray(profile?.skills).map(s => s.toLowerCase());
  const prefsTypes = toArray(profile?.jobTypes).map(s => s.toLowerCase());
  const prefsLocations = toArray(profile?.locations).map(s => s.toLowerCase());

  const jobReqs = toArray(job?.requirements).map(r => r.toLowerCase());
  const jobType = (job?.type || '').toLowerCase();
  const jobLocation = (job?.location || '').toLowerCase();

  // Skill overlap 0..1
  let skillScore = 0;
  if (skills.length && jobReqs.length) {
    const overlap = jobReqs.filter(r => skills.some(s => r.includes(s) || s.includes(r)));
    skillScore = overlap.length / jobReqs.length; // favor meeting listed requirements
  }

  // Preferences
  const typeBonus = prefsTypes.length ? (prefsTypes.includes(jobType) ? 1 : 0) : 0.3; // mild bonus if no prefs
  const locBonus = prefsLocations.length ? (prefsLocations.some(loc => jobLocation.includes(loc)) ? 1 : 0) : 0.3;

  const featuredBoost = job?.featured ? 0.1 : 0;

  // Weighted sum -> percentage
  const score = (skillScore * 0.65 + typeBonus * 0.2 + locBonus * 0.15 + featuredBoost) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      // handle stringified arrays if any
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export default function StudentMatchingPage() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState({}); // jobId -> true
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.allSettled([
      fetch('/api/profile', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/jobs', { cache: 'no-store' }).then(r => r.json()),
    ])
      .then(([pRes, jRes]) => {
        if (!mounted) return;
        const p = pRes.status === 'fulfilled' ? pRes.value : null;
        const j = jRes.status === 'fulfilled' ? jRes.value : [];

        if (p && p.error) {
          // not logged in or other error; proceed without profile
          setProfile(null);
        } else if (p && p.profile) {
          setProfile(p.profile);
        }

        setJobs(Array.isArray(j) ? j : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || 'Failed to load recommendations');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const ranked = useMemo(() => {
    const withScores = jobs
      .map(job => ({ ...job, matchScore: scoreMatch(profile, job) }))
      .sort((a, b) => b.matchScore - a.matchScore);
    return withScores;
  }, [jobs, profile]);

  const handleApply = async (job) => {
    if (!job) return;
    try {
      setApplied(prev => ({ ...prev, [job.id]: 'loading' }));
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: String(job.id),
          jobTitle: job.title,
          company: job.company || '',
          status: 'Applied',
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || 'Failed to apply');
      setApplied(prev => ({ ...prev, [job.id]: true }));
      setToast({ message: `Applied to "${job.title}" successfully`, type: 'success' });
      setTimeout(() => setToast({ message: '', type: 'info' }), 2500);
    } catch (e) {
      setApplied(prev => ({ ...prev, [job.id]: false }));
      setToast({ message: e?.message || 'Application failed', type: 'error' });
      setTimeout(() => setToast({ message: '', type: 'info' }), 3000);
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Job & Internship Matching</h1>
        <p className={styles.subtitle}>
          {profile ? 'Personalized recommendations based on your profile.' : 'Sign in and complete your profile for better recommendations.'}
        </p>
      </div>

      <Toast message={toast.message} type={toast.type} />

      {loading ? (
        <div className={styles.loadingBox}>Loading recommendations…</div>
      ) : error ? (
        <div className={styles.errorBox}>{error}</div>
      ) : ranked.length === 0 ? (
        <div className={styles.emptyState}>No jobs found. Please check back later.</div>
      ) : (
        <div className={styles.grid}>
          {ranked.map((job) => (
            <Card key={job.id} className={styles.card}>
              <CardHeader className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <div className={styles.companyRow}>
                    <span className={styles.company}>{job.company}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.location}>{job.location}</span>
                  </div>
                </div>
                <div className={styles.scoreBadge} title="AI Match Score">
                  {job.matchScore}%
                </div>
              </CardHeader>
              <CardBody>
                <p className={styles.description}>
                  {job.description?.length > 180 ? job.description.slice(0, 180) + '…' : job.description}
                </p>
                {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                  <div className={styles.reqs}>
                    <div className={styles.reqsLabel}>Top Requirements</div>
                    <ul className={styles.reqsList}>
                      {job.requirements.slice(0, 3).map((r, i) => (
                        <li key={i} className={styles.reqItem}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardBody>
              <CardFooter className={styles.footer}>
                <div className={styles.meta}>
                  <span className={styles.typeTag}>{job.type}</span>
                  {job.salary && <span className={styles.salary}>{job.salary}</span>}
                </div>
                <div className={styles.actions}>
                  <Button variant="text" href={`/jobs/${job.id}`}>View</Button>
                  <Button
                    variant="primary"
                    disabled={applied[job.id] === true || applied[job.id] === 'loading'}
                    onClick={() => handleApply(job)}
                  >
                    {applied[job.id] === true ? 'Applied' : (applied[job.id] === 'loading' ? 'Applying…' : 'Apply Now')}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
