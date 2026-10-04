import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SubmitComplaint = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!title.trim()) {
            setError("Please enter complaint title.");
            return;
        }

        if (!description.trim()) {
            setError("Please enter complaint description.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/complaints",
                {
                    title: title.trim(),
                    description: description.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (
                response.data.success ||
                response.data.status === 201
            ) {
                navigate("/student/complaints");
            } else {
                setError(
                    response.data.message ||
                    "Failed to submit complaint."
                );
            }
        } catch (error) {
            console.error(
                "Complaint submission error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to submit complaint."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                padding: "24px",
                maxWidth: "800px",
                margin: "0 auto"
            }}
        >
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ margin: 0 }}>
                    Submit Complaint
                </h1>

                <p
                    style={{
                        color: "#666",
                        marginTop: "8px"
                    }}
                >
                    Submit a complaint about any hostel-related
                    issue.
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

            <form
                onSubmit={handleSubmit}
                style={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "24px",
                    boxShadow:
                        "0 2px 6px rgba(0,0,0,0.05)"
                }}
            >
                <div style={{ marginBottom: "20px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600"
                        }}
                    >
                        Complaint Title
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                        placeholder="Enter complaint title"
                        maxLength={100}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            boxSizing: "border-box"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600"
                        }}
                    >
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        placeholder="Describe your complaint in detail"
                        rows={6}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            resize: "vertical",
                            boxSizing: "border-box"
                        }}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "12px"
                    }}
                >
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: loading
                                ? "#93c5fd"
                                : "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "14px"
                        }}
                    >
                        {loading
                            ? "Submitting..."
                            : "Submit Complaint"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/student/complaints")
                        }
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#f3f4f6",
                            color: "#374151",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitComplaint;