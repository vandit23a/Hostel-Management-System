import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const WardenComplaints = () => {
    const navigate = useNavigate();
    const detailsRef = useRef(null);

    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [newStatus, setNewStatus] = useState("");
    const [remarks, setRemarks] = useState("");

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    // =====================================================
    // SCROLL TO DETAILS
    // =====================================================

    useEffect(() => {
        if (selectedComplaint) {
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }, [selectedComplaint]);

    // =====================================================
    // GET ALL COMPLAINTS
    // =====================================================

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/complaints", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log(
                "All complaints response:",
                response.data
            );

            setComplaints(
                response.data.complaints || []
            );

        } catch (error) {
            console.error(
                "Fetch complaints error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load complaints."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            setError("Authentication token not found.");
            setLoading(false);
            return;
        }

        fetchComplaints();
    }, []);

    // =====================================================
    // GET COMPLAINT DETAILS
    // =====================================================

    const handleViewComplaint = async (complaint) => {
        try {
            setDetailsLoading(true);
            setError("");
            setMessage("");

            const complaintId =
                complaint._id ||
                complaint.id;

            console.log(
                "Opening complaint:",
                complaint
            );

            console.log(
                "Complaint ID:",
                complaintId
            );

            if (!complaintId) {
                setError(
                    "Complaint ID not found."
                );
                return;
            }

            const response = await api.get(
                `/complaints/${complaintId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Complaint details response:",
                response.data
            );

            const details =
                response.data.complaint ||
                response.data.data ||
                response.data;

            setSelectedComplaint(details);

            setNewStatus(
                details.status || "PENDING"
            );

            setRemarks(
                details.remarks || ""
            );

        } catch (error) {
            console.error(
                "Get complaint details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load complaint details."
            );

        } finally {
            setDetailsLoading(false);
        }
    };

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    const handleUpdateStatus = async () => {
        if (!selectedComplaint) {
            return;
        }

        const complaintId =
            selectedComplaint._id ||
            selectedComplaint.id;

        if (!complaintId) {
            setError(
                "Complaint ID not found."
            );
            return;
        }

        try {
            setUpdating(true);
            setError("");
            setMessage("");

            const response = await api.put(
                `/complaints/${complaintId}/status`,
                {
                    status: newStatus,
                    remarks: remarks
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Update complaint response:",
                response.data
            );

            setMessage(
                "Complaint status updated successfully."
            );

            // Reload complaint list
            await fetchComplaints();

            // Reload details
            const detailsResponse =
                await api.get(
                    `/complaints/${complaintId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const updatedComplaint =
                detailsResponse.data.complaint ||
                detailsResponse.data.data ||
                detailsResponse.data;

            setSelectedComplaint(
                updatedComplaint
            );

            setNewStatus(
                updatedComplaint.status ||
                "PENDING"
            );

            setRemarks(
                updatedComplaint.remarks ||
                ""
            );

        } catch (error) {
            console.error(
                "Update complaint error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update complaint status."
            );

        } finally {
            setUpdating(false);
        }
    };

    // =====================================================
    // SEARCH + FILTER
    // =====================================================

    const filteredComplaints =
        complaints.filter((complaint) => {

            const studentName =
                complaint.student?.name ||
                complaint.student?.user?.name ||
                complaint.user?.name ||
                "";

            const studentId =
                complaint.student?.studentId ||
                complaint.student?.user?.studentId ||
                "";

            const title =
                complaint.title || "";

            const description =
                complaint.description || "";

            const status =
                complaint.status || "";

            const searchText =
                `${studentName} ${studentId} ${title} ${description}`
                    .toLowerCase();

            const searchMatches =
                searchText.includes(
                    search.toLowerCase()
                );

            const statusMatches =
                statusFilter === "ALL" ||
                status === statusFilter;

            return (
                searchMatches &&
                statusMatches
            );
        });

    return (
        <div className="page-container">

            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <div className="page-header">
                <div>
                    <h1>Warden Complaints</h1>

                    <p>
                        View and manage student complaints
                        and update their status.
                    </p>
                </div>

                <button
                    className="secondary-button"
                    onClick={() =>
                        navigate("/warden")
                    }
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* ================================================= */}
            {/* SEARCH + FILTER */}
            {/* ================================================= */}

            <div className="filter-bar">

                <input
                    type="text"
                    placeholder="Search by student, ID, title or description"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >
                    <option value="ALL">
                        All Status
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="IN_PROGRESS">
                        In Progress
                    </option>

                    <option value="RESOLVED">
                        Resolved
                    </option>
                </select>

                {(search ||
                    statusFilter !== "ALL") && (
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("ALL");
                        }}
                    >
                        Clear
                    </button>
                )}

            </div>

            {/* ================================================= */}
            {/* MESSAGES */}
            {/* ================================================= */}

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {message && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            {/* ================================================= */}
            {/* COMPLAINT DETAILS */}
            {/* MOVED ABOVE LIST */}
            {/* ================================================= */}

            {detailsLoading && (
                <div
                    ref={detailsRef}
                    className="dashboard-card"
                >
                    <h2>Complaint Details</h2>

                    <div className="loading-container">
                        <p>
                            Loading complaint details...
                        </p>
                    </div>
                </div>
            )}

            {selectedComplaint &&
                !detailsLoading && (
                    <div
                        ref={detailsRef}
                        className="dashboard-card"
                    >

                        <div className="dashboard-card-header">
                            <div>
                                <h2>
                                    Complaint Details
                                </h2>

                                <p className="dashboard-muted">
                                    View complaint information
                                    and manage its current status.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setSelectedComplaint(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>
                        </div>

                        <div className="info-list">

                            <div className="info-row">
                                <span>
                                    Title
                                </span>

                                <strong>
                                    {
                                        selectedComplaint.title ||
                                        "N/A"
                                    }
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Description
                                </span>

                                <strong>
                                    {
                                        selectedComplaint.description ||
                                        "N/A"
                                    }
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Current Status
                                </span>

                                <strong>
                                    {
                                        selectedComplaint.status ||
                                        "N/A"
                                    }
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Current Remarks
                                </span>

                                <strong>
                                    {
                                        selectedComplaint.remarks ||
                                        "No remarks"
                                    }
                                </strong>
                            </div>

                        </div>

                        <hr />

                        <h3>
                            Manage Complaint
                        </h3>

                        <div className="form-grid">

                            <div className="form-group">
                                <label>
                                    Status
                                </label>

                                <select
                                    value={newStatus}
                                    onChange={(e) =>
                                        setNewStatus(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="IN_PROGRESS">
                                        In Progress
                                    </option>

                                    <option value="RESOLVED">
                                        Resolved
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    Remarks
                                </label>

                                <textarea
                                    value={remarks}
                                    onChange={(e) =>
                                        setRemarks(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter resolution remarks..."
                                    rows="5"
                                />
                            </div>

                        </div>

                        <div className="dashboard-actions">

                            <button
                                type="button"
                                onClick={
                                    handleUpdateStatus
                                }
                                disabled={updating}
                            >
                                {updating
                                    ? "Updating..."
                                    : "Update Status"}
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setSelectedComplaint(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>
                )}

            {/* ================================================= */}
            {/* COMPLAINT LIST */}
            {/* ================================================= */}

            <div className="dashboard-card">

                <div className="dashboard-card-header">
                    <div>
                        <h2>
                            Complaints
                        </h2>

                        <p className="dashboard-muted">
                            Showing{" "}
                            <strong>
                                {
                                    filteredComplaints.length
                                }
                            </strong>{" "}
                            complaint
                            {filteredComplaints.length !==
                            1
                                ? "s"
                                : ""}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <p>
                            Loading complaints...
                        </p>
                    </div>
                ) : filteredComplaints.length ===
                  0 ? (
                    <div className="empty-state">
                        <h3>
                            No Complaints Found
                        </h3>

                        <p>
                            No complaints match your
                            current search or filter.
                        </p>
                    </div>
                ) : (
                    <div className="card-grid">

                        {filteredComplaints.map(
                            (complaint) => {

                                const complaintId =
                                    complaint._id ||
                                    complaint.id;

                                const status =
                                    complaint.status ||
                                    "PENDING";

                                return (
                                    <div
                                        key={
                                            complaintId
                                        }
                                        className="card"
                                    >

                                        <div className="card-header">
                                            <div>
                                                <h3>
                                                    {
                                                        complaint.title ||
                                                        "Untitled Complaint"
                                                    }
                                                </h3>

                                                <p className="dashboard-muted">
                                                    {complaint.student
                                                        ?.name ||
                                                        complaint
                                                            .student
                                                            ?.user
                                                            ?.name ||
                                                        complaint
                                                            .user
                                                            ?.name ||
                                                        "Student"}
                                                </p>
                                            </div>

                                            <span
                                                className={
                                                    status ===
                                                    "RESOLVED"
                                                        ? "badge badge-success"
                                                        : status ===
                                                          "IN_PROGRESS"
                                                        ? "badge badge-warning"
                                                        : "badge badge-danger"
                                                }
                                            >
                                                {status}
                                            </span>
                                        </div>

                                        <div className="info-list">

                                            <div className="info-row">
                                                <span>
                                                    Student ID
                                                </span>

                                                <strong>
                                                    {
                                                        complaint
                                                            .student
                                                            ?.studentId ||
                                                        complaint
                                                            .student
                                                            ?.user
                                                            ?.studentId ||
                                                        "N/A"
                                                    }
                                                </strong>
                                            </div>

                                            <div className="info-row">
                                                <span>
                                                    Description
                                                </span>

                                                <strong>
                                                    {
                                                        complaint.description ||
                                                        "No description"
                                                    }
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="dashboard-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewComplaint(
                                                        complaint
                                                    )
                                                }
                                            >
                                                {status ===
                                                "RESOLVED"
                                                    ? "View"
                                                    : "View / Manage"}
                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>

        </div>
    );
};

export default WardenComplaints;