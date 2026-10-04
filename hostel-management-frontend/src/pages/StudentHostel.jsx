import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentHostel = () => {
    const { token } = useAuth();

    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchHostelDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                // First get logged-in student's profile
                const studentResponse = await api.get(
                    "/students/me",
                    { headers }
                );

                const student = studentResponse.data.student;

                // Get User ID safely
                const studentUserId =
                    student?.user?._id ||
                    student?.user?.id ||
                    student?.user;

                if (!studentUserId) {
                    throw new Error(
                        "Student User ID not found."
                    );
                }

                // Get active allocation using User ID
                const allocationResponse = await api.get(
                    `/allocations/student/${studentUserId}/active`,
                    { headers }
                );

                setAllocation(
                    allocationResponse.data.allocation || null
                );

            } catch (error) {
                console.error(
                    "Hostel details error:",
                    error
                );

                // If there is genuinely no allocation
                if (error.response?.status === 404) {
                    setAllocation(null);
                    setError(
                        error.response?.data?.message ||
                        "No active hostel allocation found."
                    );
                } else {
                    setError(
                        error.response?.data?.message ||
                        error.message ||
                        "Failed to load hostel details."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchHostelDetails();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    Loading allocation details...
                </div>
            </div>
        );
    }

    if (error && !allocation) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>My Allocation</h1>
                        <p>
                            View your current hostel and room details.
                        </p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="empty-state">
                        <h3>No Active Allocation</h3>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const room = allocation?.room;

    return (
        <div className="page-container">

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>My Allocation</h1>
                    <p>
                        View your current hostel, room and allocation details.
                    </p>
                </div>

                <span
                    className={`badge ${
                        allocation?.status === "ACTIVE"
                            ? "badge-success"
                            : "badge-warning"
                    }`}
                >
                    {allocation?.status || "N/A"}
                </span>
            </div>

            {/* Hostel Information */}
            <div className="dashboard-card">
                <div className="dashboard-card-header">
                    <div>
                        <h2>Hostel Information</h2>
                        <p>
                            Details of your currently assigned hostel.
                        </p>
                    </div>
                </div>

                <div className="info-list">
                    <div className="info-row">
                        <span>Hostel Name</span>
                        <strong>
                            {room?.hostel?.name || "Not available"}
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>Hostel Code</span>
                        <strong>
                            {room?.hostel?.blockCode || "Not available"}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Room Information */}
            <div className="dashboard-card">
                <div className="dashboard-card-header">
                    <div>
                        <h2>Room Information</h2>
                        <p>
                            Details of your assigned room.
                        </p>
                    </div>
                </div>

                <div className="info-list">
                    <div className="info-row">
                        <span>Room Number</span>
                        <strong>
                            {room?.roomNumber || "Not available"}
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>Capacity</span>
                        <strong>
                            {room?.capacity ?? "Not available"}
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>Occupied</span>
                        <strong>
                            {room?.occupiedCount ?? "Not available"}
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>Room Status</span>
                        <strong>
                            {room?.status || "Not available"}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Allocation Information */}
            <div className="dashboard-card">
                <div className="dashboard-card-header">
                    <div>
                        <h2>Allocation Information</h2>
                        <p>
                            Details about your room allocation.
                        </p>
                    </div>

                    <span
                        className={`badge ${
                            allocation?.status === "ACTIVE"
                                ? "badge-success"
                                : "badge-warning"
                        }`}
                    >
                        {allocation?.status || "N/A"}
                    </span>
                </div>

                <div className="info-list">
                    <div className="info-row">
                        <span>Allocation Status</span>
                        <strong>
                            {allocation?.status || "N/A"}
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>Allocation Date</span>
                        <strong>
                            {allocation?.allocationDate
                                ? new Date(
                                      allocation.allocationDate
                                  ).toLocaleDateString("en-IN")
                                : "Not available"}
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>Vacated Date</span>
                        <strong>
                            {allocation?.vacatedDate
                                ? new Date(
                                      allocation.vacatedDate
                                  ).toLocaleDateString("en-IN")
                                : "Not vacated"}
                        </strong>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default StudentHostel;