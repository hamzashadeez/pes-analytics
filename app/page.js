'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, History, Star, Target, Crosshair, Trophy,
  X, Check, Trash2, Eye, AlertCircle, Loader2,
  TrendingUp, ChevronDown, RefreshCw, Shield, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Area, AreaChart
} from 'recharts';

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend }) {
  return (
    <div className="card p-5 flex gap-4 items-start">
      <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>
        <Icon size={20} color="#10b981" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-widest font-mono" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p className="stat-number text-3xl mt-1" style={{ color: '#f1f5f9' }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            {sub}
          </p>
        )}
      </div>
      {trend && (
        <div className="shrink-0">
          <TrendingUp size={16} color="#10b981" />
        </div>
      )}
    </div>
  );
}

// ─── Review / Fallback Modal ───────────────────────────────────
function ReviewModal({ parsed, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    myTeam: parsed?.myTeam || '',
    opponent: parsed?.opponent || '',
    myGoals: parsed?.myGoals ?? '',
    opponentGoals: parsed?.opponentGoals ?? '',
    shots: parsed?.shots ?? '',
    shotsOnTarget: parsed?.shotsOnTarget ?? '',
    possession: parsed?.possession ?? '',
    matchRating: parsed?.matchRating ?? '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const fields = [
    { key: 'myTeam', label: 'My Team', type: 'text', placeholder: 'e.g. Arsenal' },
    { key: 'opponent', label: 'Opponent', type: 'text', placeholder: 'e.g. Bayern Munich' },
    { key: 'date', label: 'Match Date', type: 'date', placeholder: '' },
    { key: 'myGoals', label: 'My Goals', type: 'number', placeholder: '0' },
    { key: 'opponentGoals', label: 'Opponent Goals', type: 'number', placeholder: '0' },
    { key: 'shots', label: 'Total Shots', type: 'number', placeholder: '0' },
    { key: 'shotsOnTarget', label: 'Shots on Target', type: 'number', placeholder: '0' },
    { key: 'possession', label: 'Possession (%)', type: 'number', placeholder: '50' },
    { key: 'matchRating', label: 'Match Rating (0–10)', type: 'number', placeholder: '7.5' },
  ];

  const isValid = form.myTeam && form.opponent && form.myGoals !== '' && form.opponentGoals !== '';

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="card w-full max-w-lg animate-fadeslide"
        style={{ borderColor: 'rgba(16,185,129,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-xl font-bold" style={{ color: '#10b981' }}>
              Review Match Data
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
          {parsed?.rawText ? (
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              OCR extracted data — verify and correct any errors below
            </p>
          ) : (
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              Manual entry — fill in your match details
            </p>
          )}
          {parsed?.confidence != null && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>OCR Confidence:</span>
              <span
                className="text-xs font-mono font-bold"
                style={{ color: parsed.confidence > 70 ? '#10b981' : '#f59e0b' }}
              >
                {Math.round(parsed.confidence)}%
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="p-5 grid grid-cols-2 gap-4">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} className={key === 'myTeam' || key === 'opponent' || key === 'date' ? 'col-span-2' : ''}>
              <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {label}
                {(key === 'myTeam' || key === 'opponent' || key === 'myGoals' || key === 'opponentGoals') && (
                  <span style={{ color: '#ef4444' }}> *</span>
                )}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                step={key === 'matchRating' ? '0.1' : '1'}
                min={type === 'number' ? 0 : undefined}
                max={key === 'possession' ? 100 : key === 'matchRating' ? 10 : undefined}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 py-2.5 px-4 rounded-xl text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!isValid || loading}
            className="btn-primary flex-1 py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : (
              <><Check size={14} /> Save Match</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Match Modal ──────────────────────────────────────────
function ViewModal({ match, onClose }) {
  if (!match) return null;
  const resultColor = { W: '#10b981', D: '#f59e0b', L: '#ef4444' }[match.result];
  const resultLabel = { W: 'WIN', D: 'DRAW', L: 'LOSS' }[match.result];

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-fadeslide" style={{ borderColor: 'rgba(16,185,129,0.25)' }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold">{match.myTeam}</h2>
              <span className="font-display text-xl" style={{ color: 'var(--text-muted)' }}>vs</span>
              <h2 className="font-display text-xl font-bold">{match.opponent}</h2>
            </div>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {new Date(match.date).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
            <X size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Score */}
          <div className="text-center py-4">
            <div className="font-display text-6xl font-bold" style={{ color: resultColor }}>
              {match.myGoals} – {match.opponentGoals}
            </div>
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold"
              style={{ background: `${resultColor}20`, color: resultColor }}
            >
              {resultLabel}
            </span>
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Shots', `${match.shotsOnTarget}/${match.shots}`],
              ['Possession', `${match.possession}%`],
              ['Shot Accuracy', match.shots > 0 ? `${Math.round((match.shotsOnTarget / match.shots) * 100)}%` : '—'],
              ['Match Rating', match.matchRating != null ? match.matchRating : '—'],
            ].map(([label, val]) => (
              <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.08)' }}>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="font-display text-xl font-bold mt-1" style={{ color: '#10b981' }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [parseLoading, setParseLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // { parsed, imageFile }
  const [viewMatch, setViewMatch] = useState(null);
  const [parseLog, setParseLog] = useState([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // ── Fetch matches ──
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMatches(data.matches || []);
      setStats(data.stats || null);
    } catch (e) {
      setError('Failed to load matches. Is MongoDB connected?');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  // ── Handle file ──
  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    setParseLoading(true);
    setError(null);

    const log = { status: 'parsing', message: 'OCR in progress...', time: new Date() };
    setParseLog((l) => [log, ...l.slice(0, 9)]);

    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/parse-match', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setParseLog((l) => [
        { status: 'success', message: `Parsed! Confidence: ${Math.round(data.confidence)}%`, time: new Date() },
        ...l.slice(1),
      ]);
      setReviewModal({ parsed: data.parsed, confidence: data.confidence });
    } catch (e) {
      setParseLog((l) => [
        { status: 'error', message: `Parse failed: ${e.message}`, time: new Date() },
        ...l.slice(1),
      ]);
      // Open modal with empty form as fallback
      setReviewModal({ parsed: null });
    } finally {
      setParseLoading(false);
    }
  };

  // ── Save match ──
  const handleSave = async (form) => {
    setSaveLoading(true);
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReviewModal(null);
      setPreview(null);
      setParseLog((l) => [
        { status: 'success', message: 'Match saved to database!', time: new Date() },
        ...l.slice(0, 9),
      ]);
      await fetchMatches();
    } catch (e) {
      setError(`Save failed: ${e.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Delete match ──
  const handleDelete = async (id) => {
    if (!confirm('Delete this match?')) return;
    try {
      await fetch(`/api/matches/${id}`, { method: 'DELETE' });
      await fetchMatches();
    } catch (e) {
      setError('Delete failed');
    }
  };

  // ── Drag events ──
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── Custom tooltip for chart ──
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl p-3 text-xs font-mono" style={{ background: '#111827', border: '1px solid rgba(16,185,129,0.3)' }}>
        <p style={{ color: '#10b981' }}>{payload[0].payload.team}</p>
        <p style={{ color: '#f1f5f9' }}>{payload[0].value} goals</p>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(5,13,26,0.85)',
          borderBottom: '1px solid rgba(16,185,129,0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
            <Zap size={16} color="white" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide" style={{ color: '#f1f5f9' }}>
            PES 2025 <span style={{ color: '#10b981' }}>ANALYTICS</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setPreview(null); setReviewModal({ parsed: null }); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          >
            <Upload size={14} /> Upload Match
          </button>
          <button
            onClick={() => setShowManualEntry(true)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          >
            <History size={14} /> Manual Entry
          </button>
          <button onClick={fetchMatches} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <RefreshCw size={15} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </nav>

      <div className="px-6 py-6 max-w-screen-xl mx-auto space-y-8">

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            <AlertCircle size={15} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* ── Top section: Upload + Stats + Log ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Upload & Quick Stats column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Section header */}
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: '#f1f5f9' }}>
                Upload & Quick Stats
              </h1>
              <div className="neon-line mt-2 w-24" />
            </div>

            {/* Upload zone */}
            <div
              ref={dropRef}
              className={`upload-zone p-8 text-center cursor-pointer ${dragging ? 'dragging' : ''} ${parseLoading ? 'pointer-events-none' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !parseLoading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
                  {parseLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl" style={{ background: 'rgba(5,13,26,0.75)' }}>
                      <Loader2 size={28} color="#10b981" className="animate-spin" />
                      <p className="text-sm font-mono mt-3" style={{ color: '#10b981' }}>Analyzing with OCR...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <Upload size={28} color="#10b981" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                      DROP MATCH SCREENSHOT HERE
                    </p>
                    <p className="text-sm font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                      or click to browse — PNG, JPG supported
                    </p>
                  </div>
                  <button className="btn-primary px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
                    <Upload size={13} /> Parse Image
                  </button>
                </div>
              )}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Star}
                label="Avg. Match Rating"
                value={loadingData ? '…' : (stats?.avgRating || '—')}
                sub={`${stats?.totalMatches || 0} matches recorded`}
                trend
              />
              <StatCard
                icon={Crosshair}
                label="Shot Accuracy"
                value={loadingData ? '…' : `${stats?.shotAccuracy || 0}%`}
                sub="On target / total"
                trend
              />
              <StatCard
                icon={Target}
                label="Goals Per Game"
                value={loadingData ? '…' : (stats?.avgGoals || '0.0')}
                sub={`Win rate: ${stats?.winRate || 0}%`}
                trend
              />
              <StatCard
                icon={Trophy}
                label="Best Team"
                value={loadingData ? '…' : (stats?.bestTeam || '—')}
                sub="Most wins"
              />
            </div>
          </div>

          {/* Parse log sidebar */}
          <div className="card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} color="#10b981" />
              <h3 className="font-display font-semibold" style={{ color: '#f1f5f9' }}>Recent Parse Log</h3>
            </div>
            <div className="space-y-2 flex-1">
              {parseLog.length === 0 ? (
                <p className="text-xs font-mono text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No activity yet
                </p>
              ) : (
                parseLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <span
                      className="text-xs font-mono font-bold shrink-0 mt-0.5"
                      style={{ color: log.status === 'success' ? '#10b981' : log.status === 'error' ? '#ef4444' : '#f59e0b' }}
                    >
                      {log.status === 'success' ? '✓' : log.status === 'error' ? '✗' : '…'}
                    </span>
                    <div>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{log.message}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {log.time.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Match History & Chart ── */}
        <div>
          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold" style={{ color: '#f1f5f9' }}>
              Match History & Analysis
            </h2>
            <div className="neon-line mt-2 w-32" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Table */}
            <div className="xl:col-span-2 card overflow-hidden">
              {loadingData ? (
                <div className="p-8 text-center">
                  <Loader2 size={24} color="#10b981" className="animate-spin mx-auto" />
                  <p className="text-sm font-mono mt-3" style={{ color: 'var(--text-muted)' }}>Loading matches...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(16,185,129,0.08)' }}>
                    <History size={28} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p className="font-display text-lg" style={{ color: 'var(--text-secondary)' }}>No matches yet</p>
                  <p className="text-sm font-mono mt-1" style={{ color: 'var(--text-muted)' }}>Upload your first match screenshot</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="match-table w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                        {['Date', 'Team Used', 'Opponent', 'Score', 'Shots (On Target)', 'Poss.', ''].map((h) => (
                          <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((m) => (
                        <tr key={m._id}>
                          <td className="px-4 py-3 text-xs font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(m.date).toLocaleDateString('en-CA')}
                          </td>
                          <td className="px-4 py-3 text-sm font-display font-semibold whitespace-nowrap">{m.myTeam}</td>
                          <td className="px-4 py-3 text-sm font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                            {m.opponent}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`badge-${m.result} px-2.5 py-1 rounded-lg text-sm font-display font-bold`}
                            >
                              {m.myGoals}–{m.opponentGoals}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {m.shots > 0 ? `${m.shots}(${m.shotsOnTarget})` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {m.possession ? `${m.possession}%` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setViewMatch(m)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors"
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(m._id)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="card p-5">
              <h3 className="font-display font-semibold mb-4" style={{ color: '#f1f5f9' }}>
                Goals Scored by Team
              </h3>
              {stats?.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.06)" vertical={false} />
                    <XAxis
                      dataKey="team"
                      tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="goals" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>No data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {reviewModal && (
        <ReviewModal
          parsed={reviewModal.parsed}
          onSave={handleSave}
          onClose={() => { setReviewModal(null); setPreview(null); }}
          loading={saveLoading}
        />
      )}
      {showManualEntry && (
        <ReviewModal
          parsed={null}
          onSave={async (form) => { await handleSave(form); setShowManualEntry(false); }}
          onClose={() => setShowManualEntry(false)}
          loading={saveLoading}
        />
      )}
      {viewMatch && (
        <ViewModal match={viewMatch} onClose={() => setViewMatch(null)} />
      )}
    </div>
  );
}
