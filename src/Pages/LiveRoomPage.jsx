import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../API/axios';
import { motion } from 'framer-motion';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import { Swords, Eye, Shield, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import '../CSS/LiveRoom.css';

const ROLE_OPTIONS = [
  {
    id: 'RED',
    label: 'Join PRO Side',
    icon: Swords,
    variant: 'role-option--pro',
  },
  {
    id: 'BLUE',
    label: 'Join CON Side',
    icon: Swords,
    variant: 'role-option--con',
  },
  {
    id: 'HOST',
    label: 'Join as HOST',
    icon: Shield,
    variant: 'role-option--host',
    span: true,
  },
  {
    id: 'AUDIENCE',
    label: 'Watch as Audience',
    icon: Eye,
    variant: 'role-option--watch',
    span: true,
  },
];

export default function LiveRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [roleSelection, setRoleSelection] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voteCasted, setVoteCasted] = useState(null);

  const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://your-livekit-server-url.com';

  const fetchToken = async (role) => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (role === 'AUDIENCE') {
        res = await api.post(`/room/${roomId}/tokenForAuidence`);
      } else {
        res = await api.post(`/room/${roomId}/token`, null, { params: { team: role } });
      }

      const tokenStr = res.data?.token || res.data;
      if (tokenStr && typeof tokenStr === 'string') {
        setToken(tokenStr);
        setRoleSelection(false);
      } else {
        setError('Did not receive a valid token from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (team) => {
    try {
      await api.post(`/vote/${roomId}/vote`, null, { params: { team } });
      setVoteCasted(team);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote.');
    }
  };

  const leaveRoom = async () => {
    try {
      await api.post(`/room/${roomId}/leave`);
    } catch (err) {
      console.error(err);
    }
    navigate('/dashboard');
  };

  // ── Role Selection Screen ──
  if (roleSelection) {
    return (
      <div className="role-selection-page">
        <div className="role-bg-glow" aria-hidden="true" />

        <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="back-link"
            aria-label="Go back to dashboard"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Back to Dashboard
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            className="role-card"
          >
            <h1>Choose Your Role</h1>
            <p className="role-subtitle">
              Pick a side or watch the action unfold.
            </p>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="role-error"
                role="alert"
              >
                {error}
              </motion.div>
            )}

            {/* Role grid */}
            <div className="role-grid">
              {ROLE_OPTIONS.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.button
                    key={role.id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    onClick={() => fetchToken(role.id)}
                    className={`role-option ${role.variant} ${role.span ? 'span-full' : ''}`}
                    aria-label={role.label}
                  >
                    <Icon
                      className="role-icon"
                      size={28}
                      aria-hidden="true"
                    />
                    <span className="role-label">{role.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Loading */}
            {loading && (
              <div className="role-loading" role="status" aria-label="Joining room">
                <Loader2 size={28} className="role-icon" style={{ animation: 'spin 0.8s linear infinite', color: 'var(--cta)' }} />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Active Debate Room ──
  return (
    <div className="live-room-container">
      {/* Top Bar */}
      <div className="live-topbar">
        <div className="topbar-left">
          <div className="live-dot" aria-hidden="true" />
          <span className="arena-title">
            Arena #{roomId}
          </span>
        </div>

        <div className="topbar-right">
          {/* Vote PRO (Sage) */}
          <button
            onClick={() => castVote('RED')}
            disabled={voteCasted !== null}
            className={`vote-btn vote-pro ${voteCasted === 'RED' ? 'voted' : ''}`}
            aria-label={voteCasted === 'RED' ? 'You voted PRO' : 'Vote PRO'}
          >
            {voteCasted === 'RED' ? '✓ PRO' : 'PRO'}
          </button>

          <span className="vs-divider" aria-hidden="true">VS</span>

          {/* Vote CON (Orange) */}
          <button
            onClick={() => castVote('BLUE')}
            disabled={voteCasted !== null}
            className={`vote-btn vote-con ${voteCasted === 'BLUE' ? 'voted' : ''}`}
            aria-label={voteCasted === 'BLUE' ? 'You voted CON' : 'Vote CON'}
          >
            {voteCasted === 'BLUE' ? '✓ CON' : 'CON'}
          </button>

          <div className="topbar-separator" aria-hidden="true" />

          {/* Leave */}
          <button
            onClick={leaveRoom}
            className="leave-btn"
            aria-label="Leave the debate room"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* LiveKit Interface */}
      <div className="livekit-area">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={LIVEKIT_URL}
          style={{ height: '100%', width: '100%' }}
          onDisconnected={leaveRoom}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}
