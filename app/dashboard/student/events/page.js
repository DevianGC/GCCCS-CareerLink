'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './events.module.css';

export default function EventsPage() {
  // Real-time events from Firestore
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState(new Set());

  // Get current user
  useEffect(() => {
    const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe?.();
  }, []);

  // Fetch user's event registrations
  useEffect(() => {
    if (!firebaseDb || !currentUserId) return;

    const registrationsQuery = query(
      collection(firebaseDb, 'eventRegistrations'),
      where('userId', '==', currentUserId)
    );

    const unsubscribe = onSnapshot(registrationsQuery, (snapshot) => {
      const registeredEventIds = new Set(
        snapshot.docs.map(doc => doc.data().eventId)
      );
      setUserRegistrations(registeredEventIds);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Real-time listener for events
  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      return;
    }
    
    const eventsQuery = query(
      collection(firebaseDb, 'events'),
      where('status', 'in', ['Upcoming', 'Ongoing'])
    );
    
    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          isRegistered: userRegistrations.has(doc.id)
        }))
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateA - dateB;
        });
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      // If error is due to missing index, fetch all events
      const fallbackQuery = query(
        collection(firebaseDb, 'events')
      );
      const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
        const eventsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            isRegistered: userRegistrations.has(doc.id)
          }))
          .filter(event => event.status === 'Upcoming' || event.status === 'Ongoing')
          .sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);
            return dateA - dateB;
          });
        setEvents(eventsData);
        setLoading(false);
      });
      return () => fallbackUnsubscribe();
    });
    
    return () => unsubscribe();
  }, [userRegistrations]);

  // Filter states
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get unique event types
  const eventTypes = ['All', ...new Set(events.map(event => event.type))];

  // Filter events based on type and search term
  const filteredEvents = events.filter(event => {
    const matchesType = typeFilter === 'All' || event.type === typeFilter;
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Register for event
  const toggleRegistration = async (eventId) => {
    if (!currentUserId || !firebaseDb) {
      alert('Please log in to register for events');
      return;
    }

    try {
      const event = events.find(e => e.id === eventId);
      
      if (event?.isRegistered) {
        // Unregister - find and delete the registration
        const registrationsQuery = query(
          collection(firebaseDb, 'eventRegistrations'),
          where('userId', '==', currentUserId),
          where('eventId', '==', eventId)
        );
        
        const snapshot = await getDocs(registrationsQuery);
        const deletePromises = snapshot.docs.map(docSnapshot => 
          deleteDoc(doc(firebaseDb, 'eventRegistrations', docSnapshot.id))
        );
        await Promise.all(deletePromises);
        
      } else {
        // Register - add new registration
        await addDoc(collection(firebaseDb, 'eventRegistrations'), {
          userId: currentUserId,
          eventId: eventId,
          eventTitle: event?.title || '',
          eventDate: event?.date || '',
          registeredAt: serverTimestamp(),
          status: 'registered'
        });
      }
    } catch (error) {
      console.error('Error toggling event registration:', error);
      alert('Failed to update registration. Please try again.');
    }
  };

  // Group events by date for calendar view
  const eventsByDate = filteredEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

  // Sort dates for calendar view
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(a) - new Date(b));

  return (
    <DashboardLayout>
      <div className={styles.eventsContainer}>
        {selectedEvent ? (
          // Event detail view
          <div className={styles.eventDetailView}>
            <button 
              className={styles.backButton}
              onClick={() => setSelectedEvent(null)}
            >
              ← Back to Events
            </button>
            
            <div className={styles.eventDetailHeader}>
              <h1 className={styles.eventDetailTitle}>{selectedEvent.title}</h1>
              <span className={`${styles.eventType} ${styles[`eventType${selectedEvent.type.replace(/\s+/g, '')}`]}`}>
                {selectedEvent.type}
              </span>
            </div>
            
            <div className={styles.eventDetailImageContainer}>
              <div className={styles.eventDetailImagePlaceholder}>
                {/* This would be an actual image in production */}
                {selectedEvent.title.charAt(0)}
              </div>
            </div>
            
            <div className={styles.eventDetailInfo}>
              <div className={styles.eventDetailInfoItem}>
                <span className={styles.eventDetailInfoLabel}>Date:</span>
                <span className={styles.eventDetailInfoValue}>{formatDate(selectedEvent.date)}</span>
              </div>
              
              <div className={styles.eventDetailInfoItem}>
                <span className={styles.eventDetailInfoLabel}>Time:</span>
                <span className={styles.eventDetailInfoValue}>{selectedEvent.time}</span>
              </div>
              
              <div className={styles.eventDetailInfoItem}>
                <span className={styles.eventDetailInfoLabel}>Location:</span>
                <span className={styles.eventDetailInfoValue}>{selectedEvent.location}</span>
              </div>
              
              <div className={styles.eventDetailInfoItem}>
                <span className={styles.eventDetailInfoLabel}>Organizer:</span>
                <span className={styles.eventDetailInfoValue}>{selectedEvent.organizer}</span>
              </div>
            </div>
            
            <div className={styles.eventDetailDescription}>
              <h3>About This Event</h3>
              <p>{selectedEvent.description}</p>
              
              {selectedEvent.presenter && (
                <div className={styles.eventDetailSection}>
                  <h3>Presenter</h3>
                  <p>{selectedEvent.presenter}</p>
                </div>
              )}
              
              {selectedEvent.panelists && (
                <div className={styles.eventDetailSection}>
                  <h3>Panelists</h3>
                  <ul className={styles.eventDetailList}>
                    {selectedEvent.panelists.map((panelist, index) => (
                      <li key={index}>{panelist}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedEvent.companies && (
                <div className={styles.eventDetailSection}>
                  <h3>Participating Companies</h3>
                  <div className={styles.eventCompanies}>
                    {selectedEvent.companies.map((company, index) => (
                      <span key={index} className={styles.eventCompanyTag}>{company}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.eventDetailActions}>
              <button 
                className={`${styles.registerButton} ${selectedEvent.isRegistered ? styles.registeredButton : ''}`}
                onClick={() => toggleRegistration(selectedEvent.id)}
              >
                {selectedEvent.isRegistered ? 'Cancel Registration' : 'Register for Event'}
              </button>
              <button className={styles.addToCalendarButton}>Add to Calendar</button>
              <button className={styles.shareButton}>Share Event</button>
            </div>
          </div>
        ) : (
          // Events listing view
          <>
            <div className={styles.eventsHeader}>
              <h1 className={styles.eventsTitle}>Upcoming Events</h1>
              <div className={styles.viewToggle}>
                <button 
                  className={`${styles.viewToggleButton} ${viewMode === 'grid' ? styles.activeView : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  Grid View
                </button>
                <button 
                  className={`${styles.viewToggleButton} ${viewMode === 'calendar' ? styles.activeView : ''}`}
                  onClick={() => setViewMode('calendar')}
                >
                  Calendar View
                </button>
              </div>
            </div>

            <div className={styles.eventsControls}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <span className={styles.searchIcon}>🔍</span>
              </div>

              <div className={styles.filterBox}>
                <label htmlFor="typeFilter" className={styles.filterLabel}>Event Type:</label>
                <select
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {viewMode === 'grid' ? (
              // Grid view
              <div className={styles.eventsGrid}>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={styles.eventCard}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className={styles.eventImageContainer}>
                        <div className={styles.eventImagePlaceholder}>
                          {/* This would be an actual image in production */}
                          {event.title.charAt(0)}
                        </div>
                        <span className={`${styles.eventType} ${styles[`eventType${event.type.replace(/\s+/g, '')}`]}`}>
                          {event.type}
                        </span>
                      </div>
                      <div className={styles.eventContent}>
                        <h3 className={styles.eventTitle}>{event.title}</h3>
                        <div className={styles.eventInfo}>
                          <div className={styles.eventDate}>
                            <span className={styles.eventInfoIcon}>📅</span>
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className={styles.eventTime}>
                            <span className={styles.eventInfoIcon}>🕒</span>
                            <span>{event.time}</span>
                          </div>
                          <div className={styles.eventLocation}>
                            <span className={styles.eventInfoIcon}>📍</span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className={styles.eventDescription}>
                          {event.description.length > 120 
                            ? `${event.description.substring(0, 120)}...` 
                            : event.description}
                        </div>
                        <div className={styles.eventActions}>
                          <button 
                            className={`${styles.registerButton} ${event.isRegistered ? styles.registeredButton : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRegistration(event.id);
                            }}
                          >
                            {event.isRegistered ? 'Registered' : 'Register'}
                          </button>
                          <button 
                            className={styles.detailsButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noEvents}>
                    <h3>No events found</h3>
                    <p>Try adjusting your filters or search term</p>
                  </div>
                )}
              </div>
            ) : (
              // Calendar view
              <div className={styles.calendarView}>
                {sortedDates.length > 0 ? (
                  sortedDates.map(date => (
                    <div key={date} className={styles.calendarDay}>
                      <div className={styles.calendarDayHeader}>
                        <h3 className={styles.calendarDayTitle}>{formatDate(date)}</h3>
                      </div>
                      <div className={styles.calendarDayEvents}>
                        {eventsByDate[date].map(event => (
                          <div 
                            key={event.id} 
                            className={styles.calendarEvent}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className={styles.calendarEventTime}>{event.time}</div>
                            <div className={styles.calendarEventContent}>
                              <h4 className={styles.calendarEventTitle}>{event.title}</h4>
                              <div className={styles.calendarEventLocation}>
                                <span className={styles.eventInfoIcon}>📍</span>
                                <span>{event.location}</span>
                              </div>
                              <span className={`${styles.eventType} ${styles[`eventType${event.type.replace(/\s+/g, '')}`]}`}>
                                {event.type}
                              </span>
                            </div>
                            <div className={styles.calendarEventActions}>
                              <button 
                                className={`${styles.registerButton} ${event.isRegistered ? styles.registeredButton : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRegistration(event.id);
                                }}
                              >
                                {event.isRegistered ? 'Registered' : 'Register'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noEvents}>
                    <h3>No events found</h3>
                    <p>Try adjusting your filters or search term</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}