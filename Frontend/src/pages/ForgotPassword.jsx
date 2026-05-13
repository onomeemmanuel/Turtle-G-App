import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      const link = response.data.resetUrl;
      if (link) {
        setMessage(`Reset link generated: ${link}`);
      } else {
        setMessage(response.data.message || 'If the email exists, a reset link has been sent.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p>We’ll send a password reset link to your registered email.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@school.edu"
            required
          />
          {error && <div className="error-message">{error}</div>}
          {message && <div className="loader">{message}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending link…' : 'Send Reset Link'}
          </button>
        </form>

        <p>
          Remembered your password? <Link to="/login">Return to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
