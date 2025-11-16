'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './events.module.css';

export default function CareerOfficeEvents() {
  // Real-time events from Firestore
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationCounts, setRegistrationCounts] = useState({});

  // Real-time listener for event registrations count
  useEffect(() => {
    if (!firebaseDb) return;

    const registrationsQuery = query(
      collection(firebaseDb, 'eventRegistrations')
    );

    const unsubscribe = onSnapshot(registrationsQuery, (snapshot) => {
      const counts = {};
      snapshot.docs.forEach(doc => {
        const eventId = doc.data().eventId;
        counts[eventId] = (counts[eventId] || 0) + 1;
      });
      setRegistrationCounts(counts);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for events
  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      return;
    }
    
    const eventsQuery = query(
      collection(firebaseDb, 'events')
    );
    
    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          registrations: registrationCounts[doc.id] || 0
        }))
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA;
        });
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [registrationCounts]);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    featured: 'all'
  });
  const [sortBy, setSortBy] = useState('date');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // New event template
  const newEventTemplate = {
    id: Date.now(),
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'Workshop',
    status: 'Draft',
    capacity: 50,
    registrations: 0,
    featured: false
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Upcoming': return styles.statusUpcoming;
      case 'Ongoing': return styles.statusOngoing;
      case 'Completed': return styles.statusCompleted;
      case 'Cancelled': return styles.statusCancelled;
      case 'Draft': return styles.statusDraft;
      default: return '';
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    // Search term filter
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = filters.status === 'all' || event.status === filters.status;
    
    // Type filter
    const matchesType = filters.type === 'all' || event.type === filters.type;
    
    // Featured filter
    const matchesFeatured = filters.featured === 'all' || 
                           (filters.featured === 'featured' && event.featured) ||
                           (filters.featured === 'regular' && !event.featured);
    
    return matchesSearch && matchesStatus && matchesType && matchesFeatured;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'registrations':
        return b.registrations - a.registrations;
      case 'capacity':
        return b.capacity - a.capacity;
      default:
        return 0;
    }
  });

  // Handle adding a new event
  const handleAddEvent = () => {
    setSelectedEvent({...newEventTemplate});
    setIsAddingEvent(true);
  };

  // Handle editing an event
  const handleEditEvent = (event) => {
    setSelectedEvent({...event});
    setIsEditingEvent(true);
  };

  // Handle viewing event details
  const handleViewEvent = (event) => {
    setSelectedEvent({...event});
  };

  // Handle deleting an event
  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  // Confirm delete event
  const confirmDeleteEvent = async () => {
    if (eventToDelete) {
      try {
        await deleteDoc(doc(firebaseDb, 'events', eventToDelete.id));
        setShowDeleteConfirm(false);
        setEventToDelete(null);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save event (add or edit)
  const saveEvent = async () => {
    if (!selectedEvent.title || !selectedEvent.date || !selectedEvent.location) {
      alert('Please fill in all required fields (Title, Date, Location)');
      return;
    }

    if (!firebaseDb) {
      alert('Firebase is not initialized. Please refresh the page.');
      return;
    }

    try {
      if (isAddingEvent) {
        // Add new event to Firebase
        const eventData = {
          title: selectedEvent.title,
          description: selectedEvent.description || '',
          location: selectedEvent.location,
          date: selectedEvent.date,
          startTime: selectedEvent.startTime || '',
          endTime: selectedEvent.endTime || '',
          type: selectedEvent.type || 'Workshop',
          status: selectedEvent.status || 'Upcoming',
          capacity: parseInt(selectedEvent.capacity) || 50,
          registrations: 0,
          featured: selectedEvent.featured || false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(firebaseDb, 'events'), eventData);
        setIsAddingEvent(false);
        alert('Event created successfully!');
      } else if (isEditingEvent) {
        // Update existing event in Firebase
        const updateData = {
          title: selectedEvent.title,
          description: selectedEvent.description || '',
          location: selectedEvent.location,
          date: selectedEvent.date,
          startTime: selectedEvent.startTime || '',
          endTime: selectedEvent.endTime || '',
          type: selectedEvent.type || 'Workshop',
          status: selectedEvent.status || 'Upcoming',
          capacity: parseInt(selectedEvent.capacity) || 50,
          featured: selectedEvent.featured || false,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(doc(firebaseDb, 'events', selectedEvent.id), updateData);
        setIsEditingEvent(false);
        alert('Event updated successfully!');
      }
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      console.error('Error details:', error.message, error.code);
      alert(`Failed to save event: ${error.message || 'Please try again.'}`);
    }
  };

  // Get unique event types for filter
  const eventTypes = [...new Set(events.map(event => event.type))];

  return (
    <DashboardLayout userType="career-office">
      <div className={styles.eventsContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Manage Events</h1>
          <div className={styles.actionButtons}>
            <button className={styles.actionButton} onClick={handleAddEvent}>
              + Add New Event
            </button>
          </div>
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.searchAndFilters}>
            <input
              type="text"
              placeholder="Search events..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select 
              className={styles.filterSelect}
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Draft">Draft</option>
            </select>
            
            <select 
              className={styles.filterSelect}
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="all">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select 
              className={styles.filterSelect}
              value={filters.featured}
              onChange={(e) => setFilters({...filters, featured: e.target.value})}
            >
              <option value="all">All Events</option>
              <option value="featured">Featured Only</option>
              <option value="regular">Regular Only</option>
            </select>
          </div>
          
          <div className={styles.sortOptions}>
            <span className={styles.sortLabel}>Sort by:</span>
            <select 
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="registrations">Registrations</option>
              <option value="capacity">Capacity</option>
            </select>
          </div>
        </div>

        <table className={styles.eventsTable}>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date & Time</th>
              <th>Location</th>
              <th>Status</th>
              <th>Registrations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map(event => (
              <tr key={event.id}>
                <td>
                  <div className={styles.eventTitle}>{event.title}</div>
                  <div className={styles.eventType}>{event.type} {event.featured && '⭐'}</div>
                </td>
                <td>
                  <div className={styles.eventDate}>{formatDate(event.date)}</div>
                  <div className={styles.eventTime}>{event.startTime} - {event.endTime}</div>
                </td>
                <td>
                  <div className={styles.eventLocation}>{event.location}</div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(event.status)}`}>
                    {event.status}
                  </span>
                </td>
                <td>
                  {event.registrations} / {event.capacity}
                </td>
                <td className={styles.actionColumn}>
                  <div className={styles.rowActions}>
                    <button 
                      className={`${styles.actionIcon} ${styles.viewIcon}`}
                      onClick={() => handleViewEvent(event)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button 
                      className={`${styles.actionIcon} ${styles.editIcon}`}
                      onClick={() => handleEditEvent(event)}
                      title="Edit Event"
                    >
                      ✏️
                    </button>
                    <button 
                      className={`${styles.actionIcon} ${styles.deleteIcon}`}
                      onClick={() => handleDeleteEvent(event)}
                      title="Delete Event"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedEvents.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>
                  No events found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add/Edit Event Modal */}
        {(isAddingEvent || isEditingEvent) && selectedEvent && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {isAddingEvent ? 'Add New Event' : 'Edit Event'}
                </h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => {
                    setIsAddingEvent(false);
                    setIsEditingEvent(false);
                    setSelectedEvent(null);
                  }}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Event Title</label>
                  <input
                    type="text"
                    name="title"
                    className={styles.formInput}
                    value={selectedEvent.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea
                    name="description"
                    className={styles.formTextarea}
                    value={selectedEvent.description}
                    onChange={handleInputChange}
                    placeholder="Enter event description"
                  ></textarea>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formColumn}>
                    <label className={styles.formLabel}>Event Type</label>
                    <select
                      name="type"
                      className={styles.formSelect}
                      value={selectedEvent.type}
                      onChange={handleInputChange}
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Career Fair">Career Fair</option>
                      <option value="Panel">Panel</option>
                      <option value="Networking">Networking</option>
                      <option value="Fair">Fair</option>
                      <option value="Information Session">Information Session</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className={styles.formColumn}>
                    <label className={styles.formLabel}>Status</label>
                    <select
                      name="status"
                      className={styles.formSelect}
                      value={selectedEvent.status}
                      onChange={handleInputChange}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Location</label>
                  <input
                    type="text"
                    name="location"
                    className={styles.formInput}
                    value={selectedEvent.location}
                    onChange={handleInputChange}
                    placeholder="Enter event location"
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formColumn}>
                    <label className={styles.formLabel}>Date</label>
                    <input
                      type="date"
                      name="date"
                      className={styles.formInput}
                      value={selectedEvent.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className={styles.formColumn}>
                    <label className={styles.formLabel}>Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      className={styles.formInput}
                      value={selectedEvent.startTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className={styles.formColumn}>
                    <label className={styles.formLabel}>End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      className={styles.formInput}
                      value={selectedEvent.endTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formColumn}>
                    <label className={styles.formLabel}>Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      className={styles.formInput}
                      value={selectedEvent.capacity}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                  
                  {isEditingEvent && (
                    <div className={styles.formColumn}>
                      <label className={styles.formLabel}>Current Registrations</label>
                      <input
                        type="number"
                        name="registrations"
                        className={styles.formInput}
                        value={selectedEvent.registrations}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  )}
                </div>
                
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={selectedEvent.featured}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="featured" className={styles.checkboxLabel}>
                    Featured Event (will be highlighted)
                  </label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  className={`${styles.actionButton} ${styles.secondaryButton}`}
                  onClick={() => {
                    setIsAddingEvent(false);
                    setIsEditingEvent(false);
                    setSelectedEvent(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={saveEvent}
                >
                  {isAddingEvent ? 'Create Event' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Event Details Modal */}
        {selectedEvent && !isAddingEvent && !isEditingEvent && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Event Details</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setSelectedEvent(null)}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalBody}>
                <h3>{selectedEvent.title} {selectedEvent.featured && '⭐'}</h3>
                <p><strong>Type:</strong> {selectedEvent.type}</p>
                <p><strong>Status:</strong> {selectedEvent.status}</p>
                <p><strong>Date:</strong> {formatDate(selectedEvent.date)}</p>
                <p><strong>Time:</strong> {selectedEvent.startTime} - {selectedEvent.endTime}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Registrations:</strong> {selectedEvent.registrations} / {selectedEvent.capacity}</p>
                <p><strong>Description:</strong></p>
                <p>{selectedEvent.description}</p>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  className={`${styles.actionButton} ${styles.secondaryButton}`}
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => {
                    handleEditEvent(selectedEvent);
                  }}
                >
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && eventToDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Confirm Delete</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setEventToDelete(null);
                  }}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalBody}>
                <p>Are you sure you want to delete the event "{eventToDelete.title}"?</p>
                <p>This action cannot be undone.</p>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  className={`${styles.actionButton} ${styles.secondaryButton}`}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setEventToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className={`${styles.actionButton}`}
                  style={{backgroundColor: 'var(--red-600)'}}
                  onClick={confirmDeleteEvent}
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}