import React from 'react';
import { ChevronLeft, Github, Info, ShieldCheck, Zap } from 'lucide-react';

export default function About({ onBack }) {
  return (
    <div style={aboutContainer} className="about-page">
      <header style={aboutHeader} className="about-header">
        <button onClick={onBack} style={backBtn} className="back-btn">
          <ChevronLeft size={20} /> Back
        </button>
        <h1 style={title} className="about-title">About War Room</h1>
      </header>

      <main style={contentArea}>
        <section style={glassSection} className="glass-card">
          <div style={iconBox} className="icon-float">
            <Zap color="#0e5977ff" size={32} />
          </div>
          <h3>High-Speed Collaboration</h3>
          <p>
            War Room is a real-time command center designed for hackathons and rapid development sprints.
            It synchronizes tasks, architecture diagrams, and team communications instantly across all members.
          </p>
        </section>

        <div style={grid}>
          <div style={smallCard} className="hover-card">
            <ShieldCheck color="#16317cff" size={24} />
            <h4>Secure</h4>
            <p>Powered by Supabase Row Level Security.</p>
          </div>

          <div style={smallCard} className="hover-card">
            <Info color="#8fc2daff" size={24} />
            <h4>Version</h4>
            <p>v1.0.0 "First Blood"</p>
          </div>
        </div>

        <footer style={footer} className="fade-in">
          <p>Built for developers by developers.</p>
          <div style={divider} />
          <button
            style={gitBtn}
            className="git-btn"
            onClick={() => window.open('https://github.com/shishir-sh26/H-TeamState', '_blank')}
          >
            <Github size={18} /> View Source
          </button>
        </footer>
      </main>
    </div>
  );
}

/* --- STYLES (UNCHANGED) --- */
const aboutContainer = { minHeight: '100vh', background: '#020202', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui' };
const aboutHeader = { maxWidth: '800px', margin: '0 auto 40px', display: 'flex', alignItems: 'center', gap: '20px' };
const backBtn = { background: '#111', border: '1px solid #222', color: '#888', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const title = { fontSize: '1.8rem', fontWeight: '800', margin: 0 };
const contentArea = { maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' };
const glassSection = { background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '40px', borderRadius: '24px', textAlign: 'center' };
const iconBox = { marginBottom: '20px', display: 'flex', justifyContent: 'center' };
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const smallCard = { background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '20px', borderRadius: '16px' };
const footer = { marginTop: '40px', textAlign: 'center', color: '#444' };
const divider = { height: '1px', background: '#111', margin: '20px auto', width: '50%' };
const gitBtn = { background: 'none', border: '1px solid #222', color: '#eee', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' };
