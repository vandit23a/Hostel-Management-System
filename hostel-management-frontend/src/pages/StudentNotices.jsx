import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentNotices = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await api.get(
                    "/notices",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    setNotices(
                        response.data.notices || []
                    );
                    setError("");
                } else {
                    setError(
                        response.data.message ||
                        "Failed to load notices"
                    );
                }
            } catch (error) {
                console.error(
                    "Notices loading error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load notices"
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchNotices();
        }
    }, [token]);

    if (loading) {
        return (
            <div style={{ padding: "24px" }}>
                <h1>Notices</h1>
                <p>Loading notices...</p>
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
                    marginBottom: "24px"
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        marginBottom: "8px"
                    }}
                >
                    Notices
                </h1>

                <p
                    style={{
                        margin: 0,
                        color: "#666"
                    }}
                >
                    View important hostel notices and announcements.
                </p>
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

            {notices.length === 0 ? (
                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb"
                    }}
                >
                    <h3>No notices available</h3>

                    <p style={{ color: "#666" }}>
                        There are currently no published notices.
                    </p>
                </div>
            ) : (
                <div>
                    {notices.map((notice) => (
                        <div
                            key={notice._id}
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
                                <div style={{ flex: 1 }}>
                                    <h2
                                        style={{
                                            marginTop: 0,
                                            marginBottom: "10px"
                                        }}
                                    >
                                        {notice.title}
                                    </h2>

                                    <p
                                        style={{
                                            color: "#555",
                                            lineHeight: "1.6",
                                            marginBottom: "12px"
                                        }}
                                    >
                                        {notice.content}
                                    </p>

                                    {notice.targetAudience && (
                                        <p
                                            style={{
                                                margin: 0,
                                                color: "#777",
                                                fontSize: "14px"
                                            }}
                                        >
                                            Audience:{" "}
                                            {notice.targetAudience}
                                        </p>
                                    )}

                                    {notice.expiryDate && (
                                        <p
                                            style={{
                                                margin: "6px 0 0",
                                                color: "#777",
                                                fontSize: "14px"
                                            }}
                                        >
                                            Expires:{" "}
                                            {new Date(
                                                notice.expiryDate
                                            ).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/student/notices/${notice._id}`
                                        )
                                    }
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor:
                                            "#f3f4f6",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        whiteSpace: "nowrap"
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

export default StudentNotices;