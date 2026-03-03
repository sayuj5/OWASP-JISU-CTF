import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import { supabase } from './lib/supabase';
import owaspLogo from './assets/owasp_jis_logo.png';
import owaspCtfLogo from './assets/owasp_jis_ctf_logo.jpg';

// ─── ADMIN PASSKEY ──────────────────────────────────────────────────────────
const ADMIN_KEY = 'OWASP-ADMIN-JIS-2026';

// ─── CHALLENGES ─────────────────────────────────────────────────────────────
const CHALLENGES = [
  {
    id: 1,
    title: 'A01:2021 – Broken Access Control',
    owasp: 'Broken Access Control occurs when users act outside intended permissions. Attackers exploit misconfigured access to view restricted resources.',
    briefing: 'An Admin Gateway exists within this system. Your guest-level interface cannot render it — but the browser\'s own inspection tools ignore visual restrictions. The structure of the document holds secrets the UI refuses to show.',
    hint: 'What the eye cannot see, the document still contains. Browsers have built-in X-ray vision. Use it to examine what\'s truly in this page — not just what\'s displayed.',
    validate: (v) => v.trim().toLowerCase() === 'flag{p0rtal_v1s1b1lity_99}',
    renderContent: () => (
      <div>
        <div id="admin-portal" style={{ display: 'none' }}>
          FLAG_VAULT: flag{'{'}p0rtal_v1s1b1lity_99{'}'}
        </div>
        <span style={{ color: 'var(--c-dimtext)', fontSize: '0.8rem' }}>
          [SYSTEM] Access attempt logged. Guest permissions insufficient. Escalate privileges to view restricted resources.
        </span>
      </div>
    ),
  },
  {
    id: 2,
    title: 'A03:2021 – Injection',
    owasp: 'Injection flaws allow attackers to send hostile data to an interpreter. Command injection exploits exposed global functions in running applications.',
    briefing: 'Every application leaks its internals in subtle ways. This one exposes a privileged gate directly in the JavaScript runtime — a function left open, waiting for the correct passphrase. The gate\'s name is on the screen. The passphrase belongs to this event.',
    hint: 'The machine\'s memory is accessible to anyone with a runtime console. Identify the exposed function name from the briefing. The passphrase follows a naming convention consistent with who is running this event and what year it is.',
    validate: (v) => v.trim().toLowerCase() === 'flag{inj3ct_th3_futur3}',
    renderContent: () => (
      <div className="code-block">
        [DEBUG] Global interceptor{' '}
        <span style={{ color: '#fff' }}>triggerPayloadBreach(payload)</span> is ACTIVE.<br />
        Awaiting payload injection to unlock encryption...
      </div>
    ),
  },
  {
    id: 3,
    title: 'A05:2021 – Security Misconfiguration',
    owasp: 'The most common finding. Sensitive data is accidentally left in comments, configs, and logs — visible to any attacker inspecting the source.',
    briefing: 'A careless developer fragmented classified data across three layers of the application before shipping to production. Each layer is a different attack surface. A seasoned analyst knows: markup holds notes, styles can carry secrets, and runtime logs are never truly silent.',
    hint: 'Three surfaces. Three fragments. (1) Developers often leave notes in the document that are never meant to be read aloud. (2) CSS is not just for colors — variables can store anything. (3) The console never sleeps. Be patient and listen.',
    renderContent: () => (
      <div className="source-inspection-box">
        <div dangerouslySetInnerHTML={{ __html: '<!-- DEVELOPER NOTE: REMOVE BEFORE PROD! Part 1: flag{fragm3nted -->' }} />
        <span style={{ color: 'var(--c-dimtext)', fontSize: '0.8rem' }}>
          [ANALYST MODE] Three signal fragments detected across the attack surface.<br />
          Triangulate all three and reconstruct the full payload.
        </span>
      </div>
    ),
    validate: (v) => v.trim().toLowerCase() === 'flag{fragm3nted_s3cur1ty_r1sk}',
  },
  {
    id: 4,
    title: 'A02:2021 – Cryptographic Failures',
    owasp: 'Cryptographic failures expose sensitive data through weak or absent encryption. Base64 encoding provides zero security — it is trivially reversible.',
    briefing: 'An intercepted signal has been obfuscated using a reversible schema that predates the internet itself. Developers often confuse this encoding scheme with encryption — a fatal mistake. The payload above is not locked. It is merely wearing a disguise. Strip it.',
    hint: 'This encoding scheme was designed for data transport, not secrecy. It operates on a 64-character alphabet and can be reversed by any modern runtime natively — no libraries required. The browser console speaks this language fluently.',
    renderContent: () => (
      <div className="code-block">
        INTERCEPTED SIGNAL:<br />
        <span style={{ color: '#fff', letterSpacing: '2px', fontSize: '1rem' }}>
          RkxBR3tiNDU2NF9pNV9mdW59
        </span>
      </div>
    ),
    validate: (v) => v.trim().toLowerCase() === 'flag{b4564_i5_fun}',
  },
];

