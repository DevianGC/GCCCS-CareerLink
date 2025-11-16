'use client';

import { useState } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './help.module.css';

export default function AlumniHelp() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { 
      id: 'all', 
      name: 'All Topics', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    },
    { 
      id: 'mentorship', 
      name: 'Mentorship', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
    },
    { 
      id: 'profile', 
      name: 'Profile & Account', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
    { 
      id: 'networking', 
      name: 'Networking', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    { 
      id: 'opportunities', 
      name: 'Opportunities', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    },
    { 
      id: 'technical', 
      name: 'Technical Support', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>
    },
  ];

  const faqs = [
    {
      id: 1,
      category: 'mentorship',
      question: 'How do I become a mentor?',
      answer: 'To become a mentor, go to your Profile page and enable "Available for Mentorship" under the Mentorship Preferences section. You can then select your areas of expertise, maximum number of mentees, and preferred meeting frequency. Once activated, students can send you mentorship requests.'
    },
    {
      id: 2,
      category: 'mentorship',
      question: 'How do I schedule a mentoring session?',
      answer: 'Navigate to the Mentorship page and go to the "Active Mentees" tab. Click on "Schedule Session" for the mentee you want to meet with. Fill in the date, time, duration, topic, and optional meeting link. The session will be added to your Sessions tab and the mentee will be notified.'
    },
    {
      id: 3,
      category: 'mentorship',
      question: 'Can I decline a mentorship request?',
      answer: 'Yes, you can decline mentorship requests. In the Mentorship page under "Mentee Requests" tab, each request has an "Accept" and "Decline" button. You can decline if your mentee capacity is full or if the request doesn\'t align with your expertise.'
    },
    {
      id: 4,
      category: 'mentorship',
      question: 'How many mentees can I have at once?',
      answer: 'You can set your maximum number of mentees (1-5) in your Profile under Mentorship Preferences. This helps you manage your time effectively while making a meaningful impact.'
    },
    {
      id: 5,
      category: 'profile',
      question: 'How do I update my career information?',
      answer: 'Go to your Profile page and click "Edit Profile". You can update your current company, position, industry, years of experience, and skills. Make sure to click "Save Changes" when you\'re done.'
    },
    {
      id: 6,
      category: 'profile',
      question: 'How do I add achievements or certifications?',
      answer: 'In your Profile page, navigate to the "Achievements & Recognition" section. Here you can add professional achievements, certifications, and awards. Click on the respective "Add" buttons and fill in the details.'
    },
    {
      id: 7,
      category: 'profile',
      question: 'Can I add my LinkedIn profile?',
      answer: 'Yes! In the Personal Information section of your Profile, there\'s a field for your LinkedIn profile URL. Adding this helps students connect with you professionally.'
    },
    {
      id: 8,
      category: 'profile',
      question: 'Why should I complete my profile?',
      answer: 'A complete profile helps students understand your background, expertise, and career journey. It makes you more discoverable for mentorship opportunities and showcases your achievements to inspire current students.'
    },
    {
      id: 9,
      category: 'networking',
      question: 'How can I connect with other alumni?',
      answer: 'The Alumni Dashboard provides updates on networking events and career fairs where you can meet fellow alumni. You can also engage through mentorship programs and alumni-specific events.'
    },
    {
      id: 10,
      category: 'opportunities',
      question: 'Can I post job opportunities for students?',
      answer: 'Yes! As an alumnus, you can share job and internship opportunities with current students through the platform. This helps students gain valuable career opportunities and strengthens the alumni-student connection.'
    },
    {
      id: 11,
      category: 'technical',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click on the "Forgot Password" link on the login page. Enter your registered email address, and you\'ll receive instructions to reset your password.'
    },
    {
      id: 12,
      category: 'technical',
      question: 'How do I update my email address?',
      answer: 'Currently, email changes require assistance from the Career Office. Please contact support with your current email and the new email you\'d like to use.'
    },
    {
      id: 13,
      category: 'technical',
      question: 'The platform is not loading properly. What should I do?',
      answer: 'Try clearing your browser cache and cookies, or try a different browser. Make sure you\'re using an updated version of Chrome, Firefox, Safari, or Edge. If the problem persists, contact technical support.'
    },
    {
      id: 14,
      category: 'mentorship',
      question: 'How do I send advice to my mentees?',
      answer: 'In the Mentorship page under "Active Mentees" tab, click "Send Advice" for the mentee you want to reach. Enter a subject and your message. This is great for sharing quick tips, resources, or encouragement between sessions.'
    },
    {
      id: 15,
      category: 'networking',
      question: 'How do I stay updated on alumni events?',
      answer: 'Check the "Recent Updates" section on your Dashboard regularly. You\'ll see announcements about career fairs, networking events, and other alumni activities. You can also check the Events section for a full calendar.'
    }
  ];

  const supportResources = [
    {
      id: 1,
      title: 'Contact Career Office',
      description: 'Reach out to the career office for general inquiries and assistance',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      contact: 'career@college.edu',
      type: 'email'
    },
    {
      id: 2,
      title: 'Technical Support',
      description: 'Get help with technical issues, account problems, or platform bugs',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
      contact: 'support@college.edu',
      type: 'email'
    },
    {
      id: 3,
      title: 'Phone Support',
      description: 'Call us for immediate assistance during business hours (9 AM - 5 PM)',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      contact: '(555) 123-4567',
      type: 'phone'
    },
    {
      id: 4,
      title: 'Alumni Relations',
      description: 'Connect with alumni relations for networking opportunities and events',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
      contact: 'alumni@college.edu',
      type: 'email'
    }
  ];

  const quickLinks = [
    { 
      id: 1, 
      title: 'Getting Started Guide', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>,
      url: '#' 
    },
    { 
      id: 2, 
      title: 'Mentorship Best Practices', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
      url: '#' 
    },
    { 
      id: 3, 
      title: 'Profile Setup Tutorial', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4M12 16V8"/></svg>,
      url: '#' 
    },
    { 
      id: 4, 
      title: 'Privacy Policy', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
      url: '#' 
    },
    { 
      id: 5, 
      title: 'Terms of Service', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      url: '#' 
    },
    { 
      id: 6, 
      title: 'Community Guidelines', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      url: '#' 
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <DashboardLayout userType="alumni">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Help & Support</h1>
          <p className={styles.subtitle}>Find answers to your questions and get assistance</p>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className={styles.categories}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${activeCategory === category.id ? styles.active : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* FAQs Section */}
        <div className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map(faq => (
                <div key={faq.id} className={styles.faqItem}>
                  <button
                    className={styles.faqQuestion}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <span className={styles.faqIcon}>
                      {expandedFaq === faq.id ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                <p>No FAQs found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Support Resources */}
        <div className={styles.supportSection}>
          <h2 className={styles.sectionTitle}>Contact Support</h2>
          <div className={styles.supportGrid}>
            {supportResources.map(resource => (
              <div key={resource.id} className={styles.supportCard}>
                <div className={styles.supportIcon}>{resource.icon}</div>
                <h3 className={styles.supportTitle}>{resource.title}</h3>
                <p className={styles.supportDescription}>{resource.description}</p>
                <div className={styles.supportContact}>
                  {resource.type === 'email' ? (
                    <a href={`mailto:${resource.contact}`} className={styles.contactLink}>
                      {resource.contact}
                    </a>
                  ) : (
                    <a href={`tel:${resource.contact.replace(/[^0-9]/g, '')}`} className={styles.contactLink}>
                      {resource.contact}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.quickLinksSection}>
          <h2 className={styles.sectionTitle}>Quick Links</h2>
          <div className={styles.quickLinksGrid}>
            {quickLinks.map(link => (
              <a key={link.id} href={link.url} className={styles.quickLink}>
                <span className={styles.quickLinkIcon}>{link.icon}</span>
                <span className={styles.quickLinkTitle}>{link.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Additional Help section removed */}
      </div>
    </DashboardLayout>
  );
}
