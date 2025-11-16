'use client';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import Card, { CardHeader, CardBody } from '../../../../components/UI/Card/Card';
import styles from './help.module.css';

const FAQS = [
  {
    q: 'How do I update my profile?',
    a: 'Go to My Profile in the dashboard sidebar, edit your details, and click Save.'
  },
  {
    q: 'How do I apply for jobs or internships?',
    a: 'Browse Job Listings or use AI Matching, then click Apply on any job to submit your application.'
  },
  {
    q: 'How do I request a mentor?',
    a: 'Go to the Mentorship page, select a mentor, and click Send Request.'
  },
  {
    q: 'How do I reset my password?',
    a: 'Log out, then use the Forgot Password link on the login page to reset your password.'
  },
  {
    q: 'Who can I contact for support?',
    a: 'See the Contact Support section below for help.'
  }
];

export default function HelpPage() {
  return (
    <DashboardLayout userType="student">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Help & FAQ</h1>
        <p className={styles.subtitle}>Find answers to common questions and get support.</p>
      </div>
      <div className={styles.flexRow}>
        <div className={styles.faqCol}>
          <Card className={styles.faqCard}>
            <CardHeader>
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            </CardHeader>
            <CardBody>
              <ul className={styles.faqList}>
                {FAQS.map((item, i) => (
                  <li key={i} className={styles.faqItem}>
                    <div className={styles.faqQ}>{item.q}</div>
                    <div className={styles.faqA}>{item.a}</div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
        <div className={styles.supportCol}>
          <Card className={styles.supportCard}>
            <CardHeader>
              <h2 className={styles.sectionTitle}>Contact Support</h2>
            </CardHeader>
            <CardBody>
              <div className={styles.supportInfo}>
                <p>If you need further assistance, please contact our support team:</p>
                <ul className={styles.contactList}>
                  <li>Email: <a href="mailto:support@gcccs-careerlink.com">support@gcccs-careerlink.com</a></li>
                  <li>Phone: <a href="tel:+639123456789">+63 912 345 6789</a></li>
                  <li>Office: Career Center, Main Campus, Room 101</li>
                </ul>
                <p>For urgent issues, please include your student ID and a detailed description of your problem.</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