// ─── MATRIX CANVAS ──────────────────────────────────────────────────────────
const MatrixBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 13;
    let drops = Array.from({ length: Math.ceil(window.innerWidth / fontSize) }, () => Math.random() * -100);
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00FF41';
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      });
    };
    const iv = setInterval(draw, 33);
    return () => { clearInterval(iv); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="matrix-canvas" />;
};

// ─── SPLASH ─────────────────────────────────────────────────────────────────
const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); setTimeout(onComplete, 500); return 100; }
        return p + 1;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="splash-wrapper" onClick={() => { if (progress < 100) setProgress(101); }}>
      <MatrixBackground />
      <div className="splash-inner">
        <img src={owaspLogo} alt="OWASP JIS" className="splash-logo" />
        <h2 className="splash-title">OWASP JIS UNIVERSITY</h2>
        <p className="splash-sub">CYBER THREAT INTELLIGENCE · CTF 2026</p>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <p className="splash-cta">{progress < 100 ? `INITIALIZING SYSTEMS... ${progress}%` : '● READY — CLICK TO ENTER'}</p>
      </div>
    </div>
  );
};

// ─── LOGIN PAGE (DEFAULT AFTER SPLASH) ─────────────────────────────────────
const LoginPage = ({ onLogin, onGoRegister, onGoAdmin }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('participants')
        .select('*')
        .eq('email', loginData.email)
        .eq('password', loginData.password)
        .single();
      if (err || !data) throw new Error('Invalid credentials. Please register first.');
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <MatrixBackground />
      <div className="login-card">
        <img src={owaspLogo} alt="OWASP JIS" className="login-logo" />
        <h2>OPERATIVE LOGIN</h2>
        <p>OWASP JIS UNIVERSITY · CTF 2026</p>

        {error && <div className="form-error">⚠ {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>EMAIL</label>
            <input type="email" className="input-field" required
              value={loginData.email}
              onChange={e => setLoginData({ ...loginData, email: e.target.value })}
              placeholder="operator@jis.ac.in" />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" className="input-field" required
              value={loginData.password}
              onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary"
            style={{ marginTop: '1.2rem', width: '100%' }} disabled={loading}>
            {loading ? 'CONNECTING...' : 'ESTABLISH CONNECTION'}
          </button>
        </form>

        <div className="auth-divider">
          <span>New operative?</span>
        </div>

        <button className="btn-register-link" onClick={onGoRegister}>
          ◈ REGISTER HERE TO PARTICIPATE
        </button>

        <div className="owasp-footer">
          Interested in Cybersecurity?&nbsp;
          <a href="https://owasp.org/www-chapter-jis-university-student-chapter/" target="_blank" rel="noreferrer">
            Join OWASP JIS University Student Chapter →
          </a>
        </div>
      </div>

      {/* Discreet host access link — outside the card */}
      <button className="host-access-link" onClick={onGoAdmin}>
        🔐 Event Host Portal
      </button>
    </div>
  );
};

// ─── REGISTER PAGE ───────────────────────────────────────────────────────────
const RegisterPage = ({ onLogin, onGoLogin }) => {
  const [reg, setReg] = useState({ name: '', email: '', password: '', mode: 'solo', teamName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (reg.mode === 'group' && !reg.teamName.trim()) {
        setError('Team name is required for group participation.');
        setLoading(false); return;
      }
      if (reg.password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false); return;
      }
      const { data: existing } = await supabase
        .from('participants').select('id').eq('email', reg.email).single();
      if (existing) {
        setError('Email already registered. Please login.');
        setLoading(false); return;
      }
      const { data, error: err } = await supabase
        .from('participants')
        .insert([{
          name: reg.name, email: reg.email, password: reg.password,
          mode: reg.mode, team_name: reg.mode === 'group' ? reg.teamName : null,
          score: 0, completed_stages: [],
        }])
        .select().single();
      if (err) throw err;
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <MatrixBackground />
      <div className="login-card">
        <img src={owaspLogo} alt="OWASP JIS" className="login-logo" />
        <h2>OPERATIVE REGISTRATION</h2>
        <p>OWASP JIS UNIVERSITY · CTF 2026</p>

        {error && <div className="form-error">⚠ {error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>FULL NAME</label>
            <input type="text" className="input-field" required value={reg.name}
              onChange={e => setReg({ ...reg, name: e.target.value })}
              placeholder="e.g. Sayuj Das" />
          </div>
          <div className="form-group">
            <label>EMAIL ADDRESS</label>
            <input type="email" className="input-field" required value={reg.email}
              onChange={e => setReg({ ...reg, email: e.target.value })}
              placeholder="operator@jis.ac.in" />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" className="input-field" required value={reg.password}
              onChange={e => setReg({ ...reg, password: e.target.value })}
              placeholder="Min. 6 characters" />
          </div>
          <div className="form-group">
            <label>PARTICIPATION MODE</label>
            <div className="mode-toggle">
              <button type="button"
                className={`mode-btn ${reg.mode === 'solo' ? 'active' : ''}`}
                onClick={() => setReg({ ...reg, mode: 'solo', teamName: '' })}>
                ◈ SOLO
              </button>
              <button type="button"
                className={`mode-btn ${reg.mode === 'group' ? 'active' : ''}`}
                onClick={() => setReg({ ...reg, mode: 'group' })}>
                ◈ GROUP
              </button>
            </div>
          </div>
          {reg.mode === 'group' && (
            <div className="form-group">
              <label>TEAM NAME</label>
              <input type="text" className="input-field" value={reg.teamName}
                onChange={e => setReg({ ...reg, teamName: e.target.value })}
                placeholder="e.g. TEAM-SIGMA" />
            </div>
          )}
          <button type="submit" className="btn-primary"
            style={{ marginTop: '1.2rem', width: '100%' }} disabled={loading}>
            {loading ? 'REGISTERING...' : 'ENLIST & BEGIN MISSION'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Already registered?</span>
        </div>
        <button className="btn-register-link" onClick={onGoLogin}>
          ← BACK TO LOGIN
        </button>

        <div className="owasp-footer">
          Interested in Cybersecurity?&nbsp;
          <a href="https://owasp.org/www-chapter-jis-university-student-chapter/" target="_blank" rel="noreferrer">
            Join OWASP JIS University Student Chapter →
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN LOGIN PAGE (COMPLETELY SEPARATE) ──────────────────────────────────
const AdminLoginPage = ({ onAdminLogin, onGoLogin }) => {
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');

  const handleAdmin = (e) => {
    e.preventDefault();
    if (adminKey.trim() === ADMIN_KEY) onAdminLogin();
    else { setError('Invalid passkey. Access denied.'); setAdminKey(''); }
  };

  return (
    <div className="login-container">
      <MatrixBackground />
      <div className="login-card admin-login-card">
        <div className="admin-badge-header">
          <span className="admin-eye">⬛</span>
          <span className="admin-label">RESTRICTED ACCESS</span>
        </div>
        <img src={owaspLogo} alt="OWASP JIS" className="login-logo" />
        <h2>EVENT HOST PORTAL</h2>
        <p>OWASP JIS UNIVERSITY · ADMIN ONLY</p>

        {error && <div className="form-error">⚠ {error}</div>}

        <form onSubmit={handleAdmin}>
          <div className="form-group">
            <label>HOST PASSKEY</label>
            <input type="password" className="input-field" required
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              placeholder="Enter secret host passkey" />
          </div>
          <button type="submit" className="btn-primary"
            style={{ marginTop: '1.2rem', width: '100%' }}>
            ACCESS COMMAND CENTER
          </button>
        </form>

        <button className="btn-register-link" style={{ marginTop: '0.8rem' }} onClick={onGoLogin}>
          ← Back to Operative Login
        </button>
      </div>
    </div>
  );
};

// REMOVED: old combined LoginPage
const _UNUSED = ({ onLogin, onAdminLogin }) => {
  const [tab, setTab] = useState('register');
  const [reg, setReg] = useState({ name: '', email: '', password: '', mode: 'solo', teamName: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (reg.mode === 'group' && !reg.teamName.trim()) {
        setError('Team name is required for group mode.'); setLoading(false); return;
      }
      // Check if email already exists
      const { data: existing } = await supabase
        .from('participants')
        .select('id')
        .eq('email', reg.email)
        .single();
      if (existing) { setError('Email already registered. Please login instead.'); setLoading(false); return; }

      const { data, error: err } = await supabase
        .from('participants')
        .insert([{
          name: reg.name,
          email: reg.email,
          password: reg.password,
          mode: reg.mode,
          team_name: reg.mode === 'group' ? reg.teamName : null,
          score: 0,
          completed_stages: [],
        }])
        .select()
        .single();

      if (err) throw err;
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('participants')
        .select('*')
        .eq('email', loginData.email)
        .eq('password', loginData.password)
        .single();
      if (err || !data) throw new Error('Invalid credentials. Not registered yet?');
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmin = (e) => {
    e.preventDefault();
    if (adminKey.trim() === ADMIN_KEY) onAdminLogin();
    else setError('Invalid host passkey.');
  };

  return (
    <div className="login-container">
      <MatrixBackground />
      <div className="login-card">
        <img src={owaspLogo} alt="OWASP JIS" className="login-logo" />
        <h2>OPERATIVE AUTHENTICATION</h2>
        <p>OWASP JIS UNIVERSITY · CTF 2026</p>

        <div className="tab-bar">
          {['register', 'login', 'admin'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => { setTab(t); setError(''); }}>
              {t === 'register' ? 'REGISTER' : t === 'login' ? 'LOGIN' : 'HOST'}
            </button>
          ))}
        </div>

        {error && <div className="form-error">⚠ {error}</div>}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>FULL NAME</label>
              <input type="text" className="input-field" required value={reg.name}
                onChange={e => setReg({ ...reg, name: e.target.value })} placeholder="e.g. Sayuj Das" />
            </div>
            <div className="form-group">
              <label>EMAIL</label>
              <input type="email" className="input-field" required value={reg.email}
                onChange={e => setReg({ ...reg, email: e.target.value })} placeholder="operator@jis.ac.in" />
            </div>
            <div className="form-group">
              <label>PASSWORD</label>
              <input type="password" className="input-field" required value={reg.password}
                onChange={e => setReg({ ...reg, password: e.target.value })} placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label>PARTICIPATION MODE</label>
              <div className="mode-toggle">
                <button type="button" className={`mode-btn ${reg.mode === 'solo' ? 'active' : ''}`}
                  onClick={() => setReg({ ...reg, mode: 'solo', teamName: '' })}>◈ SOLO</button>
                <button type="button" className={`mode-btn ${reg.mode === 'group' ? 'active' : ''}`}
                  onClick={() => setReg({ ...reg, mode: 'group' })}>◈ GROUP</button>
              </div>
            </div>
            {reg.mode === 'group' && (
              <div className="form-group">
                <label>TEAM NAME</label>
                <input type="text" className="input-field" value={reg.teamName}
                  onChange={e => setReg({ ...reg, teamName: e.target.value })} placeholder="e.g. TEAM-SIGMA" />
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'REGISTERING...' : 'ENLIST & BEGIN'}
            </button>
          </form>
        )}

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>EMAIL</label>
              <input type="email" className="input-field" required value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })} placeholder="operator@jis.ac.in" />
            </div>
            <div className="form-group">
              <label>PASSWORD</label>
              <input type="password" className="input-field" required value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'CONNECTING...' : 'ESTABLISH CONNECTION'}
            </button>
          </form>
        )}

        {tab === 'admin' && (
          <form onSubmit={handleAdmin}>
            <div className="form-group">
              <label>HOST PASSKEY</label>
              <input type="password" className="input-field" required value={adminKey}
                onChange={e => setAdminKey(e.target.value)} placeholder="Enter admin passkey" />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
              ACCESS DASHBOARD
            </button>
          </form>
        )}

        <div className="owasp-footer">
          Interested in Cybersecurity?&nbsp;
          <a href="https://owasp.org/www-chapter-jis-university-student-chapter/" target="_blank" rel="noreferrer">
            Join OWASP JIS University Student Chapter →
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────
const AdminDashboard = ({ onExit }) => {
  const [participants, setParticipants] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .order('score', { ascending: false });
    if (data) setParticipants(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchParticipants();
    // Real-time subscription
    const channel = supabase
      .channel('participants_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        fetchParticipants();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchParticipants]);

  const filtered = participants
    .filter(u => filter === 'all' || u.mode === filter)
    .filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  const uniqueTeams = [...new Set(participants.filter(u => u.team_name).map(u => u.team_name))];
  const completed = participants.filter(u => (u.completed_stages || []).length === CHALLENGES.length);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this participant?')) return;
    await supabase.from('participants').delete().eq('id', id);
    fetchParticipants();
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src={owaspLogo} alt="OWASP" style={{ height: '40px' }} />
          <div>
            <div className="dash-title">EVENT HOST DASHBOARD</div>
            <div className="dash-sub">OWASP JIS University CTF 2026 · Live via Supabase</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="live-badge">● LIVE</div>
          <button className="btn-outline" onClick={onExit}>EXIT DASHBOARD</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'TOTAL OPERATIVES', val: participants.length },
          { label: 'SOLO', val: participants.filter(u => u.mode === 'solo').length },
          { label: 'GROUP', val: participants.filter(u => u.mode === 'group').length },
          { label: 'TEAMS', val: uniqueTeams.length },
          { label: 'COMPLETED', val: completed.length },
          { label: 'TOP SCORE', val: participants[0]?.score || 0 },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="dash-controls">
        <input type="text" className="input-field" style={{ maxWidth: '280px', fontSize: '0.8rem' }}
          placeholder="SEARCH NAME / EMAIL..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-btns">
          {['all', 'solo', 'group'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
          ))}
        </div>
        <button className="btn-outline-green" onClick={fetchParticipants}>↻ REFRESH</button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="loading-msg">LOADING OPERATIVE DATA FROM SUPABASE...</div>
        ) : (
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>OPERATIVE</th>
                <th>EMAIL</th>
                <th>MODE</th>
                <th>TEAM</th>
                <th>STAGES</th>
                <th>SCORE</th>
                <th>REGISTERED</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="empty-row">NO OPERATIVES FOUND</td></tr>
              )}
              {filtered.map((u, i) => {
                const done = (u.completed_stages || []).length;
                const isWinner = done === CHALLENGES.length;
                const rank = participants.indexOf(u);
                return (
                  <tr key={u.id} className={isWinner ? 'winner-row' : ''}>
                    <td className="rank-cell">
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : rank + 1}
                    </td>
                    <td className="name-cell">{u.name}</td>
                    <td className="email-cell">{u.email}</td>
                    <td><span className={`badge ${u.mode}`}>{u.mode.toUpperCase()}</span></td>
                    <td className="team-cell">{u.team_name || '—'}</td>
                    <td>
                      <div className="stage-dots">
                        {CHALLENGES.map(c => (
                          <div key={c.id}
                            className={`stage-dot ${(u.completed_stages || []).includes(c.id) ? 'done' : ''}`}
                            title={`Stage ${c.id}: ${c.title}`} />
                        ))}
                      </div>
                    </td>
                    <td className="score-cell">{u.score || 0} pts</td>
                    <td className="date-cell">
                      {new Date(u.registered_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <span className={`status-badge ${isWinner ? 'complete' : done > 0 ? 'active' : 'pending'}`}>
                        {isWinner ? '✓ DONE' : done > 0 ? `STG ${done + 1}` : 'WAITING'}
                      </span>
                    </td>
                    <td>
                      <button className="del-btn" onClick={() => handleDelete(u.id)} title="Remove participant">✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ─── CTF TERMINAL ────────────────────────────────────────────────────────────
const CTFTerminal = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [stageIndex, setStageIndex] = useState(() => {
    const done = (initialUser.completed_stages || []).length;
    return Math.min(done, CHALLENGES.length - 1);
  });
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: `OPERATIVE ${initialUser.name.toUpperCase()} AUTHENTICATED. SESSION ACTIVE.`, type: 'success' },
    { time: new Date().toLocaleTimeString(), msg: 'CONNECTED TO SUPABASE NETWORK. MISSION LOADED.', type: 'info' },
    { time: new Date().toLocaleTimeString(), msg: `${CHALLENGES.length} SECTORS TO BREACH. ${(initialUser.completed_stages || []).length} ALREADY BYPASSED.`, type: 'info' },
  ]);
  const [isShaking, setIsShaking] = useState(false);
  const [isVictory, setIsVictory] = useState((initialUser.completed_stages || []).length === CHALLENGES.length);
  const [saving, setSaving] = useState(false);
  const terminalEndRef = useRef(null);

  const addLog = (msg, type = 'info') =>
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Global injection hook
  useEffect(() => {
    window.triggerPayloadBreach = (payload) => {
      if (payload === 'OWASP_JIS_2026') {
        console.log('%c[INJECTION SUCCESS] Sector Flag: flag{inj3ct_th3_futur3}', 'color:#00FF41;font-weight:bold;background:#000;padding:6px 10px;border:1px solid #00FF41;');
        return 'SUCCESS: Flag logged to console.';
      }
      console.log('%c[INJECTION FAILED] Invalid payload string.', 'color:#FF003C;');
      return 'ERROR: INVALID PAYLOAD.';
    };
    return () => delete window.triggerPayloadBreach;
  }, []);

  // Stage 3 console whisper
  useEffect(() => {
    if (CHALLENGES[stageIndex]?.id === 3) {
      addLog('[A05] Signal fragments detected in 3 locations. Start your scan.', 'info');
      const iv = setInterval(() => {
        console.log('%c[A05-WHISPER] ◈ Part 3 of the flag: _r1sk}', 'color:#00CCFF;font-style:italic;background:#000;padding:4px;');
      }, 7000);
      return () => clearInterval(iv);
    }
  }, [stageIndex]);

  const saveProgress = async (updatedUser) => {
    setSaving(true);
    const { data, error } = await supabase
      .from('participants')
      .update({
        score: updatedUser.score,
        completed_stages: updatedUser.completed_stages,
      })
      .eq('id', updatedUser.id)
      .select()
      .single();
    if (!error && data) setUser(data);
    setSaving(false);
    return data;
  };

  const handleSubmit = async () => {
    const challenge = CHALLENGES[stageIndex];
    if (!inputValue.trim()) return;
    if (challenge.validate(inputValue)) {
      const pts = (CHALLENGES.length - stageIndex) * 250;
      const updatedUser = {
        ...user,
        completed_stages: [...(user.completed_stages || []), challenge.id],
        score: (user.score || 0) + pts,
      };
      const saved = await saveProgress(updatedUser);
      addLog(`✓ ACCESS GRANTED: ${challenge.title} BYPASSED. +${pts} pts`, 'success');
      setInputValue('');
      if (stageIndex < CHALLENGES.length - 1) {
        setStageIndex(prev => prev + 1);
        addLog(`LOADING SECTOR ${stageIndex + 2}...`, 'info');
      } else {
        setIsVictory(true);
        addLog('★ ALL SECTORS BREACHED. SYSTEM OVERRIDDEN. MISSION COMPLETE.', 'success');
      }
    } else {
      addLog('✗ ACCESS DENIED: Flag mismatch. Review your analysis and retry.', 'error');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const challenge = CHALLENGES[stageIndex];

  if (isVictory) {
    return (
      <div className="terminal-container">
        <div className="victory-screen">
          <img src={owaspCtfLogo} alt="OWASP JIS University" style={{ width: '200px', marginBottom: '1rem', borderRadius: '4px' }} />
          <h1 style={{ margin: '0 0 0.5rem' }}>SYSTEM OVERRIDDEN</h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            Outstanding, Operative <strong>{user.name}</strong>.<br />
            Final Score: <strong style={{ color: 'var(--c-primary)', fontSize: '1.2rem' }}>{user.score} pts</strong>
          </p>
          <div className="code-block" style={{ textAlign: 'left', maxWidth: '480px', margin: '1.5rem auto' }}>
            SECURITY AUDIT COMPLETE:<br />
            ━━━━━━━━━━━━━━━━━━━━━━━━━<br />
            [✓] A01 – Broken Access Control : SECURED<br />
            [✓] A03 – Injection             : MITIGATED<br />
            [✓] A05 – Security Misconfiguration : RESOLVED<br />
            [✓] A02 – Cryptographic Failures  : DECRYPTED<br />
            ━━━━━━━━━━━━━━━━━━━━━━━━━
          </div>
          <a href="https://owasp.org/www-chapter-jis-university-student-chapter/" target="_blank" rel="noreferrer">
            <button className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.9rem 2rem' }}>
              JOIN OWASP JIS STUDENT CHAPTER →
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`terminal-container ${isShaking ? 'shake' : ''}`}>
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={owaspCtfLogo} alt="OWASP JIS" style={{ height: '34px', borderRadius: '3px' }} />
          <span className="header-title">OWASP-GATE v2.0</span>
          {saving && <span style={{ fontSize: '0.6rem', color: 'var(--c-dimtext)', animation: 'pulse 1s infinite' }}>↑ SYNCING...</span>}
        </div>
        <div className="status-bar">
          {user.name} · {user.mode === 'group' ? `⊞ ${user.team_name}` : '◈ SOLO'} · STG {stageIndex + 1}/{CHALLENGES.length} · {user.score || 0} pts
        </div>
      </div>

      {/* OWASP context banner */}
      <div className="owasp-context">
        <span className="owasp-badge">OWASP TOP 10</span>
        <span style={{ opacity: 0.85, fontSize: '0.78rem', lineHeight: 1.5 }}>{challenge.owasp}</span>
      </div>

      {/* Challenge */}
      <div className="challenge-area">
        <h3 className="challenge-title">◈ SECTOR {stageIndex + 1} — {challenge.title}</h3>
        <p className="briefing">{challenge.briefing}</p>
        <div className="challenge-content">
          {challenge.renderContent?.()}
        </div>
        <div className="hint-text">
          <strong>◈ ANALYST HINT:</strong>&nbsp;{challenge.hint}
        </div>
      </div>

      {/* Log stream */}
      <div className="log-stream">
        {logs.map((log, i) => (
          <div key={i} className="log-entry">
            <span className="log-time">[{log.time}]</span>
            <span className={`log-msg-${log.type}`}>{log.msg}</span>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Input */}
      <div className="input-area">
        <span className="input-prompt">
          {user.name.toLowerCase().replace(/\s+/g, '-')}@owasp:~#
        </span>
        <input
          type="text"
          placeholder="ENTER EXTRACTED FLAG..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
          disabled={saving}
        />
        <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'SAVING...' : 'MITIGATE'}
        </button>
      </div>

      {/* Hidden CSS fragment for Stage 3 */}
      <div style={{ '--secret-fragment': '_s3cur1ty', display: 'none' }} />
    </div>
  );
};

// ─── ROOT APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('splash'); // splash | login | register | admin-login | admin | ctf
  const [user, setUser] = useState(null);

  const handleLogin = (u) => { setUser(u); setView('ctf'); };

  if (view === 'splash') return <SplashScreen onComplete={() => setView('login')} />;
  if (view === 'login') return <LoginPage onLogin={handleLogin} onGoRegister={() => setView('register')} onGoAdmin={() => setView('admin-login')} />;
  if (view === 'register') return <RegisterPage onLogin={handleLogin} onGoLogin={() => setView('login')} />;
  if (view === 'admin-login') return <AdminLoginPage onAdminLogin={() => setView('admin')} onGoLogin={() => setView('login')} />;
  if (view === 'admin') return <AdminDashboard onExit={() => setView('login')} />;
  if (view === 'ctf' && user) return <CTFTerminal user={user} />;
  return null;
}
