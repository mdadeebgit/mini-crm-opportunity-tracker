import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { STAGES, PRIORITIES } from '../constants.js';
import OpportunityCard from '../components/OpportunityCard.jsx';
import OpportunityForm from '../components/OpportunityForm.jsx';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    value || 0
  );

export default function Dashboard() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({ stage: '', priority: '', search: '', sort: 'newest' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.stage) params.stage = filters.stage;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.sort) params.sort = filters.sort;

      const { data } = await api.get('/opportunities', { params });
      setOpportunities(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchOpportunities, 300); // debounce search/filter changes
    return () => clearTimeout(t);
  }, [fetchOpportunities]);

  const summary = useMemo(() => {
    const totalValue = opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    const wonValue = opportunities
      .filter((o) => o.stage === 'Won')
      .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    const highPriority = opportunities.filter((o) => o.priority === 'High').length;
    return { totalValue, wonValue, highPriority, count: opportunities.length };
  }, [opportunities]);

  const handleCreate = async (payload) => {
    const { data } = await api.post('/opportunities', payload);
    setOpportunities((prev) => [data, ...prev]);
    setShowForm(false);
  };

  const handleUpdate = async (payload) => {
    const { data } = await api.put(`/opportunities/${editing._id}`, payload);
    setOpportunities((prev) => prev.map((o) => (o._id === data._id ? data : o)));
    setEditing(null);
  };

  const handleDelete = async (opportunity) => {
    if (!window.confirm(`Delete opportunity for "${opportunity.customerName}"?`)) return;
    try {
      await api.delete(`/opportunities/${opportunity._id}`);
      setOpportunities((prev) => prev.filter((o) => o._id !== opportunity._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete opportunity.');
    }
  };

  const resetFilters = () => setFilters({ stage: '', priority: '', search: '', sort: 'newest' });
  const hasActiveFilters = filters.stage || filters.priority || filters.search;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales Pipeline</h1>
          <p className="text-sm text-slate-500">Shared view of all opportunities across the team</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
          + New Opportunity
        </button>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Opportunities" value={summary.count} />
        <SummaryCard label="Pipeline value" value={formatCurrency(summary.totalValue)} />
        <SummaryCard label="Won value" value={formatCurrency(summary.wonValue)} accent="text-green-600" />
        <SummaryCard label="High priority" value={summary.highPriority} accent="text-red-600" />
      </div>

      {/* Filters */}
      <div className="card mt-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[180px] flex-1">
          <label className="label">Search</label>
          <input
            className="input"
            placeholder="Customer or requirement…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Stage</label>
          <select className="input" value={filters.stage} onChange={(e) => setFilters({ ...filters, stage: e.target.value })}>
            <option value="">All</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Sort by</label>
          <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="value">Deal value</option>
            <option value="followup">Next follow-up</option>
          </select>
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn-secondary" onClick={resetFilters}>
            Clear
          </button>
        )}
      </div>

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading opportunities…</div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : opportunities.length === 0 ? (
          <div className="card py-16 text-center">
            <p className="text-slate-500">
              {hasActiveFilters ? 'No opportunities match your filters.' : 'No opportunities yet.'}
            </p>
            {!hasActiveFilters && (
              <button type="button" className="btn-primary mt-4" onClick={() => setShowForm(true)}>
                Create your first opportunity
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((o) => (
              <OpportunityCard
                key={o._id}
                opportunity={o}
                isOwner={o.owner?._id === user?._id}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && <OpportunityForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editing && (
        <OpportunityForm initial={editing} onSubmit={handleUpdate} onClose={() => setEditing(null)} />
      )}
    </main>
  );
}

function SummaryCard({ label, value, accent = 'text-slate-800' }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
