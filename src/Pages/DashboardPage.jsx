import { useState, useEffect } from "react";
import { api } from "../API/axios";
import { useNavigate, Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import RoomCard from "../Components/RoomCard";
import { generateRoomThumbnail } from "../utils/imageGenerator";
import "../CSS/dashboard.css";

export default function DashboardPage() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchRooms = async () => {
        try {
            const res = await api.get("/room/allRooms");
            setRooms(res.data || []);
        } catch (err) {
            console.error("Failed to fetch rooms:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchRooms();
    };

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(fetchRooms, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="loading-state">Loading debates...</div>;

    return (
        <div className="dashboard-container">

            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Live Debates</h1>
                    <button 
                        className={`refresh-btn ${refreshing ? "spinning" : ""}`}
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Refresh rooms"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                <div className="dashboard-header-buttons">
                    <Link to="/join">
                        <button>Join Room</button>
                    </Link>
                    <Link to="/create-room">
                        <button>Host Room</button>
                    </Link>
                </div>
            </div>

            {/* Empty State */}
            {rooms.length === 0 && (
                <div className="dashboard-empty">
                    <h2>No Rooms Available</h2>
                    <Link to="/create-room">
                        <button>Create Room</button>
                    </Link>
                </div>
            )}

            {/* Rooms */}
            <div className="dashboard-rooms">
                {rooms.map((room) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        thumbnail={generateRoomThumbnail(room.roomName, "debate", "loremflickr")}
                        type="public"
                        onRoomClick={() => navigate(`/room/${room.id}`)}
                        onJoinAudience={async (roomId) => {
                            try {
                                const res = await api.post(
                                    `/room/${roomId}/tokenForAuidence`
                                );
                                const token = res.data;
                                navigate(`/room/${roomId}?role=audience&token=${token}`);
                            } catch (err) {
                                console.error("Join failed:", err);
                            }
                        }}
                    />
                ))}
            </div>

        </div>
    );
}