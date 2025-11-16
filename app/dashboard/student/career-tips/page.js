'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './career-tips.module.css';

export default function CareerTipsPage() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTip, setActiveTip] = useState(null);

  useEffect(() => {
    fetchCareerTips();
  }, []);

  const fetchCareerTips = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/career-tips', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTips(data.tips || []);
      }
    } catch (error) {
      console.error('Error fetching career tips:', error);
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading career tips...</p>
          </div>
        ) : !activeTip ? (
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