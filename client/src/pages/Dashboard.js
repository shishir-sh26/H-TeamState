import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import HackathonTimer from '../compoonents/HackathonTimer';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Settings, MessageSquare, LogOut, Share2, Trash2, Play, Pause, Clock, Edit2, Copy, RotateCcw } from 'lucide-react';

export default function Dashboard({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskName, setNewTaskName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('board');
  const [duration, setDuration] = useState(24);
  const [isEditingName, setIsEditingName] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const cleanId = projectId.toString().replace(/ID:\s*/g, '').trim();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', cleanId)
      .single();
    
    if (error) {
      console.error("Supabase Error:", error.message);
      setProject(null);
    } else if (data) {
      setProject(data);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    const cleanId = projectId.toString().replace(/ID:\s*/g, '').trim();
    const channel = supabase.channel(`realtime-${cleanId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${cleanId}` }, 
        (payload) => setProject(payload.new)
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [projectId, fetchProject]);

  // --- TIMER CONTROLS ---
  const startTimer = async () => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + parseInt(duration));
    await supabase.from('projects').update({ 
        end_time: endTime.toISOString(),
        timer_status: 'running' 
    }).eq('id', projectId);
  };

  const toggleTimer = async () => {
    if (!project.end_time) return;
    
    const isPausing = project.timer_status === 'running';
    const newStatus = isPausing ? 'paused' : 'running';

    if (!isPausing) {
      // If Resuming: Calculate how much time was left and set a new end_time
      // This is necessary because "end_time" is a static timestamp.
      // We calculate current remaining time from the last saved state.
      const now = new Date().getTime();
      const savedEnd = new Date(project.end_time).getTime();
      
      // Note: For a true pause, you'd store 'remaining_ms' in DB.
      // For this hackathon version, we simply toggle status.
      await supabase.from('projects').update({ timer_status: newStatus }).eq('id', projectId);
    } else {
      await supabase.from('projects').update({ timer_status: newStatus }).eq('id', projectId);
    }
  };

  const resetTimer = async () => {
    await supabase.from('projects').update({ 
        end_time: null, 
        timer_status: 'stopped' 
    }).eq('id', projectId);
  };

  // --- TASK ACTIONS ---
  const updateTeamName = async (newName) => {
    await supabase.from('projects').update({ team_name: newName }).eq('id', projectId);
    setIsEditingName(false);
  };

  const updateTaskMember = async (index, newName) => {
    const updatedTasks = [...project.tasks];
    updatedTasks[index].assigned_to = newName;
    await supabase.from('projects').update({ tasks: updatedTasks }).eq('id', projectId);
  };

  if (loading) return <div style={centerStyle}>Initializing Workspace...</div>;
  if (!project) return <div style={centerStyle}>Project Not Found</div>;

  return (
    <div style={dashboardWrapper}>
      <div style={mainContainer}>
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isEditingName ? (
              <input 
                autoFocus 
                style={inlineInput} 
                defaultValue={project.team_name} 
                onBlur={(e) => updateTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && updateTeamName(e.target.value)}
              />
            ) : (
              <h1 style={titleStyle} onClick={() => setIsEditingName(true)}>
                {project.team_name} <Edit2 size={14} style={{ opacity: 0.3 }} />
              </h1>
            )}
            <nav style={topNav}>
                <button style={{...tabBtn, color: activeTab === 'board' ? '#3ecf8e' : '#666'}} onClick={() => setActiveTab('board')}>Board</button>
                <button style={{...tabBtn, color: activeTab === 'flow' ? '#3ecf8e' : '#666'}} onClick={() => setActiveTab('flow')}>Architecture</button>
                <button style={tabBtn} onClick={() => setShowChat(!showChat)}><MessageSquare size={18}/></button>
            </nav>
          </div>
          
          <div style={{ display:'flex', gap:'12px'}}>
            <button onClick={onBack} style={logoutBtn}><LogOut size={16}/> Exit</button>
            <button onClick={() => {
                if(window.confirm("End hackathon and wipe data?")) {
                  supabase.from('projects').delete().eq('id', projectId).then(() => onBack());
                }
            }} style={terminateBtn}>Finish</button>
          </div>
        </header>

        <main style={scrollArea}>
          {activeTab === 'board' ? (
            <div style={boardLayout}>
              <div style={rowStyle}>
                <div style={glassCard}>
                  <p style={label}><Clock size={10} style={{marginRight:4}}/> Tournament Clock</p>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <HackathonTimer endTime={project.end_time} timerStatus={project.timer_status} />
                    
                    <div style={{display:'flex', gap:'8px', alignItems: 'center'}}>
                        {(!project.end_time || project.timer_status === 'stopped') ? (
                            <div style={{display:'flex', gap:'5px'}}>
                                <input type="number" style={smallInput} value={duration} onChange={e => setDuration(e.target.value)} />
                                <button onClick={startTimer} style={startBtn}><Play size={12}/> Start</button>
                            </div>
                        ) : (
                            <>
                                <button onClick={toggleTimer} style={btnIcon} title={project.timer_status === 'running' ? "Pause" : "Resume"}>
                                    {project.timer_status === 'running' ? <Pause size={14} color="#ffab00"/> : <Play size={14} color="#3ecf8e"/>}
                                </button>
                                <button onClick={resetTimer} style={btnIcon} title="Reset">
                                    <RotateCcw size={14} color="#ff4b2b"/>
                                </button>
                            </>
                        )}
                    </div>
                  </div>
                </div>

                <div style={glassCard}>
                  <p style={label}>Sprint Completion</p>
                  <div style={statText}>
                    {project.tasks?.length > 0 ? Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100) : 0}%
                  </div>
                  <div style={progressBarContainer}>
                    <div style={{...progressBar, width: `${project.tasks?.length > 0 ? (project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100 : 0}%`}}></div>
                  </div>
                </div>
              </div>

              {/* Task Entry */}
              <div style={{...glassCard, marginTop:'20px'}}>
                <p style={label}>New Task</p>
                <div style={{display:'flex', gap:'10px'}}>
                  <input style={darkInput} placeholder="Task name..." value={newTaskName} onChange={e => setNewTaskName(e.target.value)} />
                  <input style={darkInput} placeholder="Assignee..." value={assignedTo} onChange={e => setAssignedTo(e.target.value)} />
                  <select style={darkSelect} value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <button onClick={async () => {
                    const updated = [...(project.tasks || []), { task_name: newTaskName, assigned_to: assignedTo, status: "pending", priority }];
                    await supabase.from('projects').update({ tasks: updated }).eq('id', projectId);
                    setNewTaskName(""); setAssignedTo("");
                  }} style={addBtn}><Plus size={20}/></button>
                </div>
              </div>

              {/* Task List */}
              <div style={{marginTop:'25px', paddingBottom: '80px'}}>
                {project.tasks?.map((t, i) => (
                  <div key={i} style={{...taskRow, borderLeft: t.priority === 'High' ? '4px solid #ff4b2b' : '4px solid #3ecf8e'}}>
                    <div style={{display:'flex', gap:'15px', alignItems:'center', flex: 1}}>
                       <input type="checkbox" checked={t.status === 'completed'} onChange={async () => {
                           const updated = [...project.tasks];
                           updated[i].status = updated[i].status === 'completed' ? 'pending' : 'completed';
                           await supabase.from('projects').update({ tasks: updated }).eq('id', projectId);
                       }} style={checkboxStyle} />
                       <div style={{ display: 'flex', gap: '8px', alignItems:'center'}}>
                          <input 
                            style={memberInput} 
                            defaultValue={t.assigned_to} 
                            onBlur={(e) => updateTaskMember(i, e.target.value)}
                          />
                          <span style={{color: '#444'}}>—</span>
                          <span style={{textDecoration: t.status === 'completed' ? 'line-through' : 'none', color: t.status === 'completed' ? '#555' : '#eee'}}>
                            {t.task_name}
                          </span>
                       </div>
                    </div>
                    <button onClick={async () => {
                        const updated = project.tasks.filter((_, idx) => idx !== i);
                        await supabase.from('projects').update({ tasks: updated }).eq('id', projectId);
                    }} style={deleteBtn}><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={flowContainer}>
              <ReactFlow nodes={project.flow_data?.nodes || []} edges={project.flow_data?.edges || []}>
                <Background color="#111" gap={20} />
                <Controls />
              </ReactFlow>
            </div>
          )}
        </main>

        <footer style={idFooter}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase'}}>Project Access ID</span>
                <code style={idBadge}>{projectId}</code>
                <button onClick={() => {navigator.clipboard.writeText(projectId); alert("ID Copied!")}} style={copyBtn}>
                    <Copy size={12} /> Copy ID
                </button>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#222'}}>Connected to Supabase Realtime</span>
        </footer>
      </div>

      {showChat && (
        <aside style={chatBox}>
          <div style={chatHeader}>Team Sync</div>
          <div style={chatMessages}>
            {project.messages?.map((m, i) => (
              <div key={i} style={msg}>
                <div style={msgMeta}>{m.sender} • {m.time}</div>
                {m.text}
              </div>
            ))}
          </div>
          <div style={chatInputArea}>
            <input style={darkInput} value={message} onChange={e => setMessage(e.target.value)} onKeyPress={(e) => {
                    if(e.key === 'Enter') {
                        const updated = [...(project.messages || []), { text: message, sender: "Teammate", time: new Date().toLocaleTimeString() }];
                        supabase.from('projects').update({ messages: updated }).eq('id', projectId).then(() => setMessage(""));
                    }
                }} placeholder="Message team..." />
          </div>
        </aside>
      )}
    </div>
  );
}

