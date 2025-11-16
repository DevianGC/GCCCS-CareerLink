'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../components/Dashboard/DashboardLayout';
import Card from '../../../../../components/UI/Card/Card';
import Button from '../../../../../components/UI/Button/Button';

export default function JobApplyPage({ params }) {
  const { id } = params;
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', resume: '' });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would POST to your backend
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <DashboardLayout userType="student">
        <Card>
          <h1>Application Submitted!</h1>
          <p>Thank you for applying. We will review your application and contact you soon.</p>
          <Button variant="secondary" onClick={() => router.push('/dashboard/student/jobs')}>Back to Job Listings</Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <Card>
        <h1>Apply for Job #{id}</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Email:</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label>Resume (URL):</label>
            <input name="resume" value={form.resume} onChange={handleChange} required />
          </div>
          <Button variant="primary" type="submit">Submit Application</Button>
          <Button variant="secondary" onClick={() => router.back()} type="button">Cancel</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
