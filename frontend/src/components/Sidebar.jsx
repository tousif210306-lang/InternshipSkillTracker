import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/career-goal', label: 'Career Goal', icon: '🧭' },
  { path: '/skills', label: 'Skills', icon: '💻' },
  { path: '/projects', label: 'Projects', icon: '🚀' },
  { path: '/companies', label: 'Companies', icon: '🏭' },
  { path: '/applications', label: 'Internship Applications', icon: '🏢' },
  { path: '/goals', label: 'Learning Goals', icon: '🎯' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/progress', label: 'Progress', icon: '📊' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/activity', label: 'Activity History', icon: '🕒' },
  { path: '/profile', label: 'Profile / Settings', icon: '⚙️' },
  { path: '/about', label: 'Project Details', icon: 'ℹ️' },
  { path: '/logout', label: 'Logout', icon: '🚪', isAction: true },
];

export function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navItems = NAV_ITEMS.filter((item) => item.path !== '/career-goal' || user?.role === 'USER');
  if (user?.role === 'ADMIN') {
    navItems.splice(navItems.length - 1, 0, { path: '/admin', label: 'Admin dashboard', icon: '🛠️' });
  }

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">ST</div>
        <div>
          <p className="brand-kicker">Student career platform</p>
          <h2>InternshipSkillTracker</h2>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map((item) => {
          const active = item.isAction ? false : location.pathname === item.path;

          if (item.isAction) {
            return (
              <button key={item.path} type="button" className="nav-item nav-item-action" onClick={onLogout}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.path} to={item.path} className={active ? 'nav-item active' : 'nav-item'}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="user-card">
        <div className="user-card-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'S'}</div>
        <div>
          <strong>{user?.name || 'Student'}</strong>
          <span>{user?.email || 'No email provided'}</span>
        </div>
      </div>
    </aside>
  );
}
