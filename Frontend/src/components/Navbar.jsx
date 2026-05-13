import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Discover', to: '/discover' },
  { label: 'Profile', to: '/profile' },
  { label: 'Reels', to: '/reels' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Chat', to: '/chat' },
  { label: 'Friends', to: '/friends' },
  { label: 'Requests', to: '/requests' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Questions', to: '/past-questions' },
  { label: 'News', to: '/news' },
  { label: 'Settings', to: '/settings' }
];

function Navbar() {
  const [unread, setUnread] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('turtleg_token');
    if (!token) return;

    const loadCounts = () => {
      Promise.all([
        fetch('/api/users/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        }).then((res) => res.json()),
        fetch('/api/messages/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        }).then((res) => res.json())
      ])
        .then(([notifications, chatData]) => {
          const count = (notifications || []).filter((item) => !item.read).length;
          setUnread(count);
          setChatUnread(chatData?.count || 0);
        })
        .catch(() => {
          setUnread(0);
          setChatUnread(0);
        });
    };

    loadCounts();
    const intervalId = setInterval(loadCounts, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const logout = () => {
    localStorage.removeItem('turtleg_token');
    localStorage.removeItem('turtleg_user');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="brand">
        Turtle-G
        {unread > 0 && <span className="notification-badge">{unread}</span>}
      </div>
      <nav>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'active' : ''}>
            {link.label}
            {link.to === '/chat' && chatUnread > 0 && <span className="notification-badge chat-badge">{chatUnread}</span>}
          </NavLink>
        ))}
      </nav>
      <button className="btn-ghost" onClick={logout}>Logout</button>
    </header>
  );
}

export default Navbar;
