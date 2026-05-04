import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../API/axios";
import "../CSS/JoinPage.css";

export default function JoinPage() {
  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState(null);
  const [team, setTeam] = useState("RED");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch room details
  const fetchRoom = async () => {
    if (!roomId) return;

    try {
      const res = await api.get(`/room/${roomId}`);
      setRoom(res.data);
      setMessage("");
    } catch (err) {
      setRoom(null);
      setMessage("Room not found");
    }
  };

  // Join room
  const joinRoom = async () => {
    if (!roomId) {
      setMessage("Enter Room ID");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        `/room/${roomId}/token?team=${team}`
      );

      const token = res.data;

      // Redirect to live room with token
      navigate(`/room/${roomId}`, { 
        state: { token, team } 
      });

    } catch (err) {
      setMessage(err.response?.data || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-page">
      <h2>Join Debate Room</h2>

      {/* Room ID Input */}
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={fetchRoom}>Check</button>
      </div>

      {/* Room Info */}
      {room && (
        <div className="room-info">
          <p><strong>Status:</strong> {room.setLiveAt ? "LIVE" : "NOT STARTED"}</p>
          <p><strong>Participants:</strong> {room.currentParticipantsSize} / {room.totalParticipantsSize}</p>
          <p><strong>Team Size:</strong> {room.teamSize}</p>
        </div>
      )}

      {/* Team Selection */}
      <div className="team-select">
        <button
          className={team === "RED" ? "active red" : ""}
          onClick={() => setTeam("RED")}
        >
          RED
        </button>

        <button
          className={team === "BLUE" ? "active blue" : ""}
          onClick={() => setTeam("BLUE")}
        >
          BLUE
        </button>
      </div>

      <p className="note">
        * Team preference may change based on availability
      </p>

      {/* Join Button */}
      <button onClick={joinRoom} disabled={loading}>
        {loading ? "Joining..." : "Join Room"}
      </button>

      {/* Error / Info */}
      {message && <p className="message">{message}</p>}
    </div>
  );
}