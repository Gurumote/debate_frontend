import { useState } from "react";
import { api } from "../API/axios";
import { useNavigate } from "react-router-dom";
import "../CSS/createRoomPage.css";

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
        debateType: "VIDEO", // ✅ DEFAULT
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
      <div className="auth-card">

        <h2 className="auth-title">Create Debate Room</h2>

        {/* Room Name */}
        <input
          className="auth-input"
          placeholder="Enter room name..."
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        {/* Team Size */}
        <input
          className="auth-input"
          type="number"
          placeholder="Team size (default 4)"
          value={teamSize}
          onChange={(e) => setTeamSize(Number(e.target.value))}
        />

        {/* End Time */}
        <input
          className="auth-input"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <button
          className="auth-btn"
          onClick={createRoom}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Room"}
        </button>

      </div>
    </div>
  );
}