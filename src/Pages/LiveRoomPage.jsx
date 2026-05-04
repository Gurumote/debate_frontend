import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../API/axios';
import { motion } from 'framer-motion';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
// LiveKit styles are imported via index.css to avoid Vite resolution issues
import { Swords, Eye, Shield, ArrowLeft, LogOut, Loader2 } from 'lucide-react';

const ROLE_OPTIONS = [
  {
    id: 'RED',
    label: 'Join RED Team',
    icon: Swords,
    colors: 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20',
    textColor: 'text-red-400',
    iconColor: 'text-red-500',
  },
  {
    id: 'BLUE',
    label: 'Join BLUE Team',
    icon: Swords,
    colors: 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20',
    textColor: 'text-blue-400',
    iconColor: 'text-blue-500',
  },
  {
    id: 'HOST',
    label: 'Join as HOST',
    icon: Shield,
    colors: 'border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20',
    textColor: 'text-purple-400',
    iconColor: 'text-purple-500',
    span: true,
  },
  {
    id: 'AUDIENCE',
    label: 'Watch as Audience',
    icon: Eye,
    colors: 'border-slate-600/50 bg-slate-800/50 hover:bg-slate-700/50',
    textColor: 'text-slate-300',
    iconColor: 'text-slate-400',
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
      <div className="min-h-[calc(100dvh-var(--nav-height))] w-full flex items-center justify-center p-4 bg-surface-base text-slate-50 relative overflow-hidden">
        <div
          className="absolute top-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="w-full max-w-xl relative z-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-8 text-slate-400 hover:text-white transition-colors font-medium cursor-pointer"
            aria-label="Go back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            Back to Dashboard
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            className="rounded-3xl p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 text-center shadow-lg"
          >
            <h1 className="text-3xl font-heading font-bold mb-3 tracking-tight">
              Choose Your Role
            </h1>
            <p className="text-slate-400 mb-8">
              Pick a side or watch the action unfold.
            </p>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                role="alert"
              >
                {error}
              </motion.div>
            )}

            {/* Role grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROLE_OPTIONS.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.button
                    key={role.id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    onClick={() => fetchToken(role.id)}
                    className={`p-6 rounded-2xl border ${role.colors} transition-all flex flex-col items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${role.span ? 'sm:col-span-2' : ''}`}
                    aria-label={role.label}
                  >
                    <Icon
                      className={`w-8 h-8 ${role.iconColor} group-hover:scale-110 transition-transform`}
                      aria-hidden="true"
                    />
                    <span className={`font-bold ${role.textColor}`}>{role.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Loading */}
            {loading && (
              <div className="mt-8 flex justify-center" role="status" aria-label="Joining room">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Active Debate Room ──
  return (
    <div className="h-[calc(100dvh-var(--nav-height))] w-full bg-surface-base flex flex-col overflow-hidden relative text-slate-50 font-sans">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"
            aria-hidden="true"
          />
          <span className="font-heading font-bold text-lg tracking-tight">
            Arena #{roomId}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Vote Red */}
          <button
            onClick={() => castVote('RED')}
            disabled={voteCasted !== null}
            className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${voteCasted === 'RED'
              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={voteCasted === 'RED' ? 'You voted for Red team' : 'Vote for Red team'}
          >
            {voteCasted === 'RED' ? 'Voted Red' : 'Vote Red'}
          </button>

          <span className="text-slate-600 font-black italic text-sm select-none" aria-hidden="true">
            VS
          </span>

          {/* Vote Blue */}
          <button
            onClick={() => castVote('BLUE')}
            disabled={voteCasted !== null}
            className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${voteCasted === 'BLUE'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
              : 'bg-blue-500/10 text-blue-500 border border-blue-500/30 hover:bg-blue-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={voteCasted === 'BLUE' ? 'You voted for Blue team' : 'Vote for Blue team'}
          >
            {voteCasted === 'BLUE' ? 'Voted Blue' : 'Vote Blue'}
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block" aria-hidden="true" />

          {/* Leave */}
          <button
            onClick={leaveRoom}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm bg-slate-800 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-slate-700 hover:border-red-500/30 cursor-pointer"
            aria-label="Leave the debate room"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* LiveKit Interface */}
      <div className="flex-1 w-full h-full relative z-0 bg-black">
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
