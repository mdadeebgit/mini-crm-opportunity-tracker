import { STAGE_STYLES, PRIORITY_STYLES } from '../constants.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    value || 0
  );

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function OpportunityCard({ opportunity, isOwner, onEdit, onDelete }) {
  const { customerName, requirement, estimatedValue, stage, priority, nextFollowUpDate, owner, createdAt } =
    opportunity;

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">{customerName}</h3>
          <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">{requirement}</p>
        </div>
        {isOwner && (
          <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
            You
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLES[stage] || ''}`}>
          {stage}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority] || ''}`}>
          {priority} priority
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-slate-500">Deal value</dt>
        <dd className="text-right font-medium text-slate-800">{formatCurrency(estimatedValue)}</dd>
        <dt className="text-slate-500">Next follow-up</dt>
        <dd className="text-right text-slate-700">{formatDate(nextFollowUpDate)}</dd>
        <dt className="text-slate-500">Owner</dt>
        <dd className="text-right text-slate-700">{owner?.name || 'Unknown'}</dd>
        <dt className="text-slate-500">Created</dt>
        <dd className="text-right text-slate-700">{formatDate(createdAt)}</dd>
      </dl>

      {isOwner && (
        <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => onEdit(opportunity)}>
            Edit
          </button>
          <button type="button" className="btn-danger !px-3 !py-1.5 text-xs" onClick={() => onDelete(opportunity)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
