import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api, request, getUser, setSession, clearSession } from './services/api';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { StatCard } from './components/StatCard';
import { SectionCard } from './components/SectionCard';

function App() {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('skilltracker-token');
    if (!token) {
      setLoading(false);
      return;
    }

    request('get', '/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('skilltracker-user', JSON.stringify(res.data));
      })
      .catch(() => {
        clearSession();
        setUser(null);
        if (location.pathname !== '/login') navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [location.pathname, navigate]);

  if (loading) return <div className="loading-screen">Loading your dashboard...</div>;

  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" onAuth={(token, usr) => { setSession(token, usr); setUser(usr); navigate('/'); }} />} />
      <Route path="/register" element={<AuthPage mode="register" onAuth={(token, usr) => { setSession(token, usr); setUser(usr); navigate('/'); }} />} />
      <Route path="/*" element={user ? <DashboardShell user={user} onUserUpdated={setUser} onLogout={() => { clearSession(); setUser(null); navigate('/login'); }} /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

function AuthPage({ mode, onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const email = form.email.trim().toLowerCase();
      if (mode === 'register') {
        await api.post('/auth/register', { ...form, email });
      }

      const loginRes = await api.post('/auth/login', { email, password: form.password });
      const { token, user } = loginRes.data;
      onAuth(token, user);
      navigate('/');
    } catch (err) {
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || (err?.response
        ? 'Authentication failed. Check your email and password and try again.'
        : 'Cannot reach the InternshipSkillTracker API. Make sure the backend is running on port 8081.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">ST</span>
          <div>
            <h1>InternshipSkillTracker</h1>
            <p>Your skills, projects, internships, and learning progress in one place.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <label>
              Full name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
          )}

          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>

          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="primary-btn" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
          <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create account' : 'Login'}</Link>
        </div>
      </div>
    </div>
  );
}

function DashboardShell({ user, onUserUpdated, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="shell">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="content">
        <TopHeader user={user} onLogout={onLogout} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <Routes>
          <Route path="/" element={<DashboardPage user={user} searchQuery={searchQuery} />} />
          <Route path="/career-goal" element={user.role === 'USER' ? <CareerGoalPage user={user} onUserUpdated={onUserUpdated} /> : <Navigate to="/" replace />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage user={user} onUserUpdated={onUserUpdated} />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/admin" element={user.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function CareerGoalPage({ user, onUserUpdated }) {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCareerGoal, setSelectedCareerGoal] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      request('get', '/career-roles'),
      request('get', '/departments'),
      request('get', '/me/career-goal'),
    ])
      .then(([rolesResponse, departmentsResponse, goalResponse]) => {
        setRoles(rolesResponse.data || []);
        setDepartments(departmentsResponse.data || []);
        setSelectedCareerGoal(goalResponse.data?.selectedCareerGoal || null);
      })
      .catch((requestError) => {
        setError(requestError?.response?.data?.message || 'Career roles could not be loaded. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleRoles = roles.filter((role) => departmentFilter === 'all' || String(role.departmentId) === departmentFilter);

  const selectCareerGoal = async (role) => {
    setSavingRoleId(role.id);
    setError('');
    try {
      const response = await request('put', '/me/career-goal', { careerRoleId: role.id });
      const selectedRole = response.data?.selectedCareerGoal || role;
      setSelectedCareerGoal(selectedRole);
      const updatedUser = {
        ...user,
        careerRoleId: selectedRole.id,
        careerRoleName: selectedRole.name,
        departmentId: selectedRole.departmentId,
        departmentName: selectedRole.departmentName,
      };
      localStorage.setItem('skilltracker-user', JSON.stringify(updatedUser));
      onUserUpdated(updatedUser);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Your career goal could not be saved. Please try again.');
    } finally {
      setSavingRoleId(null);
    }
  };

  if (loading) return <div className="loading-shell">Loading career roles...</div>;

  return (
    <div className="page-shell career-goal-page">
      <div className="career-goal-heading">
        <div>
          <p className="eyebrow">Career direction</p>
          <h2>Choose your career goal</h2>
          <p>Pick a role to focus your skills, projects, and internship search.</p>
        </div>
        {selectedCareerGoal && (
          <div className="career-goal-current">
            <span>Current goal</span>
            <strong>{selectedCareerGoal.name}</strong>
            <small>{selectedCareerGoal.departmentName}</small>
          </div>
        )}
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}

      <div className="career-role-toolbar">
        <label>
          Department
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
            <option value="all">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={String(department.id)}>{department.name}</option>
            ))}
          </select>
        </label>
        <span>{visibleRoles.length} career {visibleRoles.length === 1 ? 'role' : 'roles'}</span>
      </div>

      {visibleRoles.length === 0 ? (
        <div className="empty-state">No career roles are available for this department yet.</div>
      ) : (
        <div className="career-role-grid">
          {visibleRoles.map((role) => {
            const isSelected = selectedCareerGoal?.id === role.id;
            return (
              <article key={role.id} className={`career-role-card${isSelected ? ' selected' : ''}`}>
                <div className="career-role-card-heading">
                  <span className="career-role-department">{role.departmentName}</span>
                  {isSelected && <span className="career-role-selected-label">Current goal</span>}
                </div>
                <h3>{role.name}</h3>
                <p className="career-role-description">{role.description}</p>
                <div className="career-role-skills">
                  <span className="career-role-skills-title">Skills preview</span>
                  <div className="career-skill-tags">
                    {(role.skillsPreview || []).length ? role.skillsPreview.map((skill) => (
                      <span key={skill}>{skill}</span>
                    )) : <small>Skill requirements will be added soon.</small>}
                  </div>
                </div>
                <button
                  type="button"
                  className={isSelected ? 'secondary-btn career-role-button' : 'primary-btn career-role-button'}
                  disabled={savingRoleId !== null || isSelected}
                  onClick={() => selectCareerGoal(role)}
                >
                  {savingRoleId === role.id ? 'Saving...' : isSelected ? 'Selected' : selectedCareerGoal ? 'Change to this goal' : 'Select this goal'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DashboardPage({ user, searchQuery }) {
  const [dashboard, setDashboard] = useState({
    totalSkills: 0,
    totalProjects: 0,
    totalApplications: 0,
    totalGoals: 0,
    totalTasks: 0,
    unreadNotifications: 0,
  });
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([
      request('get', '/dashboard'),
      request('get', '/skills'),
      request('get', '/projects'),
      request('get', '/applications'),
      request('get', '/goals'),
      request('get', '/notifications')
    ])
      .then(([dashboardRes, skillsRes, projectsRes, applicationsRes, goalsRes, notificationsRes]) => {
        setDashboard(dashboardRes.data);
        setSkills(skillsRes.data || []);
        setProjects(projectsRes.data || []);
        setApplications(applicationsRes.data || []);
        setGoals(goalsRes.data || []);
        setNotifications(notificationsRes.data || []);
      })
      .catch((requestError) => {
        setLoadError(requestError.response?.data?.message || 'Dashboard data could not be loaded. Check the API connection and try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const query = (searchQuery || '').trim().toLowerCase();

  const filteredSkills = useMemo(() => {
    if (!query) return skills;
    return skills.filter((item) => [item.name, item.category, item.proficiency].join(' ').toLowerCase().includes(query));
  }, [skills, query]);

  const filteredProjects = useMemo(() => {
    if (!query) return projects;
    return projects.filter((item) => [item.title, item.technologies, item.status].join(' ').toLowerCase().includes(query));
  }, [projects, query]);

  const filteredApplications = useMemo(() => {
    if (!query) return applications;
    return applications.filter((item) => [item.jobTitle, item.company?.name || '', item.status].join(' ').toLowerCase().includes(query));
  }, [applications, query]);

  const filteredGoals = useMemo(() => {
    if (!query) return goals;
    return goals.filter((item) => [item.title, item.status, item.targetDate].join(' ').toLowerCase().includes(query));
  }, [goals, query]);

  const summaryCards = [
    { label: 'Total Skills', value: query ? filteredSkills.length : dashboard.totalSkills, subtitle: 'Tracked abilities', icon: '💻', color: '#5b8def' },
    { label: 'Total Projects', value: query ? filteredProjects.length : dashboard.totalProjects, subtitle: 'Portfolio builds', icon: '🚀', color: '#00b5a2' },
    { label: 'Internship Applications', value: query ? filteredApplications.length : dashboard.totalApplications, subtitle: 'Active pipeline', icon: '🏢', color: '#ff9a3d' },
    { label: 'Learning Goals', value: query ? filteredGoals.length : dashboard.totalGoals, subtitle: 'Career milestones', icon: '🎯', color: '#8d5cf6' },
  ];

  const proficiencyValue = { BEGINNER: 35, INTERMEDIATE: 60, ADVANCED: 80, EXPERT: 95 };
  const projectStatusValue = { PLANNED: 25, IN_PROGRESS: 65, COMPLETED: 100, ARCHIVED: 75 };
  const applicationStatusValue = { APPLIED: 20, SCREENING: 35, INTERVIEW: 65, SELECTED: 100, REJECTED: 10, WITHDRAWN: 0 };
  const goalStatusValue = { NOT_STARTED: 20, IN_PROGRESS: 60, COMPLETED: 100 };

  const skillChartData = filteredSkills.map((skill) => ({
    name: skill.name.length > 12 ? `${skill.name.slice(0, 12)}…` : skill.name,
    value: proficiencyValue[skill.proficiency] || 50,
    fill: skill.category?.toLowerCase().includes('frontend') ? '#5b8def' : skill.category?.toLowerCase().includes('backend') ? '#8d5cf6' : '#00b5a2',
  }));

  const progressOverview = [
    { name: 'Skills', value: filteredSkills.length ? Math.round(filteredSkills.reduce((sum, skill) => sum + (proficiencyValue[skill.proficiency] || 50), 0) / filteredSkills.length) : 0 },
    { name: 'Projects', value: filteredProjects.length ? Math.round(filteredProjects.reduce((sum, project) => sum + (projectStatusValue[project.status] || 50), 0) / filteredProjects.length) : 0 },
    { name: 'Applications', value: filteredApplications.length ? Math.round(filteredApplications.reduce((sum, app) => sum + (applicationStatusValue[app.status] || 50), 0) / filteredApplications.length) : 0 },
    { name: 'Goals', value: filteredGoals.length ? Math.round(filteredGoals.reduce((sum, goal) => sum + (goalStatusValue[goal.status] || 50), 0) / filteredGoals.length) : 0 },
  ];

  const allDeadlines = [
    ...filteredGoals.map((goal) => ({ label: goal.title, date: goal.targetDate, type: 'Learning goal', status: goal.status })),
    ...filteredProjects.map((project) => ({ label: project.title, date: project.endDate || project.startDate, type: 'Project milestone', status: project.status })),
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const activityFeed = [
    ...filteredSkills.slice(0, 3).map((item) => ({ type: 'skill', title: 'Added skill', description: `${item.name} • ${item.proficiency}`, time: item.updatedAt || item.createdAt || new Date().toISOString() })),
    ...filteredProjects.slice(0, 3).map((item) => ({ type: 'project', title: 'Created project', description: `${item.title} • ${item.status}`, time: item.updatedAt || item.createdAt || new Date().toISOString() })),
    ...filteredApplications.slice(0, 3).map((item) => ({ type: 'application', title: 'Applied for internship', description: `${item.company?.name || 'Company'} • ${item.jobTitle}`, time: item.updatedAt || item.createdAt || new Date().toISOString() })),
    ...filteredGoals.slice(0, 3).map((item) => ({ type: 'goal', title: 'Updated learning goal', description: `${item.title} • ${item.status}`, time: item.updatedAt || item.createdAt || new Date().toISOString() })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 6);

  if (loading) return <div className="loading-shell">Loading dashboard data...</div>;

  return (
    <div className="page-shell">
      {loadError && <p className="form-error" role="alert">{loadError}</p>}
      <div className="stats-grid">
        {summaryCards.map((card) => (
          <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} subtitle={card.subtitle} color={card.color} />
        ))}
      </div>

      {user.role === 'USER' && (
        <SectionCard title="Career goal" subtitle={user.careerRoleName || 'Not selected yet'}>
          <div className="dashboard-career-goal">
            <div>
              <strong>{user.careerRoleName || 'Choose a direction for your next steps'}</strong>
              <p>{user.departmentName || 'Explore engineering roles and the skills they commonly use.'}</p>
            </div>
            <Link to="/career-goal" className="primary-btn dashboard-career-goal-link">
              {user.careerRoleName ? 'Change career goal' : 'Choose career goal'}
            </Link>
          </div>
        </SectionCard>
      )}

      <div className="dashboard-grid">
        <SectionCard title="Skill overview" className="panel-span-2">
          <div className="skill-overview-grid">
            <div className="skill-bars">
              {filteredSkills.length === 0 ? (
                <div className="empty-state compact">No skills yet.</div>
              ) : (
                filteredSkills.slice(0, 5).map((skill) => (
                  <div key={skill.id} className="skill-row">
                    <div className="skill-row-top">
                      <span>{skill.name}</span>
                      <span>{skill.proficiency}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${proficiencyValue[skill.proficiency] || 50}%` }} />
                    </div>
                    <small>{proficiencyValue[skill.proficiency] || 50}%</small>
                  </div>
                ))
              )}
            </div>

            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={skillChartData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={4}>
                    {skillChartData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Progress overview">
          <div className="chart-box compact" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressOverview}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#8d5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Recent projects" subtitle={`${filteredProjects.length} active`}>
          <div className="stack-list">
            {filteredProjects.length === 0 ? (
              <div className="empty-state compact">No projects yet.</div>
            ) : (
              filteredProjects.slice(0, 3).map((project) => (
                <div key={project.id} className="mini-card">
                  <div className="mini-card-header">
                    <div>
                      <strong>{project.title}</strong>
                      <p>{project.technologies || 'No tech stack provided'}</p>
                    </div>
                    <span className={`status-badge ${String(project.status).toLowerCase()}`}>{project.status}</span>
                  </div>
                  {(project.liveDemoUrl || project.githubUrl) && (
                    <div className="mini-card-footer">
                      <a
                        className="ghost-btn"
                        href={project.liveDemoUrl || project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View project
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Internship applications" subtitle={`${filteredApplications.length} tracked`}>
          <div className="stack-list">
            {filteredApplications.length === 0 ? (
              <div className="empty-state compact">No applications yet.</div>
            ) : (
              filteredApplications.slice(0, 4).map((application) => (
                <div key={application.id} className="application-row">
                  <div className="company-profile">{(application.company?.name || 'C').slice(0, 1).toUpperCase()}</div>
                  <div className="application-main">
                    <strong>{application.company?.name || 'Company'}</strong>
                    <span>{application.jobTitle}</span>
                    <small>{new Date(application.applicationDate).toLocaleDateString()}</small>
                  </div>
                  <span className={`status-badge ${String(application.status).toLowerCase()}`}>{application.status}</span>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Learning goals" subtitle={`${filteredGoals.length} in progress`}>
          <div className="stack-list">
            {filteredGoals.length === 0 ? (
              <div className="empty-state compact">No learning goals yet.</div>
            ) : (
              filteredGoals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="goal-row">
                  <div className="goal-row-head">
                    <strong>{goal.title}</strong>
                    <span>{goal.status}</span>
                  </div>
                  <div className="goal-meta">
                    <small>{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No deadline'}</small>
                    <small>{goalStatusValue[goal.status] || 0}%</small>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill success" style={{ width: `${goalStatusValue[goal.status] || 0}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming deadlines">
          <div className="stack-list">
            {allDeadlines.length === 0 ? (
              <div className="empty-state compact">No upcoming deadlines.</div>
            ) : (
              allDeadlines.map((item, index) => (
                <div key={`${item.label}-${index}`} className="deadline-row">
                  <div className="deadline-bullet" />
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.type}</small>
                  </div>
                  <span className="deadline-date">{new Date(item.date).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Recent activity" className="panel-span-2">
          <div className="activity-feed">
            {activityFeed.length === 0 ? (
              <div className="empty-state compact">No activity yet.</div>
            ) : (
              activityFeed.map((item, index) => (
                <div key={`${item.title}-${item.description}-${index}`} className="activity-item">
                  <span className="activity-icon">{item.type === 'skill' ? '💡' : item.type === 'project' ? '🚀' : item.type === 'application' ? '📩' : '🎯'}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                  <small>{new Date(item.time).toLocaleDateString()}</small>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ProgressPage() {
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      request('get', '/skills'),
      request('get', '/projects'),
      request('get', '/applications'),
      request('get', '/goals')
    ])
      .then(([skillRes, projectRes, appRes, goalRes]) => {
        setSkills(skillRes.data || []);
        setProjects(projectRes.data || []);
        setApplications(appRes.data || []);
        setGoals(goalRes.data || []);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Progress data could not be loaded.'));
  }, []);

  const progression = [
    { name: 'Skills', value: skills.length ? Math.round(skills.reduce((sum, skill) => sum + ({ BEGINNER: 35, INTERMEDIATE: 60, ADVANCED: 80, EXPERT: 95 }[skill.proficiency] || 50), 0) / skills.length) : 0 },
    { name: 'Projects', value: projects.length ? Math.round(projects.reduce((sum, project) => sum + ({ PLANNED: 25, IN_PROGRESS: 65, COMPLETED: 100, ARCHIVED: 75 }[project.status] || 50), 0) / projects.length) : 0 },
    { name: 'Applications', value: applications.length ? Math.round(applications.reduce((sum, app) => sum + ({ APPLIED: 20, SCREENING: 35, INTERVIEW: 65, SELECTED: 100, REJECTED: 10, WITHDRAWN: 0 }[app.status] || 50), 0) / applications.length) : 0 },
    { name: 'Goals', value: goals.length ? Math.round(goals.reduce((sum, goal) => sum + ({ NOT_STARTED: 20, IN_PROGRESS: 60, COMPLETED: 100 }[goal.status] || 50), 0) / goals.length) : 0 },
  ];

  return (
    <SectionCard title="Progress overview">
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="chart-box" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={progression}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#00b5a2" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

function ActivityPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      request('get', '/skills'),
      request('get', '/projects'),
      request('get', '/applications'),
      request('get', '/goals')
    ])
      .then(([skillsRes, projectsRes, appRes, goalsRes]) => {
        const merged = [
          ...((skillsRes.data || []).map((item) => ({ title: 'Added skill', detail: `${item.name} • ${item.proficiency}`, createdAt: item.createdAt }))),
          ...((projectsRes.data || []).map((item) => ({ title: 'Created project', detail: `${item.title} • ${item.status}`, createdAt: item.createdAt }))),
          ...((appRes.data || []).map((item) => ({ title: 'Applied for internship', detail: `${item.company?.name || 'Company'} • ${item.jobTitle}`, createdAt: item.applicationDate }))),
          ...((goalsRes.data || []).map((item) => ({ title: 'Updated learning goal', detail: `${item.title} • ${item.status}`, createdAt: item.updatedAt || item.createdAt }))),
        ]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setItems(merged);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Activity history could not be loaded.'));
  }, []);

  return (
    <SectionCard title="Activity history">
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="activity-feed">
        {items.length === 0 ? (
          <div className="empty-state compact">No activity history.</div>
        ) : (
          items.slice(0, 8).map((item, index) => (
            <div key={`${item.title}-${index}`} className="activity-item">
              <span className="activity-icon">{index % 2 === 0 ? '📌' : '✨'}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
              <small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</small>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function SkillsPage() {
  return <EntityPage endpoint="/skills" title="Skills" fields={[
    { name: 'name', label: 'Skill Name', type: 'text' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'proficiency', label: 'Proficiency', type: 'select', options: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] },
    { name: 'yearsOfExperience', label: 'Years of Exp.', type: 'number', defaultValue: 0 },
  ]} />;
}

function ProjectsPage() {
  return <EntityPage endpoint="/projects" title="Projects" fields={[
    { name: 'title', label: 'Project Title', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'technologies', label: 'Technologies', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'PLANNED', options: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'] },
    { name: 'githubUrl', label: 'GitHub URL', type: 'text' },
    { name: 'liveDemoUrl', label: 'Live Demo URL', type: 'text' },
  ]} />;
}

function ApplicationsPage() {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    request('get', '/companies')
      .then((response) => setCompanies(response.data || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Companies could not be loaded.'));
  }, []);

  return <EntityPage
    endpoint="/applications"
    title="Internship Applications"
    initialError={error}
    fields={[
      { name: 'jobTitle', label: 'Job Title', type: 'text' },
      { name: 'companyId', label: 'Company', type: 'select', options: companies.map((company) => ({ value: company.id, label: company.name })) },
      { name: 'applicationDate', label: 'Application Date', type: 'date', defaultValue: new Date().toISOString().slice(0, 10) },
      { name: 'internshipType', label: 'Internship Type', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', defaultValue: 'APPLIED', options: ['APPLIED', 'SCREENING', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'] },
      { name: 'interviewDate', label: 'Interview Date', type: 'date' },
      { name: 'applicationUrl', label: 'Application URL', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]}
  />;
}

function CompaniesPage() {
  return <EntityPage endpoint="/companies" title="Companies" fields={[
    { name: 'name', label: 'Company Name', type: 'text' },
    { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'website', label: 'Website', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ]} />;
}

function GoalsPage() {
  return <EntityPage endpoint="/goals" title="Learning Goals" fields={[
    { name: 'title', label: 'Goal', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'targetDate', label: 'Target Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'NOT_STARTED', options: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] },
  ]} />;
}

function TasksPage() {
  return <EntityPage endpoint="/tasks" title="Tasks" fields={[
    { name: 'title', label: 'Task', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'dueDate', label: 'Due Date', type: 'date' },
    { name: 'priority', label: 'Priority', type: 'select', defaultValue: 'MEDIUM', options: ['LOW', 'MEDIUM', 'HIGH'] },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'TODO', options: ['TODO', 'IN_PROGRESS', 'COMPLETED'] },
  ]} />;
}

function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    request('get', '/notifications')
      .then((res) => setItems(res.data || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Notifications could not be loaded.'));
  }, []);

  const markRead = async (id) => {
    setError('');
    try {
      await request('put', `/notifications/${id}/read`);
      setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Notification could not be updated.');
    }
  };

  return (
    <SectionCard title="Notifications">
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="stack-list">
        {items.length === 0 ? <div className="empty-state compact">No notifications yet.</div> : items.map((n) => (
          <div key={n.id} className="record-card">
            <div className="record-header">
              <strong>{n.title}</strong>
              <span className="badge muted">{n.type}</span>
            </div>
            <p>{n.message}</p>
            <small>{n.read ? 'Read' : 'Unread'}</small>
            {!n.read && <button type="button" className="secondary-btn" onClick={() => markRead(n.id)}>Mark as read</button>}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function ProfilePage({ user, onUserUpdated }) {
  const [form, setForm] = useState({
    name: '', phoneNumber: '', university: '', degree: '', graduationYear: '', location: '',
    bio: '', linkedinUrl: '', githubUrl: '', careerObjective: '', certifications: '',
    achievements: '', resumeUrl: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    request('get', '/me')
      .then((res) => setForm({ ...res.data }))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Profile could not be loaded.'));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const profileFields = [
        'name', 'phoneNumber', 'university', 'degree', 'location', 'bio', 'linkedinUrl',
        'githubUrl', 'careerObjective', 'certifications', 'achievements', 'resumeUrl',
      ];
      const payload = Object.fromEntries(profileFields.map((field) => [field, form[field] || '']));
      payload.graduationYear = form.graduationYear ? Number(form.graduationYear) : null;
      const response = await request('put', '/me', payload);
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('skilltracker-user', JSON.stringify(updatedUser));
      onUserUpdated(updatedUser);
      setForm((current) => ({ ...current, ...response.data }));
      setSuccess('Profile updated successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Profile settings">
      {error && <p className="form-error" role="status">{error}</p>}
      {success && <p className="form-success" role="status">{success}</p>}
      <form onSubmit={save} className="form-grid">
        <label>Name<input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={255} /></label>
        <label>Phone<input value={form.phoneNumber || ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></label>
        <label>University<input value={form.university || ''} onChange={(e) => setForm({ ...form, university: e.target.value })} /></label>
        <label>Degree<input value={form.degree || ''} onChange={(e) => setForm({ ...form, degree: e.target.value })} /></label>
        <label>Graduation year<input type="number" value={form.graduationYear || ''} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} /></label>
        <label>Engineering department<input value={form.departmentName || 'Select a career goal to set a department'} readOnly /></label>
        <label>Location<input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
        <label>LinkedIn URL<input value={form.linkedinUrl || ''} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} /></label>
        <label>GitHub URL<input value={form.githubUrl || ''} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} /></label>
        <label>Resume URL<input type="url" value={form.resumeUrl || ''} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} /></label>
        <label className="full-width">Career objective<textarea value={form.careerObjective || ''} onChange={(e) => setForm({ ...form, careerObjective: e.target.value })} rows={3} /></label>
        <label className="full-width">Certifications<textarea value={form.certifications || ''} onChange={(e) => setForm({ ...form, certifications: e.target.value })} rows={3} placeholder="One certification per line" /></label>
        <label className="full-width">Achievements<textarea value={form.achievements || ''} onChange={(e) => setForm({ ...form, achievements: e.target.value })} rows={3} /></label>
        <label className="full-width">Bio<textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={5} /></label>
        <button className="primary-btn full-width" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </SectionCard>
  );
}

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    request('get', '/users')
      .then((res) => setUsers(res.data || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Admin users could not be loaded.'));
  }, []);

  return (
    <div className="page-shell">
      <SectionCard title="Admin dashboard">
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="stack-list">
          {users.map((adminUser) => (
            <div key={adminUser.id} className="record-card">
              <div className="record-header">
                <strong>{adminUser.name}</strong>
                <span className="badge">{adminUser.role}</span>
              </div>
              <p>{adminUser.email}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <AdminCareerRolesPanel />
    </div>
  );
}

function AdminCareerRolesPanel() {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', departmentId: '', skillsPreview: '', active: true });
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadCatalog = () => Promise.all([
    request('get', '/admin/career-roles'),
    request('get', '/departments'),
  ]).then(([rolesResponse, departmentsResponse]) => {
    setRoles(rolesResponse.data || []);
    setDepartments(departmentsResponse.data || []);
  });

  useEffect(() => {
    loadCatalog().catch(() => setError('Career role management could not be loaded.'));
  }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', departmentId: '', skillsPreview: '', active: true });
    setEditingRoleId(null);
  };

  const editRole = (role) => {
    setEditingRoleId(role.id);
    setForm({
      name: role.name,
      description: role.description,
      departmentId: String(role.departmentId),
      skillsPreview: (role.skillsPreview || []).join(', '),
      active: role.active,
    });
  };

  const saveRole = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      ...form,
      departmentId: Number(form.departmentId),
      skillsPreview: form.skillsPreview.split(',').map((skill) => skill.trim()).filter(Boolean),
    };
    try {
      if (editingRoleId) {
        await request('put', `/admin/career-roles/${editingRoleId}`, payload);
      } else {
        await request('post', '/admin/career-roles', payload);
      }
      resetForm();
      await loadCatalog();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'The career role could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const changeRoleStatus = async (role) => {
    try {
      if (role.active && !window.confirm(`Deactivate ${role.name}? Students will no longer be able to select it.`)) return;
      if (role.active) {
        await request('delete', `/admin/career-roles/${role.id}`);
      } else {
        await request('put', `/admin/career-roles/${role.id}`, {
          name: role.name,
          description: role.description,
          departmentId: role.departmentId,
          skillsPreview: role.skillsPreview,
          active: true,
        });
      }
      await loadCatalog();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'The career role status could not be changed.');
    }
  };

  return (
    <SectionCard title="Career role catalog" subtitle="Manage student career goals">
      {error && <div className="error-box" role="alert">{error}</div>}
      <form onSubmit={saveRole} className="form-grid career-role-admin-form">
        <label>
          Role name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={120} />
        </label>
        <label>
          Department
          <select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })} required>
            <option value="">Select department</option>
            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
        </label>
        <label className="full-width">
          Short description
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required maxLength={1000} rows={3} />
        </label>
        <label className="full-width">
          Skills preview (comma separated)
          <input value={form.skillsPreview} onChange={(event) => setForm({ ...form, skillsPreview: event.target.value })} placeholder="Java, SQL, Spring Boot" />
        </label>
        <div className="career-role-admin-actions full-width">
          <button type="submit" className="primary-btn" disabled={busy}>
            {busy ? 'Saving...' : editingRoleId ? 'Save changes' : 'Add career role'}
          </button>
          {editingRoleId && <button type="button" className="ghost-btn" onClick={resetForm}>Cancel edit</button>}
        </div>
      </form>
      <div className="career-role-admin-list">
        {roles.map((role) => (
          <div key={role.id} className="career-role-admin-row">
            <div>
              <strong>{role.name}</strong>
              <span>{role.departmentName} · {role.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="career-role-admin-actions">
              <button type="button" className="ghost-btn" onClick={() => editRole(role)}>Edit</button>
              <button type="button" className="secondary-btn" onClick={() => changeRoleStatus(role)}>
                {role.active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        ))}
        {roles.length === 0 && <div className="empty-state compact">No career roles have been added.</div>}
      </div>
    </SectionCard>
  );
}

const isRequiredField = (fieldName) => [
  'name', 'title', 'jobTitle', 'category', 'proficiency', 'yearsOfExperience',
  'companyId', 'applicationDate',
].includes(fieldName);

function EntityPage({ endpoint, title, fields, initialError = '' }) {
  const [items, setItems] = useState([]);
  const newForm = () => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? '']));
  const [form, setForm] = useState(newForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await request('get', endpoint);
      setItems(response.data || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || `${title} could not be loaded.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = Object.fromEntries(fields.map((field) => {
      const value = form[field.name];
      return [field.name, field.type === 'number' || field.name === 'companyId'
        ? (value === '' || value == null ? null : Number(value))
        : value];
    }));
    try {
      await request(editingId ? 'put' : 'post', editingId ? `${endpoint}/${editingId}` : endpoint, payload);
      setForm(newForm());
      setEditingId(null);
      await fetchData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The record could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this record? This action cannot be undone.')) return;
    setError('');
    try {
      await request('delete', `${endpoint}/${id}`);
      await fetchData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The record could not be deleted.');
    }
  };

  const edit = (item) => {
    const values = {};
    fields.forEach((field) => {
      values[field.name] = field.name === 'companyId'
        ? (item.company?.id == null ? '' : String(item.company.id))
        : (item[field.name] == null ? '' : String(item[field.name]));
    });
    setForm(values);
    setEditingId(item.id);
    setError('');
  };

  return (
    <SectionCard title={title}>
      {initialError && <p className="form-error" role="alert">{initialError}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <form onSubmit={submit} className="form-grid">
        {fields.map((field) => (
          <label key={field.name} className={field.type === 'textarea' ? 'full-width' : ''}>
            {field.label}
            {field.type === 'textarea' ? (
              <textarea required={isRequiredField(field.name)} rows="4" value={form[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} />
            ) : field.type === 'select' ? (
              <select required={isRequiredField(field.name)} value={form[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)}>
                <option value="">Select</option>
                {field.options.map((opt) => {
                  const optionValue = typeof opt === 'object' ? opt.value : opt;
                  const optionLabel = typeof opt === 'object' ? opt.label : opt;
                  return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
                })}
              </select>
            ) : field.type === 'date' ? (
              <input required={isRequiredField(field.name)} type="date" value={form[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} />
            ) : field.type === 'number' ? (
              <input required={isRequiredField(field.name)} type="number" step="0.1" value={form[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} />
            ) : (
              <input required={isRequiredField(field.name)} type="text" value={form[field.name] ?? ''} onChange={(e) => handleChange(field.name, e.target.value)} />
            )}
          </label>
        ))}
        <button type="submit" className="primary-btn full-width" disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add record'}
        </button>
        {editingId && <button type="button" className="secondary-btn full-width" onClick={() => { setForm(newForm()); setEditingId(null); }}>Cancel editing</button>}
      </form>

      <div className="stack-list">
        {loading ? <div className="empty-state compact">Loading records…</div> : items.length === 0 ? <div className="empty-state compact">No records yet.</div> : items.map((item) => (
          <div key={item.id} className="record-card">
            <div className="record-header">
              <strong>{item.title || item.name || item.jobTitle || 'Record'}</strong>
              <div className="record-actions">
                <button type="button" className="secondary-btn" onClick={() => edit(item)}>Edit</button>
                <button type="button" className="delete-btn" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </div>
            {fields.map((field) => {
              const value = field.name === 'companyId' ? item.company?.name : item[field.name];
              return value ? <p key={field.name}><strong>{field.label}:</strong> {value}</p> : null;
            })}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export default App;
