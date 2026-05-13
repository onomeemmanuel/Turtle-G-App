import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedCard from '../components/FeedCard.jsx';
import PostCreator from '../components/PostCreator.jsx';

function Marketplace() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadItems = async () => {
      const response = await axios.get('/api/posts/marketplace', {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setItems(response.data);
    };
    loadItems();
  }, []);

  const handleNewPost = (created) => {
    setItems((current) => [created, ...current]);
  };

  const grouped = items.reduce((acc, item) => {
    const category = item.marketCategory || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Marketplace</h2>
        <p>Buy, sell, and swap school supplies, books, phones, and student gear. Even with Student Discounts!</p>
      </div>
      <PostCreator type="market" onPost={handleNewPost} />
      {items.length ? (
        Object.entries(grouped).map(([category, entries]) => (
          <div key={category} className="market-category-section">
            <h3>{category}</h3>
            <div className="feed-grid">
              {entries.map(post => <FeedCard key={post._id} post={post} />)}
            </div>
          </div>
        ))
      ) : (
        <p>Marketplace is empty. Add your first listing.</p>
      )}
    </section>
  );
}

export default Marketplace;
