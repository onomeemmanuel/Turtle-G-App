import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedCard from '../components/FeedCard.jsx';
import PostCreator from '../components/PostCreator.jsx';

function Reels() {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    const loadReels = async () => {
      const response = await axios.get('/api/posts/reels', {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setReels(response.data);
    };
    loadReels();
  }, []);

  const handleNewPost = (created) => {
    setReels((current) => [created, ...current]);
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Reels</h2>
        <p>Upload longer videos with sound, then play them back in full quality.</p>
      </div>
      <PostCreator type="reel" onPost={handleNewPost} />
      <div className="feed-grid">
        {reels.length ? reels.map(post => <FeedCard key={post._id} post={post} />) : <p>No reels available yet.</p>}
      </div>
    </section>
  );
}

export default Reels;
