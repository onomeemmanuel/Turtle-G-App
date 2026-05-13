import { useEffect, useState } from 'react';

function Settings({ theme, toggleTheme }) {
  const [settings, setSettings] = useState({
    readReceipts: true,
    showLastSeen: true,
    previews: true,
    notificationSounds: true,
    wallpaper: 'default'
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('turtleg_chat_settings') || '{}');
    setSettings((current) => ({ ...current, ...stored }));
  }, []);

  useEffect(() => {
    localStorage.setItem('turtleg_chat_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Settings</h2>
        <p>Control your profile, recovery, and WhatsApp-style chat preferences from one place.</p>
      </div>
      <div className="settings-grid">
        <div className="settings-card">
          <h3>Chat Settings</h3>
          <p>Manage read receipts, last seen visibility, and message previews.</p>
          <label className="settings-option">
            <input
              type="checkbox"
              checked={settings.readReceipts}
              onChange={(e) => updateSetting('readReceipts', e.target.checked)}
            />
            Read receipts
          </label>
          <label className="settings-option">
            <input
              type="checkbox"
              checked={settings.showLastSeen}
              onChange={(e) => updateSetting('showLastSeen', e.target.checked)}
            />
            Show last seen
          </label>
          <label className="settings-option">
            <input
              type="checkbox"
              checked={settings.previews}
              onChange={(e) => updateSetting('previews', e.target.checked)}
            />
            Message preview in notifications
          </label>
          <label className="settings-option">
            <input
              type="checkbox"
              checked={settings.notificationSounds}
              onChange={(e) => updateSetting('notificationSounds', e.target.checked)}
            />
            Notification sounds
          </label>
        </div>
        <div className="settings-card">
          <h3>Theme</h3>
          <p>Switch between dark mode and light mode for the best reading experience.</p>
          <button className="btn-primary" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <div className="settings-card">
          <h3>Chat Wallpaper</h3>
          <p>Pick your in-chat background style for a familiar messaging feel.</p>
          <select
            value={settings.wallpaper}
            onChange={(e) => updateSetting('wallpaper', e.target.value)}
          >
            <option value="default">Default</option>
            <option value="blue">Blue bubble</option>
            <option value="sunset">Sunset glow</option>
          </select>
        </div>
      </div>
      <div className="settings-card settings-notice">
        <h3>Password Recovery</h3>
        <p>If you forget your password, use the forgot password link in the login screen to receive a reset email.</p>
      </div>
    </section>
  );
}

export default Settings;
