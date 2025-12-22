import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import HackathonTimer from '../compoonents/HackathonTimer';
import ProjectFlow from '../compoonents/ProjectFlow'; 
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, Play, Pause, Clock, Edit2, RotateCcw, Send, MessageSquare, X } from 'lucide-react';
import { io } from "socket.io-client";

// PRODUCTION BACKEND URL
const SOCKET_URL = "https://h-teamstate.onrender.com";

export default function Dashboard({ projectId, onBack, userName, setGlobalTeamName }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskName, setNewTaskName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [message, setMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('board');
  const [duration, setDuration] = useState(24);
  const [isEditingName, setIsEditingName] = useState(false);
  
  const socketRef = useRef();
  const chatEndRef = useRef(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (!error && data) {
      setProject(data);
      if (setGlobalTeamName) setGlobalTeamName(data.team_name);
    }
    setLoading(false);
  }, [projectId, setGlobalTeamName]);

  useEffect(() => {
    fetchProject();
    
    // Connect to Production Socket
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    socketRef.current.emit("join-team", projectId);

    const channel = supabase.channel(`dashboard-sync-${projectId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, 
        (payload) => setProject(payload.new)
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
      socketRef.current.disconnect();
    };
  }, [projectId, fetchProject]);

  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project?.messages, isChatOpen]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const newMessage = {
      text: message,
      sender: userName || "Anonymous",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now()
    };
    const updatedMessages = [...(project.messages || []), newMessage];
    await supabase.from('projects').update({ messages: updatedMessages }).eq('id', projectId);
    setMessage(""); 
  };

  const startTimer = async () => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + parseInt(duration));
    await supabase.from('projects').update({ end_time: endTime.toISOString(), timer_status: 'running' }).eq('id', projectId);
  };

  const toggleTimer = async () => {
    const isPausing = project.timer_status === 'running';
    await supabase.from('projects').update({ timer_status: isPausing ? 'paused' : 'running' }).eq('id', projectId);
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;
    const updated = [...(project.tasks || []), { 
      task_name: newTaskName, 
      assigned_to: assignedTo || userName,
      status: "pending", 
      priority: priority 
    }];
    await supabase.from('projects').update({ tasks: updated }).eq('id', projectId);
    setNewTaskName(""); setAssignedTo("");
  };

  if (loading) return <div style={centerStyle}>Loading Workspace...</div>;
  if (!project) return <div style={centerStyle}>Project Not Found</div>;

  return (
    <div style={dashboardWrapper}>
      <div style={mainContainer}>
        <header style={headerStyle}>
          <div style={headerLeftSection}>
            <h1 style={titleStyle} onClick={() => setIsEditingName(!isEditingName)}>
              {project.team_name} <Edit2 size={14} />
            </h1>
            <nav style={topNav}>
              <button style={activeTab === 'board' ? activeTabBtn : tabBtn} onClick={() => setActiveTab('board')}>Board</button>
              <button style={activeTab === 'flow' ? activeTabBtn : tabBtn} onClick={() => setActiveTab('flow')}>Arch</button>
            </nav>
          </div>
        </header>

        <main style={scrollArea}>
          {activeTab === 'board' ? (
            <div style={boardLayout}>
              <div style={statsGrid}>
                <div style={glassCard}>
                  <p style={label}><Clock size={10}/> Timer</p>
                  <div style={timerContainer}>
                    <HackathonTimer endTime={project.end_time} timerStatus={project.timer_status} />
                    <div style={timerActions}>
                      {(!project.end_time || project.timer_status === 'stopped') ? (
                        <div style={timerInputGroup}>
                          <input type="number" style={smallInput} value={duration} onChange={e => setDuration(e.target.value)} />
                          <button onClick={startTimer} style={startBtn}><Play size={12}/></button>
                        </div>
                      ) : (
                        <div style={{display:'flex', gap:'8px'}}>
                          <button onClick={toggleTimer} style={btnIcon}>{project.timer_status === 'running' ? <Pause size={18} color="#ffab00"/> : <Play size={18} color="#3ecf8e"/>}</button>
                          <button onClick={() => { if(window.confirm("Reset?")) supabase.from('projects').update({ end_time: null, timer_status: 'stopped' }).eq('id', projectId); }} style={btnIcon}><RotateCcw size={18} color="#ff4b2b"/></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={glassCard}>
                  <p style={label}>Progress</p>
                  <div style={statText}>{project.tasks?.length > 0 ? Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100) : 0}%</div>
                  <div style={progressBarContainer}><div style={{...progressBar, width: `${project.tasks?.length > 0 ? (project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100 : 0}%`}}></div></div>
                </div>
              </div>

              <div style={{...glassCard, marginTop:'20px'}}>
                <div style={entryGrid}>
                  <input style={darkInput} placeholder="New task..." value={newTaskName} onChange={e => setNewTaskName(e.target.value)} />
                  <input style={darkInput} placeholder="Assignee" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} />
                  <select style={darkSelect} value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <button onClick={handleAddTask} style={addBtn}><Plus size={20}/></button>
                </div>
              </div>

              <div style={taskListContainer}>
                {project.tasks?.map((t, i) => (
                  <div key={i} style={{...taskRow, borderLeft: t.priority === 'High' ? '4px solid #ef4444' : '4px solid #3ecf8e'}}>
                    <div style={taskMainContent}>
                       <input type="checkbox" checked={t.status === 'completed'} onChange={async () => {
                           const updated = [...project.tasks];
                           updated[i].status = updated[i].status === 'completed' ? 'pending' : 'completed';
                           await supabase.from('projects').update({ tasks: updated }).eq('id', projectId);
                       }} style={checkboxStyle} />
                       <span style={taskDescription(t.status === 'completed')}>
                          {t.task_name} <small style={{color: '#64748b'}}>@{t.assigned_to}</small>
                       </span>
                    </div>
                    <button onClick={async () => {
                         const updated = project.tasks.filter((_, idx) => idx !== i);
                         await supabase.from('projects').update({ tasks: updated }).eq('id', projectId);
                    }} style={deleteBtn}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={flowContainer}>
               <ProjectFlow projectId={projectId} flowData={project.flowchart_data} />
            </div>
          )}
        </main>
      </div>

      {/* FLOATING CHAT UI RESTORED */}
      <button style={floatingChatToggle} onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isChatOpen && (
        <aside style={floatingChatPanel}>
          <div style={chatHeader}>Team Sync</div>
          <div style={chatMessages}>
            {project.messages?.map((m, i) => (
              <div key={i} style={{...msg, alignSelf: m.sender === userName ? 'flex-end' : 'flex-start', background: m.sender === userName ? '#3ecf8e22' : '#111'}}>
                <div style={msgMeta}>{m.sender}</div>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={chatInputArea}>
            <input style={chatInput} value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Message..." />
            <button onClick={sendMessage} style={sendBtn}><Send size={14}/></button>
          </div>
        </aside>
      )}
    </div>
  );
}

// --- STYLES ---
const dashboardWrapper = { display: 'flex', background: '#020202', height: '100vh', width: '100vw', color: '#f8fafc', overflow: 'hidden', position: 'relative' };
const mainContainer = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const headerStyle = { display: 'flex', padding: '15px 25px', background: '#0a0a0a', borderBottom: '1px solid #1e293b', alignItems: 'center' };
const headerLeftSection = { display: 'flex', alignItems: 'center', gap: '30px', width: '100%' };
const titleStyle = { margin: 0, fontSize: '1.1rem', color: '#430caaff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' };
const topNav = { display: 'flex', gap: '15px', marginLeft: 'auto' };
const tabBtn = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600' };
const activeTabBtn = { ...tabBtn, color: '#fff', borderBottom: '2px solid #30179eff' };
const scrollArea = { padding: '30px', flex: 1, overflowY: 'auto' };
const boardLayout = { maxWidth: '1000px', margin: '0 auto' };
const statsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const glassCard = { background: '#0a0a0a', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b' };
const label = { margin: '0 0 10px 0', fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' };
const statText = { fontSize: '2.8rem', fontWeight: '800', color: '#3b09b1ff' };
const progressBarContainer = { height: '8px', background: '#1e293b', borderRadius: '10px', marginTop: '15px' };
const progressBar = { height: '100%', background: '#060457ff', transition: 'width 0.4s' };
const timerContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const timerActions = { display: 'flex', alignItems: 'center' };
const timerInputGroup = { display: 'flex', background: '#111', padding: '5px', borderRadius: '8px' };
const smallInput = { width: '40px', background: 'transparent', border: 'none', color: '#3ecf8e', textAlign: 'center' };
const startBtn = { background: '#0d2a68ff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const btnIcon = { background: 'transparent', border: 'none', cursor: 'pointer' };
const entryGrid = { display: 'flex', gap: '10px' };
const darkInput = { background: '#111', border: '1px solid #1e293b', color: '#fff', padding: '12px', borderRadius: '10px', flex: 1 };
const darkSelect = { background: '#111', border: '1px solid #1e293b', color: '#fff', padding: '10px', borderRadius: '10px', cursor: 'pointer' };
const addBtn = { background: '#445281ff', border: 'none', borderRadius: '10px', padding: '0 20px', cursor: 'pointer' };
const taskListContainer = { marginTop: '25px' };
const taskRow = { display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0a0a0a', border: '1px solid #1e293b', borderRadius: '14px', marginBottom: '12px' };
const taskMainContent = { display: 'flex', gap: '15px', alignItems: 'center' };
const taskDescription = (done) => ({ textDecoration: done ? 'line-through' : 'none', color: done ? '#475569' : '#fff' });
const checkboxStyle = { accentColor: '#304792ff', width: '20px', height: '20px' };
const deleteBtn = { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' };
const centerStyle = {
  position: 'fixed',      // makes it stay over the whole screen
  top: 0,
  left: 0,
  width: '100vw',         // full width
  height: '100vh',        // full height
  backgroundColor: '#020202', // dark background
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#3f3788ff',     // visible text color
  fontSize: '1.5rem',     // bigger text
  fontWeight: 'bold',     // more emphasis
  zIndex: 9999            // ensures it stays on top of everything
};

const flowContainer = { height: 'calc(100vh - 180px)', background: '#050505', borderRadius: '20px', border: '1px solid #1e293b', overflow: 'hidden' };

// CHAT WIDGET STYLES
const floatingChatToggle = { position: 'fixed', bottom: '25px', right: '25px', width: '60px', height: '60px', borderRadius: '50%', background: '#3ecf8e', color: '#000', border: 'none', cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const floatingChatPanel = { position: 'fixed', bottom: '100px', right: '25px', width: '320px', height: '450px', background: '#0a0a0a', border: '1px solid #1e293b', borderRadius: '20px', display: 'flex', flexDirection: 'column', zIndex: 1001, boxShadow: '0 15px 40px rgba(0,0,0,0.6)' };
const chatHeader = { padding: '15px', fontWeight: 'bold', borderBottom: '1px solid #111', color: '#94a3b8', fontSize: '0.8rem' };
const chatMessages = { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' };
const msg = { padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem', maxWidth: '80%', border: '1px solid #1a1a1a' };
const msgMeta = { fontSize: '0.6rem', color: '#444', marginBottom: '2px' };
const chatInputArea = { padding: '15px', borderTop: '1px solid #111', display: 'flex', gap: '8px' };
const chatInput = { background: '#000', border: '1px solid #111', color: '#fff', flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem' };
const sendBtn = { background: '#3981d3ff', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' };
<style>{`
/* ---------- GLOBAL TRANSITIONS ---------- */
button, input, select {
  transition: all 0.25s ease;
}

/* ---------- HEADER & TABS ---------- */
nav button:hover {
  color: #ffffff;
  transform: translateY(-1px);
}

nav button {
  position: relative;
}

nav button::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 0%;
  height: 2px;
  background: #30179eff;
  transition: width 0.3s ease;
}

nav button:hover::after {
  width: 100%;
}

/* ---------- GLASS CARDS ---------- */
div[style*="border-radius: 16px"],
div[style*="border-radius: 14px"],
div[style*="border-radius: 20px"] {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

div[style*="border-radius: 16px"]:hover,
div[style*="border-radius: 14px"]:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(99,102,241,0.15);
}

/* ---------- TASK ROW ---------- */
div[style*="margin-bottom: 12px"]:hover {
  background: #0f172a;
  transform: scale(1.01);
}

/* ---------- BUTTONS ---------- */
button:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

button:active {
  transform: scale(0.97);
}

/* ---------- ADD TASK BUTTON ---------- */
button[style*="border-radius: 10px"]:hover {
  box-shadow: 0 0 20px rgba(68,82,129,0.6);
}

/* ---------- CHAT FLOAT BUTTON ---------- */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(62,207,142,0.5); }
  70% { box-shadow: 0 0 0 20px rgba(62,207,142,0); }
  100% { box-shadow: 0 0 0 0 rgba(62,207,142,0); }
}

button[style*="position: fixed"][style*="border-radius: 50%"] {
  animation: pulse 2.5s infinite;
}

/* ---------- CHAT MESSAGES ---------- */
div[style*="max-width: 80%"] {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------- FLOW CANVAS ---------- */
div[style*="overflow: hidden"] {
  transition: box-shadow 0.3s ease;
}

div[style*="overflow: hidden"]:hover {
  box-shadow: 0 0 30px rgba(48,23,158,0.4);
}
`}</style>
