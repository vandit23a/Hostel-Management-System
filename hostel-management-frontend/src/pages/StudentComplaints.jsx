import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentComplaints = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await api.get(
                    "/complaints/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    setComplaints(
                        response.data.complaints || []
                    );
                    setError("");
                } else {
                    setError(
                        response.data.message ||
                        "Failed to load complaints"
                    );
                }
            } catch (error) {
                console.error(
                    "Complaints loading error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load complaints"
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchComplaints();
        }
    }, [token]);

    const getStatusClass = (status) => {
        switch (status) {
            case "PENDING":
                return "pending";

            case "IN_PROGRESS":
                return "in-progress";

            case "RESOLVED":
                return "resolved";

            default:
                return "";
        }
    };

    if (loading) {
        return (
            <div>
                <h1>Complaints</h1>
                <p>Loading complaints...</p>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "24px",
                maxWidth: "1000px",
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
                <div>
                    <h1
                        style={{
                            margin: 0,
                            marginBottom: "8px"
                        }}
                    >
                        Complaints
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: "#666"
                        }}
                    >
                        View and manage your hostel complaints.
                    </p>
                </div>

                <button
                    onClick={() =>
                        navigate("/student/complaints/new")
                    }
                    style={{
                        padding: "10px 18px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    + Submit Complaint
                </button>
            </div>

            {error && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        borderRadius: "6px"
                    }}
                >
                    {error}
                </div>
            )}

            {complaints.length === 0 ? (
                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb"
                    }}
                >
                    <h3>No complaints found</h3>

                    <p
                        style={{
                            color: "#666"
                        }}
                    >
                        You have not submitted any complaints yet.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/student/complaints/new")
                        }
                        style={{
                            padding: "10px 18px",
                            backgroundColor: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer"
                        }}
                    >
                        Submit Your First Complaint
                    </button>
                </div>
            ) : (
                <div>
                    {complaints.map((complaint) => (
                        <div
                            key={complaint._id}
                            style={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "20px",
                                marginBottom: "16px",
                                boxShadow:
                                    "0 2px 6px rgba(0,0,0,0.05)"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "flex-start",
                                    gap: "20px"
                                }}
                            >
                                <div>
                                    <h3
                                        style={{
                                            marginTop: 0,
                                            marginBottom: "8px"
                                        }}
                                    >
                                        {complaint.title}
                                    </h3>

                                    <p
                                        style={{
                                            color: "#555",
                                            marginBottom: "12px"
                                        }}
                                    >
                                        {complaint.description}
                                    </p>

                                   <p
    style={{
        margin: 0,
        color: "#777",
        fontSize: "14px"
    }}
>
    Submitted:{" "}
    {complaint.createdAt
        ? new Date(complaint.createdAt).toLocaleDateString()
        : complaint._id
        ? new Date(
              parseInt(
                  complaint._id.substring(0, 8),
                  16
              ) * 1000
          ).toLocaleDateString()
        : "N/A"}
</p>
                                </div>

                                <span
                                    className={getStatusClass(
                                        complaint.status
                                    )}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        backgroundColor:
                                            complaint.status ===
                                            "PENDING"
                                                ? "#fef3c7"
                                                : complaint.status ===
                                                  "IN_PROGRESS"
                                                ? "#dbeafe"
                                                : "#dcfce7",
                                        color:
                                            complaint.status ===
                                            "PENDING"
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
                                    marginTop: "16px",
                                    borderTop:
                                        "1px solid #e5e7eb",
                                    paddingTop: "14px"
                                }}
                            >
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/student/complaints/${complaint._id}`
                                        )
                                    }
                                    style={{
                                        padding:
                                            "8px 16px",
                                        backgroundColor:
                                            "#f3f4f6",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "5px",
                                        cursor: "pointer"
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentComplaints;