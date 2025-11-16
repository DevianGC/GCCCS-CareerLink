'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import Card, { CardHeader, CardBody, CardFooter } from '../../../../components/UI/Card/Card';
import Button from '../../../../components/UI/Button/Button';
import styles from './pathway.module.css';

export default function CareerPathwayPage() {
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  
  useEffect(() => {
    fetchPathways();
  }, []);

  const fetchPathways = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/career-pathways', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPathways(data.pathways || []);
      }
    } catch (error) {
      console.error('Error fetching career pathways:', error);
    } finally {
      setLoading(false);
    }
  };

  const pathway = pathways.find((r) => r.role === selectedRole);

  return (
    <DashboardLayout userType="student">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Career Pathway Recommender</h1>
        <p className={styles.subtitle}>Select your target role to see recommended skills, courses, and certifications.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading career pathways...</p>
        </div>
      ) : (
        <div className={styles.flexRow}>
          <div className={styles.selectorCol}>
            <Card className={styles.selectorCard}>
              <CardHeader>
                <label htmlFor="role-select" className={styles.label}>Target Role</label>
              </CardHeader>
              <CardBody>
                <select
                  id="role-select"
                  className={styles.select}
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                >
                  <option value="">-- Select a role --</option>
                  {pathways.map((r) => (
                    <option key={r.role} value={r.role}>{r.role}</option>
                  ))}
                </select>
              </CardBody>
            </Card>
          </div>
          <div className={styles.recommendCol}>
            {pathway && (
            <div className={styles.recommendations}>
              <Card className={styles.pathwayCard}>
                <CardHeader>
                  <h2 className={styles.roleTitle}>{pathway.role}</h2>
                </CardHeader>
                <CardBody>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Recommended Skills</h3>
                    <ul className={styles.list}>
                      {pathway.skills.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Recommended Courses</h3>
                    <ul className={styles.list}>
                      {pathway.courses.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Certifications</h3>
                    <ul className={styles.list}>
                      {pathway.certifications.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </CardBody>
                <CardFooter>
                  <Button variant="primary" href="/dashboard/student/profile">Update My Profile</Button>
                </CardFooter>
              </Card>
            </div>
          )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
