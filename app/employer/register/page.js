'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { firebaseAuth } from '../../../lib/firebaseClient';
import Link from 'next/link';
import styles from './register.module.css';
import FormInput, { FormSelect } from '../../../components/UI/FormInput/FormInput';
import Button from '../../../components/UI/Button/Button';
import { getAuthConfig, getNavConfig, getValidationConfig } from '../../../utils/config';

export default function EmployerRegister() {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    contactFirstName: '',
    contactLastName: '',
    jobTitle: '',
    email: '',
    phone: '',
    companyWebsite: '',
    industry: '',
    companySize: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!formData.companySize) {
      newErrors.companySize = 'Please select company size';
    }

    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const validationConfig = getValidationConfig();

    if (!formData.contactFirstName.trim()) {
      newErrors.contactFirstName = 'Contact first name is required';
    }

    if (!formData.contactLastName.trim()) {
      newErrors.contactLastName = 'Contact last name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validationConfig.email.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < validationConfig.passwordMinLength) {
      newErrors.password = `Password must be at least ${validationConfig.passwordMinLength} characters`;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleNextStep = () => {
    const newErrors = validateStep1();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setResendMessage(data.error || 'Failed to resend verification email.');
      }
    } catch (error) {
      setResendMessage('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateStep2();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, formData.email, formData.password);
      const fullName = `${formData.contactFirstName} ${formData.contactLastName}`.trim();
      await updateProfile(cred.user, { displayName: fullName });
      
      // Send email verification
      await sendEmailVerification(cred.user);
      
      // Create employer profile
      const employerProfile = {
        firstName: formData.contactFirstName,
        lastName: formData.contactLastName,
        email: formData.email,
        role: 'employer',
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        companyWebsite: formData.companyWebsite,
        industry: formData.industry,
        companySize: formData.companySize,
        emailVerified: false,
        createdAt: new Date().toISOString()
      };

      const idToken = await cred.user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, profile: employerProfile })
      });
      
      // Show verification success screen
      setRegisteredEmail(formData.email);
      setVerificationSent(true);
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed' });
    }
  };

  // Show verification success screen
  if (verificationSent) {
    return (
      <div className={styles.registerPage}>
        <div className={styles.registerContainer}>
          <div className={styles.verificationCard}>
            <div className={styles.verificationIcon}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="38" stroke="#10b981" strokeWidth="4"/>
                <path d="M25 40L35 50L55 30" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="40" cy="40" r="30" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4"/>
              </svg>
            </div>
            <h1 className={styles.verificationTitle}>Verify Your Email</h1>
            <p className={styles.verificationText}>
              We've sent a verification email to
            </p>
            <p className={styles.verificationEmail}>{registeredEmail}</p>
            <p className={styles.verificationInstructions}>
              Please check your inbox and click the verification link to activate your account.
            </p>
            {resendMessage && (
              <p className={resendMessage.includes('sent') ? styles.verificationSuccess : styles.verificationError}>
                {resendMessage}
              </p>
            )}
            <div className={styles.verificationActions}>
              <button 
                onClick={handleResendVerification}
                disabled={resending}
                className={styles.resendButton}
              >
                {resending ? 'Resending...' : 'Resend Verification Email'}
              </button>
              <Link href="/employer/login" className={styles.verificationButton}>
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <div className={styles.registerHeader}>
            <h1 className={styles.registerTitle}>Register Your Company</h1>
            <p className={styles.registerSubtitle}>
              Join GCCCS CareerLink to connect with talented students and graduates.
            </p>
            
            {/* Step Indicator */}
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${currentStep >= 1 ? styles.stepActive : ''}`}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepLabel}>Company Info</span>
              </div>
              <div className={styles.stepConnector}></div>
              <div className={`${styles.step} ${currentStep >= 2 ? styles.stepActive : ''}`}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepLabel}>Contact & Account</span>
              </div>
            </div>
          </div>          {currentStep === 1 ? (
            <form className={styles.registerForm} onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
              {/* Company Information */}
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Company Information</h3>
              </div>

              <FormInput
                label="Company Name"
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                error={errors.companyName}
                placeholder="Your Company Name"
              />

              <div className={styles.formRow}>
                <FormSelect
                  label="Industry"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Industry' },
                    { value: 'technology', label: 'Technology' },
                    { value: 'healthcare', label: 'Healthcare' },
                    { value: 'finance', label: 'Finance & Banking' },
                    { value: 'education', label: 'Education' },
                    { value: 'manufacturing', label: 'Manufacturing' },
                    { value: 'retail', label: 'Retail & E-commerce' },
                    { value: 'consulting', label: 'Consulting' },
                    { value: 'marketing', label: 'Marketing & Advertising' },
                    { value: 'construction', label: 'Construction' },
                    { value: 'hospitality', label: 'Hospitality & Tourism' },
                    { value: 'nonprofit', label: 'Non-profit' },
                    { value: 'government', label: 'Government' },
                    { value: 'other', label: 'Other' },
                  ]}
                  required
                  error={errors.industry}
                />

                <FormSelect
                  label="Company Size"
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Size' },
                    { value: '1-10', label: '1-10 employees' },
                    { value: '11-50', label: '11-50 employees' },
                    { value: '51-200', label: '51-200 employees' },
                    { value: '201-500', label: '201-500 employees' },
                    { value: '501-1000', label: '501-1000 employees' },
                    { value: '1000+', label: '1000+ employees' },
                  ]}
                  required
                  error={errors.companySize}
                />
              </div>

              <FormInput
                label="Company Website (Optional)"
                type="url"
                id="companyWebsite"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                error={errors.companyWebsite}
                placeholder="https://www.yourcompany.com"
              />

              <Button type="submit" variant="primary" fullWidth>
                Continue to Contact Information
              </Button>
              {errors.general && <div className={styles.errorText}>{errors.general}</div>}
            </form>
          ) : (
            <form className={styles.registerForm} onSubmit={handleSubmit}>
              {/* Contact Person Information */}
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Contact Person Information</h3>
              </div>

              <div className={styles.formRow}>
                <FormInput
                  label="First Name"
                  type="text"
                  id="contactFirstName"
                  name="contactFirstName"
                  value={formData.contactFirstName}
                  onChange={handleChange}
                  required
                  error={errors.contactFirstName}
                />

                <FormInput
                  label="Last Name"
                  type="text"
                  id="contactLastName"
                  name="contactLastName"
                  value={formData.contactLastName}
                  onChange={handleChange}
                  required
                  error={errors.contactLastName}
                />
              </div>

              <FormInput
                label="Job Title"
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                required
                error={errors.jobTitle}
                placeholder="e.g., HR Manager, Recruiter, CEO"
              />

              <div className={styles.formRow}>
                <FormInput
                  label="Business Email"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={errors.email}
                  placeholder="contact@yourcompany.com"
                />

                <FormInput
                  label="Phone Number"
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  error={errors.phone}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Account Security */}
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Account Security</h3>
              </div>

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

              <FormInput
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={errors.confirmPassword}
              />

              {/* Terms and Conditions */}
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    I agree to the{' '}
                    <Link href="/terms" className={styles.link}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeToTerms && <div className={styles.errorText}>{errors.agreeToTerms}</div>}
              </div>

              <div className={styles.buttonGroup}>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handlePrevStep}
                  className={styles.backButton}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" className={styles.submitButton}>
                  Create Employer Account
                </Button>
              </div>
              {errors.general && <div className={styles.errorText}>{errors.general}</div>}
            </form>
          )}

          <div className={styles.registerFooter}>
            <p>
              Already have an employer account?{' '}
              <Link href="/employer/login" className={styles.loginLink}>
                Login here
              </Link>
            </p>
            <div className={styles.otherLogins}>
              <p className={styles.otherLoginLink}>
                <Link href="/auth/register">
                  Student/Alumni Registration
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
