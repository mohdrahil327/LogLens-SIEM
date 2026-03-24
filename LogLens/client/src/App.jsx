import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, Activity, Globe, Terminal, Upload, PlayCircle, ShieldCheck } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Core Upload Logic
  const handleUpload = async (customFile = null) => {
    const targetFile = customFile || file;
    if (!targetFile) return alert("Please select a log file or use the Demo button.");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('logfile', targetFile);

    try {
      const res = await axios.post('http://localhost:5000/analyze', formData);
      setResults(res.data);
    } catch (err) {
      alert("Backend Connection Failed. Ensure Node.js server is running on port 5000.");
    }
    setLoading(false);
  };

  /**
   * Phase 4 Deliverable: Load Demo Log
   * Allows evaluators to see the dashboard populate without manual log creation.
   */
  const loadDemo = () => {
    const demoContent = `
1.1.1.1 - - [24/Mar/2026:12:00] "GET /etc/passwd" 404
2.2.2.2 - - [24/Mar/2026:12:01] "POST /login?u=' OR 1=1" 401
2.2.2.2 - - [24/Mar/2026:12:01] "POST /login" 401
2.2.2.2 - - [24/Mar/2026:12:01] "POST /login" 401
2.2.2.2 - - [24/Mar/2026:12:01] "POST /login" 401
2.2.2.2 - - [24/Mar/2026:12:01] "POST /login" 401
3.3.3.3 - - [24/Mar/2026:12:05] "GET /search?q=<script>alert(1)</script>" 200
    `.trim();
    const blob = new Blob([demoContent], { type: 'text/plain' });
    handleUpload(new File([blob], "demo_evaluator.log"));
  };

  const chartData = results ? Object.entries(results.breakdown).map(([name, val]) => ({ name, val })) : [];

  return (
    <div style={{ padding: '2rem', backgroundColor: '#020617', color: '#94a3b8', minHeight: '100vh', fontFamily: 'monospace' }}>
      
      {/* HUD Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={28} color={results?.attacksFound > 0 ? "#ef4444" : "#3b82f6"} />
          <h1 style={{ color: 'white', margin: 0, letterSpacing: '2px' }}>LOGLENS // SIEM-LITE</h1>
        </div>
        <button onClick={loadDemo} style={demoBtnStyle}>
          <PlayCircle size={16}/> LOAD EVALUATOR DEMO
        </button>
      </header>

      {/* Upload Zone */}
      <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <Upload size={20} color="#3b82f6" />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ color: '#475569' }} />
          <button onClick={() => handleUpload()} style={scanBtnStyle}>
            {loading ? "PARSING STREAM..." : "EXECUTE SCAN"}
          </button>
        </div>
      </div>

      {results && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          
          {/* Phase 3: Metrics Cards */}
          <div style={cardStyle}>
            <Activity color="#3b82f6" size={18} />
            <p style={labelStyle}>Total Requests</p>
            <h2 style={{ color: 'white', margin: 0 }}>{results.totalLines}</h2>
          </div>

          <div style={{ ...cardStyle, borderLeft: '4px solid #ef4444' }}>
            <ShieldAlert color="#ef4444" size={18} />
            <p style={labelStyle}>Threats Identified</p>
            <h2 style={{ color: '#ef4444', margin: 0 }}>{results.attacksFound}</h2>
          </div>

          <div style={cardStyle}>
            <ShieldCheck color="#22c55e" size={18} />
            <p style={labelStyle}>Critical Severity</p>
            <h2 style={{ color: 'white', margin: 0 }}>{results.severity.CRITICAL}</h2>
          </div>

          {/* Visualization */}
          <div style={{ ...cardStyle, gridColumn: 'span 2', minHeight: '300px' }}>
            <h3 style={{ color: 'white', marginTop: 0 }}>Threat Vector Matrix</h3>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip contentStyle={{ background: '#020617', border: '1px solid #1e293b' }} />
                <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Phase 3: Geo-Map Table */}
          <div style={cardStyle}>
            <h3 style={{ color: 'white', marginTop: 0 }}>Top Malicious Origins</h3>
            {results.topAttackers.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e293b', fontSize: '0.85rem' }}>
                <span style={{ fontFamily: 'monospace' }}>{a.ip}</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{a.location}</span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

// Styling Constants
const demoBtnStyle = { cursor: 'pointer', padding: '8px 16px', border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.75rem' };
const scanBtnStyle = { cursor: 'pointer', padding: '12px 24px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '1px' };
const cardStyle = { background: '#0f172a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1e293b' };
const labelStyle = { color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '5px' };

export default App;