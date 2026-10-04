import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [allocation, setAllocation] = useState(null);
    const [fee, setFee] = useState(null);
    const [payments, setPayments] = useState([]);
    const [complaints, setComplaints] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                /*
                 * First get the logged-in student's profile.
                 * Allocation records use the User ID, not Student._id.
                 */
                const studentResponse = await api.get(
                    "/students/me",
                    {
                        headers
                    }
                );

                const student =
                    studentResponse.data.student;

                const studentUserId =
                    student?.user?._id ||
                    student?.user?.id;

                if (!studentUserId) {
                    throw new Error(
                        "Student User ID not found."
                    );
                }

                /*
                 * Fetch dashboard data.
                 *
                 * Allocation uses:
                 * /allocations/student/:userId/active
                 */
                const results = await Promise.allSettled([
                    api.get(
                        `/allocations/student/${studentUserId}/active`,
                        {
                            headers
                        }
                    ),

                    api.get(
                        "/fees/my",
                        {
                            headers
                        }
                    ),

                    api.get(
                        "/payments/my",
                        {
                            headers
                        }
                    ),

                    api.get(
                        "/complaints/my",
                        {
                            headers
                        }
                    )
                ]);

                const allocationResult = results[0];
                const feeResult = results[1];
                const paymentResult = results[2];
                const complaintResult = results[3];

                /*
                 * ALLOCATION
                 */
                if (
                    allocationResult.status ===
                        "fulfilled" &&
                    allocationResult.value.data.success !==
                        false
                ) {
                    const data =
                        allocationResult.value.data;

                    setAllocation(
                        data.allocation || null
                    );
                } else {
                    setAllocation(null);

                    console.error(
                        "Student allocation API error:",
                        allocationResult.reason
                    );
                }

                /*
                 * FEE
                 */
                if (
                    feeResult.status ===
                        "fulfilled" &&
                    feeResult.value.data.success !==
                        false
                ) {
                    const data =
                        feeResult.value.data;

                    setFee(
                        data.fee ||
                        data.fees?.[0] ||
                        null
                    );
                } else {
                    setFee(null);

                    console.error(
                        "Student fee API error:",
                        feeResult.reason
                    );
                }

                /*
                 * PAYMENTS
                 */
                if (
                    paymentResult.status ===
                        "fulfilled" &&
                    paymentResult.value.data.success !==
                        false
                ) {
                    const data =
                        paymentResult.value.data;

                    setPayments(
                        data.payments || []
                    );
                } else {
                    setPayments([]);

                    console.error(
                        "Student payment API error:",
                        paymentResult.reason
                    );
                }

                /*
                 * COMPLAINTS
                 */
                if (
                    complaintResult.status ===
                        "fulfilled" &&
                    complaintResult.value.data.success !==
                        false
                ) {
                    const data =
                        complaintResult.value.data;

                    setComplaints(
                        data.complaints || []
                    );
                } else {
                    setComplaints([]);

                    console.error(
                        "Student complaint API error:",
                        complaintResult.reason
                    );
                }

            } catch (error) {
                console.error(
                    "Student dashboard error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to load dashboard information."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    const paidAmount = Number(
        fee?.paidAmount ||
        fee?.paid ||
        0
    );

    const remainingAmount = Number(
        fee?.remainingAmount ||
        fee?.remaining ||
        0
    );

    const totalFee = Number(
        fee?.totalAmount ||
        fee?.amount ||
        0
    );

    const pendingComplaints = complaints.filter(
        (complaint) =>
            complaint.status === "PENDING" ||
            complaint.status === "IN_PROGRESS"
    ).length;

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

            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <div className="page-header">
                <div>
                    <h1>Student Dashboard</h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user?.name || "Student"}
                        </strong>
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* ========================= */}
            {/* STATISTICS */}
            {/* ========================= */}

            <div className="stat-grid">

                <div className="stat-card">
                    <div className="stat-card-title">
                        Room
                    </div>

                    <p className="stat-card-value">
                        {allocation?.room?.roomNumber ||
                            "—"}
                    </p>

                    <span className="dashboard-muted">
                        {allocation?.status ||
                            "Not Allocated"}
                    </span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-title">
                        Total Fee
                    </div>

                    <p className="stat-card-value">
                        ₹
                        {totalFee.toLocaleString(
                            "en-IN"
                        )}
                    </p>

                    <span className="dashboard-muted">
                        Current fee
                    </span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-title">
                        Paid Amount
                    </div>

                    <p className="stat-card-value dashboard-success-text">
                        ₹
                        {paidAmount.toLocaleString(
                            "en-IN"
                        )}
                    </p>

                    <span className="dashboard-muted">
                        Successfully paid
                    </span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-title">
                        Remaining
                    </div>

                    <p className="stat-card-value dashboard-warning-text">
                        ₹
                        {remainingAmount.toLocaleString(
                            "en-IN"
                        )}
                    </p>

                    <span className="dashboard-muted">
                        Amount due
                    </span>
                </div>

            </div>

            {/* ========================= */}
            {/* MAIN CARDS */}
            {/* ========================= */}

            <div className="dashboard-two-column">

                {/* ========================= */}
                {/* ALLOCATION CARD */}
                {/* ========================= */}

                <div className="dashboard-card">

                    <div className="dashboard-card-header">
                        <div>
                            <h2>My Allocation</h2>

                            <p>
                                Your current hostel and
                                room information.
                            </p>
                        </div>

                        <span
                            className={`badge ${
                                allocation?.status ===
                                "ACTIVE"
                                    ? "badge-success"
                                    : "badge-warning"
                            }`}
                        >
                            {allocation?.status ||
                                "NOT ALLOCATED"}
                        </span>
                    </div>

                    {allocation ? (
                        <div className="info-list">

                            <div className="info-row">
                                <span>
                                    Hostel
                                </span>

                                <strong>
                                    {allocation.room
                                        ?.hostel?.name ||
                                        allocation.hostel
                                            ?.name ||
                                        "N/A"}
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Room
                                </span>

                                <strong>
                                    {allocation.room
                                        ?.roomNumber ||
                                        "N/A"}
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Capacity
                                </span>

                                <strong>
                                    {allocation.room
                                        ?.capacity ||
                                        "N/A"}
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Allocation Date
                                </span>

                                <strong>
                                    {allocation.allocationDate
                                        ? new Date(
                                              allocation.allocationDate
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </strong>
                            </div>

                        </div>
                    ) : (
                        <div className="empty-state">
                            <strong>
                                No room allocated
                            </strong>

                            <p>
                                You currently do not
                                have an active room
                                allocation.
                            </p>
                        </div>
                    )}

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/student/hostel"
                            )
                        }
                    >
                        View Allocation
                    </button>

                </div>

                {/* ========================= */}
                {/* FEE CARD */}
                {/* ========================= */}

                <div className="dashboard-card">

                    <div className="dashboard-card-header">
                        <div>
                            <h2>Fee Summary</h2>

                            <p>
                                Your current hostel fee
                                status.
                            </p>
                        </div>

                        {fee?.status && (
                            <span
                                className={`badge ${
                                    fee.status ===
                                    "PAID"
                                        ? "badge-success"
                                        : "badge-warning"
                                }`}
                            >
                                {fee.status}
                            </span>
                        )}
                    </div>

                    {fee ? (
                        <div className="info-list">

                            <div className="info-row">
                                <span>
                                    Total Fee
                                </span>

                                <strong>
                                    ₹
                                    {totalFee.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Paid
                                </span>

                                <strong className="dashboard-success-text">
                                    ₹
                                    {paidAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Remaining
                                </span>

                                <strong className="dashboard-warning-text">
                                    ₹
                                    {remainingAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Due Date
                                </span>

                                <strong>
                                    {fee.dueDate
                                        ? new Date(
                                              fee.dueDate
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </strong>
                            </div>

                        </div>
                    ) : (
                        <div className="empty-state">
                            No fee record found.
                        </div>
                    )}

                    <div className="dashboard-actions">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/student/fees"
                                )
                            }
                        >
                            View Fees
                        </button>

                        {remainingAmount > 0 && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/student/pay"
                                    )
                                }
                            >
                                Pay Fee
                            </button>
                        )}

                    </div>

                </div>

            </div>

            {/* ========================= */}
            {/* BOTTOM CARDS */}
            {/* ========================= */}

            <div className="dashboard-three-column">

                {/* PAYMENTS */}

                <div className="dashboard-card dashboard-small-card">

                    <div className="dashboard-icon">
                        ₹
                    </div>

                    <h3>
                        Payments
                    </h3>

                    <p>
                        {payments.length} payment
                        {payments.length !== 1
                            ? "s"
                            : ""}{" "}
                        recorded.
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/student/payments"
                            )
                        }
                    >
                        Payment History
                    </button>

                </div>

                {/* COMPLAINTS */}

                <div className="dashboard-card dashboard-small-card">

                    <div className="dashboard-icon">
                        !
                    </div>

                    <h3>
                        Complaints
                    </h3>

                    <p>
                        {pendingComplaints} pending
                        complaint
                        {pendingComplaints !== 1
                            ? "s"
                            : ""}.
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/student/complaints"
                            )
                        }
                    >
                        View Complaints
                    </button>

                </div>

                {/* NOTICES */}

                <div className="dashboard-card dashboard-small-card">

                    <div className="dashboard-icon">
                        N
                    </div>

                    <h3>
                        Notices
                    </h3>

                    <p>
                        Check the latest hostel
                        notices.
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/student/notices"
                            )
                        }
                    >
                        View Notices
                    </button>

                </div>

            </div>

        </div>
    );
};

export default StudentDashboard;