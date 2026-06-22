import { useState } from 'react';
import { STAGES, STAGE_STYLES, PRIORITY_STYLES } from '../constants.js';
import { formatCompactCurrency, formatDate } from '../utils/format.js';
import { EditIcon, TrashIcon, CalendarIcon } from './icons.jsx';

// A compact card used inside board columns. Owner cards are draggable.
function BoardCard({ opportunity, isOwner, onEdit, onDelete, onDragStart, onDragEnd }) {
  const { customerName, requirement, estimatedValue, priority, nextFollowUpDate, owner } = opportunity;

  return (
    <div
      draggable={isOwner}
      onDragStart={(e) => isOwner && onDragStart(e, opportunity)}
      onDragEnd={onDragEnd}
      className={`card p-3 text-sm transition ${
        isOwner ? 'cursor-grab hover:shadow-md active:cursor-grabbing' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate font-medium text-slate-800">{customerName}</p>
        {isOwner && (
          <span className="shrink-0 rounded-full bg-indigo-50 px-1.5 text-[10px] font-medium text-indigo-600">
            You
          </span>
        )}
      </div>
      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{requirement}</p>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-semibold text-slate-700">{formatCompactCurrency(estimatedValue)}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_STYLES[priority] || ''}`}>
          {priority}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <CalendarIcon /> {formatDate(nextFollowUpDate)}
        </span>
        {isOwner ? (
          <span className="flex gap-1.5">
            <button type="button" className="hover:text-indigo-600" onClick={() => onEdit(opportunity)} aria-label="Edit">
              <EditIcon />
            </button>
            <button type="button" className="hover:text-red-600" onClick={() => onDelete(opportunity)} aria-label="Delete">
              <TrashIcon />
            </button>
          </span>
        ) : (
          <span className="truncate pl-1">{owner?.name}</span>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ opportunities, currentUserId, onEdit, onDelete, onStageChange }) {
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  const onDragStart = (e, opp) => {
    setDragId(opp._id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragEnd = () => {
    setDragId(null);
    setOverStage(null);
  };
  const onDrop = (stage) => {
    const opp = opportunities.find((o) => o._id === dragId);
    if (opp && opp.stage !== stage) onStageChange(opp, stage);
    onDragEnd();
  };

  return (
    <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-3">
      {STAGES.map((stage) => {
        const items = opportunities.filter((o) => o.stage === stage);
        const total = items.reduce((s, o) => s + (o.estimatedValue || 0), 0);
        const isOver = overStage === stage;

        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragId) setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => onDrop(stage)}
            className={`flex w-72 shrink-0 flex-col rounded-xl border p-3 transition ${
              isOver ? 'border-indigo-400 bg-indigo-50/60' : 'border-slate-200 bg-slate-100/60'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_STYLES[stage] || ''}`}>
                  {stage}
                </span>
                <span className="text-xs font-medium text-slate-400">{items.length}</span>
              </div>
              <span className="text-xs font-medium text-slate-500">{formatCompactCurrency(total)}</span>
            </div>

            <div className="flex min-h-[60px] flex-col gap-2">
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                  {isOver ? 'Drop here' : 'No opportunities'}
                </p>
              ) : (
                items.map((o) => (
                  <BoardCard
                    key={o._id}
                    opportunity={o}
                    isOwner={o.owner?._id === currentUserId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
