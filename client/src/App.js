import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Analytics } from '@vercel/analytics/react';
import ProjectSetup from './pages/ProjectSetup';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Navbar from './compoonents/Navbar'; 
import { MessageSquare, X, Copy, CheckCircle2, Send } from 'lucide-react';
import './App.css';

function App() {
  const [projectId, setProjectId] = useState(() => {
    const saved = localStorage.getItem('activeProjectId');
    return saved ? saved.replace('ID: ', '').trim() : null;
  });
  
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [view, setView] = useState(projectId ? 'dashboard' : 'landing');
  const [tempId, setTempId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      localStorage.setItem('activeProjectId', projectId);
      if (view !== 'about' && view !== 'setup') setView('dashboard');
    } else {
      localStorage.removeItem('activeProjectId');
      if (view !== 'setup') setView('landing');
    }
  }, [projectId, view]);

  useEffect(() => {
    if (userName) localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    if (!projectId) return;

    const fetchInitialMessages = async () => {
      const { data } = await supabase
        .from('projects')
        .select('messages')
        .eq('id', projectId)
        .single();
      if (data) setMessages(data.messages || []);
    };

    fetchInitialMessages();

    const channel = supabase
      .channel(`chat-${projectId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        (payload) => payload.new.messages && setMessages(payload.new.messages)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [projectId]);

  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const msgObj = {
      text: newMessage,
      sender: userName || "Anonymous",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now()
    };

    const updatedMessages = [...messages, msgObj];
    await supabase.from('projects').update({ messages: updatedMessages }).eq('id', projectId);
    setNewMessage("");
  };

  const handleBack = () => {
    setProjectId(null);
    setTeamName('');
    setView('landing');
    setIsChatOpen(false);
  };

  return (
    <div className="App" style={appStyle}>
      {projectId && view !== 'landing' && view !== 'setup' && (
        <Navbar 
          onBack={handleBack} 
          teamName={teamName || "Loading..."} 
          projectId={projectId}
          onOpenAbout={() => setView('about')}
        />
      )}

      <main style={mainWrapper}>
        {view === 'landing' && (
          <div style={landingCard} className="landing-card">
            <img
              src="/WarRoom.png"
              alt="War Room Logo"
              style={logoLarge}
              className="logo-float"
            />
            <h1 style={{ marginBottom: '10px', fontSize: '2rem' }}>War Room</h1>

            <div style={{ marginBottom: '20px' }}>
              <p style={inputLabel}>Who are you?</p>
              <input
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              onClick={() => userName.trim() ? setView('setup') : alert("Enter name!")}
              style={mainBtn}
            >
              Create New Team
            </button>

            <div style={dividerText}>— OR —</div>

            <input
              placeholder="Enter Team ID..."
              value={tempId}
              onChange={(e) => setTempId(e.target.value)}
              style={inputStyle}
            />

            <button
              onClick={() => {
                if (!userName.trim()) return alert("Enter name!");
                const cleanId = tempId.replace(/ID:\s*/g, '').trim();
                if (cleanId.length > 20) setProjectId(cleanId);
                else alert("Invalid ID");
              }}
              style={secBtn}
            >
              Join Team
            </button>
          </div>
        )}

        {view === 'setup' && (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <ProjectSetup onProjectCreated={(id) => setProjectId(id)} />
            <button onClick={() => setView('landing')} style={textBtn}>← Cancel</button>
          </div>
        )}

        {view === 'dashboard' && (
          <Dashboard
            projectId={projectId}
            onBack={handleBack}
            userName={userName}
            setGlobalTeamName={setTeamName}
          />
        )}

        {view === 'about' && <About onBack={() => setView('dashboard')} />}
      </main>

      {view === 'dashboard' && isChatOpen && (
        <aside style={chatBox} className="chat-drawer">
          <div style={chatHeader}>
            <span>Team Sync</span>
            <X size={18} onClick={() => setIsChatOpen(false)} style={{ cursor: 'pointer' }} />
          </div>

          <div style={chatMessages}>
            {messages.length > 0 ? messages.map((m, i) => (
              <div
                key={m.id || i}
                className="chat-message"
                style={{
                  ...msg,
                  alignSelf: m.sender === userName ? 'flex-end' : 'flex-start',
                  background: m.sender === userName ? '#1e1e1e' : '#0a0a0a',
                  border: m.sender === userName ? '1px solid #333' : '1px solid #1a1a1a'
                }}
              >
                <div style={msgMeta}>{m.sender} • {m.time}</div>
                {m.text}
              </div>
            )) : <div style={emptyChat}>No messages yet.</div>}
            <div ref={chatEndRef} />
          </div>

          <div style={chatInputArea}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                style={darkInput}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type..."
              />
              <button onClick={handleSendMessage} style={sendBtn}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {view === 'dashboard' && (
        <>
          <div style={floatingInfoPanel}>
            <div
              style={infoItem}
              className="info-chip"
              onClick={() => {
                navigator.clipboard.writeText(projectId);
                alert("ID Copied!");
              }}
            >
              <Copy size={12} />
              <code>{projectId.slice(0, 8)}...</code>
            </div>

            <div style={infoItem} className="info-chip">
              <CheckCircle2 size={12} color="#5e92dfff" />
              <span>{userName}</span>
            </div>
          </div>

          <button
            style={floatingChatToggle}
            className="floating-chat"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </button>
        </>
      )}
      <Analytics />
    </div>
  );
}

/* STYLES — unchanged */
const appStyle = { background: '#050505', minHeight: '100vh', color: '#5984d3ff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' };
const mainWrapper = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', overflow: 'hidden' };
const floatingChatToggle = { position: 'fixed', bottom: '25px', right: '25px', width: '60px', height: '60px', borderRadius: '50%', background: '#788dcfff', color: '#000', border: 'none', boxShadow: '0 8px 24px rgba(62, 207, 142, 0.3)', cursor: 'pointer', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const floatingInfoPanel = { position: 'fixed', bottom: '25px', left: '25px', display: 'flex', gap: '10px', zIndex: 999 };
const infoItem = { background: '#0a0a0a', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8', cursor: 'pointer' };
const landingCard = { textAlign: 'center', maxWidth: '400px', background: '#0a0a0a', padding: '50px 40px', borderRadius: '24px', border: '1px solid #1a1a1a', width: '90%' };
const logoLarge = { width: '80px', height: '80px', objectFit: 'contain', display: 'block', margin: '0 auto 30px auto' };
const inputLabel = { fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'left', fontWeight: 'bold' };
const inputStyle = { padding: '16px', width: '100%', marginBottom: '15px', background: '#000', border: '1px solid #1a1a1a', color: 'white', borderRadius: '12px', boxSizing: 'border-box' };
const mainBtn = { width: '100%', padding: '16px', background: '#757ce7ff', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const dividerText = { margin: '25px 0', color: '#333', fontSize: '0.8rem' };
const secBtn = { width: '100%', padding: '16px', background: 'transparent', color: '#8381daff', border: '1px solid #1a1a1a', borderRadius: '12px', cursor: 'pointer' };
const textBtn = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginTop: '20px', width: '100%' };
const chatBox = { position: 'fixed', right: '20px', bottom: '100px', width: '320px', height: '500px', background: '#0a0a0a', border: '1px solid #1e293b', borderRadius: '16px', display: 'flex', flexDirection: 'column', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const chatHeader = { padding: '15px 20px', display:'flex', justifyContent:'space-between', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800' };
const chatMessages = { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' };
const msg = { padding: '10px 14px', borderRadius: '12px', fontSize: '0.8rem', maxWidth: '85%' };
const msgMeta = { fontSize: '0.6rem', color: '#64748b', marginBottom: '2px' };
const chatInputArea = { padding: '15px', borderTop: '1px solid #1e293b' };
const darkInput = { background: '#020617', border: '1px solid #1e293b', color: '#f8fafc', padding: '10px', borderRadius: '8px', flex: 1, outline: 'none' };
const sendBtn = { background: '#3863beff', color: '#020617', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' };
const emptyChat = { color: '#334155', textAlign: 'center', marginTop: '20px', fontSize: '0.75rem' };

export default App;
