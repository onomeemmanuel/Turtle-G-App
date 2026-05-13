import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import Discover from './pages/Discover.jsx';
import Reels from './pages/Reels.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Settings from './pages/Settings.jsx';
import Notifications from './pages/Notifications.jsx';
import PastQuestions from './pages/PastQuestions.jsx';
import News from './pages/News.jsx';
import Chat from './pages/Chat.jsx';
import Requests from './pages/Requests.jsx';
import Friends from './pages/Friends.jsx';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('turtleg_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('turtleg_theme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('turtleg_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <div className="app-shell">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="page-content"
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={<ProtectedRoute><Home /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/discover"
            element={<ProtectedRoute><Discover /></ProtectedRoute>}
          />
          <Route
            path="/reels"
            element={<ProtectedRoute><Reels /></ProtectedRoute>}
          />
          <Route
            path="/marketplace"
            element={<ProtectedRoute><Marketplace /></ProtectedRoute>}
          />
          <Route
            path="/chat"
            element={<ProtectedRoute><Chat theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>}
          />
          <Route
            path="/requests"
            element={<ProtectedRoute><Requests /></ProtectedRoute>}
          />
          <Route
            path="/friends"
            element={<ProtectedRoute><Friends /></ProtectedRoute>}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute><Settings theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>}
          />
          <Route
            path="/notifications"
            element={<ProtectedRoute><Notifications /></ProtectedRoute>}
          />
          <Route
            path="/past-questions"
            element={<ProtectedRoute><PastQuestions /></ProtectedRoute>}
          />
          <Route
            path="/news"
            element={<ProtectedRoute><News /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.main>
    </div>
  );
}

export default App;
