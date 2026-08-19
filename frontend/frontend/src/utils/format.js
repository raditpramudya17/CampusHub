/** Selisih hari (dibulatkan ke atas) dari hari ini sampai tanggal `dateStr`. */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const target = new Date(dateStr);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetEnd = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59);
  return Math.ceil((targetEnd - todayMidnight) / 86400000);
}

/** Format tanggal gaya Indonesia, mis. "24 Juli 2026". */
export function formatDateID(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Label + warna + sublabel "stub" tiket berdasarkan jumlah hari tersisa. */
export function stubFor(days) {
  if (days === null || days === undefined) return { text: '-', color: '#4A5670', sub: '' };
  if (days < 0) return { text: 'Tutup', color: '#4A5670', sub: 'sudah ditutup' };
  if (days === 0) return { text: 'Hari ini', color: '#C0453A', sub: 'menuju tutup' };
  if (days <= 3) return { text: 'H-' + days, color: '#C0453A', sub: 'menuju tutup' };
  if (days <= 10) return { text: 'H-' + days, color: '#1E2A45', sub: 'menuju tutup' };
  return { text: 'H-' + days, color: '#5F7D6B', sub: 'menuju tutup' };
}

export function initials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export const CATEGORY_LABELS = {
  akademik: 'Akademik',
  teknologi: 'IT & Teknologi',
  seni: 'Seni & Kreatif',
  olahraga: 'Olahraga',
  bisnis: 'Bisnis',
  lainnya: 'Lainnya',
};

export function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat;
}

export const FEE_LABELS = { gratis: 'Gratis', berbayar: 'Berbayar' };
export const FORMAT_LABELS = { online: 'Online', offline: 'Offline', hybrid: 'Hybrid' };
export const LEVEL_LABELS = { kampus: 'Kampus', regional: 'Regional', nasional: 'Nasional', internasional: 'Internasional' };
export const VERIFIED_ROLES = ['admin', 'dosen', 'ukm'];

export function feeLabel(v) {
  return FEE_LABELS[v] || v;
}
export function formatLabel(v) {
  return FORMAT_LABELS[v] || v;
}
export function levelLabel(v) {
  return LEVEL_LABELS[v] || v;
}
export function isVerifiedOrganizer(role) {
  return VERIFIED_ROLES.includes(role);
}
