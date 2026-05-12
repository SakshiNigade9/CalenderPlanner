import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { fetchAppSnapshot } from "./services/api";

function ProgressBar({ current, total }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="progress-item">
      <div className="progress-head">
        <strong>{pct}%</strong>
        <span>
          {current.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TrendChart({ data }) {
  const width = 640;
  const height = 260;
  const padding = 32;
  const maxPeople = Math.max(...data.map((item) => item.people), 1);
  const maxPresentations = Math.max(...data.map((item) => item.presentations), 1);

  const points = data
    .map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - (item.people / maxPeople) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="People reached trend">
        <defs>
          <linearGradient id="lineGradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#ff4d8d" />
            <stop offset="100%" stopColor="#7d6bff" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="url(#lineGradient)" strokeWidth="5" points={points} />
        {data.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
          const y = height - padding - (item.people / maxPeople) * (height - padding * 2);
          return (
            <g key={item.label}>
              <circle cx={x} cy={y} r="6" fill="#ff4d8d" />
              <text x={x} y={height - 10} textAnchor="middle" className="chart-label">
                {item.label}
              </text>
              <text x={x} y={y - 12} textAnchor="middle" className="chart-value">
                {item.presentations}/{Math.round((item.people / maxPeople) * maxPresentations)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="chart-legend">
        <span>Presentations climb toward the 140 college target.</span>
        <span>People reached trends toward the 28,000 target.</span>
      </div>
    </div>
  );
}

function AuthPage({ kind, onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function submit(event) {
    event.preventDefault();
    if (kind === "forgot") {
      navigate("/login");
      return;
    }
    onAuth({ name: form.name || "Admin User", email: form.email || "admin@college.edu" });
    navigate("/dashboard");
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="section-kicker">AI Calendar Planner</p>
          <h1>CampusFlow Planner</h1>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <h2>
            {kind === "login" && "Login"}
            {kind === "signup" && "Create account"}
            {kind === "forgot" && "Forgot password"}
          </h2>
          {kind === "signup" && (
            <label>
              Full name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Samiksha"
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="admin@college.edu"
            />
          </label>
          {kind !== "forgot" && (
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="••••••••"
              />
            </label>
          )}
          <button className="primary-button" type="submit">
            {kind === "forgot" ? "Send reset link" : kind === "signup" ? "Create account" : "Login"}
          </button>
          <div className="auth-links">
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
            <NavLink to="/forgot-password">Forgot password</NavLink>
          </div>
        </form>
      </div>
    </div>
  );
}

function AppLayout({ snapshot, user, onLogout }) {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [weekendAllowed, setWeekendAllowed] = useState(true);
  const [settings, setSettings] = useState(snapshot.settingsSeed);
  const [activities, setActivities] = useState(snapshot.timeline);
  const [reportData, setReportData] = useState(snapshot.reports);
  const [teamFilter, setTeamFilter] = useState("All");

  const visibleActivities = useMemo(() => {
    return activities.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesQuery = !q || [item.title, item.type, item.team, item.location].join(" ").toLowerCase().includes(q);
      const matchesWeekend = weekendAllowed || (item.day !== "Sat" && item.day !== "Sun");
      const matchesTeam = teamFilter === "All" || item.team === teamFilter;
      return matchesQuery && matchesWeekend && matchesTeam;
    });
  }, [activities, search, weekendAllowed, teamFilter]);

  function addActivity(newItem) {
    setActivities((current) => [{ id: Date.now(), ...newItem }, ...current]);
  }

  function toggleProof(id) {
    setActivities((current) =>
      current.map((item) => (item.id === id ? { ...item, proof: !item.proof } : item))
    );
  }

  function createReport(title) {
    setReportData((current) => [{ title, status: "Draft", updated: "Just now" }, ...current]);
  }

  const routeTitle = snapshot.navItems.find((item) => location.pathname.startsWith(item.path))?.label ?? "Dashboard";

  return (
    <div className="app-shell">
      <div className="screen-glow glow-one" />
      <div className="screen-glow glow-two" />
      <div className="app-frame">
        <aside className="sidebar">
          <div className="brand-block">
            <h1>CampusFlow AI</h1>
            <p>Futuristic academic intelligence</p>
          </div>
          <nav className="side-nav">
            {snapshot.navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-chip ${isActive ? "active" : ""}`}>
                <span className="nav-icon" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <section className="sidebar-card">
            <p className="section-kicker">Schedule rules</p>
            <label className="toggle-row">
              <span>Weekend activities visible</span>
              <input
                type="checkbox"
                checked={weekendAllowed}
                onChange={(event) => setWeekendAllowed(event.target.checked)}
              />
            </label>
            <label className="toggle-row">
              <span>Proof required</span>
              <input
                type="checkbox"
                checked={settings.proofRequired}
                onChange={(event) => setSettings({ ...settings, proofRequired: event.target.checked })}
              />
            </label>
          </section>
        </aside>

        <main className="main-shell">
          <header className="topbar">
            <div>
              <p className="welcome-line">Welcome back</p>
              <h2>{routeTitle}</h2>
              <span className="subline">Interactive planning, reporting, analytics, and admin control.</span>
            </div>
            <div className="toolbar">
              <label className="search-box">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search activities, teams, or locations"
                />
              </label>
              <div className="user-card">
                <span className="avatar" />
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              <button type="button" className="ghost-button" onClick={onLogout}>
                Logout
              </button>
            </div>
          </header>

          <Routes>
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  snapshot={snapshot}
                  visibleActivities={visibleActivities}
                  search={search}
                  teamFilter={teamFilter}
                  setTeamFilter={setTeamFilter}
                />
              }
            />
            <Route
              path="/admin"
              element={<AdminPage snapshot={snapshot} settings={settings} setSettings={setSettings} />}
            />
            <Route
              path="/activities"
              element={<ActivitiesPage activities={visibleActivities} addActivity={addActivity} toggleProof={toggleProof} holidays={snapshot.holidays} />}
            />
            <Route path="/analytics" element={<AnalyticsPage snapshot={snapshot} activities={activities} />} />
            <Route
              path="/reports"
              element={<ReportsPage reports={reportData} createReport={createReport} />}
            />
            <Route
              path="/settings"
              element={<SettingsPage settings={settings} setSettings={setSettings} holidays={snapshot.holidays} />}
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function DashboardPage({ snapshot, visibleActivities, search, teamFilter, setTeamFilter }) {
  return (
    <section className="page-grid">
      <section className="hero-banner">
        <div>
          <p className="section-kicker">Command center</p>
          <h3>AI-driven academic activity dashboard</h3>
          <p className="hero-copy">
            The planner respects proposal rules: presentations avoid weekends and holidays, while impact and mass activities can still flow on those days.
          </p>
        </div>
        <div className="hero-metrics">
          <article className="metric-orb">
            <span>Visible schedule</span>
            <strong>{visibleActivities.length}</strong>
          </article>
          <article className="metric-orb">
            <span>Search mode</span>
            <strong>{search ? "Filtered" : "Live"}</strong>
          </article>
        </div>
      </section>

      <section className="stat-grid">
        {snapshot.summaryCards.map((card) => (
          <article key={card.label} className="stat-box interactive-card">
            <div className="stat-icon" />
            <p>{card.label}</p>
            <strong>
              {card.value.toLocaleString()}
              {card.suffix}
            </strong>
            <span>{card.delta}</span>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel panel-wide">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Target completion</p>
              <h3>Progress against proposal goals</h3>
            </div>
            <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)} className="inline-select">
              <option>All</option>
              {snapshot.teams.map((team) => (
                <option key={team.name}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="progress-stack">
            {snapshot.progressRows.map((row) => (
              <div key={row.label}>
                <p className="row-label">{row.label}</p>
                <ProgressBar current={row.current} total={row.total} />
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Live schedule</p>
              <h3>Upcoming activities</h3>
            </div>
          </div>
          <div className="list-stack">
            {visibleActivities.slice(0, 4).map((item) => (
              <div key={item.id} className="timeline-row compact-row">
                <div className="timeline-date">
                  <span>{item.day}</span>
                  <strong>{item.time}</strong>
                </div>
                <div className="timeline-copy">
                  <small>{item.type}</small>
                  <h4>{item.title}</h4>
                  <p>{item.team}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel panel-wide">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Top performers</p>
              <h3>Student momentum board</h3>
            </div>
          </div>
          <div className="leaderboard">
            {snapshot.leaderboard.map((student, index) => (
              <article key={student.name} className="leader-row">
                <div className="leader-rank">0{index + 1}</div>
                <div className="leader-meta">
                  <h4>{student.name}</h4>
                  <p>{student.team}</p>
                </div>
                <div className="leader-metric">
                  <span>Presentations</span>
                  <strong>{student.presentations}</strong>
                </div>
                <div className="leader-metric">
                  <span>People</span>
                  <strong>{student.people}</strong>
                </div>
                <div className="leader-metric">
                  <span>Streak</span>
                  <strong>{student.streak}</strong>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

function AdminPage({ snapshot, settings, setSettings }) {
  return (
    <section className="content-grid">
      <article className="panel panel-wide">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Admin control</p>
            <h3>Team oversight and planning health</h3>
          </div>
        </div>
        <div className="leaderboard">
          {snapshot.teams.map((team) => (
            <article key={team.name} className="leader-row">
              <div className="leader-meta">
                <h4>{team.name}</h4>
                <p>Lead: {team.lead}</p>
              </div>
              <div className="leader-metric">
                <span>Completion</span>
                <strong>{team.completion}%</strong>
              </div>
              <div className="leader-metric">
                <span>Presentations</span>
                <strong>{team.presentations}</strong>
              </div>
              <div className="leader-metric">
                <span>People</span>
                <strong>{team.people}</strong>
              </div>
              <div className="leader-metric">
                <span>Health</span>
                <strong>{team.health}</strong>
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Automation</p>
            <h3>Planner controls</h3>
          </div>
        </div>
        <div className="settings-stack">
          <label className="toggle-row">
            <span>Auto scheduling</span>
            <input
              type="checkbox"
              checked={settings.autoSchedule}
              onChange={(event) => setSettings({ ...settings, autoSchedule: event.target.checked })}
            />
          </label>
          <label className="toggle-row">
            <span>Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(event) => setSettings({ ...settings, notifications: event.target.checked })}
            />
          </label>
        </div>
      </article>
    </section>
  );
}

function ActivitiesPage({ activities, addActivity, toggleProof, holidays }) {
  const [form, setForm] = useState({
    day: "Wed",
    date: "May 20",
    type: "Presentation",
    title: "",
    time: "10:30 AM",
    team: "Orbit Team",
    audience: 100,
    location: "",
    status: "Planned",
    proof: false
  });

  function submit(event) {
    event.preventDefault();
    addActivity(form);
    setForm({ ...form, title: "", location: "", audience: 100 });
  }

  const holidayWarning = holidays.includes(form.date);
  const invalidPresentationWeekend =
    form.type === "Presentation" && (form.day === "Sat" || form.day === "Sun");

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Self reporting</p>
            <h3>Create activity</h3>
          </div>
        </div>
        <form className="entry-form" onSubmit={submit}>
          {["title", "location"].map((field) => (
            <label key={field}>
              {field === "title" ? "Activity title" : "Location"}
              <input
                value={form[field]}
                onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                required
              />
            </label>
          ))}
          <label>
            Type
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option>Presentation</option>
              <option>Impact Activity</option>
              <option>Mass Activity</option>
            </select>
          </label>
          <label>
            Day
            <select value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })}>
              <option>Mon</option>
              <option>Tue</option>
              <option>Wed</option>
              <option>Thu</option>
              <option>Fri</option>
              <option>Sat</option>
              <option>Sun</option>
            </select>
          </label>
          <label>
            Date
            <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </label>
          <label>
            Audience count
            <input
              type="number"
              value={form.audience}
              onChange={(event) => setForm({ ...form, audience: Number(event.target.value) })}
            />
          </label>
          {(holidayWarning || invalidPresentationWeekend) && (
            <div className="warning-box">
              {invalidPresentationWeekend && "Presentations cannot be scheduled on weekends. "}
              {holidayWarning && "Selected date is marked as a holiday."}
            </div>
          )}
          <button className="primary-button" type="submit">
            Add activity
          </button>
        </form>
      </article>

      <article className="panel panel-wide">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Activity stream</p>
            <h3>Live execution list</h3>
          </div>
        </div>
        <div className="list-stack">
          {activities.map((item) => (
            <div key={item.id} className="timeline-row">
              <div className="timeline-date">
                <span>
                  {item.day} • {item.date}
                </span>
                <strong>{item.time}</strong>
              </div>
              <div className="timeline-copy">
                <small>{item.type}</small>
                <h4>{item.title}</h4>
                <p>
                  {item.team} • {item.audience} people • {item.location}
                </p>
              </div>
              <button className="ghost-button" type="button" onClick={() => toggleProof(item.id)}>
                {item.proof ? "Proof uploaded" : "Mark proof"}
              </button>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function AnalyticsPage({ snapshot, activities }) {
  const totalAudience = activities.reduce((sum, item) => sum + item.audience, 0);
  const presentationCount = activities.filter((item) => item.type === "Presentation").length;
  return (
    <section className="content-grid">
      <article className="panel panel-wide">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Interactive analytics</p>
            <h3>Growth and target trends</h3>
          </div>
        </div>
        <TrendChart data={snapshot.trends} />
      </article>
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Live totals</p>
            <h3>Analytics summary</h3>
          </div>
        </div>
        <div className="mini-stat-list">
          <article className="mini-stat">
            <span>Visible presentations</span>
            <strong>{presentationCount}</strong>
          </article>
          <article className="mini-stat">
            <span>Visible audience total</span>
            <strong>{totalAudience.toLocaleString()}</strong>
          </article>
          <article className="mini-stat">
            <span>College completion</span>
            <strong>65.7%</strong>
          </article>
        </div>
      </article>
    </section>
  );
}

function ReportsPage({ reports, createReport }) {
  const [title, setTitle] = useState("");
  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Reports</p>
            <h3>Generate a new report</h3>
          </div>
        </div>
        <form
          className="entry-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            createReport(title.trim());
            setTitle("");
          }}
        >
          <label>
            Report title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <button className="primary-button" type="submit">
            Create report draft
          </button>
        </form>
      </article>
      <article className="panel panel-wide">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Exports</p>
            <h3>Generated reporting queue</h3>
          </div>
        </div>
        <div className="list-stack">
          {reports.map((report) => (
            <div key={`${report.title}-${report.updated}`} className="focus-row">
              <span>{report.title}</span>
              <strong>{report.status}</strong>
              <small>{report.updated}</small>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function SettingsPage({ settings, setSettings, holidays }) {
  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Settings</p>
            <h3>Platform configuration</h3>
          </div>
        </div>
        <div className="settings-stack">
          <label className="toggle-row">
            <span>Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(event) => setSettings({ ...settings, notifications: event.target.checked })}
            />
          </label>
          <label className="toggle-row">
            <span>Auto schedule</span>
            <input
              type="checkbox"
              checked={settings.autoSchedule}
              onChange={(event) => setSettings({ ...settings, autoSchedule: event.target.checked })}
            />
          </label>
          <label className="toggle-row">
            <span>Proof required</span>
            <input
              type="checkbox"
              checked={settings.proofRequired}
              onChange={(event) => setSettings({ ...settings, proofRequired: event.target.checked })}
            />
          </label>
        </div>
      </article>
      <article className="panel panel-wide">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Holiday rules</p>
            <h3>Blocked presentation dates</h3>
          </div>
        </div>
        <div className="holiday-list">
          {holidays.map((holiday) => (
            <div key={holiday} className="mini-stat">
              <span>National holiday</span>
              <strong>{holiday}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function App() {
  const [snapshot, setSnapshot] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchAppSnapshot().then(setSnapshot);
  }, []);

  if (!snapshot) {
    return <div className="loading-screen">Loading interactive workspace...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthPage kind="login" onAuth={setUser} />} />
      <Route path="/signup" element={<AuthPage kind="signup" onAuth={setUser} />} />
      <Route path="/forgot-password" element={<AuthPage kind="forgot" onAuth={setUser} />} />
      <Route
        path="/*"
        element={
          user ? (
            <AppLayout snapshot={snapshot} user={user} onLogout={() => setUser(null)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
