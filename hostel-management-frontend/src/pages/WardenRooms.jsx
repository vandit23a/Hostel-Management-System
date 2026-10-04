import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const WardenRooms = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [roomNumber, setRoomNumber] = useState("");
    const [searching, setSearching] = useState(false);

    // Fetch all rooms
    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/rooms", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success !== false) {
                setRooms(response.data.rooms || []);
            } else {
                setError(
                    response.data.message ||
                    "Failed to load rooms."
                );
            }
        } catch (error) {
            console.error("Warden rooms loading error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load rooms."
            );
        } finally {
            setLoading(false);
        }
    };

    // Search room by room number
    const handleSearch = async (e) => {
        e.preventDefault();

        const searchValue = roomNumber.trim();

        if (!searchValue) {
            fetchRooms();
            return;
        }

        try {
            setSearching(true);
            setError("");

            const response = await api.get(
                `/rooms/search?roomNumber=${encodeURIComponent(
                    searchValue
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success !== false) {
                setRooms(response.data.rooms || []);
            } else {
                setRooms([]);
                setError(
                    response.data.message ||
                    "No rooms found."
                );
            }
        } catch (error) {
            console.error("Room search error:", error);

            setRooms([]);

            setError(
                error.response?.data?.message ||
                "Failed to search rooms."
            );
        } finally {
            setSearching(false);
        }
    };

    // Clear search
    const handleClear = () => {
        setRoomNumber("");
        fetchRooms();
    };

    useEffect(() => {
        if (token) {
            fetchRooms();
        }
    }, [token]);

    return (
        <div className="page-container">

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Rooms</h1>
                    <p>
                        View hostel rooms and their current
                        availability.
                    </p>
                </div>

                <button
                    className="secondary-button"
                    onClick={() => navigate("/warden")}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Search */}
            <form
                onSubmit={handleSearch}
                className="filter-bar"
            >
                <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) =>
                        setRoomNumber(e.target.value)
                    }
                    placeholder="Search by room number"
                />

                <button
                    type="submit"
                    disabled={searching}
                >
                    {searching
                        ? "Searching..."
                        : "Search"}
                </button>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={handleClear}
                >
                    Clear
                </button>
            </form>

            {/* Loading */}
            {loading && (
                <div className="loading-container">
                    <p>Loading rooms...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading &&
                !error &&
                rooms.length === 0 && (
                    <div className="empty-state">
                        <h3>No Rooms Found</h3>
                        <p>
                            There are no rooms matching your
                            search.
                        </p>
                    </div>
                )}

            {/* Rooms */}
            {!loading &&
                !error &&
                rooms.length > 0 && (
                    <>
                        <div className="action-row">
                            <p>
                                Total Rooms:{" "}
                                <strong>
                                    {rooms.length}
                                </strong>
                            </p>
                        </div>

                        <div className="card-grid">
                            {rooms.map((room) => {
                                const capacity =
                                    room.capacity || 0;

                                const occupied =
                                    room.occupiedCount || 0;

                                const available =
                                    capacity - occupied;

                                return (
                                    <div
                                        key={room._id}
                                        className="card"
                                    >
                                        <div className="card-header">
                                            <div>
                                                <h3>
                                                    Room{" "}
                                                    {
                                                        room.roomNumber
                                                    }
                                                </h3>

                                                <p className="dashboard-muted">
                                                    {
                                                        room
                                                            .hostel
                                                            ?.name
                                                    }
                                                </p>
                                            </div>

                                            <span
                                                className={
                                                    room.status ===
                                                    "AVAILABLE"
                                                        ? "badge badge-success"
                                                        : room.status ===
                                                          "FULL"
                                                        ? "badge badge-danger"
                                                        : "badge badge-warning"
                                                }
                                            >
                                                {room.status ||
                                                    "N/A"}
                                            </span>
                                        </div>

                                        <div className="info-list">

                                            <div className="info-row">
                                                <span>
                                                    Room Number
                                                </span>
                                                <strong>
                                                    {
                                                        room.roomNumber
                                                    }
                                                </strong>
                                            </div>

                                            <div className="info-row">
                                                <span>
                                                    Capacity
                                                </span>
                                                <strong>
                                                    {capacity}
                                                </strong>
                                            </div>

                                            <div className="info-row">
                                                <span>
                                                    Occupied
                                                </span>
                                                <strong>
                                                    {occupied}
                                                </strong>
                                            </div>

                                            <div className="info-row">
                                                <span>
                                                    Available Beds
                                                </span>
                                                <strong>
                                                    {available}
                                                </strong>
                                            </div>

                                            <div className="info-row">
                                                <span>
                                                    Hostel
                                                </span>
                                                <strong>
                                                    {room.hostel
                                                        ?.name ||
                                                        "N/A"}
                                                </strong>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
        </div>
    );
};

export default WardenRooms;