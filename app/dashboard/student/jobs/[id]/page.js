'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../components/Dashboard/DashboardLayout';
import Card from '../../../../../components/UI/Card/Card';
import Button from '../../../../../components/UI/Button/Button';

export default function JobDetailPage({ params }) {
  const { id } = params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/jobs`)
      .then(r => r.json())
      .then(data => {
        const found = data.find(j => String(j.id) === String(id));
        setJob(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  if (!job) return <DashboardLayout><div>Job not found.</div></DashboardLayout>;

  return (
    <DashboardLayout userType="student">
      <Card>
        <h1>{job.title}</h1>
        <h3>{job.company} &mdash; {job.location}</h3>
        <p><strong>Type:</strong> {job.type}</p>
        <p><strong>Salary:</strong> {job.salary}</p>
        <p><strong>Deadline:</strong> {job.deadline}</p>
        <h4>Description</h4>
        <p>{job.description}</p>
        <h4>Requirements</h4>
        <ul>
          {(Array.isArray(job.requirements) ? job.requirements : [job.requirements]).map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
        <Button variant="primary" href={`/dashboard/student/jobs/${job.id}/apply`}>Apply Now</Button>
        <Button variant="secondary" onClick={() => router.back()}>Back to Listings</Button>
      </Card>
    </DashboardLayout>
  );
}
