import {useAuth} from "../context/AuthContext.jsx";
import {Navigate, Route, Routes} from "react-router-dom";
import {Suspense} from "react";
import AuthPage from "../Pages/Auth.jsx";
import Nav from "../Pages/Nav.jsx";
import DashboardPage from "../Pages/DashboardPage.jsx";
import CreateRoomPage from "../Pages/CreateRoomPage.jsx";
import HostRoomsPage from "../Pages/HostRoomsPage.jsx";
import JoinPage from "../Pages/JoinPage.jsx";
import ActivateRoom from "../Components/ActivateRoom.jsx";

const NavigationWrapper = Nav;

function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { user } = useAuth();
    return !user ? children : <Navigate to="/homepage" replace />;
}
function AppContent() {
    const { loading, user } = useAuth();

    if (loading) {
        return <div className="page-loader">Checking auth...</div>;
    }

    const userStats = {
        wins: user?.wins || 0,
        losses: user?.losses || 0
    };

    return (
        <>
            <NavigationWrapper isLoggedIn={!!user} userStats={userStats} />

            <main className="app-main">
                <Suspense fallback={<div className="page-loader">Loading...</div>}>
                    <Routes>

                        {/* Default */}
                        <Route path="/" element={<Navigate to="/homepage" replace />} />

                        {/* Public */}
                        <Route
                            path="/auth"
                            element={
                                <PublicRoute>
                                    <AuthPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <AuthPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <AuthPage />
                                </PublicRoute>
                            }
                        />

                        {/* Core Pages (DON’T COMMENT THESE) */}
                        {/* Put at least one real page */}
                        <Route
                            path="/homepage"
                            element={
                                <PrivateRoute>
                                    <DashboardPage />
                                </PrivateRoute>
                            }
                        />

                        {/* Protected */}
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <DashboardPage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/create-room"
                            element={
                                <PrivateRoute>
                                    <CreateRoomPage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/join"
                            element={
                                <PrivateRoute>
                                    <JoinPage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/activate-room"
                            element={
                                <PrivateRoute>
                                    <ActivateRoom />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/host-rooms"
                            element={
                                <PrivateRoute>
                                    <HostRoomsPage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/ai-battle"
                            element={
                                <PrivateRoute>
                                    <div>AI Battle</div>
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <div>Profile</div>
                                </PrivateRoute>
                            }
                        />

                        {/* Catch */}
                        <Route path="*" element={<Navigate to="/homepage" replace />} />

                    </Routes>
                </Suspense>
            </main>
        </>
    );
}

export default AppContent;