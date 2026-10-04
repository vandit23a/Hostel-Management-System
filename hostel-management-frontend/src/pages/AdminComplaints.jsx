import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminComplaints = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const [newStatus, setNewStatus] = useState("");
    const [remarks, setRemarks] = useState("");
    const [updating, setUpdating] = useState(false);

    // Reference for Complaint Details section
    const detailsRef = useRef(null);

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/complaints",
                authConfig
            );

            console.log(
                "Admin complaints response:",
                response.data
            );

            if (response.data.success !== false) {
                setComplaints(
                    response.data.complaints || []
                );
            } else {
                setError(
                    response.data.message ||
                    "Failed to load complaints."
                );
            }
        } catch (error) {
            console.error(
                "Admin complaints loading error:",
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

    // =========================
    // Scroll to Complaint Details
    // =========================

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

    const getStudentName = (complaint) => {
        if (!complaint?.student) {
            return "N/A";
        }

        if (typeof complaint.student === "object") {
            return complaint.student.name || "N/A";
        }

        return "N/A";
    };

    const getStudentEmail = (complaint) => {
        if (!complaint?.student) {
            return "N/A";
        }

        if (typeof complaint.student === "object") {
            return complaint.student.email || "N/A";
        }

        return "N/A";
    };

    const getStatus = (complaint) => {
        return complaint?.status || "N/A";
    };

    const getComplaintTitle = (complaint) => {
        return complaint?.title || "Untitled Complaint";
    };

    const getComplaintDescription = (complaint) => {
        return complaint?.description || "N/A";
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString();
    };

    const handleView = async (complaint) => {
        try {
            setError("");

            const complaintId =
                complaint._id || complaint.id;

            const response = await api.get(
                `/complaints/${complaintId}`,
                authConfig
            );

            console.log(
                "Complaint details response:",
                response.data
            );

            const details =
                response.data.complaint ||
                response.data;

            setSelectedComplaint(details);

            setNewStatus(details.status || "");
            setRemarks(details.remarks || "");
        } catch (error) {
            console.error(
                "Complaint details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load complaint details."
            );
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedComplaint) {
            return;
        }

        if (!newStatus) {
            alert("Please select a status.");
            return;
        }

        try {
            setUpdating(true);
            setError("");

            const complaintId =
                selectedComplaint._id ||
                selectedComplaint.id;

            const response = await api.put(
                `/complaints/${complaintId}/status`,
                {
                    status: newStatus,
                    remarks: remarks
                },
                authConfig
            );

            console.log(
                "Update complaint response:",
                response.data
            );

            if (response.data.success === false) {
                setError(
                    response.data.message ||
                    "Failed to update complaint."
                );
                return;
            }

            alert("Complaint status updated successfully.");

            setSelectedComplaint(null);
            setNewStatus("");
            setRemarks("");

            await fetchComplaints();
        } catch (error) {
            console.error(
                "Complaint status update error:",
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

    const filteredComplaints = complaints.filter(
        (complaint) => {
            const searchText =
                search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                getComplaintTitle(complaint)
                    .toLowerCase()
                    .includes(searchText) ||
                getComplaintDescription(complaint)
                    .toLowerCase()
                    .includes(searchText) ||
                getStudentName(complaint)
                    .toLowerCase()
                    .includes(searchText) ||
                getStudentEmail(complaint)
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                !statusFilter ||
                getStatus(complaint) === statusFilter;

            return matchesSearch && matchesStatus;
        }
    );

    if (loading) {
        return (
            <div>
                <h1>Admin Complaints</h1>
                <p>Loading complaints...</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Admin Complaints</h1>

            <button
                type="button"
                onClick={() => navigate("/admin")}
            >
                Back to Admin Dashboard
            </button>

            <hr />

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <h2>Complaint Management</h2>

            <div>
                <input
                    type="text"
                    placeholder="Search by title, description, student name or email"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                {" "}

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="">
                        All Statuses
                    </option>

                    <option value="PENDING">
                        PENDING
                    </option>

                    <option value="IN_PROGRESS">
                        IN_PROGRESS
                    </option>

                    <option value="RESOLVED">
                        RESOLVED
                    </option>
                </select>
            </div>

            <hr />

            {/* ========================= */}
            {/* COMPLAINT DETAILS */}
            {/* ========================= */}

            {selectedComplaint && (
                <div
                    ref={detailsRef}
                    style={{
                        border: "2px solid #333",
                        borderRadius: "8px",
                        padding: "20px",
                        marginTop: "20px",
                        marginBottom: "30px"
                    }}
                >
                    <h2>
                        Complaint Details
                    </h2>

                    <p>
                        <strong>
                            Title:
                        </strong>{" "}
                        {getComplaintTitle(
                            selectedComplaint
                        )}
                    </p>

                    <p>
                        <strong>
                            Student:
                        </strong>{" "}
                        {getStudentName(
                            selectedComplaint
                        )}
                    </p>

                    <p>
                        <strong>
                            Email:
                        </strong>{" "}
                        {getStudentEmail(
                            selectedComplaint
                        )}
                    </p>

                    <p>
                        <strong>
                            Description:
                        </strong>{" "}
                        {getComplaintDescription(
                            selectedComplaint
                        )}
                    </p>

                    <p>
                        <strong>
                            Current Status:
                        </strong>{" "}
                        {getStatus(
                            selectedComplaint
                        )}
                    </p>

                    <p>
                        <strong>
                            Created:
                        </strong>{" "}
                        {formatDate(
                            selectedComplaint.createdAt
                        )}
                    </p>

                    <hr />

                    <h3>
                        Manage Complaint
                    </h3>

                    <label>
                        Status:
                    </label>

                    {" "}

                    <select
                        value={newStatus}
                        onChange={(e) =>
                            setNewStatus(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            Select Status
                        </option>

                        <option value="PENDING">
                            PENDING
                        </option>

                        <option value="IN_PROGRESS">
                            IN_PROGRESS
                        </option>

                        <option value="RESOLVED">
                            RESOLVED
                        </option>
                    </select>

                    <br />
                    <br />

                    <label>
                        Remarks:
                    </label>

                    <br />

                    <textarea
                        rows="5"
                        cols="50"
                        placeholder="Enter resolution remarks"
                        value={remarks}
                        onChange={(e) =>
                            setRemarks(
                                e.target.value
                            )
                        }
                    />

                    <br />
                    <br />

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

                    {" "}

                    <button
                        type="button"
                        onClick={() => {
                            setSelectedComplaint(
                                null
                            );
                            setNewStatus("");
                            setRemarks("");
                        }}
                    >
                        Close
                    </button>
                </div>
            )}

            {/* ========================= */}
            {/* COMPLAINT COUNT */}
            {/* ========================= */}

            <p>
                Total Complaints:{" "}
                {filteredComplaints.length}
            </p>

            {/* ========================= */}
            {/* COMPLAINT LIST */}
            {/* ========================= */}

            {filteredComplaints.length === 0 ? (
                <p>No complaints found.</p>
            ) : (
                filteredComplaints.map(
                    (complaint) => {
                        const complaintId =
                            complaint._id ||
                            complaint.id;

                        return (
                            <div
                                key={complaintId}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "15px",
                                    marginBottom: "10px"
                                }}
                            >
                                <h3>
                                    {getComplaintTitle(
                                        complaint
                                    )}
                                </h3>

                                <p>
                                    <strong>
                                        Student:
                                    </strong>{" "}
                                    {getStudentName(
                                        complaint
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Email:
                                    </strong>{" "}
                                    {getStudentEmail(
                                        complaint
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Description:
                                    </strong>{" "}
                                    {getComplaintDescription(
                                        complaint
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{" "}
                                    {getStatus(
                                        complaint
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Created:
                                    </strong>{" "}
                                    {formatDate(
                                        complaint.createdAt
                                    )}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleView(
                                            complaint
                                        )
                                    }
                                >
                                    View / Manage
                                </button>
                            </div>
                        );
                    }
                )
            )}
        </div>
    );
};

export default AdminComplaints;