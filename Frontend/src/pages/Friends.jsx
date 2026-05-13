import { useEffect, useState } from 'react';
import axios from 'axios';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioning, setActioning] = useState(null);
  const token = localStorage.getItem('turtleg_token');

  useEffect(() => {
    const loadFriends = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/users/friends', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFriends(response.data);
      } catch (err) {
        console.error(err);
        setError('Unable to load friends list');
      } finally {
        setLoading(false);
      }
    };
    loadFriends();
  }, [token]);

  const handleUnfriend = async (friendId) => {
    setActioning(friendId);
    try {
      await axios.post(`/api/users/unfollow/${friendId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends((current) => current.filter((friend) => friend._id !== friendId));
    } catch (err) {
      console.error('Unable to remove friend', err);
      setError('Could not remove friend. Please try again.');
    } finally {
      setActioning(null);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Friends</h2>
        <p>See classmates who are connected with you and stay in touch with your network.</p>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loader">Loading friends…</div>
      ) : friends.length ? (
        <div className="friend-grid">
          {friends.map((friend) => (
            <div key={friend._id} className="friend-card">
              <div className="friend-avatar">
                {friend.profilePicUrl ? <img src={friend.profilePicUrl} alt={friend.name} /> : friend.name?.[0]}
              </div>
              <div className="friend-info">
                <strong>{friend.name}</strong>
                <p>{friend.bio || 'Student friend'}</p>
                <p className="muted-text">{friend.location || 'Location hidden'}</p>
              </div>
              <button
                className="btn-ghost"
                disabled={actioning === friend._id}
                onClick={() => handleUnfriend(friend._id)}
              >
                {actioning === friend._id ? 'Removing…' : 'Unfriend'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">You don’t have any friends yet. Send a friend request to start building your network.</div>
      )}
    </section>
  );
}

export default Friends;
