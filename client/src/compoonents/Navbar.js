import React, { useState } from 'react';
import { ChevronLeft, Bot, Settings, Activity, LogOut, Info, AlertTriangle, Edit3, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Navbar({ onBack, teamName, projectId }) {
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(teamName);

  // --- ACTIONS ---
  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase
      .from('projects')
      .update({ team_name: newName })
      .eq('id', projectId);
    
    if (!error) {
      setIsEditing(false);
      setShowSettings(false);
    }
  };

  const reportIssue = () => {
    const issue = window.prompt("Describe the error/issue:");
    if (issue) alert("Issue reported to team lead! (Logged to console for now)");
    console.log(`Issue for Project ${projectId}: ${issue}`);
  };

  return (
    <>
      <nav style={navStyle}>
        {/* LEFT: Navigation & Team Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onBack} style={backBtn} title="Back to Projects">
            <ChevronLeft size={18} />
          </button>
          
          <div style={divider} />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={breadcrumbLabel}>Current Workspace</span>
            <h2 style={teamTitleStyle}>{teamName || "Untitled Project"}</h2>
          </div>
        </div>

        {/* CENTER: Status Badge */}
        <div style={statusBadge}>
          <Activity size={12} style={{ color: '#3ecf8e' }} />
          <span>Live Syncing</span>
        </div>

        {/* RIGHT: Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button style={actionBtn} title="AI Assistant">
            <Bot size={18} />
            <span style={btnText}>AI Helper</span>
          </button>

          {/* SHARE REMOVED AS PER REQUEST */}

          <button 
            style={{...actionBtn, background: showSettings ? '#3ecf8e' : '#1a1a1a', color: showSettings ? '#000' : '#eee'}} 
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </nav>

      {/* SETTINGS MODAL / OVERLAY */}
      {showSettings && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3>Workspace Settings</h3>
              <button onClick={() => setShowSettings(false)} style={closeBtn}><X size={18}/></button>
            </div>

            <div style={modalBody}>
              {/* Option 1: Change Team Name */}
              <div style={settingItem}>
                <div style={settingInfo}>
                  <Edit3 size={16} color="#888" />
                  <span>Team Name</span>
                </div>
                {isEditing ? (
                  <div style={{display:'flex', gap:'5px'}}>
                    <input 
                      style={smallInput} 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <button onClick={handleUpdateName} style={saveBtn}>Save</button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} style={editBtn}>Change</button>
                )}
              </div>

              {/* Option 2: Issue Error */}
              <button onClick={reportIssue} style={settingItemBtn}>
                <div style={settingInfo}>
                  <AlertTriangle size={16} color="#ffab00" />
                  <span>Report Error / Issue</span>
                </div>
              </button>

              {/* Option 3: About */}
              <button onClick={() => alert("Hackathon Partner AI v1.0\nBuilt for high-speed collaboration.")} style={settingItemBtn}>
                <div style={settingInfo}>
                  <Info size={16} color="#3ecf8e" />
                  <span>About Workspace</span>
                </div>
              </button>

              <div style={modalDivider} />

              {/* Option 4: Logout */}
              <button onClick={onBack} style={{...settingItemBtn, color: '#ff4b2b'}}>
                <div style={settingInfo}>
                  <LogOut size={16} />
                  <span>Logout / Exit Project</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- NEW & UPDATED STYLES ---
const navStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(12px)', color: 'white', alignItems: 'center', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, zIndex: 100, width: '100%', boxSizing: 'border-box' };
const backBtn = { background: '#111', border: '1px solid #222', color: '#888', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer' };
const divider = { width: '1px', height: '24px', background: '#222' };
const breadcrumbLabel = { fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' };
const teamTitleStyle = { margin: 0, fontSize: '1rem', fontWeight: '600' };
const statusBadge = { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(62, 207, 142, 0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(62, 207, 142, 0.1)', fontSize: '0.75rem', color: '#3ecf8e' };
const actionBtn = { background: 'transparent', border: '1px solid #222', color: '#eee', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' };
const btnText = { fontSize: '0.75rem', fontWeight: '500' };

// --- MODAL STYLES ---
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#111', border: '1px solid #222', borderRadius: '16px', width: '350px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' };
const modalHeader = { padding: '16px 20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { background: 'none', border: 'none', color: '#555', cursor: 'pointer' };
const modalBody = { padding: '10px' };
const modalDivider = { height: '1px', background: '#222', margin: '10px 0' };
const settingItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 10px', borderRadius: '8px' };
const settingItemBtn = { width: '100%', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 10px', borderRadius: '8px', cursor: 'pointer', color: '#eee', textAlign: 'left', transition: '0.2s' };
const settingInfo = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' };
const editBtn = { background: '#222', border: '1px solid #333', color: '#888', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' };
const saveBtn = { background: '#3ecf8e', border: 'none', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' };
const smallInput = { background: '#000', border: '1px solid #333', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', width: '120px' };