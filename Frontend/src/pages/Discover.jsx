import { useEffect, useState } from 'react';
import axios from 'axios';

function Discover() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const token = localStorage.getItem('turtleg_token');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axios.get('/api/users/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to load users', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [token]);

  const updateUserFollow = (userId, changes) => {
    setUsers((current) => current.map((user) => (
      user._id === userId ? { ...user, ...changes } : user
    )));
  };

  const handleFollow = async (userId) => {
    setActioning(userId);
    try {
      const response = await axios.post(`/api/users/follow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUserFollow(userId, { requestPending: response.data.status === 'requested' });
    } catch (error) {
      console.error('Follow failed', error);
    } finally {
      setActioning(null);
    }
  };

  const handleUnfollow = async (userId) => {
    setActioning(userId);
    try {
      await axios.post(`/api/users/unfollow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUserFollow(userId, { isFollowing: false, requestPending: false });
    } catch (error) {
      console.error('Unfollow failed', error);
    } finally {
      setActioning(null);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Discover Students</h2>
        <p>Find classmates using Turtle-G and request to follow them. They must approve before their posts appear in your feed.</p>
      </div>

      {loading ? (
        <div className="loader">Loading students…</div>
      ) : users.length ? (
        <div className="discover-grid">
          {users.map((user) => (
            <div key={user._id} className="user-card">
              <div className="user-avatar">
                {user.profilePicUrl ? <img src={user.profilePicUrl} alt={user.name} /> : user.name?.[0]}
              </div>
              <div className="user-details">
                <h3>{user.name}</h3>
                <p>{user.bio || 'Student at Turtle-G'}</p>
                <div className="user-meta">
                  <span>{user.location || 'Location hidden'}</span>
                  <span>{user.followersCount || 0} followers</span>
                </div>
              </div>
              <button
                className={user.isFriend || user.requestPending ? 'btn-ghost' : 'btn-primary'}
                disabled={actioning === user._id || user.requestPending}
                onClick={() => (user.isFriend ? handleUnfollow(user._id) : handleFollow(user._id))}
              >
                {actioning === user._id
                  ? 'Working…'
                  : user.isFriend
                    ? 'Friends'
                    : user.requestPending
                      ? 'Requested'
                      : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No classmates are visible yet. Invite friends to join Turtle-G.</div>
      )}
    </section>
  );
}

export default Discover;
