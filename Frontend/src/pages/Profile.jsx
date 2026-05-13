import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedCard from '../components/FeedCard.jsx';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestActioning, setRequestActioning] = useState(null);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    profilePicUrl: '',
    birthday: '',
    age: '',
    location: '',
    questions: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      const response = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      const user = response.data;
      setProfile(user);
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        profilePicUrl: user.profilePicUrl || '',
        birthday: user.birthday || '',
        age: user.age || '',
        location: user.location || '',
        questions: (user.questions || []).join('\n')
      });
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadMyPosts = async () => {
      const response = await axios.get('/api/posts/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setMyPosts(response.data);
    };
    loadMyPosts();
  }, []);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await axios.get('/api/users/requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Failed to load follow requests', error);
      } finally {
        setLoadingRequests(false);
      }
    };
    loadRequests();
  }, []);

  const handleFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, profilePicUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);
    const payload = {
      name: form.name,
      bio: form.bio,
      profilePicUrl: form.profilePicUrl,
      birthday: form.birthday,
      age: Number(form.age),
      location: form.location,
      questions: form.questions.split('\n').filter(Boolean)
    };
    try {
      const response = await axios.patch('/api/users/me', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setProfile(response.data);
      setEditing(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    setRequestActioning(requesterId);
    try {
      await axios.post(`/api/users/requests/accept/${requesterId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setRequests((current) => current.filter((item) => item._id !== requesterId));
    } catch (error) {
      console.error('Accept request failed', error);
    } finally {
      setRequestActioning(null);
    }
  };

  const handleRejectRequest = async (requesterId) => {
    setRequestActioning(requesterId);
    try {
      await axios.post(`/api/users/requests/reject/${requesterId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setRequests((current) => current.filter((item) => item._id !== requesterId));
    } catch (error) {
      console.error('Reject request failed', error);
    } finally {
      setRequestActioning(null);
    }
  };

  if (!profile) {
    return (
      <section className="page-section">
        <div className="loader">Loading profile…</div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Your Profile</h2>
        <p>Build a richer student profile with bio, location, birthday, and crowns.</p>
      </div>
      <div className="profile-panel profile-edit-panel">
        <div className="profile-avatar large">
          {profile.profilePicUrl ? <img src={profile.profilePicUrl} alt={profile.name} /> : profile.name?.[0]}
        </div>
        <div>
          <div className="profile-meta">
            <h3>{profile.name}</h3>
            <span className="badge">{profile.crownCount || 0} crowns</span>
          </div>
          <p>{profile.bio}</p>
          <div className="profile-fields">
            <span>Age: {profile.age || '—'}</span>
            <span>Birthday: {profile.birthday || '—'}</span>
            <span>Location: {profile.location || '—'}</span>
          </div>
          <div className="profile-stats">
            <span>{profile.followers?.length || 0} followers</span>
            <span>{profile.following?.length || 0} following</span>
            <span>{profile.friends?.length || 0} friends</span>
          </div>
          {profile.friends?.length > 0 && (
            <div className="profile-friends">
              <h4>Your Friends</h4>
              <div className="friend-grid">
                {profile.friends.map((friend) => (
                  <div key={friend._id} className="friend-card">
                    <div className="friend-avatar">
                      {friend.profilePicUrl ? <img src={friend.profilePicUrl} alt={friend.name} /> : friend.name?.[0]}
                    </div>
                    <div>
                      <strong>{friend.name}</strong>
                      <p className="muted-text">{friend.location || 'Student'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(loadingRequests || requests.length > 0) && (
            <div className="request-panel">
              <h4>Follow requests</h4>
              {loadingRequests ? (
                <p className="muted-text">Loading requests…</p>
              ) : requests.length ? (
                <div className="request-list">
                  {requests.map((request) => (
                    <div key={request._id} className="request-card">
                      <div>
                        <strong>{request.name}</strong>
                        <p>{request.bio || 'Wants to follow you'}</p>
                      </div>
                      <div className="request-actions">
                        <button
                          className="btn-primary"
                          disabled={requestActioning === request._id}
                          onClick={() => handleAcceptRequest(request._id)}
                        >
                          {requestActioning === request._id ? 'Saving…' : 'Accept'}
                        </button>
                        <button
                          className="btn-ghost"
                          disabled={requestActioning === request._id}
                          onClick={() => handleRejectRequest(request._id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted-text">No one is waiting to follow you right now.</p>
              )}
            </div>
          )}
          {profile.questions?.length > 0 && (
            <div className="profile-questions">
              <h4>About Me</h4>
              <ul>
                {profile.questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      </div>

      {editing && (
        <form className="profile-form" onSubmit={handleSave}>
          <h3>Edit Profile</h3>
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows="3" />
          <label>Location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <label>Birthday</label>
          <input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
          <label>Age</label>
          <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <label>Profile picture</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {form.profilePicUrl && <img className="upload-preview" src={form.profilePicUrl} alt="Profile preview" />}
          <label>Profile questions (one per line)</label>
          <textarea value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} rows="4" />
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)} disabled={isSavingProfile}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}

      <div className="section-subheader">
        <h3>Your Posts</h3>
        <p>Manage your own posts and marketplace listings from one place.</p>
      </div>
      {myPosts.length ? (
        <div className="feed-grid">
          {myPosts.map((post) => (
            <FeedCard key={post._id} post={post} onDelete={(deletedId) => setMyPosts((current) => current.filter((item) => item._id !== deletedId))} />
          ))}
        </div>
      ) : (
        <div className="empty-state">You haven’t posted anything yet.</div>
      )}
    </section>
  );
}

export default Profile;
