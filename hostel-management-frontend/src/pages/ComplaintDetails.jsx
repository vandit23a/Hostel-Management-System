import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ComplaintDetails = () => {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const response = await api.get(
                    `/complaints/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    setComplaint(response.data.complaint);
                } else {
                    setError(
                        response.data.message ||
                        "Failed to load complaint"
                    );
                }
            } catch (error) {
                console.error(
                    "Complaint details error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load complaint"
                );
            } finally {
                setLoading(false);
            }
        };

        if (token && id) {
            fetchComplaint();
        }
    }, [token, id]);

    if (loading) {
        return (
            <div style={{ padding: "24px" }}>
                <h1>Complaint Details</h1>
                <p>Loading complaint...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    padding: "24px",
                    maxWidth: "800px",
                    margin: "0 auto"
                }}
            >
                <h1>Complaint Details</h1>

                <div
                    style={{
                        padding: "12px",
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        borderRadius: "6px",
                        marginBottom: "20px"
                    }}
                >
                    {error}
                </div>

                <button
                    onClick={() =>
                        navigate("/student/complaints")
                    }
                    style={{
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    Back to Complaints
                </button>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div style={{ padding: "24px" }}>
                <h1>Complaint Details</h1>
                <p>Complaint not found.</p>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "24px",
                maxWidth: "800px",
                margin: "0 auto"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px"
                }}
            >
                <h1 style={{ margin: 0 }}>
                    Complaint Details
                </h1>

                <button
                    onClick={() =>
                        navigate("/student/complaints")
                    }
                    style={{
                        padding: "9px 16px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    Back
                </button>
            </div>

            <div
                style={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "24px",
                    boxShadow:
                        "0 2px 6px rgba(0,0,0,0.05)"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px",
                        marginBottom: "20px"
                    }}
                >
                    <h2 style={{ margin: 0 }}>
                        {complaint.title}
                    </h2>

                    <span
                        style={{
                            padding: "7px 14px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor:
                                complaint.status === "PENDING"
                                    ? "#fef3c7"
                                    : complaint.status ===
                                      "IN_PROGRESS"
                                    ? "#dbeafe"
                                    : "#dcfce7",
                            color:
                                complaint.status === "PENDING"
                                    ? "#92400e"
                                    : complaint.status ===
                                      "IN_PROGRESS"
                                    ? "#1e40af"
                                    : "#166534"
                        }}
                    >
                        {complaint.status}
                    </span>
                </div>

                <div
                    style={{
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "20px"
                    }}
                >
                    <h3>Description</h3>

                    <p
                        style={{
                            color: "#555",
                            lineHeight: "1.6"
                        }}
                    >
                        {complaint.description}
                    </p>
                </div>

                <div
                    style={{
                        borderTop: "1px solid #e5e7eb",
                        marginTop: "20px",
                        paddingTop: "20px"
                    }}
                >
                    <h3>Submitted On</h3>

                    <p style={{ color: "#555" }}>
                        {complaint.createdAt
                            ? new Date(
                                  complaint.createdAt
                              ).toLocaleString()
                            : "N/A"}
                    </p>
                </div>

                <div
                    style={{
                        borderTop: "1px solid #e5e7eb",
                        marginTop: "20px",
                        paddingTop: "20px"
                    }}
                >
                    <h3>Resolution Remarks</h3>

                    <p style={{ color: "#555" }}>
                        {complaint.remarks ||
                            complaint.resolutionRemarks ||
                            "No resolution remarks yet."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;