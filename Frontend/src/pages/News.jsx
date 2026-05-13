import { useEffect, useState } from 'react';
import axios from 'axios';

function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await axios.get('/api/news');
        setArticles(response.data.articles || []);
      } catch (err) {
        setError('Unable to load news. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>News</h2>
        <p>Latest global headlines and student updates from across the world.</p>
      </div>

      {loading ? (
        <div className="loader">Loading news…</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="news-grid">
          {articles.map((item, index) => (
            <article key={index} className="news-card">
              {item.imageUrl && (
                <div className="news-card-image">
                  <img src={item.imageUrl} alt={item.title} />
                </div>
              )}
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="news-card-meta">
                <span>{item.source}</span>
                {item.publishedAt && <span>{new Date(item.publishedAt).toLocaleDateString()}</span>}
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className="btn-ghost">
                  Read more
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default News;
