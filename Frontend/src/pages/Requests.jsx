import { useEffect, useState } from 'react';
import axios from 'axios';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    try {
      const response = await axios.get('/api/users/requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setRequests(response.data);
    } catch (err) {
      setError('Could not load requests');
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id, action) => {
    setWorking(true);
    setError('');
    try {
      await axios.post(`/api/users/requests/${action}/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      await loadRequests();
    } catch (err) {
      setError('Unable to update request');
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Friend Requests</h2>
        <p>Approve or decline pending friend requests from classmates before they can see your posts.</p>
      </div>
      {error && <div className="error-message">{error}</div>}
      {requests.length ? (
        <div className="request-panel">
          {requests.map((request) => (
            <div key={request._id} className="request-card">
              <div>
                <strong>{request.name}</strong>
                <p className="muted-text">{request.bio || 'Student requester'}</p>
              </div>
              <div className="request-actions">
                <button className="btn-primary" disabled={working} onClick={() => handleAction(request._id, 'accept')}>
                  Accept
                </button>
                <button className="btn-danger" disabled={working} onClick={() => handleAction(request._id, 'reject')}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="settings-card">
          <p>No follow requests right now. Good job keeping your network tidy.</p>
        </div>
      )}
    </section>
  );
}

export default Requests;
