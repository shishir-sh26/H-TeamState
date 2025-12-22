import React, { useCallback, useEffect, useState } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { supabase } from '../supabaseClient';
import { Save, PlusCircle, Trash2 } from 'lucide-react';

export default function ProjectFlow({ projectId, flowData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeName, setNodeName] = useState("");
  const [selectedShape, setSelectedShape] = useState("rectangle");
  const [selectedColor, setSelectedColor] = useState("#1e293b"); // Default Dark Blue

  // Sync with incoming flowData from Dashboard
  useEffect(() => {
    if (flowData) {
      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);
    }
  }, [flowData, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Add a new node with shape and color styling
  const addNode = () => {
    if (!nodeName.trim()) return;
    
    const isCircle = selectedShape === 'circle';
    const isDiamond = selectedShape === 'diamond';
    
    const newNode = {
      id: Date.now().toString(),
      data: { label: nodeName },
      position: { x: 150, y: 150 },
      // Apply shape-specific CSS
      style: { 
        background: selectedColor, 
        color: '#fff', 
        border: '1px solid #3ecf8e', 
        borderRadius: isCircle ? '50%' : '8px',
        clipPath: isDiamond ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        padding: isDiamond ? '15px' : '5px'
      }
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeName("");
  };

  // Delete only the elements currently clicked/selected
  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  // IMPORTANT: Matches your database column name 'flowchart_data'
  const saveFlow = async () => {
    const { error } = await supabase
      .from('projects')
      .update({ flowchart_data: { nodes, edges } }) // Changed from flow_data
      .eq('id', projectId);

    if (!error) {
      alert("Architecture successfully saved!");
    } else {
      console.error("Save Error:", error.message);
      alert("Failed to save: " + error.message);
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Panel position="top-left" style={flowControls}>
        <div style={inputGroup}>
          <input 
            style={flowInput} 
            placeholder="Node Name..." 
            value={nodeName} 
            onChange={e => setNodeName(e.target.value)} 
          />
          <button onClick={addNode} style={addBtn}><PlusCircle size={14}/> Add Block</button>
        </div>
        
        <div style={selectorRow}>
          <select style={flowSelect} value={selectedShape} onChange={e => setSelectedShape(e.target.value)}>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="diamond">Diamond</option>
          </select>
          
          <input 
            type="color" 
            style={colorPicker} 
            value={selectedColor} 
            onChange={e => setSelectedColor(e.target.value)} 
            title="Pick Node Color"
          />
        </div>
        
        <div style={divider} />
        
        <div style={actionGroup}>
          <button onClick={deleteSelected} style={deleteBtn} title="Delete selected elements">
            <Trash2 size={14}/> Delete Selected
          </button>
          <button onClick={saveFlow} style={saveBtn}>
            <Save size={14}/> Save Architecture
          </button>
        </div>
      </Panel>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        colorMode="dark"
        fitView
      >
        <Background variant="grid" gap={25} color="#1a1a1a" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// --- UPDATED STYLES ---
const flowControls = { 
  display: 'flex', 
  flexDirection: 'column',
  gap: '12px', 
  background: '#0a0a0a', 
  padding: '15px', 
  borderRadius: '12px', 
  border: '1px solid #1e293b',
  boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
  width: '260px'
};

const inputGroup = { display: 'flex', gap: '8px' };
const selectorRow = { display: 'flex', gap: '8px', alignItems: 'center' };
const actionGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const divider = { height: '1px', background: '#1e293b', width: '100%' };

const flowInput = { flex: 1, background: '#000', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' };
const flowSelect = { flex: 1, background: '#000', border: '1px solid #333', color: '#eee', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' };
const colorPicker = { width: '40px', height: '34px', padding: '0', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', background: 'none' };

const baseBtn = { border: 'none', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 'bold', transition: '0.2s' };
const addBtn = { ...baseBtn, background: '#1e293b', color: '#3ecf8e', border: '1px solid #3ecf8e' };
const deleteBtn = { ...baseBtn, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
const saveBtn = { ...baseBtn, background: '#3ecf8e', color: '#000' };