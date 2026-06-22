import { STAGE_STYLES, PRIORITY_STYLES } from '../constants.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { BuildingIcon, CalendarIcon, RupeeIcon, UserIcon, EditIcon, TrashIcon } from './icons.jsx';

export default function OpportunityCard({ opportunity, isOwner, onEdit, onDelete }) {
  const { customerName, requirement, estimatedValue, stage, priority, nextFollowUpDate, owner, createdAt } =
    opportunity;

  return (
    <div className="card group flex flex-col p-5 transition hover:shadow-md hover:ring-1 hover:ring-indigo-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-semibold text-slate-800">
            <BuildingIcon className="shrink-0 text-slate-400" />
            <span className="truncate">{customerName}</span>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{requirement}</p>
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

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-1.5 text-slate-500"><RupeeIcon className="text-slate-400" /> Deal value</dt>
          <dd className="font-semibold text-slate-800">{formatCurrency(estimatedValue)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-1.5 text-slate-500"><CalendarIcon className="text-slate-400" /> Follow-up</dt>
          <dd className="text-slate-700">{formatDate(nextFollowUpDate)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-1.5 text-slate-500"><UserIcon className="text-slate-400" /> Owner</dt>
          <dd className="truncate pl-2 text-slate-700">{owner?.name || 'Unknown'}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">{formatDate(createdAt)}</span>
        {isOwner && (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary !px-2.5 !py-1.5 text-xs"
              onClick={() => onEdit(opportunity)}
            >
              <EditIcon className="mr-1" /> Edit
            </button>
            <button
              type="button"
              className="btn-danger !px-2.5 !py-1.5 text-xs"
              onClick={() => onDelete(opportunity)}
            >
              <TrashIcon className="mr-1" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
