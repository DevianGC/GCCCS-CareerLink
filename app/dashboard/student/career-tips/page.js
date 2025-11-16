'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './career-tips.module.css';

export default function CareerTipsPage() {
  // Mock data for career tips
  const [tips, setTips] = useState([
    {
      id: 1,
      title: 'Mastering the Technical Interview',
      category: 'Interviews',
      author: 'Sarah Johnson',
      authorRole: 'Senior Recruiter at TechCorp',
      date: '2023-10-10',
      readTime: '5 min read',
      content: `
        <p>Technical interviews can be intimidating, but with the right preparation, you can showcase your skills effectively.</p>
        <h3>Key Strategies:</h3>
        <ul>
          <li>Practice common coding problems on platforms like LeetCode or HackerRank</li>
          <li>Review fundamental data structures and algorithms</li>
          <li>Explain your thought process clearly as you solve problems</li>
          <li>Ask clarifying questions before diving into solutions</li>
          <li>Prepare examples of past projects that demonstrate your technical abilities</li>
        </ul>
        <p>Remember, interviewers are often more interested in how you approach problems than whether you get the perfect answer immediately.</p>
      `,
      image: '/images/tips/technical-interview.jpg',
      featured: true,
    },
    {
      id: 2,
      title: 'Building a Professional Portfolio',
      category: 'Career Development',
      author: 'Michael Chen',
      authorRole: 'UX Design Lead at DesignHub',
      date: '2023-10-05',
      readTime: '7 min read',
      content: `
        <p>A strong portfolio is essential for showcasing your skills to potential employers.</p>
        <h3>Portfolio Best Practices:</h3>
        <ul>
          <li>Focus on quality over quantity - include your best 4-6 projects</li>
          <li>For each project, explain the problem, your approach, and the outcome</li>
          <li>Include visual elements like screenshots, diagrams, or prototypes</li>
          <li>Highlight your specific contributions for team projects</li>
          <li>Keep your portfolio updated with recent work</li>
        </ul>
        <p>Your portfolio should tell a story about who you are as a professional and what unique value you bring.</p>
      `,
      image: '/images/tips/portfolio.jpg',
      featured: true,
    },
    {
      id: 3,
      title: 'Networking Strategies for Introverts',
      category: 'Networking',
      author: 'Emily Rodriguez',
      authorRole: 'Career Coach',
      date: '2023-09-28',
      readTime: '4 min read',
      content: `
        <p>Networking doesn't have to be overwhelming, even if you're an introvert.</p>
        <h3>Introvert-Friendly Networking Tips:</h3>
        <ul>
          <li>Prepare talking points and questions in advance</li>
          <li>Set small, achievable goals (e.g., talk to three new people)</li>
          <li>Take breaks when needed to recharge</li>
          <li>Follow up with meaningful, personalized messages</li>
          <li>Consider online networking through LinkedIn or industry forums</li>
        </ul>
        <p>Remember that quality connections often matter more than quantity.</p>
      `,
      image: '/images/tips/networking.jpg',
      featured: false,
    },
    {
      id: 4,
      title: 'Resume Keywords That Get You Noticed',
      category: 'Job Applications',
      author: 'David Park',
      authorRole: 'HR Director',
      date: '2023-09-20',
      readTime: '6 min read',
      content: `
        <p>With many companies using ATS (Applicant Tracking Systems), using the right keywords is crucial.</p>
        <h3>Keyword Optimization Tips:</h3>
        <ul>
          <li>Study the job description and mirror key terms</li>
          <li>Include industry-specific technical skills and certifications</li>
          <li>Use action verbs that demonstrate impact (e.g., implemented, increased, reduced)</li>
          <li>Incorporate both spelled-out terms and acronyms (e.g., "Search Engine Optimization (SEO)")</li>
          <li>Update keywords for each application to match the specific role</li>
        </ul>
        <p>Remember to use keywords naturally and honestly - don't claim skills you don't have.</p>
      `,
      image: '/images/tips/resume.jpg',
      featured: false,
    },
    {
      id: 5,
      title: 'Negotiating Your First Job Offer',
      category: 'Salary Negotiation',
      author: 'Alex Thompson',
      authorRole: 'Career Advisor',
      date: '2023-09-15',
      readTime: '8 min read',
      content: `
        <p>Many new graduates accept their first offer without negotiation, potentially leaving money on the table.</p>
        <h3>Negotiation Strategies for Beginners:</h3>
        <ul>
          <li>Research salary ranges for similar positions in your area</li>
          <li>Consider the entire compensation package, not just salary</li>
          <li>Practice your negotiation conversation with a friend</li>
          <li>Be professional and express enthusiasm for the role</li>
          <li>Have a specific number in mind based on your research</li>
        </ul>
        <p>Even a small increase in starting salary can compound significantly over your career.</p>
      `,
      image: '/images/tips/negotiation.jpg',
      featured: false,
    },
  ]);

  // State for category filter
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTip, setActiveTip] = useState(null);

  // Get unique categories
  const categories = ['All', ...new Set(tips.map(tip => tip.category))];

  // Filter tips based on category and search term
  const filteredTips = tips.filter(tip => {
    const matchesCategory = categoryFilter === 'All' || tip.category === categoryFilter;
    const matchesSearch = 
      tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured tips
  const featuredTips = tips.filter(tip => tip.featured);

  return (
    <DashboardLayout>
      <div className={styles.careerTipsContainer}>
        <div className={styles.careerTipsHeader}>
          <h1 className={styles.careerTipsTitle}>Career Tips & Resources</h1>
        </div>

        {!activeTip ? (
          <>
            {/* Featured tips carousel */}
            {featuredTips.length > 0 && (
              <div className={styles.featuredSection}>
                <h2 className={styles.sectionTitle}>Featured Tips</h2>
                <div className={styles.featuredGrid}>
                  {featuredTips.map(tip => (
                    <div 
                      key={tip.id} 
                      className={styles.featuredCard}
                      onClick={() => setActiveTip(tip)}
                    >
                      <div className={styles.featuredImageContainer}>
                        <div className={styles.featuredImagePlaceholder}>
                          {/* This would be an actual image in production */}
                          {tip.title.charAt(0)}
                        </div>
                      </div>
                      <div className={styles.featuredContent}>
                        <span className={styles.tipCategory}>{tip.category}</span>
                        <h3 className={styles.featuredTitle}>{tip.title}</h3>
                        <div className={styles.tipMeta}>
                          <span>{tip.date}</span>
                          <span>•</span>
                          <span>{tip.readTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search and filter */}
            <div className={styles.controlsSection}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search tips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <span className={styles.searchIcon}>🔍</span>
              </div>

              <div className={styles.categoryFilters}>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`${styles.categoryButton} ${categoryFilter === category ? styles.activeCategory : ''}`}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips grid */}
            <div className={styles.tipsGrid}>
              {filteredTips.length > 0 ? (
                filteredTips.map(tip => (
                  <div 
                    key={tip.id} 
                    className={styles.tipCard}
                    onClick={() => setActiveTip(tip)}
                  >
                    <div className={styles.tipImageContainer}>
                      <div className={styles.tipImagePlaceholder}>
                        {/* This would be an actual image in production */}
                        {tip.title.charAt(0)}
                      </div>
                    </div>
                    <div className={styles.tipContent}>
                      <span className={styles.tipCategory}>{tip.category}</span>
                      <h3 className={styles.tipTitle}>{tip.title}</h3>
                      <div className={styles.tipMeta}>
                        <span>{tip.date}</span>
                        <span>•</span>
                        <span>{tip.readTime}</span>
                      </div>
                      <div className={styles.tipAuthor}>
                        <div className={styles.authorAvatar}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                            <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className={styles.authorInfo}>
                          <div className={styles.authorName}>{tip.author}</div>
                          <div className={styles.authorRole}>{tip.authorRole}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <h3>No tips found</h3>
                  <p>Try adjusting your filters or search term</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.tipDetailView}>
            <button 
              className={styles.backButton}
              onClick={() => setActiveTip(null)}
            >
              ← Back to Tips
            </button>
            <div className={styles.tipDetailHeader}>
              <span className={styles.tipCategory}>{activeTip.category}</span>
              <h1 className={styles.tipDetailTitle}>{activeTip.title}</h1>
              <div className={styles.tipDetailMeta}>
                <span>{activeTip.date}</span>
                <span>•</span>
                <span>{activeTip.readTime}</span>
              </div>
              <div className={styles.tipAuthor}>
                <div className={styles.authorAvatar}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{activeTip.author}</div>
                  <div className={styles.authorRole}>{activeTip.authorRole}</div>
                </div>
              </div>
            </div>
            <div className={styles.tipDetailImageContainer}>
              <div className={styles.tipDetailImagePlaceholder}>
                {/* This would be an actual image in production */}
                {activeTip.title.charAt(0)}
              </div>
            </div>
            <div 
              className={styles.tipDetailContent}
              dangerouslySetInnerHTML={{ __html: activeTip.content }}
            />
            {/* Only show share/save if not featured */}
            { !activeTip.featured && (
              <div className={styles.tipDetailFooter}>
                <button className={styles.shareButton}>Share This Tip</button>
                <button className={styles.saveButton}>Save for Later</button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}