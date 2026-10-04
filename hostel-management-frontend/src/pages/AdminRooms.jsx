import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminRooms = () => {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [hostels, setHostels] = useState([]);

    const [selectedRoom, setSelectedRoom] = useState(null);

    const detailsRef = useRef(null);

    const [search, setSearch] = useState("");

    const [isAdding, setIsAdding] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    const [roomNumber, setRoomNumber] = useState("");
    const [hostelId, setHostelId] = useState("");
    const [capacity, setCapacity] = useState("");
    const [status, setStatus] = useState("AVAILABLE");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // --------------------------------
    // Reset form
    // --------------------------------

    const resetForm = () => {
        setRoomNumber("");
        setHostelId("");
        setCapacity("");
        setStatus("AVAILABLE");
    };

    // --------------------------------
    // Fetch rooms
    // --------------------------------

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/rooms",
                authConfig
            );

            setRooms(
                response.data.rooms || []
            );
        } catch (error) {
            console.error(
                "Fetch rooms error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load rooms."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------
    // Fetch hostels
    // --------------------------------

    const fetchHostels = async () => {
        try {
            const response = await api.get(
                "/hostels",
                authConfig
            );

            setHostels(
                response.data.hostels || []
            );
        } catch (error) {
            console.error(
                "Fetch hostels error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load hostels."
            );
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

        fetchRooms();
        fetchHostels();
    }, [token]);

    // --------------------------------
    // Scroll to Room Details
    // --------------------------------

    useEffect(() => {
        if (selectedRoom) {
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }, [selectedRoom]);

    // --------------------------------
    // Search rooms
    // --------------------------------

    const handleSearch = async () => {
        if (!search.trim()) {
            fetchRooms();
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/rooms/search?roomNumber=${encodeURIComponent(
                    search.trim()
                )}`,
                authConfig
            );

            setRooms(
                response.data.rooms || []
            );
        } catch (error) {
            console.error(
                "Search rooms error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to search rooms."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearch("");
        fetchRooms();
    };

    // --------------------------------
    // Add Room
    // --------------------------------

    const handleAddRoom = () => {
        resetForm();

        setSelectedRoom(null);
        setEditingRoom(null);

        setError("");
        setSuccess("");

        setIsAdding(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // --------------------------------
    // Edit Room
    // --------------------------------

    const handleEditRoom = (room) => {
        setEditingRoom(room);

        setSelectedRoom(null);
        setIsAdding(false);

        setError("");
        setSuccess("");

        setRoomNumber(
            room.roomNumber || ""
        );

        setCapacity(
            room.capacity !== undefined
                ? String(room.capacity)
                : ""
        );

        setStatus(
            room.status || "AVAILABLE"
        );

        if (
            room.hostel &&
            typeof room.hostel === "object"
        ) {
            setHostelId(
                room.hostel._id ||
                room.hostel.id ||
                ""
            );
        } else {
            setHostelId(
                room.hostel || ""
            );
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // --------------------------------
    // Cancel
    // --------------------------------

    const handleCancelForm = () => {
        resetForm();

        setEditingRoom(null);
        setIsAdding(false);

        setError("");
        setSuccess("");
    };

    // --------------------------------
    // Create / Update Room
    // --------------------------------

    const handleSaveRoom = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!roomNumber.trim()) {
            setError(
                "Room number is required."
            );
            return;
        }

        if (!hostelId) {
            setError(
                "Please select a hostel."
            );
            return;
        }

        if (!capacity) {
            setError(
                "Room capacity is required."
            );
            return;
        }

        const capacityValue =
            Number(capacity);

        if (
            !Number.isInteger(
                capacityValue
            ) ||
            capacityValue <= 0
        ) {
            setError(
                "Capacity must be a positive integer."
            );
            return;
        }

        try {
            setSaving(true);

            if (editingRoom) {
                const roomId =
                    editingRoom._id ||
                    editingRoom.id;

                const response =
                    await api.put(
                        `/rooms/${roomId}`,
                        {
                            capacity:
                                capacityValue,
                            status
                        },
                        authConfig
                    );

                setSuccess(
                    response.data.message ||
                    "Room updated successfully."
                );
            } else {
                const response =
                    await api.post(
                        "/rooms",
                        {
                            hostel:
                                hostelId,
                            roomNumber:
                                roomNumber.trim(),
                            capacity:
                                capacityValue,
                            status
                        },
                        authConfig
                    );

                setSuccess(
                    response.data.message ||
                    "Room created successfully."
                );
            }

            resetForm();

            setEditingRoom(null);
            setIsAdding(false);

            await fetchRooms();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } catch (error) {
            console.error(
                "Save room error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to save room."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------
    // Delete Room
    // --------------------------------

    const handleDeleteRoom = async (
        room
    ) => {
        const roomId =
            room._id ||
            room.id;

        const confirmed = window.confirm(
            `Are you sure you want to delete room ${room.roomNumber}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/rooms/${roomId}`,
                authConfig
            );

            setSuccess(
                "Room deleted successfully."
            );

            if (
                selectedRoom &&
                (
                    selectedRoom._id ||
                    selectedRoom.id
                ) === roomId
            ) {
                setSelectedRoom(null);
            }

            await fetchRooms();
        } catch (error) {
            console.error(
                "Delete room error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete room."
            );
        }
    };

    // --------------------------------
    // View Room
    // --------------------------------

    const handleViewRoom = async (
        room
    ) => {
        try {
            setError("");
            setSuccess("");

            const roomId =
                room._id ||
                room.id;

            const response =
                await api.get(
                    `/rooms/${roomId}`,
                    authConfig
                );

            setSelectedRoom(
                response.data.room
            );

            setEditingRoom(null);
            setIsAdding(false);
        } catch (error) {
            console.error(
                "Get room details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load room details."
            );
        }
    };

    // --------------------------------
    // Get Hostel Name
    // --------------------------------

    const getHostelName = (room) => {
        if (
            room.hostel &&
            typeof room.hostel === "object"
        ) {
            return (
                room.hostel.name ||
                room.hostel.blockCode ||
                "N/A"
            );
        }

        const hostel = hostels.find(
            (item) =>
                (item._id || item.id) ===
                room.hostel
        );

        return (
            hostel?.name ||
            hostel?.blockCode ||
            "N/A"
        );
    };

    // --------------------------------
    // UI
    // --------------------------------

    return (
        <div>
            <h1>Admin - Room Management</h1>

            <button
                type="button"
                onClick={() =>
                    navigate("/admin")
                }
            >
                Back to Admin Dashboard
            </button>

            {" "}

            <button
                type="button"
                onClick={handleAddRoom}
            >
                Add Room
            </button>

            <hr />

            {success && (
                <p style={{ color: "green" }}>
                    {success}
                </p>
            )}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {/* Search */}

            <div>
                <input
                    type="text"
                    placeholder="Search by room number..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                />

                {" "}

                <button
                    type="button"
                    onClick={handleSearch}
                >
                    Search
                </button>

                {" "}

                <button
                    type="button"
                    onClick={
                        handleClearSearch
                    }
                >
                    Clear
                </button>
            </div>

            <hr />

            {/* Add / Edit Form */}

            {(isAdding ||
                editingRoom) && (
                <div>
                    <h2>
                        {editingRoom
                            ? "Edit Room"
                            : "Add Room"}
                    </h2>

                    <form
                        onSubmit={
                            handleSaveRoom
                        }
                    >
                        <p>
                            <strong>
                                Hostel:
                            </strong>
                            <br />

                            <select
                                value={
                                    hostelId
                                }
                                onChange={(e) =>
                                    setHostelId(
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    !!editingRoom
                                }
                            >
                                <option value="">
                                    Select Hostel
                                </option>

                                {hostels.map(
                                    (hostel) => (
                                        <option
                                            key={
                                                hostel._id ||
                                                hostel.id
                                            }
                                            value={
                                                hostel._id ||
                                                hostel.id
                                            }
                                        >
                                            {hostel.name}{" "}
                                            (
                                            {
                                                hostel.blockCode
                                            }
                                            )
                                        </option>
                                    )
                                )}
                            </select>
                        </p>

                        <p>
                            <strong>
                                Room Number:
                            </strong>
                            <br />

                            <input
                                type="text"
                                value={
                                    roomNumber
                                }
                                onChange={(e) =>
                                    setRoomNumber(
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    !!editingRoom
                                }
                            />
                        </p>

                        <p>
                            <strong>
                                Capacity:
                            </strong>
                            <br />

                            <input
                                type="number"
                                min="1"
                                value={
                                    capacity
                                }
                                onChange={(e) =>
                                    setCapacity(
                                        e.target
                                            .value
                                    )
                                }
                            />
                        </p>

                        <p>
                            <strong>
                                Status:
                            </strong>
                            <br />

                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(
                                        e.target
                                            .value
                                    )
                                }
                            >
                                <option value="AVAILABLE">
                                    Available
                                </option>

                                <option value="OCCUPIED">
                                    Occupied
                                </option>

                                <option value="UNDER_MAINTENANCE">
                                    Under Maintenance
                                </option>
                            </select>
                        </p>

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingRoom
                                ? "Update Room"
                                : "Create Room"}
                        </button>

                        {" "}

                        <button
                            type="button"
                            onClick={
                                handleCancelForm
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </form>

                    <hr />
                </div>
            )}

            {/* Room Details */}

            {selectedRoom && (
                <div
                    ref={detailsRef}
                    style={{
                        border:
                            "2px solid #333",
                        padding: "20px",
                        marginBottom:
                            "25px",
                        backgroundColor:
                            "#fff"
                    }}
                >
                    <h2>
                        Room Details
                    </h2>

                    <p>
                        <strong>
                            Room Number:
                        </strong>{" "}
                        {
                            selectedRoom.roomNumber
                        }
                    </p>

                    <p>
                        <strong>
                            Hostel:
                        </strong>{" "}
                        {getHostelName(
                            selectedRoom
                        )}
                    </p>

                    <p>
                        <strong>
                            Capacity:
                        </strong>{" "}
                        {
                            selectedRoom.capacity
                        }
                    </p>

                    <p>
                        <strong>
                            Occupied:
                        </strong>{" "}
                        {
                            selectedRoom.occupiedCount ||
                            0
                        }
                    </p>

                    <p>
                        <strong>
                            Available Beds:
                        </strong>{" "}
                        {Math.max(
                            Number(
                                selectedRoom.capacity ||
                                    0
                            ) -
                                Number(
                                    selectedRoom.occupiedCount ||
                                        0
                                ),
                            0
                        )}
                    </p>

                    <p>
                        <strong>
                            Status:
                        </strong>{" "}
                        {
                            selectedRoom.status ||
                            "N/A"
                        }
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setSelectedRoom(
                                null
                            )
                        }
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Room List */}

            <h2>Rooms</h2>

            {loading ? (
                <p>Loading rooms...</p>
            ) : rooms.length === 0 ? (
                <p>No rooms found.</p>
            ) : (
                <div>
                    {rooms.map((room) => {
                        const roomKey =
                            room._id ||
                            room.id;

                        const occupied =
                            Number(
                                room.occupiedCount ||
                                    0
                            );

                        const roomCapacity =
                            Number(
                                room.capacity ||
                                    0
                            );

                        const available =
                            Math.max(
                                roomCapacity -
                                    occupied,
                                0
                            );

                        return (
                            <div
                                key={roomKey}
                                style={{
                                    border:
                                        "1px solid #ccc",
                                    padding:
                                        "15px",
                                    marginBottom:
                                        "10px"
                                }}
                            >
                                <h3>
                                    Room{" "}
                                    {
                                        room.roomNumber
                                    }
                                </h3>

                                <p>
                                    <strong>
                                        Hostel:
                                    </strong>{" "}
                                    {getHostelName(
                                        room
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Capacity:
                                    </strong>{" "}
                                    {
                                        room.capacity
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Occupied:
                                    </strong>{" "}
                                    {occupied}
                                </p>

                                <p>
                                    <strong>
                                        Available Beds:
                                    </strong>{" "}
                                    {available}
                                </p>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{" "}
                                    {room.status ||
                                        "N/A"}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleViewRoom(
                                            room
                                        )
                                    }
                                >
                                    View
                                </button>

                                {" "}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleEditRoom(
                                            room
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                {" "}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteRoom(
                                            room
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminRooms;