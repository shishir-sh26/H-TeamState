import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ProjectSetup({ onProjectCreated }) {
  // 1. State for form inputs
  const [teamName, setTeamName] = useState("");
  const [idea, setIdea] = useState("");
  const [strength, setStrength] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startProject = async () => {
    if (!teamName || !idea) {
      alert("Please fill in the Team Name and Project Idea!");
      return;
    }

    setIsSubmitting(true);

    // 2. Automated Task Splitting Logic based on team strength
    const tasksList = [
      { id: 1, task_name: "Core Architecture & Database", assigned_to: "Member 1", status: "pending", priority: "High" },
      { id: 2, task_name: "Frontend UI & Styling", assigned_to: "Member 2", status: "pending", priority: "High" },
      { id: 3, task_name: "Real-time Sync & Timer", assigned_to: "Member 1", status: "pending", priority: "Medium" },
      { id: 4, task_name: "Final Demo Preparation", assigned_to: `Member ${strength}`, status: "pending", priority: "Low" }
    ];

    // 3. Insert data into Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        team_name: teamName,
        idea: idea,
        team_strength: parseInt(strength),
        tasks: tasksList,
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24-hour countdown
      }])
      .select();

    if (error) {
      alert("Error saving project: " + error.message);
      setIsSubmitting(false);
    } else if (data && data.length > 0) {
      // 4. Send the new Project ID back to App.js to trigger the view switch
      onProjectCreated(data[0].id);
    }
  };

  return (
    <div className="setup-container" style={containerStyle}>
      <h2>🚀 Initialize Your Hackathon</h2>
      
      <div style={formGroup}>
        <label>Team Name</label>
        <input 
          type="text" 
          placeholder="e.g. Code Warriors" 
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)} 
          style={inputStyle}
        />
      </div>

      <div style={formGroup}>
        <label>Project Idea</label>
        <textarea 
          placeholder="What are you building?" 
          value={idea}
          onChange={(e) => setIdea(e.target.value)} 
          style={{ ...inputStyle, height: '80px' }}
        />
      </div>

      <div style={formGroup}>
        <label>Team Strength (Number of members)</label>
        <input 
          type="number" 
          min="1" 
          max="10"
          value={strength}
          onChange={(e) => setStrength(e.target.value)} 
          style={inputStyle}
        />
      </div>

      <button 
        onClick={startProject} 
        disabled={isSubmitting}
        style={isSubmitting ? { ...btnStyle, opacity: 0.6 } : btnStyle}
      >
        {isSubmitting ? "Creating Project..." : "Initialize Project & Split Work"}
      </button>
    </div>
  );
}

// Basic Inline Styles
const containerStyle = { background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' };
const formGroup = { marginBottom: '15px', textAlign: 'left' };
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#3ecf8e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' };