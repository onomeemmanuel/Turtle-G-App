import { useEffect, useState } from 'react';
import axios from 'axios';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await axios.get('/api/users/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
        });
        setNotifications(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
    const intervalId = setInterval(loadNotifications, 4000);
    return () => clearInterval(intervalId);
  }, []);

  const markRead = async () => {
    await axios.post('/api/users/notifications/read-all', {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
    });
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Notifications</h2>
        <p>See the latest follower alerts and activity updates.</p>
      </div>
      <div className="settings-card">
        <button className="btn-primary" onClick={markRead}>Mark all as read</button>
      </div>
      {loading ? (
        <div className="loader">Loading notifications…</div>
      ) : notifications.length ? (
        <div className="notifications-list">
          {notifications.map((notification, index) => (
            <div key={index} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
              <p>{notification.message}</p>
              <span>{new Date(notification.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      ) : (
        <p>No notifications yet.</p>
      )}
    </section>
  );
}

export default Notifications;
