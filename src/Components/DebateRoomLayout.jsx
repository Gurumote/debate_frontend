import { useState, useEffect, useRef, useCallback } from 'react';
import {
  useParticipants,
  useLocalParticipant,
  useTracks,
  VideoTrack,
  AudioTrack,
  useIsSpeaking,
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Crown, Swords, Eye, Shield } from 'lucide-react';
import '../CSS/DebateRoomLayout.css';

/* ─── Utility: parse metadata ─── */
function useMeta(participant) {
  return (() => {
    try { return JSON.parse(participant?.metadata || '{}'); }
    catch { return {}; }
  })();
}

/* ─── Speaking indicator hook ─── */
function SpeakingRing({ participant }) {
  const isSpeaking = useIsSpeaking(participant);
  return isSpeaking ? <div className="drl-speaking-ring" aria-hidden="true" /> : null;
}

/* ─── Single participant tile ─── */
function ParticipantTile({ participant, size = 'normal', teamColor, canRemove, onRemove, isHost: hostFlag }) {
  const meta = useMeta(participant);
  const isSpeaking = useIsSpeaking(participant);
  const videoTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { participant }
  );
  const audioTracks = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: false }],
    { participant }
  );

  const cameraTrack = videoTracks[0];
  const micTrack = audioTracks[0];

  const isMuted = !micTrack?.publication?.isMuted === false || !micTrack?.publication?.track;
  const isCamOff = !cameraTrack?.publication?.track || cameraTrack?.publication?.isMuted;

  const displayName = participant?.identity || 'Unknown';
  const team = meta?.Team || teamColor || 'neutral';
  const role = meta?.Role || (hostFlag ? 'HOST' : '');

  const tileClass = [
    'drl-tile',
    `drl-tile--${size}`,
    `drl-tile--team-${team.toLowerCase()}`,
    isSpeaking ? 'drl-tile--speaking' : '',
    isCamOff ? 'drl-tile--no-cam' : '',
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      layout
      layoutId={`tile-${participant?.identity}`}
      className={tileClass}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.45 }}
      role="region"
      aria-label={`${displayName} video tile`}
    >
      {/* Video */}
      <div className="drl-tile__video">
        {cameraTrack && cameraTrack.publication?.track ? (
          <VideoTrack trackRef={cameraTrack} className="drl-video-el" />
        ) : (
          <div className="drl-avatar">
            <span>{displayName.slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        {/* Audio (remote only) */}
        {audioTracks.map((track) =>
          track.publication?.track && !participant?.isLocal ? (
            <AudioTrack key={track.publication.trackSid} trackRef={track} />
          ) : null
        )}

        {/* Speaking glow */}
        <SpeakingRing participant={participant} />

        {/* Status badges */}
        <div className="drl-tile__badges">
          {isMuted && <span className="drl-badge drl-badge--muted" aria-label="Muted"><MicOff size={10} /></span>}
          {isCamOff && <span className="drl-badge drl-badge--cam" aria-label="Camera off"><VideoOff size={10} /></span>}
        </div>

        {/* Role crown for host */}
        {role === 'HOST' && (
          <div className="drl-host-crown" aria-label="Host">
            <Crown size={14} />
          </div>
        )}

        {/* Remove button */}
        {canRemove && !participant?.isLocal && (
          <button
            className="drl-remove-btn"
            onClick={() => onRemove?.(participant.identity)}
            aria-label={`Remove ${displayName}`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Nameplate */}
      <div className="drl-tile__nameplate">
        <span className="drl-tile__name">{displayName}</span>
        {role && (
          <span className={`drl-tile__role drl-tile__role--${role.toLowerCase()}`}>
            {role === 'HOST' ? <><Shield size={10} /> Host</> :
             role === 'AUDIENCE' ? <><Eye size={10} /> Viewer</> :
             <><Swords size={10} /> {team}</>}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Team column sub-grid ─── */
function TeamZone({ participants, team, label, teamColor, canRemove, onRemove }) {
  const count = participants.length;

  const gridStyle = (() => {
    if (count === 0) return {};
    if (count === 1) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
    if (count === 2) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr 1fr' };
    if (count <= 4) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(2, 1fr)' };
    if (count <= 6) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(3, 1fr)' };
    return { gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'repeat(auto-fill, 1fr)' };
  })();

  return (
    <div
      className={`drl-team-zone drl-team-zone--${teamColor}`}
      aria-label={`${label} team`}
    >
      {/* Zone label */}
      <div className="drl-zone-label">
        <span className="drl-zone-label__text">{label}</span>
        <span className="drl-zone-label__count">{count}</span>
      </div>

      {/* Empty state */}
      {count === 0 && (
        <div className="drl-zone-empty">
          <Swords size={24} opacity={0.3} />
          <span>Waiting for debaters…</span>
        </div>
      )}

      {/* Participant grid */}
      {count > 0 && (
        <div className="drl-zone-grid" style={gridStyle}>
          <AnimatePresence mode="popLayout">
            {participants.map((p) => (
              <ParticipantTile
                key={p.identity}
                participant={p}
                size={count === 1 ? 'large' : count <= 2 ? 'medium' : 'small'}
                teamColor={teamColor}
                canRemove={canRemove}
                onRemove={onRemove}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─── Host Center Zone ─── */
function HostZone({ hostParticipant, canRemove, onRemove }) {
  return (
    <div className="drl-host-zone" aria-label="Host center">
      <div className="drl-zone-label drl-zone-label--host">
        <Crown size={12} />
        <span className="drl-zone-label__text">HOST</span>
      </div>

      <AnimatePresence mode="wait">
        {hostParticipant ? (
          <ParticipantTile
            key={hostParticipant.identity}
            participant={hostParticipant}
            size="large"
            teamColor="host"
            isHost
            canRemove={canRemove}
            onRemove={onRemove}
          />
        ) : (
          <motion.div
            key="waiting-host"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="drl-host-waiting"
          >
            <Shield size={32} opacity={0.25} />
            <span>Host connecting…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Audience Strip ─── */
function AudienceStrip({ audience }) {
  if (audience.length === 0) return null;
  return (
    <div className="drl-audience-strip" aria-label={`${audience.length} audience members`}>
      <Eye size={12} />
      <span>{audience.length} watching</span>
      <div className="drl-audience-avatars">
        {audience.slice(0, 8).map((p) => (
          <span key={p.identity} className="drl-audience-avatar" title={p.identity}>
            {p.identity.slice(0, 2).toUpperCase()}
          </span>
        ))}
        {audience.length > 8 && (
          <span className="drl-audience-more">+{audience.length - 8}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Main Layout ─── */
export default function DebateRoomLayout({ canRemove = false, onRemove, isAudience = false }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  // Partition participants by team/role from metadata
  const { pro, con, hosts, audience } = (() => {
    const pro = [], con = [], hosts = [], audience = [];
    const all = participants;

    all.forEach((p) => {
      let meta = {};
      try { meta = JSON.parse(p.metadata || '{}'); } catch {}

      const role = meta.Role || meta.team || '';
      const team = meta.Team || '';

      if (role === 'HOST') hosts.push(p);
      else if (role === 'AUDIENCE') audience.push(p);
      else if (team === 'RED' || team === 'PRO') pro.push(p);
      else if (team === 'BLUE' || team === 'CON') con.push(p);
      else {
        // Fallback: try participant attribute or identity hint
        if (p.identity?.toLowerCase().includes('host')) hosts.push(p);
        else audience.push(p);
      }
    });

    return { pro, con, hosts, audience };
  })();

  const hostParticipant = hosts[0] || null;

  // Dynamic class based on participant count
  const totalDebaters = pro.length + con.length;
  const layoutDensity = totalDebaters <= 2 ? 'sparse' : totalDebaters <= 6 ? 'medium' : 'dense';

  return (
    <LayoutGroup>
      {/* Audience viewer banner */}
      {isAudience && (
        <div className="drl-audience-banner" role="status" aria-live="polite">
          <Eye size={14} />
          <span>You're watching live — camera &amp; microphone are off</span>
        </div>
      )}

      <div
        className={`drl-root drl-root--${layoutDensity}`}
        aria-label="Debate room layout"
      >
        {/* PRO team — left column */}
        <TeamZone
          participants={pro}
          team="RED"
          label="PRO"
          teamColor="pro"
          canRemove={canRemove}
          onRemove={onRemove}
        />

        {/* Host — center column */}
        <HostZone
          hostParticipant={hostParticipant}
          canRemove={canRemove}
          onRemove={onRemove}
        />

        {/* CON team — right column */}
        <TeamZone
          participants={con}
          team="BLUE"
          label="CON"
          teamColor="con"
          canRemove={canRemove}
          onRemove={onRemove}
        />
      </div>

      {/* Audience strip at bottom */}
      <AudienceStrip audience={audience} />
    </LayoutGroup>
  );
}
