'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './communications.module.css';

export default function EmployerCommunications() {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Get current user
  useEffect(() => {
    const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe?.();
  }, []);

  // Fetch messages from Firebase
  useEffect(() => {
    if (!firebaseDb || !currentUserId) {
      setLoading(false);
      return;
    }

    const messagesQuery = query(
      collection(firebaseDb, 'messages'),
      where('recipientId', '==', currentUserId)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB - dateA;
      });
      
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Fetch notifications from Firebase (using applications for now)
  useEffect(() => {
    if (!firebaseDb || !currentUserId) return;

    // Get applications for employer's jobs to create notifications
    const applicationsQuery = query(
      collection(firebaseDb, 'applications')
    );

    const unsubscribe = onSnapshot(applicationsQuery, async (snapshot) => {
      const notificationsData = [];
      
      for (const appDoc of snapshot.docs) {
        const appData = appDoc.data();
        
        // Fetch job to check if it belongs to this employer
        const jobQuery = query(
          collection(firebaseDb, 'jobs'),
          where('__name__', '==', appData.jobId)
        );
        
        const jobSnapshot = await new Promise((resolve) => {
          const unsub = onSnapshot(jobQuery, (snap) => {
            unsub();
            resolve(snap);
          });
        });

        if (!jobSnapshot.empty) {
          const jobData = jobSnapshot.docs[0].data();
          
          // Only include if job belongs to this employer
          if (jobData.employerId === currentUserId || jobData.createdBy === currentUserId) {
            notificationsData.push({
              id: appDoc.id,
              title: 'New Application Received',
              message: `${appData.applicantName || 'Someone'} applied for ${jobData.title}`,
              date: appData.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              time: appData.createdAt?.split('T')[1]?.substring(0, 5) || '00:00',
              read: appData.notificationRead || false,
              type: 'application'
            });
          }
        }
      }
      
      setNotifications(notificationsData.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;
      }));
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  const unreadMessages = messages.filter(msg => !msg.read).length;
  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    if (!message.read && firebaseDb) {
      try {
        const messageRef = doc(firebaseDb, 'messages', message.id);
        await updateDoc(messageRef, { read: true });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleNotificationClick = async (notificationId) => {
    if (firebaseDb) {
      try {
        const notifRef = doc(firebaseDb, 'applications', notificationId);
        await updateDoc(notifRef, { notificationRead: true });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseDb || !currentUserId) return;
    
    try {
      await addDoc(collection(firebaseDb, 'messages'), {
        senderId: currentUserId,
        recipientId: composeData.to,
        subject: composeData.subject,
        content: composeData.message,
        preview: composeData.message.substring(0, 100) + '...',
        from: 'Employer',
        fromEmail: firebaseAuth?.currentUser?.email || '',
        type: 'employer',
        read: false,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
      
      setComposeData({ to: '', subject: '', message: '' });
      setShowComposeModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'announcement':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1L10.5 6H15L11 9.5L12.5 15L8 12L3.5 15L5 9.5L1 6H5.5L8 1Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'candidate':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 14C2 11.7909 4.68629 10 8 10C11.3137 10 14 11.7909 14 14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 5L8 9L14 5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
    }
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'application':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="2" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 6H10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 9H10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'interview':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 1V5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 1V5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'job':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="5" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="5" y="2" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5V8L11 11" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
    }
  };

  return (
    <DashboardLayout userType="employer">
      <div className={styles.communicationsContainer}>
        <div className={styles.communicationsHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Messages</h1>
            <p className={styles.pageSubtitle}>Manage messages and notifications</p>
          </div>
          <button 
            className={styles.composeButton}
            onClick={() => setShowComposeModal(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Compose Message
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'messages' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages ({unreadMessages})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'notifications' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications ({unreadNotifications})
            </button>
          </div>
        </div>

        <div className={styles.contentContainer}>
          {activeTab === 'messages' && (
            <div className={styles.messagesLayout}>
              {/* Messages List */}
              <div className={styles.messagesList}>
                {loading ? (
                  <div className={styles.loadingState}>
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="12" width="36" height="24" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6 15L24 27L42 15" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <p>No messages yet</p>
                  </div>
                ) : (
                  messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`${styles.messageItem} ${!message.read ? styles.unread : ''} ${selectedMessage?.id === message.id ? styles.selected : ''}`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className={styles.messageIcon}>
                      {getMessageTypeIcon(message.type)}
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageFrom}>{message.from}</span>
                        <span className={styles.messageTime}>{message.time}</span>
                      </div>
                      <h4 className={styles.messageSubject}>{message.subject}</h4>
                      <p className={styles.messagePreview}>{message.preview}</p>
                    </div>
                    {!message.read && <div className={styles.unreadDot}></div>}
                  </div>
                ))
                )}
              </div>

              {/* Message Detail */}
              <div className={styles.messageDetail}>
                {selectedMessage ? (
                  <div className={styles.messageDetailContent}>
                    <div className={styles.messageDetailHeader}>
                      <h2 className={styles.messageDetailSubject}>{selectedMessage.subject}</h2>
                      <div className={styles.messageDetailMeta}>
                        <span className={styles.messageDetailFrom}>From: {selectedMessage.from}</span>
                        <span className={styles.messageDetailDate}>{selectedMessage.date} at {selectedMessage.time}</span>
                      </div>
                    </div>
                    <div className={styles.messageDetailBody}>
                      <pre className={styles.messageText}>{selectedMessage.content}</pre>
                    </div>
                    <div className={styles.messageActions}>
                      <button className={styles.replyButton}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 8L7 4V7C11 7 14 9 14 13C13 11 11 10 7 10V13L3 8Z" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        Reply
                      </button>
                      <button className={styles.forwardButton}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 8L9 4V7C5 7 2 9 2 13C3 11 5 10 9 10V13L13 8Z" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        Forward
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noMessageSelected}>
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="8" y="16" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 20L32 36L56 20" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <h3>Select a message to read</h3>
                    <p>Choose a message from the list to view its contents</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={styles.notificationsList}>
              {loading ? (
                <div className={styles.loadingState}>
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2"/>
                    <path d="M24 18V24L28 28" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className={styles.notificationIcon}>
                    {getNotificationTypeIcon(notification.type)}
                  </div>
                  <div className={styles.notificationContent}>
                    <h4 className={styles.notificationTitle}>{notification.title}</h4>
                    <p className={styles.notificationMessage}>{notification.message}</p>
                    <span className={styles.notificationTime}>{notification.date} at {notification.time}</span>
                  </div>
                  {!notification.read && <div className={styles.unreadDot}></div>}
                </div>
              ))
              )}
            </div>
          )}
        </div>

        {/* Compose Message Modal */}
        {showComposeModal && (
          <div className={styles.modalOverlay} onClick={() => setShowComposeModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Compose Message</h2>
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowComposeModal(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleComposeSubmit} className={styles.composeForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>To:</label>
                  <select
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Select recipient</option>
                    <option value="career@gc.edu">Career Office</option>
                    <option value="john.smith@email.com">John Smith</option>
                    <option value="maria.garcia@email.com">Maria Garcia</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Subject:</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    className={styles.formInput}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Message:</label>
                  <textarea
                    value={composeData.message}
                    onChange={(e) => setComposeData(prev => ({ ...prev, message: e.target.value }))}
                    className={styles.formTextarea}
                    rows="8"
                    required
                  />
                </div>
                
                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => setShowComposeModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.sendButton}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2L7 9" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M14 2L10 14L7 9L2 6L14 2Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
