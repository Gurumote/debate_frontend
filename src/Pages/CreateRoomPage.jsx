import { useState } from "react";
import { api } from "../API/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../CSS/createRoomPage.css";
import "../CSS/auth.css";

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const createRoom = async () => {
    if (!roomName.trim()) return;

    setLoading(true);

    try {
      await api.post("/room/createRoom", {
        roomName: roomName,
        teamSize: teamSize || 0,
        debateType: "VIDEO",
        endTime: endTime ? new Date(endTime).toISOString() : null
      });

      navigate("/host-rooms");
    } catch (err) {
      console.error("Room creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
      >

        <div className="auth-header">
          <h2 className="auth-title">Create Debate Room</h2>
          <p className="auth-sub">Set up a new room for your next argument</p>
        </div>

        {/* Room Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="auth-field">
            <input
              className="auth-input"
              placeholder="Enter room name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              id="create-room-name"
              aria-label="Room name"
            />
          </div>

          {/* Team Size */}
          <div className="auth-field">
            <input
              className="auth-input"
              type="number"
              placeholder="Team size (default 4)"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              id="create-team-size"
              aria-label="Team size"
            />
          </div>

          {/* End Time */}
          <div className="auth-field">
            <input
              className="auth-input"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              id="create-end-time"
              aria-label="Debate end time"
            />
          </div>

          <motion.button
            className="auth-btn"
            onClick={createRoom}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Creating..." : "🚀 Create Room"}
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
}