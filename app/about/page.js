import Image from 'next/image';
import Link from 'next/link';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>About GCCCS CareerLink</h1>
            <p className={styles.heroSubtitle}>
              Empowering students and graduates with the resources they need to succeed in their professional journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className="container">
          <div className={styles.missionContent}>
            <h2 className={styles.sectionTitle}>Our Mission</h2>
            <p className={styles.missionText}>
              The GCCCS Career Office is dedicated to empowering students and graduates with the resources, connections, and opportunities they need to succeed in their professional journeys. We bridge the gap between academic excellence and career achievement.
            </p>
            <p className={styles.missionText}>
              We believe that every student deserves access to quality career guidance, job opportunities, and professional development resources. Our platform serves as a centralized hub where students can explore career paths, connect with employers, and access valuable resources to help them navigate their professional journey.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className="container">
          <div className={styles.teamContent}>
            <h2 className={styles.sectionTitle}>Our Team</h2>
            <div className={styles.teamGrid}>

            {/* Team Member 1 */}
            <div className={styles.teamMember} style={{"--animation-order": 1}}>
              <div className={styles.teamMemberImage}>
                <Image 
                  src="/Janico.png" 
                  alt="Janico Gyle Sorio"
                  width={200}
                  height={200}
                  className={styles.teamImage}
                />
              </div>
              <h3 className={styles.teamMemberName}>Janico Gyle Sorio</h3>
              <p className={styles.teamMemberRole}>Backend Developer</p>
              <p className={styles.teamMemberBio}>
                Janico leads our team with passion and expertise.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className={styles.teamMember} style={{"--animation-order": 2}}>
              <div className={styles.teamMemberImage}>
                <Image 
                  src="/Devian.jpg" 
                  alt="John Ian Ormides"
                  width={200}
                  height={200}
                  className={styles.teamImage}
                />
              </div>
              <h3 className={styles.teamMemberName}>John Ian Ormides</h3>
              <p className={styles.teamMemberRole}>Frontend Developer</p>
              <p className={styles.teamMemberBio}>
                John builds and maintains relationships with employers to create opportunities for our students and graduates.
              </p>
            </div>

            
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.servicesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Our Services</h2>
          <div className={styles.servicesGrid}>
            {/* Service 1 */}
            <div className={styles.serviceCard} style={{"--animation-order": 1}}>
              <div className={styles.serviceIcon}>📝</div>
              <h3 className={styles.serviceTitle}>Career Counseling</h3>
              <p className={styles.serviceDescription}>
                One-on-one sessions with career counselors to help you explore career options, set goals, and develop action plans.
              </p>
            </div>

            {/* Service 2 */}
            <div className={styles.serviceCard} style={{"--animation-order": 2}}>
              <div className={styles.serviceIcon}>💼</div>
              <h3 className={styles.serviceTitle}>Job Placement</h3>
              <p className={styles.serviceDescription}>
                Access to exclusive job listings from our partner companies and organizations specifically looking for GCCCS talent.
              </p>
            </div>

            {/* Service 3 */}
            <div className={styles.serviceCard} style={{"--animation-order": 3}}>
              <div className={styles.serviceIcon}>📚</div>
              <h3 className={styles.serviceTitle}>Resource Library</h3>
              <p className={styles.serviceDescription}>
                Comprehensive collection of career resources, including resume templates, interview guides, and industry insights.
              </p>
            </div>

            {/* Service 4 */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>📅</div>
              <h3 className={styles.serviceTitle}>Events & Workshops</h3>
              <p className={styles.serviceDescription}>
                Regular career events, workshops, and networking opportunities to help you build professional connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <div className="container">
          <div className={styles.contactContent}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p className={styles.contactText}>
              Have questions or need assistance? Our team is here to help you navigate your career journey.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem} style={{"--animation-order": 1}}>
                <span className={styles.contactIcon}>📍</span>
                <span>Gordon College, Olongapo City, Philippines</span>
              </div>
              <div className={styles.contactItem} style={{"--animation-order": 2}}>
                <span className={styles.contactIcon}>📞</span>
                <span>+63 (47) 123-4567</span>
              </div>
              <div className={styles.contactItem} style={{"--animation-order": 3}}>
                <span className={styles.contactIcon}>✉️</span>
                <span>careers@gcccs.edu.ph</span>
              </div>
              <div className={styles.contactItem} style={{"--animation-order": 4}}>
                <span className={styles.contactIcon}>🕒</span>
                <span>Monday - Friday: 8:00 AM - 5:00 PM</span>
              </div>
            </div>
            <div className={styles.contactCta}>
              <Link href="/contact">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}