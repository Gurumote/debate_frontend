import { useState } from "react";
import { api } from "../API/axios";
import { useNavigate } from "react-router-dom";
import "../CSS/CreateAndJoinPage.css";

export default function CreateAndJoinPage() {
  const [roomName, setRoomName] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get minimum datetime (now + 5 minutes)
  const getMinEndTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const handleCreateAndJoin = async () => {
    if (!roomName.trim()) {
      setError("Room name is required");
      return;
    }
    if (teamSize < 1 || teamSize > 50) {
      setError("Team size must be between 1 and 50");
      return;
    }
    if (!endTime) {
      setError("End time is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const roomBody = {
        roomName: roomName.trim(),
        teamSize: teamSize,
        debateType: "VIDEO",
        endTime: new Date(endTime).toISOString(),
      };

      // Step 1: Create the room → returns room ID
      const createRes = await api.post("/room/createRoom", roomBody);
      const roomId = createRes.data;

      // Step 2: Get HOST token (this also auto-activates the room)
      const tokenRes = await api.post(`/room/${roomId}/token?team=HOST`);
      const token = tokenRes.data;

      // Step 3: Navigate into the live room as HOST
      navigate(`/room/${roomId}`, {
        state: { token, role: "HOST" },
      });
    } catch (err) {
      console.error("Create & Join failed:", err);
      setError(err.response?.data || "Failed to create room. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="caj-page">
      <div className="caj-card">
        {/* Header */}
        <div className="caj-header">
          <div className="caj-icon">⚡</div>
          <h1 className="caj-title">Create & Go Live</h1>
          <p className="caj-subtitle">
            Set up your debate room and jump in instantly as the host
          </p>
        </div>

        {/* Form */}
        <div className="caj-form">
          {/* Room Name */}
          <div className="caj-field">
            <label htmlFor="caj-room-name">Room Name</label>
            <input
              id="caj-room-name"
              type="text"
              placeholder="e.g. AI vs Humanity"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Team Size */}
          <div className="caj-field">
            <label htmlFor="caj-team-size">Team Size</label>
            <div className="caj-stepper">
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setTeamSize(Math.max(1, teamSize - 1))}
                disabled={teamSize <= 1}
              >
                −
              </button>
              <input
                id="caj-team-size"
                type="number"
                min="1"
                max="50"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value)))}
              />
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setTeamSize(Math.min(50, teamSize + 1))}
                disabled={teamSize >= 50}
              >
                +
              </button>
            </div>
            <span className="caj-hint">
              {teamSize} per side · {teamSize * 2 + 1} total (including you)
            </span>
          </div>

          {/* End Time */}
          <div className="caj-field">
            <label htmlFor="caj-end-time">Debate Ends At</label>
            <input
              id="caj-end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={getMinEndTime()}
            />
          </div>

          {/* Error */}
          {error && <div className="caj-error">{error}</div>}

          {/* Actions */}
          <div className="caj-actions">
            <button
              className="caj-btn-secondary"
              onClick={() => navigate("/host-rooms")}
              type="button"
            >
              Cancel
            </button>
            <button
              className="caj-btn-primary"
              onClick={handleCreateAndJoin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="caj-spinner" />
                  Going Live...
                </>
              ) : (
                <>⚡ Create & Go Live</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
