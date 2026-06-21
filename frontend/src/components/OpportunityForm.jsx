import { useState } from 'react';
import { STAGES, PRIORITIES } from '../constants.js';

const EMPTY = {
  customerName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  requirement: '',
  estimatedValue: '',
  stage: 'New',
  priority: 'Medium',
  nextFollowUpDate: '',
  notes: '',
};

// Convert an ISO date string to the yyyy-mm-dd format an <input type="date"> expects.
const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export default function OpportunityForm({ initial, onSubmit, onClose }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(
    initial
      ? {
          customerName: initial.customerName || '',
          contactName: initial.contactName || '',
          contactEmail: initial.contactEmail || '',
          contactPhone: initial.contactPhone || '',
          requirement: initial.requirement || '',
          estimatedValue: initial.estimatedValue ?? '',
          stage: initial.stage || 'New',
          priority: initial.priority || 'Medium',
          nextFollowUpDate: toDateInput(initial.nextFollowUpDate),
          notes: initial.notes || '',
        }
      : EMPTY
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.customerName.trim() || !form.requirement.trim()) {
      setError('Customer name and requirement are required.');
      return;
    }
    if (form.estimatedValue !== '' && Number(form.estimatedValue) < 0) {
      setError('Estimated value must be non-negative.');
      return;
    }

    const payload = {
      ...form,
      estimatedValue: form.estimatedValue === '' ? 0 : Number(form.estimatedValue),
      nextFollowUpDate: form.nextFollowUpDate || null,
    };

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save opportunity.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4">
      <div className="card my-8 w-full max-w-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {isEdit ? 'Edit Opportunity' : 'New Opportunity'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submit}>
          <div className="sm:col-span-2">
            <label className="label">Customer / Company name *</label>
            <input name="customerName" className="input" value={form.customerName} onChange={onChange} required />
          </div>

          <div>
            <label className="label">Contact person</label>
            <input name="contactName" className="input" value={form.contactName} onChange={onChange} />
          </div>
          <div>
            <label className="label">Contact phone</label>
            <input name="contactPhone" className="input" value={form.contactPhone} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Contact email</label>
            <input name="contactEmail" type="email" className="input" value={form.contactEmail} onChange={onChange} />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Requirement / need summary *</label>
            <textarea name="requirement" rows={2} className="input" value={form.requirement} onChange={onChange} required />
          </div>

          <div>
            <label className="label">Estimated value</label>
            <input name="estimatedValue" type="number" min="0" step="any" className="input" value={form.estimatedValue} onChange={onChange} />
          </div>
          <div>
            <label className="label">Next follow-up date</label>
            <input name="nextFollowUpDate" type="date" className="input" value={form.nextFollowUpDate} onChange={onChange} />
          </div>

          <div>
            <label className="label">Stage</label>
            <select name="stage" className="input" value={form.stage} onChange={onChange}>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select name="priority" className="input" value={form.priority} onChange={onChange}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea name="notes" rows={3} className="input" value={form.notes} onChange={onChange} />
          </div>

          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
