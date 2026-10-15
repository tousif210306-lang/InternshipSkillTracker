import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from './services/api';
import './LandingPage.css';

export function LandingPage({ user }) {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [healthStatus, setHealthStatus] = useState({ backend: 'checking', database: 'checking' });

  useEffect(() => {
    let isMounted = true;
    api.get('/health', { timeout: 8000 })
      .then((res) => {
        if (isMounted && res.data) {
          setHealthStatus({
            backend: res.data.status === 'UP' ? 'online' : 'error',
            database: res.data.database === 'UP' ? 'online' : 'error',
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthStatus({ backend: 'standby', database: 'standby' });
        }
      });

    return () => { isMounted = false; };
  }, []);

  const sampleRoles = [
    {
      name: 'Java Developer',
      dept: 'CSE',
      desc: 'Build enterprise-grade REST APIs, microservices, and backend architecture.',
      skills: ['Java 17', 'Spring Boot 3', 'SQL', 'Hibernate', 'REST APIs', 'Git'],
    },
    {
      name: 'Full Stack Developer',
      dept: 'CSE',
      desc: 'Develop end-to-end web applications with responsive frontend and robust backend.',
      skills: ['React 18', 'JavaScript', 'Spring Boot', 'REST APIs', 'Tailwind/CSS', 'MySQL'],
    },
    {
      name: 'AI/ML Engineer',
      dept: 'AIML',
      desc: 'Develop machine learning pipelines, predictive modeling, and intelligent APIs.',
      skills: ['Python', 'Machine Learning', 'Data Structures', 'Model Evaluation', 'PyTorch'],
    },
    {
      name: 'Data Scientist',
      dept: 'AIML',
      desc: 'Analyze complex datasets, extract business intelligence, and train statistical models.',
      skills: ['Python', 'SQL', 'Statistics', 'Pandas', 'Data Visualization', 'Scikit-Learn'],
    },
    {
      name: 'Embedded Systems Engineer',
      dept: 'ECE',
      desc: 'Program microcontrollers, firmware, and low-latency hardware interfaces.',
      skills: ['Embedded C', 'Microcontrollers', 'Digital Electronics', 'I2C/SPI Protocols'],
    },
    {
      name: 'VLSI Design Engineer',
      dept: 'ECE',
      desc: 'Design and verify integrated circuits, digital logic systems, and silicon chips.',
      skills: ['Verilog', 'Digital Electronics', 'CMOS', 'VLSI Design', 'ModelSim'],
    },
  ];

  const filteredRoles = deptFilter === 'ALL'
    ? sampleRoles
    : sampleRoles.filter((r) => r.dept === deptFilter);

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <header className="landing-navbar">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <div className="brand-icon">ST</div>
            <div className="brand-text-wrap">
              <span className="brand-title">InternshipSkillTracker</span>
              <span className="brand-subtitle">Career Accelerator</span>
            </div>
          </Link>

          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#architecture">Architecture</a>
            <a href="#pathways">Career Paths</a>
            <a href="#stack">Tech Stack</a>
          </nav>

          <div className="landing-nav-actions">
            {user ? (
              <Link to="/" className="btn-nav-cta">
                Open Dashboard <span>→</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-nav-login">Sign In</Link>
                <Link to="/register" className="btn-nav-cta">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill-badge">
          <span className="pulse-dot"></span>
          <span>Production Ready • Spring Boot 3 + React 18 + Aiven MySQL</span>
        </div>

        <h1 className="hero-headline">
          Track Your Skills. Accelerate Growth. <br />
          <span className="gradient-text">Land Your Dream Internship.</span>
        </h1>

        <p className="hero-subhead">
          A modern, data-driven platform empowering engineering students to systematically map competencies, build standout portfolios, manage internship application pipelines, and conquer career goals.
        </p>

        <div className="hero-actions">
          {user ? (
            <Link to="/" className="hero-btn-primary">
              Launch Your Dashboard <span>→</span>
            </Link>
          ) : (
            <>
              <Link to="/register" className="hero-btn-primary">
                Get Started Free <span>→</span>
              </Link>
              <Link to="/login" className="hero-btn-secondary">
                <span>⚡</span> Explore Live Demo / Sign In
              </Link>
            </>
          )}
        </div>

        {/* Live Cloud Status */}
        <div className="system-status-chip">
          <span className="status-indicator">
            <span className={healthStatus.backend === 'online' ? 'status-dot-up' : 'status-dot-down'}></span>
            API: {healthStatus.backend === 'online' ? 'Online (Render)' : healthStatus.backend === 'checking' ? 'Connecting...' : 'Standby / Sleep'}
          </span>
          <span>•</span>
          <span className="status-indicator">
            <span className={healthStatus.database === 'online' ? 'status-dot-up' : 'status-dot-down'}></span>
            Database: {healthStatus.database === 'online' ? 'Connected (Aiven MySQL SSL)' : 'Aiven Cloud Ready'}
          </span>
          <span>•</span>
          <span>Latency: ~40ms</span>
        </div>

        {/* Hero Stats */}
        <div className="hero-stats-row">
          <div className="stat-highlight-card">
            <div className="stat-number">12+</div>
            <div className="stat-desc">Curated Career Paths (CSE, AIML, ECE, Mech)</div>
          </div>
          <div className="stat-highlight-card">
            <div className="stat-number">100%</div>
            <div className="stat-desc">Cloud Automated CI/CD (Render + Vercel)</div>
          </div>
          <div className="stat-highlight-card">
            <div className="stat-number">Stateless</div>
            <div className="stat-desc">JWT Authentication & Role-Based Access</div>
          </div>
          <div className="stat-highlight-card">
            <div className="stat-number">TLS 1.3</div>
            <div className="stat-desc">Aiven Cloud MySQL SSL Certificate Encrypted</div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Tour */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <div className="section-eyebrow">Platform Capabilities</div>
          <h2 className="section-title">Everything You Need to Succeed</h2>
          <p className="section-subhead">
            Eliminate messy spreadsheets and scattered links. Manage every facet of your professional journey in one unified, responsive workspace.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="feature-tabs-wrap">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            🏢 Internship Pipeline
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            💻 Skills Matrix
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            🚀 Project Showcase
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            🎯 Learning Goals
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="tour-card">
          {activeTab === 'pipeline' && (
            <>
              <div className="tour-info">
                <h3>Internship Application Tracker</h3>
                <p>
                  Keep precise track of every company, role, interview round, and deadline. Filter through statuses and never miss a follow-up or scheduled interview.
                </p>
                <ul className="tour-bullets">
                  <li><span className="bullet-icon">✓</span> Multi-stage tracking: Applied, Screening, Interview, Selected</li>
                  <li><span className="bullet-icon">✓</span> Company profiles with industry, location, and website links</li>
                  <li><span className="bullet-icon">✓</span> Interview date calendar alerts and personalized notes</li>
                </ul>
                <Link to="/register" className="btn-nav-cta">Try Application Tracker →</Link>
              </div>
              <div className="tour-preview-pane">
                <div className="mockup-item">
                  <div>
                    <strong>Google • Cloud Engineering Intern</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Mountain View, CA • Applied Oct 12</div>
                  </div>
                  <span className="mockup-badge badge-interview">Interview</span>
                </div>
                <div className="mockup-item">
                  <div>
                    <strong>Microsoft • Software Engineering Intern</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Redmond, WA • Applied Oct 08</div>
                  </div>
                  <span className="mockup-badge badge-selected">Selected</span>
                </div>
                <div className="mockup-item">
                  <div>
                    <strong>Amazon • AWS Backend Intern</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Seattle, WA • Applied Oct 04</div>
                  </div>
                  <span className="mockup-badge badge-applied">Applied</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'skills' && (
            <>
              <div className="tour-info">
                <h3>Skills Competency Matrix</h3>
                <p>
                  Systematically categorize your abilities into Frontend, Backend, Database, and DevOps. Quantify your proficiency level and track your growth trajectory over time.
                </p>
                <ul className="tour-bullets">
                  <li><span className="bullet-icon">✓</span> Proficiency grading: Beginner, Intermediate, Advanced, Expert</li>
                  <li><span className="bullet-icon">✓</span> Years of experience and project application metrics</li>
                  <li><span className="bullet-icon">✓</span> Visual distribution charts powered by Recharts</li>
                </ul>
                <Link to="/register" className="btn-nav-cta">Build Your Matrix →</Link>
              </div>
              <div className="tour-preview-pane">
                <div className="mockup-item">
                  <div>
                    <strong>Java & Spring Boot 3</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Backend • 2 Years Exp</div>
                  </div>
                  <span className="mockup-badge badge-expert">Expert (95%)</span>
                </div>
                <div className="mockup-item">
                  <div>
                    <strong>React 18 & Vite</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Frontend • 1.5 Years Exp</div>
                  </div>
                  <span className="mockup-badge badge-advanced">Advanced (80%)</span>
                </div>
                <div className="mockup-item">
                  <div>
                    <strong>MySQL & Cloud Relational DBs</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Database • 2 Years Exp</div>
                  </div>
                  <span className="mockup-badge badge-advanced">Advanced (80%)</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'projects' && (
            <>
              <div className="tour-info">
                <h3>Portfolio Projects Repository</h3>
                <p>
                  Curate your capstone and independent engineering projects. Showcase your tech stack, GitHub repository links, and live deployed demo URLs in one polished gallery.
                </p>
                <ul className="tour-bullets">
                  <li><span className="bullet-icon">✓</span> Direct GitHub repository and live deployment links</li>
                  <li><span className="bullet-icon">✓</span> Project lifecycle statuses: Planned, In Progress, Completed</li>
                  <li><span className="bullet-icon">✓</span> Tech stack tagging for rapid recruiter scanning</li>
                </ul>
                <Link to="/register" className="btn-nav-cta">Showcase Your Projects →</Link>
              </div>
              <div className="tour-preview-pane">
                <div className="mockup-item">
                  <div>
                    <strong>Internship Skill Tracker Fullstack</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Spring Boot 3, React, Aiven MySQL</div>
                  </div>
                  <span className="mockup-badge badge-selected">Completed</span>
                </div>
                <div className="mockup-item">
                  <div>
                    <strong>AI Job Fit & Resume Matcher</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Python, Fast-API, LLM Embeddings</div>
                  </div>
                  <span className="mockup-badge badge-interview">In Progress</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'goals' && (
            <>
              <div className="tour-info">
                <h3>Milestones & Learning Goals</h3>
                <p>
                  Set achievable, time-bound targets for technical certifications, algorithm practice, and course completions. Watch your completion rate climb with visual progress indicators.
                </p>
                <ul className="tour-bullets">
                  <li><span className="bullet-icon">✓</span> Deadline countdowns and target date tracking</li>
                  <li><span className="bullet-icon">✓</span> Dynamic progress calculations across all goals</li>
                  <li><span className="bullet-icon">✓</span> Granular sub-tasks with priority levels (Low, Medium, High)</li>
                </ul>
                <Link to="/register" className="btn-nav-cta">Set Your Goals →</Link>
              </div>
              <div className="tour-preview-pane">
                <div className="mockup-item">
                  <div>
                    <strong>AWS Certified Cloud Practitioner</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Target Date: Nov 15, 2026</div>
                  </div>
                  <span className="mockup-badge badge-interview">60% Done</span>
                </div>
                <div className="mockup-item">
                  <div>
                    <strong>Complete 100 LeetCode Mediums</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Target Date: Dec 30, 2026</div>
                  </div>
                  <span className="mockup-badge badge-selected">100% Done</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Engineering Career Role Pathways */}
      <section id="pathways" className="landing-section">
        <div className="section-header">
          <div className="section-eyebrow">Targeted Career Direction</div>
          <h2 className="section-title">Department-Aligned Career Pathways</h2>
          <p className="section-subhead">
            Choose your desired engineering target and immediately see the industry-standard skills required to stand out to employers.
          </p>
        </div>

        <div className="pathway-selector">
          {['ALL', 'CSE', 'AIML', 'ECE'].map((dept) => (
            <button
              key={dept}
              type="button"
              className={`dept-chip ${deptFilter === dept ? 'active' : ''}`}
              onClick={() => setDeptFilter(dept)}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
        </div>

        <div className="roles-grid">
          {filteredRoles.map((role) => (
            <div key={role.name} className="role-card">
              <div>
                <div className="role-header">
                  <span className="role-dept-tag">{role.dept}</span>
                </div>
                <h3 className="role-title">{role.name}</h3>
                <p className="role-desc">{role.desc}</p>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                  CORE SKILLS REQUIRED:
                </div>
                <div className="role-skills-wrap">
                  {role.skills.map((skill) => (
                    <span key={skill} className="skill-pill">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & Tech Stack Section */}
      <section id="architecture" className="landing-section">
        <div className="section-header">
          <div className="section-eyebrow">Enterprise Architecture</div>
          <h2 className="section-title">Modern Full-Stack Engineering</h2>
          <p className="section-subhead">
            Constructed with modern production patterns, industry-standard security, and cloud scalability.
          </p>
        </div>

        <div id="stack" className="arch-grid">
          <div className="arch-card">
            <div className="arch-card-top">
              <div className="arch-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>☕</div>
              <span className="arch-layer">Backend Layer</span>
            </div>
            <h4>Java 17 & Spring Boot 3</h4>
            <p>
              High-throughput RESTful API architecture with Spring Security 6, stateless JWT filter chain, BCrypt password hashing, and Hibernate JPA.
            </p>
            <div className="arch-tags">
              <span className="arch-tag">Spring Boot 3.3</span>
              <span className="arch-tag">Java 17</span>
              <span className="arch-tag">Stateless JWT</span>
              <span className="arch-tag">HikariCP</span>
            </div>
          </div>

          <div className="arch-card">
            <div className="arch-card-top">
              <div className="arch-icon" style={{ background: '#ecfdf5', color: '#047857' }}>🐬</div>
              <span className="arch-layer">Database Layer</span>
            </div>
            <h4>Aiven Cloud MySQL 8.0</h4>
            <p>
              Fully managed relational database cluster with automatic SSL/TLS 1.3 certificate verification, connection pooling, and resilient schema migration.
            </p>
            <div className="arch-tags">
              <span className="arch-tag">MySQL 8.0</span>
              <span className="arch-tag">SSL CA Cert</span>
              <span className="arch-tag">Aiven Cloud</span>
              <span className="arch-tag">ACID Compliant</span>
            </div>
          </div>

          <div className="arch-card">
            <div className="arch-card-top">
              <div className="arch-icon" style={{ background: '#fdf2f8', color: '#be185d' }}>⚛️</div>
              <span className="arch-layer">Frontend Layer</span>
            </div>
            <h4>React 18 & Vite</h4>
            <p>
              Lightning-fast single-page app bundled with Vite, featuring custom glassmorphism design, React Router navigation, and interactive Recharts data visualization.
            </p>
            <div className="arch-tags">
              <span className="arch-tag">React 18</span>
              <span className="arch-tag">Vite 5</span>
              <span className="arch-tag">Recharts</span>
              <span className="arch-tag">Glassmorphism</span>
            </div>
          </div>

          <div className="arch-card">
            <div className="arch-card-top">
              <div className="arch-icon" style={{ background: '#fef3c7', color: '#b45309' }}>☁️</div>
              <span className="arch-layer">Cloud & CI/CD</span>
            </div>
            <h4>Render + Vercel Cloud</h4>
            <p>
              Continuous deployment pipeline with Git hooks: backend packaged via Maven container on Render; frontend distributed globally via Vercel Edge CDN.
            </p>
            <div className="arch-tags">
              <span className="arch-tag">Render Cloud</span>
              <span className="arch-tag">Vercel CDN</span>
              <span className="arch-tag">CORS Handshake</span>
              <span className="arch-tag">Auto Redeploy</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Card */}
      <section className="cta-banner-wrap">
        <div className="cta-banner">
          <h2>Ready to Supercharge Your Career?</h2>
          <p>
            Join students who use InternshipSkillTracker to stand out in interviews, stay organized, and land competitive internships.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn-white">Create Free Student Account</Link>
            <Link to="/login" className="cta-btn-ghost">Sign In to Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="brand-icon" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>ST</div>
            <div>
              <p className="footer-copy">
                <strong>InternshipSkillTracker</strong> — Student Career Accelerator & Portfolio Management Platform.
              </p>
            </div>
          </div>

          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#architecture">Architecture</a>
            <a href="#pathways">Career Paths</a>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
