import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ProjectSetup({ onProjectCreated }) {
  const [teamName, setTeamName] = useState("");
  const [idea, setIdea] = useState("");
  const [strength, setStrength] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // trigger entry animation
  }, []);

  const startProject = async () => {
    if (!teamName || !idea) {
      alert("Please fill in the Team Name and Project Idea!");
      return;
    }

    setIsSubmitting(true);

    const tasksList = [
      { id: 1, task_name: "Core Architecture & Database", assigned_to: "Member 1", status: "pending", priority: "High" },
      { id: 2, task_name: "Frontend UI & Styling", assigned_to: "Member 2", status: "pending", priority: "High" },
      { id: 3, task_name: "Real-time Sync & Timer", assigned_to: "Member 1", status: "pending", priority: "Medium" },
      { id: 4, task_name: "Final Demo Preparation", assigned_to: `Member ${strength}`, status: "pending", priority: "Low" }
    ];

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        team_name: teamName,
        idea: idea,
        team_strength: parseInt(strength),
        tasks: tasksList,
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }])
      .select();

    if (error) {
      alert("Error saving project: " + error.message);
      setIsSubmitting(false);
    } else if (data && data.length > 0) {
      onProjectCreated(data[0].id);
    }
  };

  return (
    <div
      className="setup-container"
      style={{
        ...containerStyle,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease'
      }}
    >
      <h2>Initialize Your Hackathon</h2>

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
        onMouseEnter={() => setHoverBtn(true)}
        onMouseLeave={() => setHoverBtn(false)}
        style={{
          ...btnStyle,
          opacity: isSubmitting ? 0.6 : 1,
          transform: hoverBtn ? 'scale(1.05)' : 'scale(1)',
          boxShadow: hoverBtn
            ? '0 8px 20px rgba(0,0,0,0.25)'
            : '0 4px 10px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease'
        }}
      >
        {isSubmitting ? "Creating Project..." : "Initialize Project & Split Work"}
      </button>
    </div>
  );
}

// Styles (unchanged, only animations applied above)
const containerStyle = {
  background: '#d3dceeff',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '450px'
};

const formGroup = { marginBottom: '15px', textAlign: 'left' };

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  marginTop: '5px',
  borderRadius: '5px',
  border: '1px solid #d8c4c4ff',
  boxSizing: 'border-box',
  transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
};

const btnStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#6db4e4ff',
  color: '#d0eaeeff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold'
};