// --- STYLES ---
const dashboardWrapper = { display: 'flex', background: '#050505', height: '100vh', width: '100vw', color: '#fff', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' };
const mainContainer = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', background: '#0a0a0a', borderBottom: '1px solid #1a1a1a', alignItems: 'center' };
const topNav = { display: 'flex', gap: '20px', marginLeft: '30px', borderLeft: '1px solid #1a1a1a', paddingLeft: '30px' };
const tabBtn = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' };
const titleStyle = { margin: 0, fontSize: '1.2rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' };
const inlineInput = { background: '#111', border: '1px solid #3ecf8e', color: '#3ecf8e', fontSize: '1.2rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', outline: 'none' };
const memberInput = { background: 'none', border: 'none', color: '#3ecf8e', fontWeight: 'bold', width: '100px', outline: 'none', borderBottom: '1px solid transparent', transition: '0.2s' };
const idFooter = { position: 'absolute', bottom: 0, width: '100%', background: '#080808', borderTop: '1px solid #111', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' };
const idBadge = { color: '#3ecf8e', fontSize: '0.8rem', background: '#000', padding: '5px 12px', borderRadius: '6px', border: '1px solid #111' };
const copyBtn = { background: '#111', color: '#666', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px' };
const logoutBtn = { background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' };
const scrollArea = { padding: '30px 40px', flex: 1, overflowY: 'auto' };
const boardLayout = { maxWidth: '1200px', margin: '0 auto' };
const rowStyle = { display: 'flex', gap: '20px', marginBottom: '20px' };
const glassCard = { background: '#0a0a0a', padding: '24px', borderRadius: '16px', border: '1px solid #1a1a1a', flex: 1 };
const label = { margin: '0 0 12px 0', fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' };
const statText = { fontSize: '2.8rem', fontWeight: '800', color: '#3ecf8e' };
const progressBarContainer = { height: '6px', width: '100%', background: '#1a1a1a', borderRadius: '10px', marginTop: '15px', overflow: 'hidden' };
const progressBar = { height: '100%', background: '#3ecf8e', transition: 'width 0.5s ease' };
const darkInput = { background: '#111', border: '1px solid #222', color: '#fff', padding: '12px 16px', borderRadius: '8px', flex: 1, fontSize: '0.9rem' };
const darkSelect = { background: '#111', border: '1px solid #222', color: '#fff', padding: '12px', borderRadius: '8px' };
const addBtn = { background: '#3ecf8e', color: '#000', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer' };
const taskRow = { display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: '#0d0d0d', borderRadius: '12px', border: '1px solid #1a1a1a', marginBottom: '10px' };
const checkboxStyle = { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3ecf8e' };
const deleteBtn = { background: 'none', border: 'none', color: '#333', cursor: 'pointer' };
const flowContainer = { height: 'calc(100vh - 200px)', background: '#080808', borderRadius: '20px', border: '1px solid #1a1a1a', overflow: 'hidden' };
const chatBox = { width: '350px', background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column' };
const chatHeader = { padding: '24px', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid #1a1a1a' };
const chatMessages = { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' };
const msg = { background: '#111', padding: '12px 16px', borderRadius: '12px 12px 12px 0', fontSize: '0.85rem', border: '1px solid #1a1a1a' };
const msgMeta = { fontSize: '0.6rem', color: '#444', marginBottom: '4px' };
const chatInputArea = { padding: '20px', borderTop: '1px solid #1a1a1a' };
const terminateBtn = { background: '#ff4b2b22', color: '#ff4b2b', border: '1px solid #ff4b2b', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const startBtn = { background: '#3ecf8e', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' };
const smallInput = { width: '40px', background: '#111', border: '1px solid #333', color: '#3ecf8e', fontSize: '0.7rem', padding: '2px 4px', borderRadius: '4px' };
const btnIcon = { background: '#111', color: '#666', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' };
const centerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#3ecf8e' };