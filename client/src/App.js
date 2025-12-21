import React, { useState, useEffect } from 'react';
import ProjectSetup from './pages/ProjectSetup';
import Dashboard from './pages/Dashboard';
import Navbar from './compoonents/Navbar'; // Import the upgraded Navbar
import './App.css';

function App() {
  const [projectId, setProjectId] = useState(() => {
    const saved = localStorage.getItem('activeProjectId');
    return saved ? saved.replace('ID: ', '').trim() : null;
  });
  
  const [view, setView] = useState(projectId ? 'dashboard' : 'landing');
  const [tempId, setTempId] = useState('');
  const [teamName, setTeamName] = useState(''); // To pass to Navbar

  useEffect(() => {
    if (projectId) {
      localStorage.setItem('activeProjectId', projectId);
      setView('dashboard');
    } else {
      localStorage.removeItem('activeProjectId');
      setView('landing');
    }
  }, [projectId]);

  const handleBack = () => {
    setProjectId(null);
    setTeamName('');
    setView('landing');
  };

  return (
    <div className="App" style={appStyle}>
      {/* UX FIX: Only show the Navbar when inside the Dashboard or Setup.
         Landing page usually looks better without a fixed nav.
      */}
      {projectId && (
        <Navbar 
          onBack={handleBack} 
          teamName={teamName || "Loading..."} 
        />
      )}

      <main style={mainWrapper}>
        {view === 'landing' && (
          <div style={landingCard}>
            <div style={logoLarge}>⚡</div>
            <h1 style={{ marginBottom: '10px', fontSize: '2rem' }}>War Room</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>AI-Powered Hackathon Management</p>
            
            <button onClick={() => setView('setup')} style={mainBtn}>Create New Team</button>
            <div style={dividerText}>— OR —</div>
            
            <input 
              placeholder="Enter Team ID..." 
              value={tempId} 
              onChange={(e) => setTempId(e.target.value)}
              style={inputStyle}
            />
            <button onClick={() => {
              const cleanId = tempId.replace(/ID:\s*/g, '').trim();
              if (cleanId.length > 20) setProjectId(cleanId);
              else alert("Invalid ID");
            }} style={secBtn}>Join Team</button>
          </div>
        )}

        {view === 'setup' && (
          <div style={{width: '100%', maxWidth: '600px'}}>
             <ProjectSetup onProjectCreated={(id) => setProjectId(id)} />
             <button onClick={() => setView('landing')} style={textBtn}>← Cancel</button>
          </div>
        )}
        
        {view === 'dashboard' && (
          <Dashboard 
            projectId={projectId} 
            onBack={handleBack} 
            setGlobalTeamName={setTeamName} // Pass a setter to get name back from Supabase
          />
        )}
      </main>
    </div>
  );
}

// --- STYLES ---
const appStyle = { 
  background: '#050505', 
  minHeight: '100vh', 
  color: 'white', 
  display: 'flex', 
  flexDirection: 'column' 
};

const mainWrapper = { 
  flex: 1, 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', // Centers the landing card perfectly
  width: '100%'
};

const landingCard = { 
  textAlign: 'center', 
  maxWidth: '400px', 
  background: '#0a0a0a', 
  padding: '50px 40px', 
  borderRadius: '24px', 
  border: '1px solid #1a1a1a', 
  width: '90%',
  boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
};

const logoLarge = { fontSize: '3rem', marginBottom: '20px', filter: 'drop-shadow(0 0 15px #3ecf8e)' };
const dividerText = { margin: '25px 0', color: '#333', fontSize: '0.8rem', fontWeight: 'bold' };
const mainBtn = { width: '100%', padding: '16px', background: '#3ecf8e', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };
const secBtn = { width: '100%', padding: '16px', background: 'transparent', color: '#3ecf8e', border: '1px solid #1a1a1a', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const inputStyle = { padding: '16px', width: '100%', marginBottom: '15px', background: '#000', border: '1px solid #1a1a1a', color: 'white', borderRadius: '12px', boxSizing: 'border-box', textAlign: 'center' };
const textBtn = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginTop: '20px', width: '100%' };
export default App;