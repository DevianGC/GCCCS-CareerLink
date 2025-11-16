"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../job.module.css';

export default function JobApply({ params }) {
  const p = React.use(params);
  const { id } = p || {};
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState(0);
  const [company, setCompany] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch('/api/jobs')
      .then(r => r.json())
      .then(response => { if (!mounted) return; const data = response.jobs || response.data || response; const found = (Array.isArray(data) ? data : []).find(j => String(j.id) === String(id)); if (found) { setJobTitle(found.title); setCompany(found.company || ''); } })
      .catch(() => {});
    return () => { mounted = false };
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
  const form = new FormData(e.target);
  const resumeFile = form.get('resume');
    setLoading(true);
    setError(null);

    const send = (resumeName, resumeData) => {
      const applicationData = {
        jobId: String(id),
        jobTitle,
        company,
        status: 'Applied'
      };
      
      // Add resume data if available
      if (resumeName && resumeData) {
        applicationData.resumeName = resumeName;
        applicationData.resumeData = resumeData;
      }
      
      fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      })
        .then(r => r.json())
        .then(() => {
          setSubmitted(true);
          setTimeout(() => router.push('/dashboard/student/applications'), 900);
        })
        .catch((err) => {
          setError(err.message || 'Failed to submit application');
        })
        .finally(() => setLoading(false));
    };

    // Validation: require a resume file (PDF) and limit size to 7 MB
    const MAX_BYTES = 7 * 1024 * 1024; // 7 MB
    if (!resumeFile || !resumeFile.size) {
      setError('Please choose a resume file (PDF) to upload.');
      setLoading(false);
      return;
    }
    if (resumeFile.type !== 'application/pdf') {
      setError('Only PDF resumes are allowed. Please upload a PDF file.');
      setLoading(false);
      return;
    }
    if (resumeFile.size > MAX_BYTES) {
      setError('File is too large. Maximum allowed size is 7 MB.');
      setLoading(false);
      return;
    }

    setSelectedFileName(resumeFile.name);
    setSelectedFileSize(resumeFile.size);

    if (resumeFile && resumeFile.size) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result; // includes data:...base64
        send(resumeFile.name, dataUrl);
      };
      reader.onerror = () => {
        setError('Failed to read resume file');
        setLoading(false);
      };
      reader.readAsDataURL(resumeFile);
    } else {
      // No resume file provided - still allow submission without resume
      send(null, null);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setSelectedFileName(f.name);
      setSelectedFileSize(f.size);
      setError(null);
    } else {
      setSelectedFileName('');
      setSelectedFileSize(0);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <h2>Application Submitted</h2>
        <p>Your application for {jobTitle ? `"${jobTitle}"` : `job #${id}`} was submitted. Redirecting to your applications...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Apply for {jobTitle ? jobTitle : `Job #${id}`}</h1>
      <form onSubmit={handleSubmit} className={styles.applyForm}>
        <div className={styles.fileInputWrapper}>
          <input id="resume" type="file" name="resume" accept="application/pdf" className={styles.fileInputHidden} onChange={handleFileChange} />
          <label htmlFor="resume" className={styles.fileButton}>Choose File</label>
          <div className={styles.fileNameText}>
            {selectedFileName ? `Selected: ${selectedFileName} (${(selectedFileSize / 1024 / 1024).toFixed(2)} MB)` : 'No file chosen'}
          </div>
        </div>

        <div className={styles.fileHint}>
          Please upload a PDF version of your resume. Maximum file size: 7 MB.
        </div>

        <button type="submit" className={styles.applyButton} disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
