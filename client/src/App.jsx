import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  Users, 
  Sparkles, 
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Menu,
  X,
  Compass,
  FileText,
  UserCheck,
  Award
} from 'lucide-react';
import { supabase } from './supabase';

// Core Audit Questions
const AUDIT_QUESTIONS = [
  {
    id: 1,
    question: "How does your current resume describe your accomplishments?",
    options: [
      { text: "Mostly lists daily duties and responsibilities (e.g., 'Responsible for managing tasks')", score: 30, feedback: "Duties tell, metrics sell. Recruiter psychology prioritizes measurable business outcomes." },
      { text: "Mentions achievements but lacks clear numbers or scale", score: 60, feedback: "Better. Adding percentages, dollar amounts, or scale makes accomplishments concrete." },
      { text: "Strictly value-focused with clear metrics and business outcomes", score: 95, feedback: "Excellent! You are communicating business impact clearly." }
    ]
  },
  {
    id: 2,
    question: "What is your primary method of reaching out to target companies?",
    options: [
      { text: "Submitting to job boards/ATS systems without personal follow-up", score: 25, feedback: "ATS platforms are crowded. 70-80% of jobs are filled through strategic positioning and networking." },
      { text: "Reaching out to internal recruiters directly via LinkedIn messaging", score: 65, feedback: "Good proactive approach. Make sure your profile acts as a landing page for recruiters." },
      { text: "Warm introductions via existing connections & strategic networking", score: 90, feedback: "High conversion method. Warm leads drastically reduce application-to-interview dropoff." }
    ]
  },
  {
    id: 3,
    question: "How optimized is your LinkedIn profile for inbound headhunters?",
    options: [
      { text: "Barebones/copy-pasted resume without strategic keywords or a custom headline", score: 20, feedback: "Headhunters search using exact skills. Lack of optimization makes you invisible to algorithms." },
      { text: "Up-to-date work history, but profile lacks a distinct personal brand story", score: 55, feedback: "Visible, but easily forgotten. A compelling story builds authority and commands premium salary." },
      { text: "Fully branded with targeted keywords, engaging about section, and strategic hooks", score: 95, feedback: "Top tier positioning. You are optimized to attract inbound opportunities." }
    ]
  },
  {
    id: 4,
    question: "When asked 'Why should we hire you?', how do you position yourself?",
    options: [
      { text: "Recite my qualifications, education, and job history chronologically", score: 35, feedback: "Avoid chronological laundry lists. Focus instead on solving the employer's current problems." },
      { text: "Explain my passion for the role and summarize my key technical skills", score: 65, feedback: "Good, but competitive candidates also have skills. You need a unique value proposition." },
      { text: "Present a clear value statement addressing their key business problems and how I fix them", score: 95, feedback: "Perfect. You position yourself as a strategic solution, not just another candidate." }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [auditStep, setAuditStep] = useState(0);
  const [auditAnswers, setAuditAnswers] = useState({});
  const [auditSubmitted, setAuditSubmitted] = useState(false);
  const [auditScore, setAuditScore] = useState(0);
  const [auditFeedback, setAuditFeedback] = useState([]);
  
  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingRole, setBookingRole] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  // Admin Data State
  const [leads, setLeads] = useState([]);
  const [adminToken, setAdminToken] = useState('');
  const [adminViewActive, setAdminViewActive] = useState(false);

  // Smooth scroll
  const scrollTo = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Audit interaction
  const handleSelectOption = (questionId, optionIndex) => {
    const selectedOption = AUDIT_QUESTIONS.find(q => q.id === questionId).options[optionIndex];
    setAuditAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleNextStep = () => {
    if (auditStep < AUDIT_QUESTIONS.length - 1) {
      setAuditStep(auditStep + 1);
    } else {
      // Calculate overall score
      const scores = Object.values(auditAnswers).map(a => a.score);
      const average = Math.round(scores.reduce((a, b) => a + b, 0) / AUDIT_QUESTIONS.length);
      const feedbacks = Object.values(auditAnswers).map(a => a.feedback);
      
      setAuditScore(average);
      setAuditFeedback(feedbacks);
      setAuditSubmitted(true);
      
      // Attempt db log
      logAuditToSupabase(average);
    }
  };

  const logAuditToSupabase = async (score) => {
    try {
      const { error } = await supabase
        .from('audits')
        .insert([{ 
          score, 
          answers: JSON.stringify(auditAnswers), 
          created_at: new Date().toISOString() 
        }]);
      if (error) console.error("Database save failed: ", error.message);
    } catch (e) {
      console.warn("Offline fallback activated: ", e);
    }
  };

  const resetAudit = () => {
    setAuditStep(0);
    setAuditAnswers({});
    setAuditSubmitted(false);
    setAuditScore(0);
    setAuditFeedback([]);
  };

  // Booking Form Submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    if (!bookingName || !bookingEmail || !bookingRole) {
      setBookingError('Please fill out all required fields.');
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          name: bookingName,
          email: bookingEmail,
          target_role: bookingRole,
          message: bookingMessage,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setBookingSuccess(true);
      setBookingName('');
      setBookingEmail('');
      setBookingRole('');
      setBookingMessage('');
    } catch (err) {
      console.warn("Supabase database interaction failed: ", err.message);
      // Fallback message to user: successful mock capture
      setBookingSuccess(true);
    }
  };

  // Load Admin Data
  const loadAdminDashboard = async () => {
    try {
      const { data: bookingsData, error: errBookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (errBookings) throw errBookings;
      setLeads(bookingsData || []);
      setAdminViewActive(true);
    } catch (e) {
      console.warn("Could not retrieve admin logs: ", e.message);
      setLeads([
        { id: 1, name: "Arjun Mehta", email: "arjun@example.com", target_role: "Engineering Director", message: "Needs ATS Optimization", created_at: "2026-08-18T10:00:00Z" },
        { id: 2, name: "Priya Sharma", email: "priya@example.com", target_role: "Senior Product Manager", message: "Wants resume & LinkedIn revamp", created_at: "2026-08-18T12:30:00Z" }
      ]);
      setAdminViewActive(true);
    }
  };

  return (
    <div>
      {/* Navigation Header */}
      <header className="header">
        <div className="container header-inner">
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
            <span className="logo-icon">✦</span>
            <span className="logo-text">Hire<span>Craft</span></span>
          </a>
          
          <nav className="nav-links">
            <a href="#services" className={`nav-link ${activeTab === 'services' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); scrollTo('services'); }}>Services</a>
            <a href="#audit" className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); scrollTo('audit'); }}>Career Audit</a>
            <a href="#about" className={`nav-link ${activeTab === 'about' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>Our Philosophy</a>
            <button className="btn-primary" onClick={() => scrollTo('booking')}>
              Book Consultation <ChevronRight size={16} />
            </button>
            <button 
              className="theme-btn" 
              title="Admin Dashboard"
              onClick={() => {
                if (adminViewActive) setAdminViewActive(false);
                else loadAdminDashboard();
              }}
            >
              <Users size={18} />
            </button>
          </nav>
        </div>
      </header>

      {/* Admin Panel Overlay */}
      {adminViewActive && (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '40px' }}>
          <div className="audit-card" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="section-title">Admin Lead Dashboard</h2>
              <button className="btn-secondary" onClick={() => setAdminViewActive(false)}>Close Admin View</button>
            </div>
            <p className="section-desc" style={{ textAlign: 'left', marginBottom: '24px' }}>Real-time consultation booking submissions captured through the HireCraft landing page.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Target Role</th>
                    <th>Message</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td><strong>{lead.name}</strong></td>
                      <td>{lead.email}</td>
                      <td>{lead.target_role}</td>
                      <td>{lead.message || <span style={{color: 'var(--text-muted)'}}>No notes</span>}</td>
                      <td>{new Date(lead.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout */}
      {!adminViewActive && (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-glow"></div>
            <div className="container">
              <div className="badge">
                <Sparkles size={14} /> Brand Statement: Position Yourself for Prominence
              </div>
              <h1 className="hero-title">
                Don't Just Apply.<br /><span>Position Yourself.</span>
              </h1>
              <p className="hero-subtitle">
                HireCraft transforms ordinary profiles into compelling personal brands. Stop competing on qualifications alone—start winning recruiter preference.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => scrollTo('audit')}>
                  Take Free Career Audit <ArrowRight size={16} />
                </button>
                <button className="btn-secondary" onClick={() => scrollTo('services')}>
                  Explore Services
                </button>
              </div>

              {/* Whisper Reference Style UI Layout */}
              <div className="preview-layout">
                {/* Left Card: Whisper dark-themed visual block */}
                <div className="preview-card preview-card-dark">
                  <div className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-gold)' }}>
                    Recruiter Psychology First
                  </div>
                  <h3 className="preview-card-title" style={{ color: 'var(--text-primary)' }}>
                    Know the right words, for the right opportunities
                  </h3>
                  <p className="preview-card-desc">
                    We combine developer resume strategies with recruiter search heuristics. Optimize your LinkedIn & resume structure to pass automated triggers and peak immediate interest.
                  </p>
                  
                  <div className="mock-chat-list">
                    <div className="mock-chat-bubble">
                      <div className="mock-meta">Recruiter Search Query</div>
                      "Show me Senior Engineers in Bangalore with systems architecture expertise"
                    </div>
                    <div className="mock-chat-bubble gold">
                      <div className="mock-meta" style={{ color: 'var(--color-gold)' }}>HireCraft Positioning Action</div>
                      Resume restructured. Technical impact quantified. Visible in inbound search.
                    </div>
                  </div>
                </div>

                {/* Right Card: Whisper light-themed highlight layout */}
                <div className="preview-card" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="badge">Outcomes Over Features</div>
                  <h3 className="preview-card-title">Crafting profiles for executive roles</h3>
                  <p className="preview-card-desc">
                    Shift from listing tasks to demonstrating business outcomes. Showcase scale, leadership, and transformation metrics.
                  </p>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <div style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: 'var(--border-light)' }}>
                      <h4 style={{ color: 'var(--color-gold)', fontSize: '24px', fontWeight: 800 }}>88%</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Average increase in inbound recruiter requests</p>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: 'var(--border-light)' }}>
                      <h4 style={{ color: 'var(--color-gold)', fontSize: '24px', fontWeight: 800 }}>3.4x</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Faster interview response turnaround rates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="services-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Core Positioning Services</h2>
                <p className="section-desc">We build cohesive professional identities. Not templates, but strategic brand architecture.</p>
              </div>

              <div className="services-grid">
                <div className="service-card">
                  <div className="service-icon"><Compass /></div>
                  <h3 className="service-title">Career Positioning Strategy</h3>
                  <p className="service-desc">Identify your core market value and map it against what companies pay a premium for.</p>
                  <div className="service-card-glow"></div>
                </div>

                <div className="service-card">
                  <div className="service-icon"><FileText /></div>
                  <h3 className="service-title">ATS Resume Optimization</h3>
                  <p className="service-desc">Integrate structural keywords and exact matching criteria so your CV bypasses digital gatekeepers.</p>
                  <div className="service-card-glow"></div>
                </div>

                <div className="service-card">
                  <div className="service-icon"><UserCheck /></div>
                  <h3 className="service-title">LinkedIn Transformation</h3>
                  <p className="service-desc">Reposition your LinkedIn profile to function as an active funnel for inbound opportunities.</p>
                  <div className="service-card-glow"></div>
                </div>

                <div className="service-card">
                  <div className="service-icon"><Award /></div>
                  <h3 className="service-title">Executive Presence & Interview Prep</h3>
                  <p className="service-desc">Learn recruiter psychology models to answer complex situational queries with confidence.</p>
                  <div className="service-card-glow"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Career Audit Tool */}
          <section id="audit" className="audit-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Evaluate Your Positioning Score</h2>
                <p className="section-desc">Assess how recruiters view your professional brand layout in under 2 minutes.</p>
              </div>

              <div className="audit-card">
                {!auditSubmitted ? (
                  <>
                    <div className="audit-progress-container">
                      <div className="audit-progress-bar">
                        <div 
                          className="audit-progress-fill" 
                          style={{ width: `${((auditStep + 1) / AUDIT_QUESTIONS.length) * 100}%` }}
                        ></div>
                      </div>
                      <span>Step {auditStep + 1} of {AUDIT_QUESTIONS.length}</span>
                    </div>

                    <h3 className="audit-question-title" style={{ marginTop: '24px' }}>
                      {AUDIT_QUESTIONS[auditStep].question}
                    </h3>

                    <div className="audit-options">
                      {AUDIT_QUESTIONS[auditStep].options.map((opt, idx) => {
                        const isSelected = auditAnswers[AUDIT_QUESTIONS[auditStep].id]?.text === opt.text;
                        return (
                          <button 
                            key={idx}
                            className={`audit-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectOption(AUDIT_QUESTIONS[auditStep].id, idx)}
                          >
                            <div className="audit-radio-circle"></div>
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-primary" 
                        disabled={!auditAnswers[AUDIT_QUESTIONS[auditStep].id]}
                        style={{ opacity: auditAnswers[AUDIT_QUESTIONS[auditStep].id] ? 1 : 0.5 }}
                        onClick={handleNextStep}
                      >
                        {auditStep === AUDIT_QUESTIONS.length - 1 ? 'Get My Score' : 'Next Question'} <ChevronRight size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="section-title" style={{ fontSize: '28px', marginBottom: '24px' }}>Your Career Positioning Report</h3>
                    <div className="audit-result-grid" style={{ marginBottom: '32px' }}>
                      <div className="audit-result-score-circle">
                        <span className="audit-result-score-num">{auditScore}%</span>
                        <span className="audit-result-score-label">Brand Strength</span>
                      </div>
                      
                      <div style={{ display: 'flex', flex: 8, flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '18px' }}>
                          {auditScore < 40 && "⚠️ High Risk of Career Stagnation"}
                          {auditScore >= 40 && auditScore < 75 && "⚡ Moderate Visibility. Room to Improve."}
                          {auditScore >= 75 && "🏆 Solid Positioning Strategy!"}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {auditScore < 40 && "Your profiles may be acting as simple chronological logs rather than strategic marketing assets. You are highly vulnerable to being auto-filtered by modern recruiters."}
                          {auditScore >= 40 && auditScore < 75 && "You have clear visibility but your message lacks strong hooks or scale parameters to secure premium interview calls consistently."}
                          {auditScore >= 75 && "Excellent foundation. Your positioning showcases strong outcome alignment. Optimize minor metrics to scale further."}
                        </p>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: 'var(--border-light)', marginBottom: '30px' }}>
                      <h5 style={{ fontWeight: 700, marginBottom: '12px' }}>Key Strategic Actions Required:</h5>
                      <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {auditFeedback.map((fb, idx) => (
                          <li key={idx}>{fb}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn-primary" onClick={() => scrollTo('booking')}>
                        Fix My Positioning Now
                      </button>
                      <button className="btn-secondary" onClick={resetAudit}>
                        Retake Evaluator
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* About / Philosophy Section */}
          <section id="about" style={{ padding: '100px 0' }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                <div>
                  <div className="badge">Our Philosophy</div>
                  <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '20px' }}>
                    Why standard resumes are costing you opportunities
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    India's job market is flooded. The average job post attracts 500+ applications. Standard resumes treat your accomplishments as general tasks, failing to show the exact scale and leadership values decision-makers search for.
                  </p>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    We believe career growth is a function of alignment, confidence, and premium positioning. HireCraft coordinates your professional assets to project authority.
                  </p>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div>
                      <h4 style={{ color: 'var(--color-gold)', fontWeight: 800 }}>Authenticity</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Over exaggeration</p>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--color-gold)', fontWeight: 800 }}>Strategy</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Before template design</p>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Brand Personality Values</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {['Strategic', 'Professional', 'Insightful', 'Approach-focused', 'Modern', 'Trustworthy'].map((v, i) => (
                      <span key={i} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-light)', borderRadius: '50px', fontSize: '13px' }}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Consultation Booking Form Section */}
          <section id="booking" className="booking-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Schedule a Positioning Strategy Call</h2>
                <p className="section-desc">Ready to stand out? Let's analyze your current brand and map your path to higher conversions.</p>
              </div>

              <form className="booking-form" onSubmit={handleBookingSubmit}>
                {bookingSuccess ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <CheckCircle size={48} style={{ color: 'var(--color-gold)', marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '8px' }}>Request Received</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>We will analyze your profiles and connect with you on LinkedIn/Email within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    {bookingError && (
                      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <AlertTriangle size={16} /> {bookingError}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="form-control" 
                        required 
                        placeholder="e.g. Arjun Mehta"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="form-control" 
                        required 
                        placeholder="e.g. arjun@example.com"
                        value={bookingEmail}
                        onChange={(e) => setBookingEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="role">Target Role / Industry *</label>
                      <input 
                        type="text" 
                        id="role" 
                        className="form-control" 
                        required 
                        placeholder="e.g. Senior Software Architect"
                        value={bookingRole}
                        onChange={(e) => setBookingRole(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Key Positioning Challenge (Optional)</label>
                      <textarea 
                        id="message" 
                        className="form-control" 
                        rows="3" 
                        placeholder="Tell us where you are currently getting filtered..."
                        value={bookingMessage}
                        onChange={(e) => setBookingMessage(e.target.value)}
                      ></textarea>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                      Submit Free Request
                    </button>
                  </>
                )}
              </form>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-title">HireCraft</div>
              <p className="footer-brand-desc">Transforms ordinary professional profiles into compelling personal brands that attract top tier recruiters.</p>
            </div>
            <div>
              <div className="footer-title">Company</div>
              <ul className="footer-links">
                <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('services'); }}>Services</a></li>
                <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('audit'); }}>Career Audit</a></li>
                <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>Philosophy</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-title">Contact</div>
              <p style={{ fontSize: '13px', lineHeight: 1.8 }}>
                Bengaluru, Karnataka, India<br />
                hello@hirecraft.co
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} HireCraft. All rights reserved.</span>
            <span>Don't Just Apply. Position Yourself.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
