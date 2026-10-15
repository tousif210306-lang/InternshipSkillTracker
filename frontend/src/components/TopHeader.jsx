import { Link } from 'react-router-dom';
import { useState } from 'react';

export function TopHeader({ user, onLogout, searchQuery, setSearchQuery }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="welcome-copy">
        <p className="eyebrow">Career dashboard</p>
        <h1>Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="subcopy">Keep building your career 🚀</p>
      </div>

      <div className="topbar-actions">
        <label className="search-wrap" aria-label="Search dashboard">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search skills, projects, applications..."
          />
        </label>

        <Link to="/notifications" className="icon-button" aria-label="Notifications">
          🔔
        </Link>

        <div className="profile-menu">
          <button type="button" className="profile-trigger" onClick={() => setMenuOpen((value) => !value)}>
            <span className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'S'}</span>
            <span className="profile-name">{user?.name || 'Student'}</span>
            <span className="caret">▾</span>
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              <Link to="/about" onClick={() => setMenuOpen(false)}>Project Details</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>View profile</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Settings</Link>
              <button type="button" onClick={() => { setMenuOpen(false); onLogout(); }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
