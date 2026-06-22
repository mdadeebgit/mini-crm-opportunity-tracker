import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { STAGES, PRIORITIES } from '../constants.js';
import { formatCompactCurrency } from '../utils/format.js';
import OpportunityCard from '../components/OpportunityCard.jsx';
import OpportunityForm from '../components/OpportunityForm.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { PlusIcon, SearchIcon, BoardIcon, ListIcon, RupeeIcon, AlertIcon, CheckIcon, FilterIcon } from '../components/icons.jsx';

const DEFAULT_FILTERS = { stage: '', priority: '', search: '', sort: 'newest' };

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState('board'); // 'board' | 'list'
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    const totalValue = opportunities.reduce((s, o) => s + (o.estimatedValue || 0), 0);
    const wonValue = opportunities
      .filter((o) => o.stage === 'Won')
      .reduce((s, o) => s + (o.estimatedValue || 0), 0);
    const highPriority = opportunities.filter((o) => o.priority === 'High').length;
    return { totalValue, wonValue, highPriority, count: opportunities.length };
  }, [opportunities]);

  const handleCreate = async (payload) => {
    const { data } = await api.post('/opportunities', payload);
    setOpportunities((prev) => [data, ...prev]);
    setShowForm(false);
    toast.success('Opportunity created');
  };

  const handleUpdate = async (payload) => {
    const { data } = await api.put(`/opportunities/${editing._id}`, payload);
    setOpportunities((prev) => prev.map((o) => (o._id === data._id ? data : o)));
    setEditing(null);
    toast.success('Opportunity updated');
  };

  // Drag-to-change-stage on the board. Optimistic with rollback on failure.
  const handleStageChange = async (opportunity, stage) => {
    const prev = opportunity.stage;
    setOpportunities((list) => list.map((o) => (o._id === opportunity._id ? { ...o, stage } : o)));
    try {
      const { data } = await api.put(`/opportunities/${opportunity._id}`, { stage });
      setOpportunities((list) => list.map((o) => (o._id === data._id ? data : o)));
      toast.success(`Moved to ${stage}`);
    } catch (err) {
      setOpportunities((list) => list.map((o) => (o._id === opportunity._id ? { ...o, stage: prev } : o)));
      toast.error(err.response?.data?.message || 'Could not move opportunity');
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/opportunities/${deleting._id}`);
      setOpportunities((prev) => prev.filter((o) => o._id !== deleting._id));
      toast.success('Opportunity deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete opportunity');
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const hasActiveFilters = filters.stage || filters.priority || filters.search;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales Pipeline</h1>
          <p className="text-sm text-slate-500">Shared view of all opportunities across the team</p>
        </div>
        <button type="button" className="btn-primary self-start sm:self-auto" onClick={() => setShowForm(true)}>
          <PlusIcon className="mr-1.5" /> New Opportunity
        </button>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard label="Opportunities" value={summary.count} />
        <SummaryCard label="Pipeline value" value={formatCompactCurrency(summary.totalValue)} icon={<RupeeIcon />} />
        <SummaryCard label="Won value" value={formatCompactCurrency(summary.wonValue)} icon={<CheckIcon />} accent="text-green-600" iconBg="bg-green-100 text-green-600" />
        <SummaryCard label="High priority" value={summary.highPriority} icon={<AlertIcon />} accent="text-red-600" iconBg="bg-red-100 text-red-600" />
      </div>

      {/* Controls */}
      <div className="card mt-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[180px] flex-1">
          <label className="label flex items-center gap-1"><SearchIcon /> Search</label>
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
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Sort by</label>
          <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="value">Deal value</option>
            <option value="priority">Priority</option>
            <option value="followup">Next follow-up</option>
          </select>
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn-secondary" onClick={resetFilters}>
            <FilterIcon className="mr-1" /> Clear
          </button>
        )}

        {/* View toggle */}
        <div className="ml-auto inline-flex overflow-hidden rounded-lg border border-slate-300">
          <button
            type="button"
            onClick={() => setView('board')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm ${view === 'board' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <BoardIcon /> Board
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <ListIcon /> Cards
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon /> {error}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="card py-16 text-center">
            <p className="text-slate-500">
              {hasActiveFilters ? 'No opportunities match your filters.' : 'No opportunities yet.'}
            </p>
            {hasActiveFilters ? (
              <button type="button" className="btn-secondary mt-4" onClick={resetFilters}>Clear filters</button>
            ) : (
              <button type="button" className="btn-primary mt-4" onClick={() => setShowForm(true)}>
                <PlusIcon className="mr-1.5" /> Create your first opportunity
              </button>
            )}
          </div>
        ) : view === 'board' ? (
          <KanbanBoard
            opportunities={opportunities}
            currentUserId={user?._id}
            onEdit={setEditing}
            onDelete={setDeleting}
            onStageChange={handleStageChange}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((o) => (
              <OpportunityCard
                key={o._id}
                opportunity={o}
                isOwner={o.owner?._id === user?._id}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

      {(showForm || editing) && (
        <OpportunityForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onClose={() => (editing ? setEditing(null) : setShowForm(false))}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete opportunity?"
        message={deleting ? `"${deleting.customerName}" will be permanently removed. This cannot be undone.` : ''}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </main>
  );
}

function SummaryCard({ label, value, icon, accent = 'text-slate-800', iconBg = 'bg-indigo-100 text-indigo-600' }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      {icon && <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg ${iconBg}`}>{icon}</span>}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`mt-0.5 text-xl font-bold ${accent}`}>{value}</p>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card space-y-3 p-5">
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-3 w-full" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
          <div className="skeleton h-3 w-1/2" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
