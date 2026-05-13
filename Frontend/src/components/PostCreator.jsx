import { useState } from 'react';
import axios from 'axios';

function PostCreator({ type, onPost }) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('Phone');
  const [paidFee, setPaidFee] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (event) => {
    const selected = event.target.files[0];
    if (!selected) return;

    const isVideo = selected.type.startsWith('video/');
    const isImage = selected.type.startsWith('image/');

    if (type === 'reel' && !isVideo) {
      setError('Please upload a video file for reels.');
      return;
    }

    if (type === 'story' && !isVideo && !isImage) {
      setError('Please upload a photo or video for your story.');
      return;
    }

    if (type === 'post' && !isImage) {
      setError('Please upload an image file.');
      return;
    }

    setError('');
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!caption && !file) {
      setError('Add a caption or upload a media file.');
      return;
    }

    if (type === 'market') {
      if (!paidFee) {
        setError('Confirm payment of ₦2,000 before posting a marketplace item.');
        return;
      }
      if (!paymentReference.trim()) {
        setError('Provide the payment reference used for the marketplace fee.');
        return;
      }
    }

    setIsSubmitting(true);
    const body = {
      caption,
      mediaUrls: preview ? [preview] : [],
      type,
      marketCategory: type === 'market' ? category : undefined,
      marketFeePaid: type === 'market' ? paidFee : undefined,
      paymentReference: type === 'market' ? paymentReference : undefined
    };

    try {
      const response = await axios.post('/api/posts', body, {
        headers: { Authorization: `Bearer ${localStorage.getItem('turtleg_token')}` }
      });
      setCaption('');
      setFile(null);
      setPreview(null);
      setPaidFee(false);
      setPaymentReference('');
      if (onPost) onPost(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="post-creator card">
      <h3>Create {type === 'reel' ? 'Reel' : type === 'market' ? 'Marketplace Listing' : 'Post'}</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption, list details, or share a quick update..."
          rows="3"
        />
        {type === 'market' && (
          <>
            <label>Marketplace Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Phone</option>
              <option>Books</option>
              <option>Supplies</option>
              <option>Fashion</option>
              <option>Other</option>
            </select>
            <label>
              <input type="checkbox" checked={paidFee} onChange={(e) => setPaidFee(e.target.checked)} />
              I paid ₦2,000 to 7032087886 to post in the marketplace
            </label>
            <label>Payment reference</label>
            <input
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Enter transaction reference"
            />
          </>
        )}
        <label className="file-upload">
          <input
            type="file"
            accept={type === 'reel' ? 'video/*' : type === 'story' ? 'image/*,video/*' : 'image/*'}
            onChange={handleFileChange}
          />
          Upload {type === 'reel' ? 'video' : type === 'story' ? 'story media' : 'photo'}
        </label>
        {preview && (
          type === 'reel' ? (
            <video className="upload-preview" src={preview} controls />
          ) : (
            <img className="upload-preview" src={preview} alt="Preview" />
          )
        )}
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </section>
  );
}

export default PostCreator;
