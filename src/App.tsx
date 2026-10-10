import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import type { AppContextValue } from './interface/AppContext';
import type { Activity, AuthSession, Contact, Deal } from './interface/types';
import { crmApi, isDemoMode } from './services/crmApi';
import Dashboard from './views/Dashboard';
import Pipeline from './views/Pipeline';
import LeadsList from './views/LeadsList';
import Contacts from './views/Contacts';
import Assistant from './views/Assistant';
import DealDetails from './components/DealDetails';
import DealForm from './components/DealForm';
import Icon from './components/Icon';
import './App.css';

interface SignInValues {
  email: string;
  password: string;
}

interface SignUpValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function SignIn({
  onSignIn,
  onCreateAccount,
  onError,
  notice,
}: {
  onSignIn: (session: AuthSession) => void;
  onCreateAccount: () => void;
  onError: (message: string) => void;
  notice?: string;
}) {
  const [error, setError] = useState(notice ?? '');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    defaultValues: { email: isDemoMode ? '' : '', password: '' },
  });
  const navigate = useNavigate();

  async function submit(values: SignInValues) {
    setError('');
    try {
      onSignIn(await crmApi.login(values.email, values.password));
      navigate('/dashboard');
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    }
  }

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-brand">
          <span className="brand-symbol">p</span> pipeline<span className="brand-crm">crm</span>
        </div>
        <div className="login-art-copy">
          <span className="eyebrow">A CLEARER PATH TO CLOSE</span>
          <h1>
            Good conversations.
            <br />
            Great outcomes.
          </h1>
          <p>One thoughtful workspace for every relationship and every opportunity.</p>
          <div className="login-art-stats">
            <div>
              <b>2.4×</b>
              <small>more visibility</small>
            </div>
            <span />
            <div>
              <b>34%</b>
              <small>faster follow-up</small>
            </div>
            <span />
            <div>
              <b>1 place</b>
              <small>for your whole team</small>
            </div>
          </div>
        </div>
        <div className="login-art-glow" />
        <small className="login-art-foot">A little more clarity in every sales day.</small>
      </section>
      <section className="login-form-side">
        <div className="login-form-wrap">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p>Pick up right where your team left off.</p>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <form noValidate onSubmit={handleSubmit(submit)}>
            <label className="field">
              Work email
              <input
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                {...register('email', {
                  required: 'Email is required field',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address.',
                  },
                })}
              />
              {errors.email && <small className="form-field-error">{errors.email.message}</small>}
            </label>
            <label className="field">
              Password
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Enter your password.',
                  minLength: {
                    value: isDemoMode ? 1 : 8,
                    message: `Password must be at least ${isDemoMode ? 1 : 8} characters.`,
                  },
                })}
              />
              {errors.password && (
                <small className="form-field-error">{errors.password.message}</small>
              )}
            </label>
            {/* <div className="login-meta">
              <label>
                <input type="checkbox" defaultChecked /> Remember me
              </label>
            </div> */}
            <button
              className="button button-primary login-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
              <Icon name="chevron" size={16} />
            </button>
          </form>
          <div className="auth-switch">
            New here?
            <button type="button" className="text-button" onClick={onCreateAccount}>
              Create an account
            </button>
          </div>
          {isDemoMode && (
            <div className="demo-login-note">
              <Icon name="sparkles" size={15} />
              <span>
                <b>New to the demo?</b>
                <small>Create an account first, then sign in with your registered email and password.</small>
              </span>
            </div>
          )}
          <small className="login-terms">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </small>
        </div>
        <div className="login-footer">
          © 2026 Pipeline CRM <span>·</span> Built for better relationships
        </div>
      </section>
    </main>
  );
}

