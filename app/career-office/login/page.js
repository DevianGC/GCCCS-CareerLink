'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './career-office-login.module.css';
import FormInput from '../../../components/UI/FormInput/FormInput';
import Button from '../../../components/UI/Button/Button';
import { getNavConfig, getValidationConfig } from '../../../utils/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../../../lib/firebaseClient';

export default function CareerOfficeLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const validationConfig = getValidationConfig();

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validationConfig.email.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, formData.email, formData.password);
      const idToken = await cred.user.getIdToken();

      // Create HTTP-only session cookie in our app
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      // Verify role and redirect
      let isCareerOffice = false;
      try {
        const meRes = await fetch('/api/me', { cache: 'no-store' });
        if (meRes.ok) {
          const me = await meRes.json();
          const role = me?.user?.role || me?.profile?.role;
          isCareerOffice = role === 'career_office';
        }
      } catch {}

      const navConfig = getNavConfig();
      if (isCareerOffice) {
        window.location.href = navConfig.dashboardRedirects.careerOffice || '/dashboard/career-office';
      } else {
        setErrors({ general: 'This account is not authorized for the Career Office.' });
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.officeBadge}>Career Office Portal</div>
            <h1 className={styles.loginTitle}>Admin Login</h1>
            <p className={styles.loginSubtitle}>
              Sign in to access the GCCCS CareerLink management dashboard
            </p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            {errors.general && (
              <div className={styles.errorMessage}>{errors.general}</div>
            )}

            <FormInput
              label="Email Address"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
            />

            <FormInput
              label="Password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
            />

            <Button type="submit" variant="primary" fullWidth className={styles.loginButton}>
              Login
            </Button>
          </form>

          <div className={styles.loginFooter}>
            <Link href="/auth/login" className={styles.backLink}>
              ← Back to Role Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}