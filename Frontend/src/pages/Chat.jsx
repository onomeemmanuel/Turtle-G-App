import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function Chat({ theme, toggleTheme }) {
  const location = useLocation();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [chatError, setChatError] = useState('');
  const [chatSettings, setChatSettings] = useState({
    readReceipts: true,
    showLastSeen: true,
    previews: true,
    notificationSounds: true,
    wallpaper: 'default'
  });
  const [callActive, setCallActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [callError, setCallError] = useState('');
  const videoRef = useRef(null);
  const token = localStorage.getItem('turtleg_token');
  const currentUser = JSON.parse(localStorage.getItem('turtleg_user') || '{}');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('turtleg_chat_settings') || '{}');
    setChatSettings((current) => ({ ...current, ...stored }));
  }, []);

  useEffect(() => {
    localStorage.setItem('turtleg_chat_settings', JSON.stringify(chatSettings));
  }, [chatSettings]);

  const loadMessages = useCallback(async () => {
    if (!selectedFriend) return;
    try {
      const response = await axios.get(
        `/api/messages/${selectedFriend._id}?markRead=${chatSettings.readReceipts}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, [selectedFriend, chatSettings.readReceipts, token]);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await axios.get('/api/users/contacts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const contacts = response.data;
        setFriends(contacts);

        const sellerId = new URLSearchParams(location.search).get('userId');
        if (sellerId) {
          const seller = contacts.find((friend) => friend._id === sellerId);
          if (seller) {
            setSelectedFriend(seller);
            setChatError('');
          } else {
            setSelectedFriend(null);
            setChatError('Follow this seller to send a message.');
          }
        } else if (contacts.length) {
          setSelectedFriend(contacts[0]);
        }
      } catch (err) {
        console.error('Failed to load contacts', err);
        setChatError('Unable to load contacts');
      }
    };
    loadContacts();
  }, [location.search, token]);

  useEffect(() => {
    if (!selectedFriend) return;
    loadMessages();
    const intervalId = setInterval(loadMessages, 2000);
    return () => clearInterval(intervalId);
  }, [selectedFriend, loadMessages]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !selectedFriend) return;

    const content = draft.trim();
    const optimisticMessage = {
      _id: `local-${Date.now()}`,
      from: currentUser.id || currentUser._id,
      to: selectedFriend._id,
      content,
      createdAt: new Date().toISOString(),
      seen: true
    };

    setDraft('');
    setMessages((current) => [...current, optimisticMessage]);

    try {
      await axios.post(
        '/api/messages',
        { to: selectedFriend._id, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message', err);
      setChatError('Message failed to send.');
    }
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setCallActive(true);
      setCallError('');
    } catch (err) {
      console.error('Call start failed', err);
      setCallError('Unable to access camera or microphone.');
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setCallActive(false);
  };

  return (
    <section className="page-section chat-page">
      <div className="section-header">
        <h2>Chat</h2>
        <p>Message students you follow and keep conversations with friends.</p>
      </div>
      <div className="chat-layout">
        <aside className="chat-friends">
          <h3>Friends</h3>
          {friends.length ? (
            friends.map((friend) => (
              <button
                key={friend._id}
                className={selectedFriend?._id === friend._id ? 'friend-active' : ''}
                onClick={() => setSelectedFriend(friend)}
              >
                <span className={`status-dot ${friend.online ? 'online' : 'offline'}`}></span>
                {friend.name}
              </button>
            ))
          ) : (
            <p>No friends yet. Follow classmates to chat.</p>
          )}
        </aside>
        <div className="chat-window">
          {selectedFriend ? (
            <>
              <div className="chat-header">
                <div>Chat with {selectedFriend.name}</div>
                <div className="chat-header-actions">
                  <button type="button" className="btn-ghost" onClick={toggleTheme}>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={callActive ? endCall : startCall}
                  >
                    {callActive ? 'End Call' : 'Start Self Call'}
                  </button>
                </div>
                <div className="muted-text">
                  {selectedFriend.online
                    ? 'Online now'
                    : selectedFriend.lastActive
                    ? `Last seen ${new Date(selectedFriend.lastActive).toLocaleTimeString()}`
                    : 'Offline'}
                </div>
              </div>
              {callError && <div className="error-message">{callError}</div>}
              {callActive && (
                <div className="video-preview">
                  <video ref={videoRef} autoPlay muted playsInline />
                </div>
              )}
              <div className="chat-history">
                {messages.map((message) => {
                  const isOutgoing = message.from === currentUser.id || message.from === currentUser._id;
                  return (
                    <div
                      key={message._id}
                      className={`chat-message ${isOutgoing ? 'outgoing' : 'incoming'}`}
                    >
                      <p>{message.content}</p>
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString()}
                        {isOutgoing && message.seen && chatSettings.readReceipts && ' · Seen'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <form className="chat-form" onSubmit={sendMessage}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" className="btn-primary">Send</button>
              </form>
            </>
          ) : (
            <div className="chat-empty">
              {chatError || 'Select a friend to start chatting.'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Chat;
