import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const NoticeDetails = () => {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const response = await api.get(
                    `/notices/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    setNotice(response.data.notice);
                } else {
                    setError(
                        response.data.message ||
                        "Failed to load notice."
                    );
                }
            } catch (error) {
                console.error(
                    "Notice details error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load notice."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token && id) {
            fetchNotice();
        }
    }, [token, id]);

    if (loading) {
        return (
            <div style={{ padding: "24px" }}>
                <h1>Notice Details</h1>
                <p>Loading notice...</p>
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
                <h1>Notice Details</h1>

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
                        navigate("/student/notices")
                    }
                >
                    Back to Notices
                </button>
            </div>
        );
    }

    if (!notice) {
        return (
            <div style={{ padding: "24px" }}>
                <h2>Notice not found</h2>

                <button
                    onClick={() =>
                        navigate("/student/notices")
                    }
                >
                    Back to Notices
                </button>
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
            <button
                onClick={() =>
                    navigate("/student/notices")
                }
                style={{
                    marginBottom: "20px",
                    padding: "8px 16px",
                    cursor: "pointer"
                }}
            >
                ← Back to Notices
            </button>

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
                <h1
                    style={{
                        marginTop: 0,
                        marginBottom: "16px"
                    }}
                >
                    {notice.title}
                </h1>

                <div
                    style={{
                        marginBottom: "20px",
                        color: "#666",
                        fontSize: "14px"
                    }}
                >
                    {notice.targetAudience && (
                        <p style={{ margin: "5px 0" }}>
                            Audience:{" "}
                            {notice.targetAudience}
                        </p>
                    )}

                    {notice.expiryDate && (
                        <p style={{ margin: "5px 0" }}>
                            Expires:{" "}
                            {new Date(
                                notice.expiryDate
                            ).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div
                    style={{
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "20px"
                    }}
                >
                    <p
                        style={{
                            whiteSpace: "pre-wrap",
                            lineHeight: "1.7",
                            color: "#333"
                        }}
                    >
                        {notice.content}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NoticeDetails;