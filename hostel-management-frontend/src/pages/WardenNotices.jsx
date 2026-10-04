import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const WardenNotices = () => {
    const navigate = useNavigate();
    const detailsRef = useRef(null);

    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);

    const [search, setSearch] = useState("");
    const [audienceFilter, setAudienceFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    // =====================================================
    // SCROLL TO NOTICE DETAILS
    // =====================================================

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

    // =====================================================
    // FETCH ALL NOTICES
    // =====================================================

    const fetchNotices = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/notices",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "All notices response:",
                response.data
            );

            setNotices(
                response.data.notices || []
            );

        } catch (error) {
            console.error(
                "Fetch notices error:",
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

    useEffect(() => {
        if (!token) {
            setError(
                "Authentication token not found."
            );
            setLoading(false);
            return;
        }

        fetchNotices();
    }, [token]);

    // =====================================================
    // VIEW NOTICE DETAILS
    // =====================================================

    const handleViewNotice = async (notice) => {
        try {
            setDetailsLoading(true);
            setError("");

            const noticeId =
                notice._id ||
                notice.id;

            if (!noticeId) {
                setError(
                    "Notice ID not found."
                );
                return;
            }

            const response = await api.get(
                `/notices/${noticeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Notice details response:",
                response.data
            );

            const details =
                response.data.notice ||
                response.data.data ||
                response.data;

            setSelectedNotice(details);

        } catch (error) {
            console.error(
                "Get notice details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load notice details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    // =====================================================
    // SEARCH + AUDIENCE FILTER
    // =====================================================

    const filteredNotices =
        notices.filter((notice) => {
            const title =
                notice.title || "";

            const content =
                notice.content || "";

            const targetAudience =
                notice.targetAudience ||
                notice.audience ||
                "";

            const searchText =
                `${title} ${content}`
                    .toLowerCase();

            const searchMatches =
                searchText.includes(
                    search.toLowerCase()
                );

            const audienceMatches =
                audienceFilter === "ALL" ||
                targetAudience === audienceFilter;

            return (
                searchMatches &&
                audienceMatches
            );
        });

    return (
        <div className="page-container">

            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <div className="page-header">

                <div>
                    <h1>
                        Warden Notices
                    </h1>

                    <p>
                        View notices and important
                        announcements for hostel users.
                    </p>
                </div>

                <button
                    type="button"
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
                    placeholder="Search notices..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <select
                    value={audienceFilter}
                    onChange={(e) =>
                        setAudienceFilter(
                            e.target.value
                        )
                    }
                >
                    <option value="ALL">
                        All Audiences
                    </option>

                    <option value="STUDENT">
                        Students
                    </option>

                    <option value="WARDEN">
                        Wardens
                    </option>

                    <option value="ALL">
                        All Users
                    </option>
                </select>

                {(search ||
                    audienceFilter !== "ALL") && (
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                            setSearch("");
                            setAudienceFilter("ALL");
                        }}
                    >
                        Clear
                    </button>
                )}

            </div>

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* ================================================= */}
            {/* NOTICE DETAILS */}
            {/* MOVED ABOVE NOTICE LIST */}
            {/* ================================================= */}

            {detailsLoading && (
                <div
                    ref={detailsRef}
                    className="dashboard-card"
                >
                    <h2>
                        Notice Details
                    </h2>

                    <div className="loading-container">
                        <p>
                            Loading notice details...
                        </p>
                    </div>
                </div>
            )}

            {selectedNotice &&
                !detailsLoading && (
                    <div
                        ref={detailsRef}
                        className="dashboard-card"
                    >

                        <div className="dashboard-card-header">

                            <div>
                                <h2>
                                    Notice Details
                                </h2>

                                <p className="dashboard-muted">
                                    View the complete
                                    notice information.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setSelectedNotice(
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
                                        selectedNotice.title ||
                                        "N/A"
                                    }
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>
                                    Audience
                                </span>

                                <strong>
                                    {
                                        selectedNotice.targetAudience ||
                                        selectedNotice.audience ||
                                        "ALL"
                                    }
                                </strong>
                            </div>

                            {selectedNotice.expiryDate && (
                                <div className="info-row">
                                    <span>
                                        Expiry Date
                                    </span>

                                    <strong>
                                        {new Date(
                                            selectedNotice.expiryDate
                                        ).toLocaleDateString()}
                                    </strong>
                                </div>
                            )}

                        </div>

                        <div className="dashboard-card">
                            <h3>
                                Content
                            </h3>

                            <p>
                                {
                                    selectedNotice.content ||
                                    "No content"
                                }
                            </p>
                        </div>

                        <div className="dashboard-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setSelectedNotice(
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
            {/* NOTICE LIST */}
            {/* ================================================= */}

            <div className="dashboard-card">

                <div className="dashboard-card-header">

                    <div>
                        <h2>
                            Notices
                        </h2>

                        <p className="dashboard-muted">
                            Showing{" "}
                            <strong>
                                {
                                    filteredNotices.length
                                }
                            </strong>{" "}
                            notice
                            {filteredNotices.length !== 1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                </div>

                {loading ? (
                    <div className="loading-container">
                        <p>
                            Loading notices...
                        </p>
                    </div>
                ) : filteredNotices.length === 0 ? (
                    <div className="empty-state">

                        <h3>
                            No Notices Found
                        </h3>

                        <p>
                            No notices match your
                            current search or filter.
                        </p>

                    </div>
                ) : (
                    <div className="card-grid">

                        {filteredNotices.map(
                            (notice) => {

                                const noticeId =
                                    notice._id ||
                                    notice.id;

                                const targetAudience =
                                    notice.targetAudience ||
                                    notice.audience ||
                                    "ALL";

                                return (
                                    <div
                                        key={noticeId}
                                        className="card"
                                    >

                                        <div className="card-header">

                                            <div>
                                                <h3>
                                                    {
                                                        notice.title ||
                                                        "Untitled Notice"
                                                    }
                                                </h3>
                                            </div>

                                            <span className="badge badge-info">
                                                {
                                                    targetAudience
                                                }
                                            </span>

                                        </div>

                                        <div className="info-list">

                                            <div className="info-row">
                                                <span>
                                                    Audience
                                                </span>

                                                <strong>
                                                    {
                                                        targetAudience
                                                    }
                                                </strong>
                                            </div>

                                            {notice.expiryDate && (
                                                <div className="info-row">
                                                    <span>
                                                        Expiry Date
                                                    </span>

                                                    <strong>
                                                        {new Date(
                                                            notice.expiryDate
                                                        ).toLocaleDateString()}
                                                    </strong>
                                                </div>
                                            )}

                                        </div>

                                        <p className="dashboard-muted">
                                            {
                                                notice.content ||
                                                "No content"
                                            }
                                        </p>

                                        <div className="dashboard-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewNotice(
                                                        notice
                                                    )
                                                }
                                            >
                                                View Details
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

export default WardenNotices;