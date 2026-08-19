import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CompetitionService } from '../services/competitionService';
import { UserService } from '../services/userService';
import { AchievementService } from '../services/achievementService';
import { extractErrorMessage } from '../services/errorUtils';
import { categoryLabel, formatDateID } from '../utils/format';

const ROLES = ['mahasiswa', 'dosen', 'ukm', 'eksternal', 'admin'];

const STATUS_BADGE = {
  approved: { label: '✓ Disetujui', color: '#5F7D6B' },
  rejected: { label: '✕ Ditolak', color: '#C0453A' },
};

function RejectForm({ onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState('');
  return (
    <div className="mt-3 flex flex-col gap-2">
      <textarea
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Alasan penolakan (wajib diisi, min. 5 karakter)…"
        className="w-full border-[1.5px] border-red rounded-[3px] bg-white px-3 py-2 font-sans text-[13px] text-navy resize-y"
      />
      <div className="flex gap-2">
        <button
          onClick={() => reason.trim().length >= 5 && onConfirm(reason.trim())}
          disabled={loading || reason.trim().length < 5}
          className="font-mono text-[11px] tracking-[.04em] uppercase px-3.5 py-2 border-[1.5px] border-red rounded-[3px] bg-red text-white disabled:opacity-50 cursor-pointer"
        >
          Kirim Penolakan
        </button>
        <button
          onClick={onCancel}
          className="font-mono text-[11px] tracking-[.04em] uppercase px-3.5 py-2 border-[1.5px] border-navy rounded-[3px] bg-transparent text-navy cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('queue'); // queue | audit | stats | roles

  const [queue, setQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [audit, setAudit] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleSaving, setRoleSaving] = useState(null);

  const [fameQueue, setFameQueue] = useState([]);
  const [fameQueueLoading, setFameQueueLoading] = useState(true);
  const [fameQueueError, setFameQueueError] = useState(null);
  const [fameRejectingId, setFameRejectingId] = useState(null);
  const [fameActionLoading, setFameActionLoading] = useState(false);

  const loadQueue = async () => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const result = await CompetitionService.getAllUnpaged({ status: 'pending' });
      setQueue(result);
    } catch (err) {
      setQueueError(extractErrorMessage(err));
    } finally {
      setQueueLoading(false);
    }
  };

  const loadAudit = async () => {
    setAuditLoading(true);
    try {
      const result = await CompetitionService.getAudit({ size: 30 });
      setAudit(result.data || []);
    } catch (err) {
      // non-blocking
    } finally {
      setAuditLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const result = await CompetitionService.getStats();
      setStats(result);
    } catch (err) {
      // non-blocking
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const result = await UserService.getAllUsers({ size: 50 });
      setUsers(result.data || []);
    } catch (err) {
      // non-blocking
    } finally {
      setUsersLoading(false);
    }
  };

  const loadFameQueue = async () => {
    setFameQueueLoading(true);
    setFameQueueError(null);
    try {
      const result = await AchievementService.getAll({ status: 'pending', size: 100 });
      setFameQueue(result.data || []);
    } catch (err) {
      setFameQueueError(extractErrorMessage(err));
    } finally {
      setFameQueueLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadQueue();
    loadAudit();
    loadStats();
    loadUsers();
    loadFameQueue();
  }, [isAdmin]);

  const approve = async (id) => {
    setActionLoading(true);
    try {
      await CompetitionService.approve(id);
      setQueue((q) => q.filter((c) => c.id !== id));
      loadAudit();
      loadStats();
    } catch (err) {
      setQueueError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async (id, reason) => {
    setActionLoading(true);
    try {
      await CompetitionService.reject(id, reason);
      setQueue((q) => q.filter((c) => c.id !== id));
      setRejectingId(null);
      loadAudit();
      loadStats();
    } catch (err) {
      setQueueError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const approveFame = async (id) => {
    setFameActionLoading(true);
    try {
      await AchievementService.approve(id);
      setFameQueue((q) => q.filter((c) => c.id !== id));
    } catch (err) {
      setFameQueueError(extractErrorMessage(err));
    } finally {
      setFameActionLoading(false);
    }
  };

  const rejectFame = async (id, reason) => {
    setFameActionLoading(true);
    try {
      await AchievementService.reject(id, reason);
      setFameQueue((q) => q.filter((c) => c.id !== id));
      setFameRejectingId(null);
    } catch (err) {
      setFameQueueError(extractErrorMessage(err));
    } finally {
      setFameActionLoading(false);
    }
  };

  const changeRole = async (userId, role) => {
    setRoleSaving(userId);
    try {
      await UserService.updateRole(userId, role);
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (err) {
      // revert visually by reloading
      loadUsers();
    } finally {
      setRoleSaving(null);
    }
  };

  if (!isAdmin) {
    return (
      <section className="max-w-[560px] mx-auto w-full px-6 py-16 flex-1 text-center">
        <h1 className="font-serif font-semibold text-3xl text-navy mb-3">Khusus admin.</h1>
        <p className="text-muted">Halaman ini hanya bisa diakses oleh akun dengan role admin.</p>
      </section>
    );
  }

  const statCards = stats
    ? [
        { label: 'menunggu moderasi', value: stats.byStatus.pending || 0, color: '#E8A93C' },
        { label: 'disetujui', value: stats.byStatus.approved || 0, color: '#5F7D6B' },
        { label: 'ditolak', value: stats.byStatus.rejected || 0, color: '#C0453A' },
        { label: 'total lomba', value: Object.values(stats.byStatus).reduce((a, b) => a + b, 0), color: '#1E2A45' },
      ]
    : [];

  const maxCategory = stats ? Math.max(1, ...Object.values(stats.byCategory)) : 1;

  const TABS = [
    ['queue', `Antrean Lomba (${queue.length})`],
    ['fame', `Antrean Prestasi (${fameQueue.length})`],
    ['audit', 'Riwayat Moderasi'],
    ['stats', 'Statistik'],
    ['roles', 'Manajemen Role'],
  ];

  return (
    <section className="max-w-[1180px] mx-auto w-full px-6 py-12 flex-1">
      <div className="font-mono text-xs tracking-[.12em] uppercase text-red mb-2.5">Khusus Admin</div>
      <h1 className="m-0 mb-6 font-serif font-semibold text-[34px] text-navy">Panel Moderasi</h1>

      <div className="flex gap-1.5 flex-wrap mb-7">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              'font-mono text-[11px] tracking-[.03em] uppercase px-3.5 py-2 border-[1.5px] border-navy rounded-[3px] cursor-pointer transition-colors ' +
              (tab === key ? 'bg-navy text-cream' : 'bg-transparent text-navy hover:bg-navy/10')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        <div>
          {queueError && <div className="text-red font-mono text-sm mb-4">{queueError}</div>}
          {queueLoading ? (
            <div className="text-center py-10 font-mono text-sm text-muted">Memuat antrean…</div>
          ) : queue.length === 0 ? (
            <div className="text-center p-10 border-[1.5px] border-dashed border-line rounded-[4px] text-muted text-sm">
              Antrean kosong — semua kiriman sudah ditinjau. ✓
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {queue.map((q) => (
                <div key={q.id} className="bg-card border-[1.5px] border-navy rounded-[4px] px-5 py-4.5">
                  <div className="font-mono text-[10px] tracking-[.08em] uppercase text-muted mb-1.5">
                    {categoryLabel(q.category)} · oleh {q.author}
                  </div>
                  <div className="font-serif font-semibold text-lg mb-1 text-navy">{q.title}</div>
                  <div className="text-[13.5px] text-muted mb-3.5 line-clamp-2">{q.description}</div>
                  {rejectingId === q.id ? (
                    <RejectForm loading={actionLoading} onCancel={() => setRejectingId(null)} onConfirm={(reason) => reject(q.id, reason)} />
                  ) : (
                    <div className="flex gap-2 flex-wrap items-center">
                      <button
                        onClick={() => approve(q.id)}
                        disabled={actionLoading}
                        className="font-mono text-[11.5px] tracking-[.04em] uppercase px-3.5 py-2.5 border-[1.5px] border-green rounded-[3px] bg-green text-white cursor-pointer hover:bg-[#4a6355] disabled:opacity-50"
                      >
                        ✓ Setujui
                      </button>
                      <button
                        onClick={() => setRejectingId(q.id)}
                        disabled={actionLoading}
                        className="font-mono text-[11.5px] tracking-[.04em] uppercase px-3.5 py-2.5 border-[1.5px] border-red rounded-[3px] bg-transparent text-red cursor-pointer hover:bg-red hover:text-white disabled:opacity-50"
                      >
                        ✕ Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'fame' && (
        <div>
          {fameQueueError && <div className="text-red font-mono text-sm mb-4">{fameQueueError}</div>}
          {fameQueueLoading ? (
            <div className="text-center py-10 font-mono text-sm text-muted">Memuat antrean…</div>
          ) : fameQueue.length === 0 ? (
            <div className="text-center p-10 border-[1.5px] border-dashed border-line rounded-[4px] text-muted text-sm">
              Antrean kosong — semua laporan prestasi sudah ditinjau. ✓
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {fameQueue.map((f) => (
                <div key={f.id} className="bg-card border-[1.5px] border-navy rounded-[4px] px-5 py-4.5">
                  <div className="font-mono text-[10px] tracking-[.08em] uppercase text-muted mb-1.5">
                    {f.rank} · {f.year} · {f.prodi} · oleh {f.author}
                  </div>
                  <div className="font-serif font-semibold text-lg mb-1 text-navy">{f.title}</div>
                  <div className="text-[13.5px] text-muted mb-3.5">{f.teamOrUser}</div>
                  {fameRejectingId === f.id ? (
                    <RejectForm loading={fameActionLoading} onCancel={() => setFameRejectingId(null)} onConfirm={(reason) => rejectFame(f.id, reason)} />
                  ) : (
                    <div className="flex gap-2 flex-wrap items-center">
                      <button
                        onClick={() => approveFame(f.id)}
                        disabled={fameActionLoading}
                        className="font-mono text-[11.5px] tracking-[.04em] uppercase px-3.5 py-2.5 border-[1.5px] border-green rounded-[3px] bg-green text-white cursor-pointer hover:bg-[#4a6355] disabled:opacity-50"
                      >
                        ✓ Setujui
                      </button>
                      <button
                        onClick={() => setFameRejectingId(f.id)}
                        disabled={fameActionLoading}
                        className="font-mono text-[11.5px] tracking-[.04em] uppercase px-3.5 py-2.5 border-[1.5px] border-red rounded-[3px] bg-transparent text-red cursor-pointer hover:bg-red hover:text-white disabled:opacity-50"
                      >
                        ✕ Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div>
          {auditLoading ? (
            <div className="text-center py-10 font-mono text-sm text-muted">Memuat riwayat…</div>
          ) : audit.length === 0 ? (
            <div className="text-center p-10 border-[1.5px] border-dashed border-line rounded-[4px] text-muted text-sm">Belum ada riwayat moderasi.</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {audit.map((a) => {
                const badge = STATUS_BADGE[a.status] || STATUS_BADGE.approved;
                return (
                  <div key={a.id} className="bg-card border-[1.5px] border-navy rounded-[4px] px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-serif font-semibold text-navy">{a.title}</div>
                      <div className="font-mono text-[11px] text-muted mt-1">
                        oleh {a.author} · ditinjau {a.reviewedByUsername || '-'} pada {a.reviewedAt ? formatDateID(a.reviewedAt) : '-'}
                        {a.status === 'rejected' && a.rejectionReason ? ` · alasan: ${a.rejectionReason}` : ''}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] tracking-[.05em] uppercase px-2.5 py-1 rounded-[3px] whitespace-nowrap" style={{ color: badge.color, border: `1.5px solid ${badge.color}` }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div>
          {statsLoading || !stats ? (
            <div className="text-center py-10 font-mono text-sm text-muted">Memuat statistik…</div>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-8">
                {statCards.map((s) => (
                  <div key={s.label} className="bg-card border-[1.5px] border-navy rounded-[4px] p-4.5">
                    <div className="font-mono font-semibold text-[30px]" style={{ color: s.color }}>{s.value}</div>
                    <div className="font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border-[1.5px] border-navy rounded-[4px] p-5">
                  <h3 className="m-0 mb-3.5 font-serif font-semibold text-lg text-navy">Lomba per Kategori</h3>
                  <div className="flex flex-col gap-2.5">
                    {Object.entries(stats.byCategory).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between font-mono text-[11px] text-muted mb-1">
                          <span>{categoryLabel(key)}</span>
                          <span>{value}</span>
                        </div>
                        <div className="h-2 bg-navy/[.08] rounded-[2px]">
                          <div className="h-full bg-navy rounded-[2px]" style={{ width: (value / maxCategory) * 100 + '%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card border-[1.5px] border-navy rounded-[4px] p-5">
                  <h3 className="m-0 mb-3.5 font-serif font-semibold text-lg text-navy">Lomba Paling Banyak Disimpan</h3>
                  {stats.topBookmarked.length === 0 ? (
                    <p className="m-0 text-muted text-sm">Belum ada data bookmark.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {stats.topBookmarked.map((t) => (
                        <div key={t.id} className="flex justify-between gap-3 text-[13px]">
                          <span className="text-navy truncate">{t.title}</span>
                          <span className="font-mono text-muted whitespace-nowrap">♥ {t.bookmarkCount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'roles' && (
        <div className="bg-card border-[1.5px] border-navy rounded-[4px] p-5">
          <h3 className="m-0 mb-4 font-serif font-semibold text-lg text-navy">Manajemen Role</h3>
          {usersLoading ? (
            <div className="text-center py-10 font-mono text-sm text-muted">Memuat pengguna…</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-2.5">
                  <div>
                    <div className="text-[13.5px] font-semibold text-navy">{u.firstName} {u.lastName}</div>
                    <div className="font-mono text-[10.5px] text-muted">{u.email}</div>
                  </div>
                  <select
                    value={u.role}
                    disabled={roleSaving === u.id}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="border-[1.5px] border-navy rounded-[3px] bg-white px-2.5 py-1.5 font-mono text-[11px] text-navy"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
