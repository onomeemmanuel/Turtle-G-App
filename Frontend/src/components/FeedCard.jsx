import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Comment from './Comment.jsx';

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('turtleg_user') || '{}');
  } catch {
    return {};
  }
})();

function FeedCard({ post, onDelete }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.includes(storedUser.id));
  const [shares, setShares] = useState(post.shares?.length || 0);
  const [shared, setShared] = useState(post.shares?.includes(storedUser.id));
  const navigate = useNavigate();
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [editCategory, setEditCategory] = useState(post.marketCategory || 'Phone');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwnPost = post.author?._id === storedUser.id;
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await axios.post(`/api/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setLikes(response.data.likes.length);
      setLiked(response.data.likes.includes(storedUser.id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const response = await axios.post(`/api/posts/${post._id}/share`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setShares(response.data.shares.length);
      setShared(response.data.shares.includes(storedUser.id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      const response = await axios.post(`/api/posts/${post._id}/comment`, { text: commentText }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setComments(response.data.comments);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editCaption.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const response = await axios.patch(`/api/posts/${post._id}`, {
        caption: editCaption,
        marketCategory: post.type === 'market' ? editCategory : undefined
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      post.caption = response.data.caption;
      post.marketCategory = response.data.marketCategory;
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm('Delete this post?')) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.article
      className="feed-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="feed-card-header">
        <div>
          <strong>{post.author?.name || 'Anonymous'}</strong>
          <p>{new Date(post.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <span className="badge">{post.type}</span>
          {post.type === 'market' && post.marketCategory && (
            <span className="badge market-category">{post.marketCategory}</span>
          )}
        </div>
      </div>
      {post.mediaUrls?.length > 0 && (
        <div className="media-preview">
          {post.type === 'reel' || post.type === 'story' ? (
            <video src={post.mediaUrls[0]} controls playsInline />
          ) : (
            <img src={post.mediaUrls[0]} alt={post.caption} />
          )}
        </div>
      )}
      {isEditing ? (
        <div className="edit-post-panel">
          <textarea
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            rows="3"
          />
          {post.type === 'market' && (
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
              <option>Phone</option>
              <option>Books</option>
              <option>Supplies</option>
              <option>Fashion</option>
              <option>Other</option>
            </select>
          )}
          <div className="edit-actions">
            <button type="button" className="btn-ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="feed-caption">{post.caption}</p>
      )}
      <div className="feed-meta">
        <button type="button" className={`like-button ${liked ? 'liked' : ''}`} onClick={handleLike} disabled={isLiking}>
          {isLiking ? '...' : (liked ? 'Unlike' : 'Like')} ({likes})
        </button>
        <button type="button" className={`share-button ${shared ? 'shared' : ''}`} onClick={handleShare} disabled={isLiking}>
          {isLiking ? '...' : (shared ? 'Unshare' : 'Share')} ({shares})
        </button>
        <span>{comments.length} comments</span>
        {post.type === 'market' && !isOwnPost && post.author?._id && (
          <button
            type="button"
            className="contact-button"
            onClick={() => navigate(`/chat?userId=${post.author._id}`)}
          >
            Contact Seller
          </button>
        )}
        {isOwnPost && (
          <div className="post-action-group">
            <button type="button" className="btn-ghost" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button type="button" className="btn-danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>
      <div className="comments-list">
        {comments.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </div>
      <form className="comment-form" onSubmit={addComment}>
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
        />
        <button type="submit" disabled={isCommenting}>
          {isCommenting ? '...' : 'Comment'}
        </button>
      </form>
    </motion.article>
  );
}

export default FeedCard;
