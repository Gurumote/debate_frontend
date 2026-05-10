import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Hash, CheckCircle, XCircle,
  Swords, Clock, ChevronRight, Loader2, RefreshCw, Trophy
} from 'lucide-react';
import { api } from '../API/axios';
import '../CSS/ProfilePage.css';

/* ── Helpers ── */
const statusLabel = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'LIVE':        return { label: 'LIVE',      cls: 'status--live' };
    case 'INITIALIZED': return { label: 'Scheduled', cls: 'status--init' };
    case 'ENDED':       return { label: 'Ended',     cls: 'status--ended' };
    default:            return { label: status || '—', cls: '' };
  }
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

/* ── Avatar initials ── */
function Avatar({ name, size = 72 }) {
  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="profile-avatar"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-label={`${name} avatar`}
    >
      {initials}
    </div>
  );
}

/* ── Single room card ── */
function RoomCard({ room, onClick }) {
  const { label, cls } = statusLabel(room.roomStatus);
  return (
    <motion.div
      layout
      className="room-card"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.3 }}
      role="button"
      tabIndex={0}
      aria-label={`Room ${room.roomName || room.id}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="room-card__header">
        <span className={`room-status-tag ${cls}`}>{label}</span>
        <ChevronRight size={14} className="room-card__arrow" />
      </div>
      <h3 className="room-card__name">{room.roomName || `Room #${room.id}`}</h3>
      {room.topic && <p className="room-card__topic">{room.topic}</p>}
      <div className="room-card__meta">
        <span className="room-card__meta-item">
          <Clock size={11} />
          {fmtDate(room.setLiveAt || room.createdAt)}
        </span>
        {room.id && (
          <span className="room-card__meta-item">
            <Hash size={11} />
            {room.id}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main page ── */
export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile,  setProfile]  = useState(null);
  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refresh,  setRefresh]  = useState(false);
  const [error,    setError]    = useState('');

  const load = async () => {
    setError('');
    try {
      // Parallel fetch — profile + rooms
      const [profRes, roomsRes] = await Promise.all([
        api.get('/profile/me'),
        api.get('/profile/rooms'),
      ]);
      setProfile(profRes.data);
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleRefresh = () => {
    setRefresh(true);
    load();
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="profile-loading" aria-live="polite">
        <Loader2 size={32} className="spin" />
        <span>Loading your profile…</span>
      </div>
    );
  }

  /* ── Error ── */
  if (error && !profile) {
    return (
      <div className="profile-error" role="alert">
        <XCircle size={28} />
        <span>{error}</span>
        <button className="btn-outline" onClick={load}>Retry</button>
      </div>
    );
  }

  const liveRooms   = rooms.filter(r => (r.roomStatus || '').toUpperCase() === 'LIVE');
  const endedRooms  = rooms.filter(r => (r.roomStatus || '').toUpperCase() === 'ENDED');
  const otherRooms  = rooms.filter(r => !['LIVE','ENDED'].includes((r.roomStatus || '').toUpperCase()));

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* ── Hero card ── */}
        <motion.div
          className="profile-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Avatar */}
          <Avatar name={profile?.username} size={80} />

          {/* Info */}
          <div className="profile-hero__info">
            <div className="profile-hero__name-row">
              <h1 className="profile-hero__name">{profile?.username || 'Debater'}</h1>
              {profile?.isActive ? (
                <span className="active-chip active-chip--yes">
                  <CheckCircle size={11} /> Active
                </span>
              ) : (
                <span className="active-chip active-chip--no">
                  <XCircle size={11} /> Inactive
                </span>
              )}
            </div>

            <div className="profile-hero__fields">
              <div className="profile-field">
                <Mail size={13} className="profile-field__icon" />
                <span>{profile?.Email || profile?.email || '—'}</span>
              </div>
              <div className="profile-field">
                <Hash size={13} className="profile-field__icon" />
                <span className="profile-field--muted">ID: {profile?.userid || '—'}</span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-item__val">{rooms.length}</span>
              <span className="stat-item__lbl">Rooms</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-item__val">{liveRooms.length}</span>
              <span className="stat-item__lbl">Live</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-item__val">{endedRooms.length}</span>
              <span className="stat-item__lbl">Completed</span>
            </div>
          </div>

          {/* Refresh */}
          <button
            className={`profile-refresh ${refresh ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refresh}
            aria-label="Refresh profile"
          >
            <RefreshCw size={15} />
          </button>
        </motion.div>

        {/* ── Rooms section ── */}
        <div className="profile-rooms-section">
          <div className="profile-section-header">
            <Swords size={16} />
            <h2>Debate History</h2>
            <span className="section-count">{rooms.length}</span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="profile-inline-error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {rooms.length === 0 ? (
            <div className="rooms-empty">
              <Trophy size={36} opacity={0.2} />
              <p>No debate rooms yet.</p>
              <button className="btn-cta" onClick={() => navigate('/create-and-join')}>
                Join or Create a Room
              </button>
            </div>
          ) : (
            <>
              {/* Live rooms first */}
              {liveRooms.length > 0 && (
                <div className="rooms-group">
                  <span className="rooms-group__label">🔴 Live Now</span>
                  <div className="rooms-grid">
                    {liveRooms.map(r => (
                      <RoomCard
                        key={r.id}
                        room={r}
                        onClick={() => navigate(`/room/${r.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other / scheduled */}
              {otherRooms.length > 0 && (
                <div className="rooms-group">
                  <span className="rooms-group__label">Scheduled</span>
                  <div className="rooms-grid">
                    {otherRooms.map(r => (
                      <RoomCard
                        key={r.id}
                        room={r}
                        onClick={() => navigate(`/room/${r.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Ended */}
              {endedRooms.length > 0 && (
                <div className="rooms-group">
                  <span className="rooms-group__label">Completed</span>
                  <div className="rooms-grid">
                    {endedRooms.map(r => (
                      <RoomCard key={r.id} room={r} onClick={() => {}} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
