import { Link, NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Trophy, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../CSS/nav.css";
import logo from "../assets/logo.png";

export default function Nav({ isLoggedIn, userStats = { wins: 0, losses: 0 } }) {
  const [statusText, setStatusText] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef();
  const { user, logout } = useAuth();

  const dynamicStatuses = [
    "3 debates live right now",
    "AI is waiting...",
    "You haven't won today",
    "The bot is warming up...",
    "Top rooms are heating up",
  ];

  useEffect(() => {
    const randomStatus =
      dynamicStatuses[Math.floor(Math.random() * dynamicStatuses.length)];
    setStatusText(randomStatus);
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  return (
    <nav className="site-nav">
      <div className="nav-container">

        {/* LEFT */}
        <div className="nav-left">
          <Link className="brand" to="/homepage">
            <img src={logo} alt="ArgueMind" className="logo-img" />
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* CENTER */}
        <div className={`nav-center${mobileOpen ? " open" : ""}`}>
          <NavLink to="/rooms" className="nav-link" onClick={handleNavClick}>
            Rooms
          </NavLink>
          <NavLink to="/ai-battle" className="nav-link" onClick={handleNavClick}>
            AI Battle
          </NavLink>
          <NavLink to="/leaderboard" className="nav-link" onClick={handleNavClick}>
            Leaderboard
          </NavLink>
        </div>

        {/* STATUS */}
        <div className="nav-status">
          <span className="status-fade">“{statusText}”</span>
        </div>

        {/* RIGHT */}
        <div className="nav-right">
          {isLoggedIn ? (
            <div className="user-profile-nav">

              {/* STATS */}
              <div className="nav-stats">
                <Trophy className="stats-icon" />
                <span className="win">{userStats.wins}W</span>
                <span>-</span>
                <span className="lose">{userStats.losses}L</span>
              </div>

              {/* PROFILE */}
              <div className="profile-wrapper" ref={dropdownRef}>
                <button
                  className="profile-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="profile-avatar">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                </button>

                <div className={`profile-dropdown ${profileOpen ? "open" : ""}`}>
                  <div className="dropdown-header">
                    <span>{user?.username || "User"}</span>
                  </div>

                  <Link to="/profile" className="dropdown-item">
                    Profile
                  </Link>

                  <button className="dropdown-item logout-btn" onClick={logout}>
                    Logout
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="auth-group">
              <Link to="/login" className="nav-link login-text">Login</Link>
              <Link to="/register" className="auth-btn start-debating">
                Start Debating
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}