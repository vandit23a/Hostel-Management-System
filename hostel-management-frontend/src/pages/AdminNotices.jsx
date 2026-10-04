import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminNotices = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [audienceFilter, setAudienceFilter] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [selectedNotice, setSelectedNotice] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        targetAudience: "STUDENT",
        expiryDate: ""
    });

    const [saving, setSaving] = useState(false);

    // Reference for Notice Details section
    const detailsRef = useRef(null);

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/notices",
                authConfig
            );

            console.log(
                "Admin notices response:",
                response.data
            );

            if (response.data.success !== false) {
                setNotices(
                    response.data.notices || []
                );
            } else {
                setError(
                    response.data.message ||
                    "Failed to load notices."
                );
            }
        } catch (error) {
            console.error(
                "Admin notices loading error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load notices."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Scroll to Notice Details
    // =========================

    useEffect(() => {
        if (selectedNotice) {
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }, [selectedNotice]);

    const getNoticeTitle = (notice) => {
        return notice?.title || "Untitled Notice";
    };

    const getNoticeContent = (notice) => {
        return notice?.content || "";
    };

    const getAudience = (notice) => {
        return notice?.targetAudience || "N/A";
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
            targetAudience: "STUDENT",
            expiryDate: ""
        });

        setEditingNotice(null);
        setShowForm(false);
    };

    const handleCreate = () => {
        setEditingNotice(null);

        setFormData({
            title: "",
            content: "",
            targetAudience: "STUDENT",
            expiryDate: ""
        });

        setShowForm(true);
        setSelectedNotice(null);
    };

    const handleEdit = async (notice) => {
        try {
            setError("");

            const noticeId =
                notice._id || notice.id;

            const response = await api.get(
                `/notices/${noticeId}`,
                authConfig
            );

            console.log(
                "Notice details response:",
                response.data
            );

            const details =
                response.data.notice ||
                response.data;

            setEditingNotice(details);

            setFormData({
                title: details.title || "",
                content: details.content || "",
                targetAudience:
                    details.targetAudience ||
                    "STUDENT",
                expiryDate: details.expiryDate
                    ? new Date(details.expiryDate)
                          .toISOString()
                          .split("T")[0]
                    : ""
            });

            setShowForm(true);
            setSelectedNotice(null);
        } catch (error) {
            console.error(
                "Notice details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load notice details."
            );
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("Please enter notice title.");
            return;
        }

        if (!formData.content.trim()) {
            alert("Please enter notice content.");
            return;
        }

        if (!formData.expiryDate) {
            alert("Please select expiry date.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            if (editingNotice) {
                const noticeId =
                    editingNotice._id ||
                    editingNotice.id;

                const response = await api.put(
                    `/notices/${noticeId}`,
                    formData,
                    authConfig
                );

                console.log(
                    "Update notice response:",
                    response.data
                );

                if (response.data.success === false) {
                    setError(
                        response.data.message ||
                        "Failed to update notice."
                    );
                    return;
                }

                alert(
                    "Notice updated successfully."
                );
            } else {
                const response = await api.post(
                    "/notices",
                    formData,
                    authConfig
                );

                console.log(
                    "Create notice response:",
                    response.data
                );

                if (response.data.success === false) {
                    setError(
                        response.data.message ||
                        "Failed to create notice."
                    );
                    return;
                }

                alert(
                    "Notice created successfully."
                );
            }

            resetForm();
            await fetchNotices();
        } catch (error) {
            console.error(
                "Notice save error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to save notice."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleView = async (notice) => {
        try {
            setError("");

            const noticeId =
                notice._id || notice.id;

            const response = await api.get(
                `/notices/${noticeId}`,
                authConfig
            );

            console.log(
                "Notice details response:",
                response.data
            );

            setSelectedNotice(
                response.data.notice ||
                response.data
            );
        } catch (error) {
            console.error(
                "Notice details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load notice details."
            );
        }
    };

    const handleDelete = async (notice) => {
        const noticeId =
            notice._id || notice.id;

        const confirmed = window.confirm(
            "Are you sure you want to delete this notice?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const response = await api.delete(
                `/notices/${noticeId}`,
                authConfig
            );

            console.log(
                "Delete notice response:",
                response.data
            );

            if (response.data.success === false) {
                setError(
                    response.data.message ||
                    "Failed to delete notice."
                );
                return;
            }

            alert(
                "Notice deleted successfully."
            );

            if (
                selectedNotice &&
                (selectedNotice._id ||
                    selectedNotice.id) === noticeId
            ) {
                setSelectedNotice(null);
            }

            await fetchNotices();
        } catch (error) {
            console.error(
                "Notice delete error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete notice."
            );
        }
    };

    const filteredNotices = notices.filter(
        (notice) => {
            const searchText =
                search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                getNoticeTitle(notice)
                    .toLowerCase()
                    .includes(searchText) ||
                getNoticeContent(notice)
                    .toLowerCase()
                    .includes(searchText);

            const matchesAudience =
                !audienceFilter ||
                getAudience(notice) ===
                    audienceFilter;

            return (
                matchesSearch &&
                matchesAudience
            );
        }
    );

    if (loading) {
        return (
            <div>
                <h1>Admin Notices</h1>
                <p>Loading notices...</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Admin Notices</h1>

            <button
                type="button"
                onClick={() =>
                    navigate("/admin")
                }
            >
                Back to Admin Dashboard
            </button>

            <hr />

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={handleCreate}
            >
                Create Notice
            </button>

            <hr />

            <h2>Notice Management</h2>

            <div>
                <input
                    type="text"
                    placeholder="Search by title or content"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                {" "}

                <select
                    value={audienceFilter}
                    onChange={(e) =>
                        setAudienceFilter(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        All Audiences
                    </option>

                    <option value="STUDENT">
                        STUDENT
                    </option>

                    <option value="WARDEN">
                        WARDEN
                    </option>

                    <option value="ALL">
                        ALL
                    </option>
                </select>
            </div>

            <hr />

            {/* ========================= */}
            {/* NOTICE DETAILS */}
            {/* ========================= */}

            {selectedNotice && (
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
                        Notice Details
                    </h2>

                    <p>
                        <strong>
                            Title:
                        </strong>{" "}
                        {getNoticeTitle(
                            selectedNotice
                        )}
                    </p>

                    <p>
                        <strong>
                            Content:
                        </strong>{" "}
                        {getNoticeContent(
                            selectedNotice
                        )}
                    </p>

                    <p>
                        <strong>
                            Target Audience:
                        </strong>{" "}
                        {getAudience(
                            selectedNotice
                        )}
                    </p>

                    <p>
                        <strong>
                            Expiry Date:
                        </strong>{" "}
                        {formatDate(
                            selectedNotice.expiryDate
                        )}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setSelectedNotice(
                                null
                            )
                        }
                    >
                        Close
                    </button>
                </div>
            )}

            {/* ========================= */}
            {/* NOTICE COUNT */}
            {/* ========================= */}

            <p>
                Total Notices:{" "}
                {filteredNotices.length}
            </p>

            {/* ========================= */}
            {/* NOTICE LIST */}
            {/* ========================= */}

            {filteredNotices.length === 0 ? (
                <p>No notices found.</p>
            ) : (
                filteredNotices.map(
                    (notice) => {
                        const noticeId =
                            notice._id ||
                            notice.id;

                        return (
                            <div
                                key={noticeId}
                                style={{
                                    border:
                                        "1px solid #ccc",
                                    padding: "15px",
                                    marginBottom:
                                        "10px"
                                }}
                            >
                                <h3>
                                    {getNoticeTitle(
                                        notice
                                    )}
                                </h3>

                                <p>
                                    <strong>
                                        Audience:
                                    </strong>{" "}
                                    {getAudience(
                                        notice
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Expiry Date:
                                    </strong>{" "}
                                    {formatDate(
                                        notice.expiryDate
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Content:
                                    </strong>{" "}
                                    {getNoticeContent(
                                        notice
                                    )}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleView(
                                            notice
                                        )
                                    }
                                >
                                    View
                                </button>

                                {" "}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleEdit(
                                            notice
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                {" "}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(
                                            notice
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    }
                )
            )}

            {/* ========================= */}
            {/* CREATE / EDIT FORM */}
            {/* ========================= */}

            {showForm && (
                <div>
                    <hr />

                    <h2>
                        {editingNotice
                            ? "Edit Notice"
                            : "Create Notice"}
                    </h2>

                    <form
                        onSubmit={handleSave}
                    >
                        <div>
                            <label>
                                Title:
                            </label>

                            <br />

                            <input
                                type="text"
                                name="title"
                                value={
                                    formData.title
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="Enter notice title"
                            />
                        </div>

                        <br />

                        <div>
                            <label>
                                Content:
                            </label>

                            <br />

                            <textarea
                                name="content"
                                rows="6"
                                cols="50"
                                value={
                                    formData.content
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="Enter notice content"
                            />
                        </div>

                        <br />

                        <div>
                            <label>
                                Target Audience:
                            </label>

                            <br />

                            <select
                                name="targetAudience"
                                value={
                                    formData.targetAudience
                                }
                                onChange={
                                    handleInputChange
                                }
                            >
                                <option value="STUDENT">
                                    STUDENT
                                </option>

                                <option value="WARDEN">
                                    WARDEN
                                </option>

                                <option value="ALL">
                                    ALL
                                </option>
                            </select>
                        </div>

                        <br />

                        <div>
                            <label>
                                Expiry Date:
                            </label>

                            <br />

                            <input
                                type="date"
                                name="expiryDate"
                                value={
                                    formData.expiryDate
                                }
                                onChange={
                                    handleInputChange
                                }
                            />
                        </div>

                        <br />

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingNotice
                                ? "Update Notice"
                                : "Create Notice"}
                        </button>

                        {" "}

                        <button
                            type="button"
                            onClick={resetForm}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminNotices;