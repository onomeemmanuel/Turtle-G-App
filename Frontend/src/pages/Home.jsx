import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedCard from '../components/FeedCard.jsx';
import PostCreator from '../components/PostCreator.jsx';

function Home() {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const [feedRes, storiesRes] = await Promise.all([
          axios.get('/api/posts/feed', {
            headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
          }),
          axios.get('/api/posts/stories', {
            headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
          })
        ]);
        setPosts(feedRes.data);
        setStories(storiesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, []);

  const handleNewPost = (created) => {
    setPosts((current) => [created, ...current]);
  };

  const handleNewStory = (created) => {
    setStories((current) => [created, ...current]);
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Student Feed</h2>
        <p>Latest posts from people you follow, plus school updates, reels, stories, and marketplace items.</p>
      </div>
      <div className="post-creator-section">
        <PostCreator type="post" onPost={handleNewPost} />
      </div>
      <div className="story-tray">
        <article className="story-bubble story-add">
          <strong>+ Add Story</strong>
          <p>Share your day</p>
        </article>
        {stories.map((story) => (
          <article key={story._id} className="story-bubble">
            <strong>{story.author?.name || 'Unknown'}</strong>
            <span>{story.caption || 'New story'}</span>
          </article>
        ))}
      </div>
      <div className="story-section">
        <div className="story-panel">
          <div>
            <h3>Stories</h3>
            <p>Share a quick moment, and browse fresh stories from classmates you follow.</p>
          </div>
          <PostCreator type="story" onPost={handleNewStory} />
        </div>
        {stories.length ? (
          <div className="story-grid">
            {stories.map((story) => (
              <article key={story._id} className="story-card">
                <strong>{story.author?.name || 'Unknown'}</strong>
                {story.mediaUrls?.[0] && story.mediaUrls[0].includes('video') ? (
                  <video src={story.mediaUrls[0]} controls playsInline />
                ) : (
                  <img src={story.mediaUrls?.[0]} alt={story.caption} />
                )}
                <p>{story.caption || 'Shared a story'}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="story-card no-stories">
            <p>No active stories yet. Post your first story to share a quick update.</p>
          </div>
        )}
      </div>
      {loading ? (
        <div className="loader">Loading feed…</div>
      ) : (
        <div className="feed-grid">
          {posts.length ? posts.map(post => <FeedCard key={post._id} post={post} />) : <p>No activity yet. Start following classmates.</p>}
        </div>
      )}
    </section>
  );
}

export default Home;
