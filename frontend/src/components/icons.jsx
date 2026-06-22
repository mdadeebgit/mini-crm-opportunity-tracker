// Lightweight inline SVG icons (no external icon dependency).
// All accept standard svg props (className, etc.) and inherit currentColor.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
};

export const PlusIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const SearchIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const EditIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
export const TrashIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
);
export const LogoutIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>
);
export const BoardIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></svg>
);
export const ListIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
);
export const BuildingIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" /><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" /></svg>
);
export const CalendarIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const RupeeIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M6 3h12M6 8h12M6 13l8.5 8M9 8c4 0 4 5 0 5H6" /></svg>
);
export const UserIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const CheckIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M20 6 9 17l-5-5" /></svg>
);
export const XIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const AlertIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
);
export const FilterIcon = (p) => (
  <svg {...base} width="1em" height="1em" {...p}><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3Z" /></svg>
);
