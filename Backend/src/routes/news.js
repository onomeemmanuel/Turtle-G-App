const express = require('express');
const router = express.Router();

const fallbackArticles = [
  {
    title: 'Global student communities share exam tips',
    summary: 'Top study strategies from classrooms around the world to help you prepare better.',
    source: 'Turtle-G Digest'
  },
  {
    title: 'New learning tools arrive this semester',
    summary: 'Explore apps, videos, and study circles designed for faster school success.',
    source: 'Education Today'
  },
  {
    title: 'Campus events and career fairs coming soon',
    summary: 'See what student activities are trending and how to join the next club meetup.',
    source: 'School Bulletin'
  }
];

router.get('/', async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.json({ articles: fallbackArticles });
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&category=general&apiKey=${apiKey}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TurtleG-NewsClient/1.0' }
    });

    if (!response.ok) {
      console.warn('News API returned non-ok response:', response.status);
      return res.json({ articles: fallbackArticles });
    }

    const data = await response.json();
    const articles = (data.articles || []).map((article) => ({
      title: article.title || 'Latest news update',
      summary: article.description || article.content || 'Read more for the full story.',
      source: article.source?.name || 'Global News',
      url: article.url || '',
      imageUrl: article.urlToImage || '',
      publishedAt: article.publishedAt || ''
    }));

    if (!articles.length) {
      return res.json({ articles: fallbackArticles });
    }

    res.json({ articles });
  } catch (error) {
    console.error('Failed to fetch news:', error);
    res.json({ articles: fallbackArticles });
  }
});

module.exports = router;
