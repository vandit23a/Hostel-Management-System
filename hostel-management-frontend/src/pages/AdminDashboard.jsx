import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [fees, setFees] = useState([]);
    const [payments, setPayments] = useState([]);
    const [complaints, setComplaints] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const results = await Promise.allSettled([
                    api.get("/students", { headers }),
                    api.get("/hostels", { headers }),
                    api.get("/rooms", { headers }),
                    api.get("/allocations", { headers }),
                    api.get("/fees", { headers }),
                    api.get("/payments", { headers }),
                    api.get("/complaints", { headers })
                ]);

                const getData = (result, key) => {
                    if (
                        result.status !== "fulfilled" ||
                        result.value.data.success === false
                    ) {
                        return [];
                    }

                    return result.value.data[key] || [];
                };

                setStudents(
                    getData(results[0], "students")
                );

                setHostels(
                    getData(results[1], "hostels")
                );

                setRooms(
                    getData(results[2], "rooms")
                );

                setAllocations(
                    getData(results[3], "allocations")
                );

                setFees(
                    getData(results[4], "fees")
                );

                setPayments(
                    getData(results[5], "payments")
                );

                setComplaints(
                    getData(results[6], "complaints")
                );
            } catch (error) {
                console.error(
                    "Admin dashboard error:",
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

    const pendingFees = fees.filter(
        (fee) =>
            fee.status !== "PAID"
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
                    <h1>Admin Dashboard</h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user?.name || "Admin"}
                        </strong>
                    </p>
                </div>
            </div>

            {/* Main statistics */}

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
                        Total Hostels
                    </div>

                    <p className="stat-card-value">
                        {hostels.length}
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

            </div>

            {/* Secondary statistics */}

            <div className="stat-grid">

                <div className="stat-card">
                    <div className="stat-card-title">
                        Available Rooms
                    </div>

                    <p className="stat-card-value dashboard-success-text">
                        {availableRooms.length}
                    </p>
                </div>

                <div className="stat-card">
                    <div className="stat-card-title">
                        Pending Fees
                    </div>

                    <p className="stat-card-value dashboard-warning-text">
                        {pendingFees.length}
                    </p>
                </div>

                <div className="stat-card">
                    <div className="stat-card-title">
                        Payments
                    </div>

                    <p className="stat-card-value">
                        {payments.length}
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

            {/* Management overview */}

            <div className="dashboard-two-column">

                <div className="dashboard-card">

                    <h2>Hostel Overview</h2>

                    <p>
                        Quick overview of hostel
                        infrastructure.
                    </p>

                    <div className="info-list">

                        <div className="info-row">
                            <span>Hostels</span>
                            <strong>
                                {hostels.length}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>Rooms</span>
                            <strong>
                                {rooms.length}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>Available Rooms</span>
                            <strong className="dashboard-success-text">
                                {availableRooms.length}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>Active Allocations</span>
                            <strong>
                                {activeAllocations.length}
                            </strong>
                        </div>

                    </div>

                    <div className="dashboard-actions">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/hostels")
                            }
                        >
                            Hostels
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate("/admin/rooms")
                            }
                        >
                            Rooms
                        </button>

                    </div>

                </div>

                <div className="dashboard-card">

                    <h2>Complaints</h2>

                    <p>
                        Complaints requiring attention.
                    </p>

                    {pendingComplaints.length > 0 ? (
                        <div className="info-list">

                            {pendingComplaints
                                .slice(0, 4)
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
                            navigate("/admin/complaints")
                        }
                    >
                        Manage Complaints
                    </button>

                </div>

            </div>

            {/* Quick actions */}

            <div className="dashboard-card quick-actions-card">

                <div className="dashboard-card-header">
                    <div>
                        <h2>Quick Actions</h2>

                        <p>
                            Quickly access hostel
                            management sections.
                        </p>
                    </div>
                </div>

                <div className="quick-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        Students
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/hostels")
                        }
                    >
                        Hostels
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/rooms")
                        }
                    >
                        Rooms
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/allocations")
                        }
                    >
                        Allocations
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/fees")
                        }
                    >
                        Fees
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/payments")
                        }
                    >
                        Payments
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/complaints")
                        }
                    >
                        Complaints
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/notices")
                        }
                    >
                        Notices
                    </button>

                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;