function SignUp({
  onBackToSignIn,
  notice,
}: {
  onBackToSignIn: () => void;
  notice?: string;
}) {
  const [error, setError] = useState(notice ?? '');
  const [accountCreated, setAccountCreated] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  async function submit(values: SignUpValues) {
    setError('');
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await crmApi.signup(values.name.trim(), values.email, values.password);
      setAccountCreated(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create account.');
    }
  }

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-brand">
          <span className="brand-symbol">p</span> pipeline<span className="brand-crm">crm</span>
        </div>
        <div className="login-art-copy">
          <span className="eyebrow">BUILD BETTER RELATIONSHIPS</span>
          <h1>
            Start your
            <br />
            next sales chapter.
          </h1>
          <p>Turn conversations into momentum with context, focus, and a clear path to the next step.</p>
          <div className="login-art-stats">
            <div>
              <b>5 min</b>
              <small>to launch</small>
            </div>
            <span />
            <div>
              <b>99.9%</b>
              <small>less chaos</small>
            </div>
            <span />
            <div>
              <b>1 team</b>
              <small>one workspace</small>
            </div>
          </div>
        </div>
        <div className="login-art-glow" />
        <small className="login-art-foot">A little more clarity in every sales day.</small>
      </section>
      <section className="login-form-side">
        <div className="login-form-wrap">
          <span className="eyebrow">CREATE ACCOUNT</span>
          <h2>Set up your workspace</h2>
          <p>Get started with a CRM built for faster follow-up and stronger pipeline visibility.</p>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <form noValidate onSubmit={handleSubmit(submit)}>
            <label className="field">
              Full name
              <input
                type="text"
                autoComplete="name"
                placeholder="Jordan Lee"
                {...register('name', { required: 'Enter your full name.' })}
              />
              {errors.name && <small className="form-field-error">{errors.name.message}</small>}
            </label>
            <label className="field">
              Work email
              <input
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                {...register('email', {
                  required: 'Email is required field',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address.',
                  },
                })}
              />
              {errors.email && <small className="form-field-error">{errors.email.message}</small>}
            </label>
            <label className="field">
              Password
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                {...register('password', {
                  required: 'Create a password.',
                  minLength: {
                    value: isDemoMode ? 1 : 8,
                    message: `Password must be at least ${isDemoMode ? 1 : 8} characters.`,
                  },
                })}
              />
              {errors.password && (
                <small className="form-field-error">{errors.password.message}</small>
              )}
            </label>
            <label className="field">
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password.',
                })}
              />
              {errors.confirmPassword && (
                <small className="form-field-error">{errors.confirmPassword.message}</small>
              )}
            </label>
            <button
              className="button button-primary login-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
              <Icon name="chevron" size={16} />
            </button>
          </form>
          <div className="auth-switch">
            Already have an account?
            <button type="button" className="text-button" onClick={onBackToSignIn}>
              Sign in
            </button>
          </div>
          <small className="login-terms">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </small>
        </div>
        <div className="login-footer">
          © 2026 Pipeline CRM <span>·</span> Built for better relationships
        </div>
      </section>
      {accountCreated && (
        <div className="modal-backdrop">
          <section
            className="modal-card signup-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-success-title"
          >
            <span className="eyebrow">SIGN-UP COMPLETE</span>
            <h2 id="signup-success-title">Your account was created successfully.</h2>
            <p>You can now sign in using the email and password you registered.</p>
            <button className="button button-primary" type="button" onClick={onBackToSignIn}>
              Sign in
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

function ApplicationShell({
  session,
  onLogout,
  deals,
  contacts,
  activities,
  reload,
  loadError,
  notify,
}: {
  session: AuthSession;
  onLogout: () => void;
  deals: Deal[];
  contacts: Contact[];
  activities: Activity[];
  reload: () => Promise<void>;
  loadError: string;
  notify: (message: string, kind?: 'success' | 'error') => void;
}) {
  const [showDealForm, setShowDealForm] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const context = useMemo<AppContextValue>(
    () => ({
      user: session.user,
      deals,
      contacts,
      activities,
      reload,
      notify,
      selectDeal: setSelectedDealId,
    }),
    [session.user, deals, contacts, activities, reload, notify],
  );
  const title = location.pathname.startsWith('/pipeline')
    ? 'Pipeline'
    : location.pathname.startsWith('/deals')
      ? 'Deals'
      : location.pathname.startsWith('/contacts')
        ? 'Contacts'
        : location.pathname.startsWith('/assistant')
          ? 'Sales assistant'
          : 'Overview';
  const filteredDeals = globalSearch.trim()
    ? deals
        .filter((deal) => {
          const contact = contacts.find((item) => item.id === deal.contactId);
          return `${contact?.name ?? ''} ${contact?.company ?? ''}`
            .toLowerCase()
            .includes(globalSearch.toLowerCase());
        })
        .slice(0, 5)
    : [];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <NavLink to="/dashboard" className="brand">
          <span className="brand-symbol">p</span>
          <span>
            pipeline<small>CRM</small>
          </span>
        </NavLink>
        <div className="workspace-switcher">
          <span className="workspace-logo">N</span>
          <span>
            <b>Northstar Studio</b>
            <small>Sales workspace</small>
          </span>
          <span className="workspace-caret">⌄</span>
        </div>
        <nav className="primary-nav" aria-label="Main navigation">
          <small className="nav-section-label">WORKSPACE</small>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="grid" />
            Overview
          </NavLink>
          <NavLink
            to="/pipeline"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="columns" />
            Pipeline
            <span className="nav-count">
              {deals.filter((deal) => !deal.stage.startsWith('Closed')).length}
            </span>
          </NavLink>
          <NavLink to="/deals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon name="dollar" />
            Deals
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="users" />
            Contacts
          </NavLink>
          <small className="nav-section-label nav-section-spaced">INTELLIGENCE</small>
          <NavLink
            to="/assistant"
            className={({ isActive }) => `nav-link assistant-nav ${isActive ? 'active' : ''}`}
          >
            <Icon name="sparkles" />
            Sales assistant<span className="nav-new">AI</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-sparkle">
              <Icon name="sparkles" size={16} />
            </span>
            <b>A little help?</b>
            <p>Explore tips to make your pipeline work harder.</p>
            <button onClick={() => navigate('/assistant')}>
              Explore the assistant <Icon name="arrow" size={13} />
            </button>
          </div>
          <button className="user-menu" onClick={onLogout}>
            <span className="user-avatar">
              {session.user.name
                .split(/\s+/)
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
            <span>
              <b>{session.user.name}</b>
              <small>{session.user.role}</small>
            </span>
            <Icon name="logout" size={16} />
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <Icon name="chevron" size={14} />
            <b>{title}</b>
          </div>
          <div className="topbar-actions">
            <div className={`top-search ${searchOpen ? 'open' : ''}`}>
              <Icon name="search" size={17} />
              <input
                aria-label="Search all deals"
                placeholder="Search anything..."
                value={globalSearch}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => setGlobalSearch(event.target.value)}
                onKeyDown={(event) =>
                  event.key === 'Enter' &&
                  filteredDeals[0] &&
                  setSelectedDealId(filteredDeals[0].id)
                }
              />
              <kbd>⌘ K</kbd>
              {searchOpen && globalSearch && (
                <div className="search-results">
                  {filteredDeals.length ? (
                    filteredDeals.map((deal) => {
                      const contact = contacts.find((item) => item.id === deal.contactId);
                      return (
                        <button
                          key={deal.id}
                          onClick={() => {
                            setSelectedDealId(deal.id);
                            setSearchOpen(false);
                            setGlobalSearch('');
                          }}
                        >
                          <span className="company-avatar">{contact?.company.slice(0, 1)}</span>
                          <span>
                            <b>{contact?.company}</b>
                            <small>
                              {contact?.name} · {deal.stage}
                            </small>
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <small>No deals found.</small>
                  )}
                </div>
              )}
            </div>
            <button className="icon-button top-notification" aria-label="Notifications">
              <Icon name="bell" />
            </button>
            <button
              className="button button-primary header-create"
              onClick={() => setShowDealForm(true)}
            >
              <Icon name="plus" size={16} />
              New deal
            </button>
          </div>
        </header>
        {loadError && (
          <div className="load-error" role="alert">
            <span>{loadError}</span>
            <button className="button button-secondary button-small" onClick={() => void reload()}>
              Retry
            </button>
          </div>
        )}
        <div onClick={() => searchOpen && setSearchOpen(false)} className="route-content">
          <Outlet context={context} />
        </div>
      </main>
      {showDealForm && (
        <DealForm
          contacts={contacts}
          onClose={() => setShowDealForm(false)}
          onCreated={reload}
          notify={notify}
        />
      )}
      <DealDetails
        key={selectedDealId}
        deal={deals.find((deal) => deal.id === selectedDealId)}
        contact={contacts.find(
          (contact) => contact.id === deals.find((deal) => deal.id === selectedDealId)?.contactId,
        )}
        activities={activities}
        onClose={() => setSelectedDealId('')}
        reload={reload}
        notify={notify}
      />
    </div>
  );
}

function AppRoutes() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' }>();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const reload = useCallback(async () => {
    try {
      const results = await Promise.all([
        crmApi.getDeals(),
        crmApi.getContacts(),
        crmApi.getActivities(),
      ]);
      setDeals(results[0]);
      setContacts(results[1]);
      setActivities(results[2]);
      setLoadError('');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load CRM data.');
      throw error;
    }
  }, []);
  const notify = useCallback(
    (message: string, kind: 'success' | 'error' = 'success') => setToast({ message, kind }),
    [],
  );

  useEffect(() => {
    let active = true;
    crmApi
      .restoreSession()
      .then((restored) => {
        if (active) setSession(restored);
      })
      .catch((error: unknown) => {
        if (active)
          setLoadError(error instanceof Error ? error.message : 'Unable to restore your session.');
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    void Promise.all([crmApi.getDeals(), crmApi.getContacts(), crmApi.getActivities()])
      .then((results) => {
        if (!active) return;
        setDeals(results[0]);
        setContacts(results[1]);
        setActivities(results[2]);
        setLoadError('');
      })
      .catch((error: unknown) => {
        if (active)
          setLoadError(error instanceof Error ? error.message : 'Unable to load CRM data.');
      });
    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(undefined), 3800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (checkingSession)
    return (
      <div className="boot-screen">
        <span className="brand-symbol">p</span>
        <p>Opening your workspace...</p>
      </div>
    );
  if (!session)
    return (
      <>
        {authMode === 'signup' ? (
          <SignUp
            onBackToSignIn={() => setAuthMode('signin')}
            notice={loadError}
          />
        ) : (
          <SignIn
            onSignIn={setSession}
            onCreateAccount={() => setAuthMode('signup')}
            onError={(message) => setToast({ message, kind: 'error' })}
            notice={loadError}
          />
        )}
        {toast && (
          <div className={`toast ${toast.kind}`} role="status">
            {toast.message}
          </div>
        )}
      </>
    );
  return (
    <>
      <Routes>
        <Route
          element={
            <ApplicationShell
              session={session}
              onLogout={() => {
                crmApi.logout();
                setSession(null);
              }}
              deals={deals}
              contacts={contacts}
              activities={activities}
              reload={reload}
              loadError={loadError}
              notify={notify}
            />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/deals" element={<LeadsList />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      {toast && (
        <div className={`toast ${toast.kind}`} role="status">
          {toast.message}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
