'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './interviews.module.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

export default function InterviewScheduling() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    candidate: '',
    candidateName: '',
    date: '',
    time: '',
    duration: 60,
    type: 'video',
    status: 'scheduled',
    notes: ''
  });
  const [candidates, setCandidates] = useState([]);

  // Get current user
  useEffect(() => {
    const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe?.();
  }, []);

  // Fetch candidates from applications
  useEffect(() => {
    if (!firebaseDb || !currentUserId) return;

    const fetchCandidates = async () => {
      try {
        // Get all applications
        const applicationsSnapshot = await getDocs(collection(firebaseDb, 'applications'));
        const candidatesMap = new Map();

        for (const appDoc of applicationsSnapshot.docs) {
          const appData = appDoc.data();
          const userId = appData.userId;

          if (!candidatesMap.has(userId)) {
            // Fetch user details
            const usersQuery = query(
              collection(firebaseDb, 'users'),
              where('__name__', '==', userId)
            );
            const userSnapshot = await getDocs(usersQuery);

            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              candidatesMap.set(userId, {
                id: userId,
                name: userData.fullName || appData.applicantName || 'Unknown',
                email: userData.email || appData.email || 'N/A',
                position: appData.jobTitle || 'N/A'
              });
            }
          }
        }

        setCandidates(Array.from(candidatesMap.values()));
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };

    fetchCandidates();
  }, [currentUserId]);

  // Fetch interviews from Firebase
  useEffect(() => {
    if (!firebaseDb || !currentUserId) {
      setLoading(false);
      return;
    }

    const interviewsQuery = query(
      collection(firebaseDb, 'interviews'),
      where('employerId', '==', currentUserId)
    );

    const unsubscribe = onSnapshot(interviewsQuery, (snapshot) => {
      const interviewsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const startDateTime = new Date(data.date + 'T' + data.time);
        const endDateTime = new Date(startDateTime.getTime() + (data.duration || 60) * 60000);

        return {
          id: doc.id,
          title: data.title || `Interview with ${data.candidateName}`,
          start: startDateTime,
          end: endDateTime,
          candidate: data.candidate || data.candidateName,
          candidateName: data.candidateName,
          type: data.type || 'video',
          status: data.status || 'scheduled',
          notes: data.notes || '',
          duration: data.duration || 60
        };
      });

      setEvents(interviewsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching interviews:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const handleSelectSlot = (slotInfo) => {
    setFormData({
      ...formData,
      date: slotInfo.start.toISOString().split('T')[0],
      time: slotInfo.start.toTimeString().slice(0, 5)
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      candidate: event.candidate,
      candidateName: event.candidateName || event.candidate,
      date: event.start.toISOString().split('T')[0],
      time: event.start.toTimeString().slice(0, 5),
      duration: Math.round((event.end - event.start) / (1000 * 60)),
      type: event.type,
      status: event.status,
      notes: event.notes || ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If candidate is selected, update candidateName
    if (name === 'candidate') {
      const selectedCandidate = candidates.find(c => c.id === value);
      setFormData({
        ...formData,
        [name]: value,
        candidateName: selectedCandidate ? selectedCandidate.name : value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firebaseDb || !currentUserId) {
      toast.error('Unable to save interview');
      return;
    }

    try {
      const interviewData = {
        title: formData.title,
        candidate: formData.candidate,
        candidateName: formData.candidateName || formData.candidate,
        date: formData.date,
        time: formData.time,
        duration: parseInt(formData.duration),
        type: formData.type,
        status: formData.status,
        notes: formData.notes,
        employerId: currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (selectedEvent) {
        // Update existing interview
        const interviewRef = doc(firebaseDb, 'interviews', selectedEvent.id);
        await updateDoc(interviewRef, {
          ...interviewData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Interview updated successfully');
      } else {
        // Create new interview
        await addDoc(collection(firebaseDb, 'interviews'), interviewData);
        toast.success('Interview scheduled successfully');
      }

      setShowModal(false);
      setSelectedEvent(null);
      setFormData({
        title: '',
        candidate: '',
        candidateName: '',
        date: '',
        time: '',
        duration: 60,
        type: 'video',
        status: 'scheduled',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving interview:', error);
      toast.error('Failed to save interview');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this interview?')) {
      return;
    }

    if (!firebaseDb || !selectedEvent) {
      toast.error('Unable to delete interview');
      return;
    }

    try {
      await deleteDoc(doc(firebaseDb, 'interviews', selectedEvent.id));
      setShowModal(false);
      setSelectedEvent(null);
      toast.success('Interview deleted successfully');
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Failed to delete interview');
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '';
    switch (event.status) {
      case 'scheduled':
        backgroundColor = '#3174ad';
        break;
      case 'completed':
        backgroundColor = '#5cb85c';
        break;
      case 'cancelled':
        backgroundColor = '#d9534f';
        break;
      default:
        backgroundColor = '#3174ad';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.8em',
        padding: '2px 5px'
      }
    };
  };

  return (
    <DashboardLayout userType="employer">
      <div className={styles.container}>
        <h1 className={styles.title}>Interview Scheduling</h1>
        
        <div className={styles.controls}>
          <button 
            className={styles.newButton}
            onClick={() => {
              setSelectedEvent(null);
              setFormData({
                title: '',
                candidate: '',
                candidateName: '',
                date: '',
                time: '',
                duration: 60,
                type: 'video',
                status: 'scheduled',
                notes: ''
              });
              setShowModal(true);
            }}
          >
            Schedule New Interview
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <p>Loading interviews...</p>
          </div>
        ) : (
          <div className={styles.calendarContainer}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              defaultView="week"
              views={['month', 'week', 'day', 'agenda']}
              min={new Date(0, 0, 0, 8, 0, 0)} // 8 AM
              max={new Date(0, 0, 0, 20, 0, 0)} // 8 PM
            />
          </div>
        )}

        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>{selectedEvent ? 'Edit Interview' : 'Schedule New Interview'}</h2>
                <button 
                  className={styles.closeButton} 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedEvent(null);
                  }}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                    placeholder="E.g., Technical Interview for Senior Developer"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Candidate</label>
                  <select
                    name="candidate"
                    value={formData.candidate}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Select a candidate...</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} - {candidate.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Time</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Duration (minutes)</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="30">30 min</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Interview Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="video">Video Call</option>
                      <option value="in-person">In-Person</option>
                      <option value="phone">Phone Call</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    rows="3"
                    placeholder="Any additional notes or instructions..."
                  />
                </div>

                <div className={styles.formActions}>
                  {selectedEvent && (
                    <button 
                      type="button" 
                      className={styles.deleteButton}
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  )}
                  <div>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={() => {
                        setShowModal(false);
                        setSelectedEvent(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      {selectedEvent ? 'Update' : 'Schedule'} Interview
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
