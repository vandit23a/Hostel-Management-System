import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const WardenDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [complaints, setComplaints] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const [
                    studentsResponse,
                    roomsResponse,
                    allocationsResponse,
                    complaintsResponse
                ] = await Promise.all([
                    api.get("/students", { headers }),
                    api.get("/rooms", { headers }),
                    api.get("/allocations", { headers }),
                    api.get("/complaints", { headers })
                ]);

                setStudents(
                    studentsResponse.data.students || []
                );

                setRooms(
                    roomsResponse.data.rooms || []
                );

                setAllocations(
                    allocationsResponse.data.allocations || []
                );

                setComplaints(
                    complaintsResponse.data.complaints || []
                );
            } catch (error) {
                console.error(
                    "Warden dashboard error:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    const activeAllocations = allocations.filter(
        (allocation) =>
            allocation.status === "ACTIVE"
    );

    const pendingComplaints = complaints.filter(
        (complaint) =>
            complaint.status === "PENDING" ||
            complaint.status === "IN_PROGRESS"
    );

    const availableRooms = rooms.filter(
        (room) =>
            room.status === "AVAILABLE" &&
            (room.occupiedCount || 0) <
                (room.capacity || 0)
    );

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Warden Dashboard</h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user?.name || "Warden"}
                        </strong>
                    </p>
                </div>
            </div>

            <div className="stat-grid">

                <div className="stat-card">
                    <div className="stat-card-title">
                        Total Students
                    </div>

                    <p className="stat-card-value">
                        {students.length}
                    </p>
                </div>

                <div className="stat-card">
                    <div className="stat-card-title">
                        Total Rooms
                    </div>

                    <p className="stat-card-value">
                        {rooms.length}
                    </p>
                </div>

                <div className="stat-card">
                    <div className="stat-card-title">
                        Active Allocations
                    </div>

                    <p className="stat-card-value">
                        {activeAllocations.length}
                    </p>
                </div>

                <div className="stat-card">
                    <div className="stat-card-title">
                        Pending Complaints
                    </div>

                    <p className="stat-card-value dashboard-warning-text">
                        {pendingComplaints.length}
                    </p>
                </div>

            </div>

            <div className="dashboard-two-column">

                <div className="dashboard-card">

                    <h2>Room Overview</h2>

                    <p>
                        Current room availability.
                    </p>

                    <div className="info-list">

                        <div className="info-row">
                            <span>Total Rooms</span>
                            <strong>{rooms.length}</strong>
                        </div>

                        <div className="info-row">
                            <span>Available Rooms</span>
                            <strong className="dashboard-success-text">
                                {availableRooms.length}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>Occupied Rooms</span>
                            <strong>
                                {rooms.filter(
                                    (room) =>
                                        (room.occupiedCount || 0) >
                                        0
                                ).length}
                            </strong>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/warden/rooms")
                        }
                    >
                        Manage Rooms
                    </button>

                </div>

                <div className="dashboard-card">

                    <h2>Complaints</h2>

                    <p>
                        Complaints requiring attention.
                    </p>

                    {pendingComplaints.length > 0 ? (
                        <div className="info-list">

                            {pendingComplaints
                                .slice(0, 3)
                                .map((complaint) => (
                                    <div
                                        className="info-row"
                                        key={complaint._id}
                                    >
                                        <span>
                                            {complaint.title ||
                                                "Complaint"}
                                        </span>

                                        <span className="badge badge-warning">
                                            {complaint.status}
                                        </span>
                                    </div>
                                ))}

                        </div>
                    ) : (
                        <div className="empty-state">
                            No pending complaints.
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/warden/complaints")
                        }
                    >
                        Manage Complaints
                    </button>

                </div>

            </div>

            <div className="dashboard-card quick-actions-card">

                <div className="dashboard-card-header">
                    <div>
                        <h2>Quick Actions</h2>
                        <p>
                            Access your most frequently used
                            management sections.
                        </p>
                    </div>
                </div>

                <div className="quick-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/warden/students")
                        }
                    >
                        Students
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/warden/rooms")
                        }
                    >
                        Rooms
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/warden/allocations")
                        }
                    >
                        Allocations
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/warden/complaints")
                        }
                    >
                        Complaints
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/warden/notices")
                        }
                    >
                        Notices
                    </button>

                </div>

            </div>

        </div>
    );
};

export default WardenDashboard;