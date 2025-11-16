import React from 'react';
import styles from './jobForm.module.css';

export default function JobForm({ formState, setFormState, onSubmit, onCancel, loading, error, isEditing }) {
  return (
    <div className={styles.jobForm}>
      <div className={styles.formRow}>
        <label className={styles.formLabel}>Job Title</label>
        <input type="text" value={formState.title} onChange={e => setFormState(s => ({ ...s, title: e.target.value }))} className={styles.formInput} placeholder="e.g. Frontend Developer" />
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Company</label>
        <input type="text" value={formState.company} onChange={e => setFormState(s => ({ ...s, company: e.target.value }))} className={styles.formInput} placeholder="e.g. TechCorp Inc." />
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Location</label>
        <input type="text" value={formState.location} onChange={e => setFormState(s => ({ ...s, location: e.target.value }))} className={styles.formInput} placeholder="e.g. Remote" />
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Job Type</label>
        <select value={formState.type} onChange={e => setFormState(s => ({ ...s, type: e.target.value }))} className={styles.formSelect}>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Freelance">Freelance</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Salary</label>
        <input type="text" value={formState.salary} onChange={e => setFormState(s => ({ ...s, salary: e.target.value }))} className={styles.formInput} placeholder="e.g. ₱80,000 - ₱110,000" />
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Application Deadline</label>
        <input type="date" value={formState.deadline} onChange={e => setFormState(s => ({ ...s, deadline: e.target.value }))} className={styles.formInput} />
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Description</label>
        <textarea value={formState.description} onChange={e => setFormState(s => ({ ...s, description: e.target.value }))} className={styles.formTextarea} rows={5} />
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Requirements</label>
        <textarea value={formState.requirements} onChange={e => setFormState(s => ({ ...s, requirements: e.target.value }))} className={styles.formTextarea} rows={5} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formCheckboxRow}>
          <input type="checkbox" id="featured" checked={!!formState.featured} onChange={e => setFormState(s => ({ ...s, featured: e.target.checked }))} className={styles.formCheckbox} />
          <label htmlFor="featured" className={styles.formCheckboxLabel}>Mark as Featured Job</label>
        </div>
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Status</label>
        <select value={formState.status} onChange={e => setFormState(s => ({ ...s, status: e.target.value }))} className={styles.formSelect}>
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className={styles.jobFormActions}>
        <button className={`btn ${styles.cancelButton}`} onClick={onCancel} disabled={loading}>Cancel</button>
        <button className={`btn ${styles.saveButton}`} onClick={(e) => { e.preventDefault(); onSubmit({ isEdit: isEditing }); }} disabled={loading}>{loading ? (isEditing ? 'Saving...' : 'Posting...') : (isEditing ? 'Save Changes' : 'Post Job')}</button>
      </div>

      {error && <div className={styles.formError}>{error}</div>}
    </div>
  );
}
