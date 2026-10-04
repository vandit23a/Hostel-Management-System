import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const WardenAllocations = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [allocations, setAllocations] = useState([]);
    const [students, setStudents] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");

    const [changeAllocationId, setChangeAllocationId] =
        useState("");
    const [changeRoomId, setChangeRoomId] =
        useState("");

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [allocating, setAllocating] = useState(false);
    const [changingRoom, setChangingRoom] =
        useState(false);
    const [vacatingId, setVacatingId] =
        useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // =====================================================
    // FETCH ALLOCATIONS
    // =====================================================

    const fetchAllocations = async () => {
        const response = await api.get(
            "/allocations",
            authConfig
        );

        if (response.data.success !== false) {
            setAllocations(
                response.data.allocations || []
            );
        }
    };

    // =====================================================
    // FETCH STUDENTS
    // =====================================================

    const fetchStudents = async () => {
        const response = await api.get(
            "/students",
            authConfig
        );

        if (response.data.success !== false) {
            setStudents(
                response.data.students || []
            );
        }
    };

    // =====================================================
    // FETCH ROOMS
    // =====================================================

    const fetchRooms = async () => {
        const response = await api.get(
            "/rooms",
            authConfig
        );

        if (response.data.success !== false) {
            setRooms(
                response.data.rooms || []
            );
        }
    };

    // =====================================================
    // FETCH ALL DATA
    // =====================================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            await Promise.all([
                fetchAllocations(),
                fetchStudents(),
                fetchRooms()
            ]);
        } catch (error) {
            console.error(
                "Warden allocation data loading error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load allocation data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    // =====================================================
    // ACTIVE ALLOCATIONS ONLY
    // =====================================================

    const activeAllocations =
        allocations.filter(
            (allocation) =>
                allocation.status === "ACTIVE"
        );

    // =====================================================
    // GET USER ID FROM STUDENT
    // =====================================================

    const getStudentUserId = (student) => {
        if (!student) {
            return "";
        }

        if (typeof student.user === "string") {
            return student.user;
        }

        if (student.user?._id) {
            return student.user._id;
        }

        if (student.user?.id) {
            return student.user.id;
        }

        if (student.userId) {
            return student.userId;
        }

        if (student.userID) {
            return student.userID;
        }

        return "";
    };

    // =====================================================
    // STUDENTS WITH ACTIVE ALLOCATION
    // =====================================================

    const activeStudentIds = new Set(
        activeAllocations
            .map((allocation) => {
                if (
                    typeof allocation.student ===
                    "string"
                ) {
                    return allocation.student;
                }

                return (
                    allocation.student?._id ||
                    allocation.student?.id ||
                    ""
                );
            })
            .filter(Boolean)
    );

    // =====================================================
    // UNALLOCATED STUDENTS
    // =====================================================

    const unallocatedStudents =
        students.filter((student) => {
            const userId =
                getStudentUserId(student);

            if (!userId) {
                return false;
            }

            return !activeStudentIds.has(userId);
        });

    // =====================================================
    // AVAILABLE ROOMS
    // =====================================================

    const availableRooms =
        rooms.filter(
            (room) =>
                room.status === "AVAILABLE" &&
                (room.occupiedCount || 0) <
                    (room.capacity || 0)
        );

    // =====================================================
    // ALLOCATE ROOM
    // =====================================================

    const handleAllocate = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!selectedStudent) {
            setError(
                "Please select a student."
            );
            return;
        }

        if (!selectedRoom) {
            setError(
                "Please select a room."
            );
            return;
        }

        try {
            setAllocating(true);

            const response = await api.post(
                "/allocations",
                {
                    student: selectedStudent,
                    room: selectedRoom
                },
                authConfig
            );

            if (response.data.success !== false) {
                setMessage(
                    response.data.message ||
                    "Room allocated successfully."
                );

                setSelectedStudent("");
                setSelectedRoom("");

                await fetchData();
            } else {
                setError(
                    response.data.message ||
                    "Failed to allocate room."
                );
            }
        } catch (error) {
            console.error(
                "Room allocation error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to allocate room."
            );
        } finally {
            setAllocating(false);
        }
    };

    // =====================================================
    // CHANGE ROOM
    // =====================================================

    const handleChangeRoom = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!changeAllocationId) {
            setError(
                "Please select a student allocation."
            );
            return;
        }

        if (!changeRoomId) {
            setError(
                "Please select a new room."
            );
            return;
        }

        try {
            setChangingRoom(true);

            const response = await api.put(
                `/allocations/${changeAllocationId}/change-room`,
                {
                    newRoom: changeRoomId
                },
                authConfig
            );

            if (response.data.success !== false) {
                setMessage(
                    response.data.message ||
                    "Room changed successfully."
                );

                setChangeAllocationId("");
                setChangeRoomId("");

                await fetchData();
            } else {
                setError(
                    response.data.message ||
                    "Failed to change room."
                );
            }
        } catch (error) {
            console.error(
                "Change room error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to change room."
            );
        } finally {
            setChangingRoom(false);
        }
    };

    // =====================================================
    // VACATE ROOM
    // =====================================================

    const handleVacate = async (allocationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to vacate this room?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");
        setVacatingId(allocationId);

        try {
            const response = await api.put(
                `/allocations/${allocationId}/vacate`,
                {},
                authConfig
            );

            if (response.data.success !== false) {
                setMessage(
                    response.data.message ||
                    "Room vacated successfully."
                );

                if (
                    changeAllocationId ===
                    allocationId
                ) {
                    setChangeAllocationId("");
                    setChangeRoomId("");
                }

                await fetchData();
            } else {
                setError(
                    response.data.message ||
                    "Failed to vacate room."
                );
            }
        } catch (error) {
            console.error(
                "Vacate room error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to vacate room."
            );
        } finally {
            setVacatingId("");
        }
    };

    // =====================================================
    // SEARCH ACTIVE ALLOCATIONS
    // =====================================================

    const filteredAllocations =
        activeAllocations.filter(
            (allocation) => {
                const searchText =
                    search.trim().toLowerCase();

                if (!searchText) {
                    return true;
                }

                const student =
                    allocation.student || {};

                const room =
                    allocation.room || {};

                const studentName =
                    student.name
                        ?.toLowerCase() || "";

                const studentId =
                    student.studentId
                        ?.toLowerCase() || "";

                const roomNumber =
                    room.roomNumber
                        ?.toString()
                        .toLowerCase() || "";

                return (
                    studentName.includes(
                        searchText
                    ) ||
                    studentId.includes(
                        searchText
                    ) ||
                    roomNumber.includes(
                        searchText
                    )
                );
            }
        );

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Room Allocations</h1>
                        <p>
                            Loading allocation data...
                        </p>
                    </div>
                </div>

                <div className="loading-container">
                    <p>Loading allocation data...</p>
                </div>
            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="page-container">

            {/* PAGE HEADER */}

            <div className="page-header">
                <div>
                    <h1>Room Allocations</h1>
                    <p>
                        Allocate rooms to students and
                        manage existing room allocations.
                    </p>
                </div>

                <button
                    className="secondary-button"
                    onClick={() =>
                        navigate("/warden")
                    }
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* SUCCESS */}

            {message && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            {/* ERROR */}

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* SUMMARY */}

            <div className="stat-grid">

                <div className="stat-card">
                    <div className="stat-card-content">
                        <span className="stat-label">
                            Active Allocations
                        </span>

                        <strong className="stat-value">
                            {activeAllocations.length}
                        </strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <span className="stat-label">
                            Unallocated Students
                        </span>

                        <strong className="stat-value">
                            {unallocatedStudents.length}
                        </strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <span className="stat-label">
                            Available Rooms
                        </span>

                        <strong className="stat-value">
                            {availableRooms.length}
                        </strong>
                    </div>
                </div>

            </div>

            {/* ALLOCATE ROOM */}

            <div className="dashboard-card">

                <div className="dashboard-card-header">
                    <div>
                        <h2>Allocate Room</h2>

                        <p className="dashboard-muted">
                            Assign an available room to an
                            unallocated student.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleAllocate}
                    className="form-grid"
                >

                    {/* STUDENT */}

                    <div className="form-group">
                        <label>
                            Student
                        </label>

                        <select
                            value={
                                selectedStudent
                            }
                            onChange={(e) =>
                                setSelectedStudent(
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                Select Student
                            </option>

                            {unallocatedStudents.map(
                                (student) => {
                                    const userId =
                                        getStudentUserId(
                                            student
                                        );

                                    if (!userId) {
                                        return null;
                                    }

                                    return (
                                        <option
                                            key={
                                                userId
                                            }
                                            value={
                                                userId
                                            }
                                        >
                                            {student.user?.name ||
                                                student.name ||
                                                "N/A"}
                                            {" - "}
                                            {student.studentId ||
                                                "N/A"}
                                        </option>
                                    );
                                }
                            )}
                        </select>
                    </div>

                    {/* ROOM */}

                    <div className="form-group">
                        <label>
                            Available Room
                        </label>

                        <select
                            value={
                                selectedRoom
                            }
                            onChange={(e) =>
                                setSelectedRoom(
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                Select Room
                            </option>

                            {availableRooms.map(
                                (room) => (
                                    <option
                                        key={
                                            room._id
                                        }
                                        value={
                                            room._id
                                        }
                                    >
                                        Room{" "}
                                        {
                                            room.roomNumber
                                        }
                                        {" - "}
                                        {
                                            room.occupiedCount ||
                                            0
                                        }
                                        /
                                        {
                                            room.capacity
                                        }
                                        {" occupied - "}
                                        {
                                            room.hostel
                                                ?.name ||
                                            "Hostel"
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            disabled={
                                allocating
                            }
                        >
                            {allocating
                                ? "Allocating..."
                                : "Allocate Room"}
                        </button>
                    </div>

                </form>

                {unallocatedStudents.length ===
                    0 && (
                    <div className="empty-state">
                        <p>
                            No unallocated students
                            available.
                        </p>
                    </div>
                )}

                {availableRooms.length ===
                    0 && (
                    <div className="empty-state">
                        <p>
                            No available rooms
                            found.
                        </p>
                    </div>
                )}

            </div>

            {/* CHANGE ROOM */}

            <div className="dashboard-card">

                <div className="dashboard-card-header">
                    <div>
                        <h2>Change Room</h2>

                        <p className="dashboard-muted">
                            Change the room of an existing
                            active allocation.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleChangeRoom}
                    className="form-grid"
                >

                    {/* CURRENT STUDENT */}

                    <div className="form-group">
                        <label>
                            Student
                        </label>

                        <select
                            value={
                                changeAllocationId
                            }
                            onChange={(e) => {
                                setChangeAllocationId(
                                    e.target.value
                                );
                                setChangeRoomId("");
                            }}
                        >
                            <option value="">
                                Select Student
                            </option>

                            {activeAllocations.map(
                                (allocation) => (
                                    <option
                                        key={
                                            allocation._id
                                        }
                                        value={
                                            allocation._id
                                        }
                                    >
                                        {
                                            allocation
                                                .student
                                                ?.name ||
                                            "N/A"
                                        }
                                        {" - "}
                                        {
                                            allocation
                                                .student
                                                ?.studentId ||
                                            "N/A"
                                        }
                                        {" (Room "}
                                        {
                                            allocation
                                                .room
                                                ?.roomNumber ||
                                            "N/A"
                                        }
                                        {")"}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* NEW ROOM */}

                    <div className="form-group">
                        <label>
                            New Room
                        </label>

                        <select
                            value={
                                changeRoomId
                            }
                            onChange={(e) =>
                                setChangeRoomId(
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                Select New Room
                            </option>

                            {availableRooms
                                .filter(
                                    (room) => {
                                        const currentAllocation =
                                            activeAllocations.find(
                                                (
                                                    allocation
                                                ) =>
                                                    allocation._id ===
                                                    changeAllocationId
                                            );

                                        const currentRoomId =
                                            typeof currentAllocation?.room ===
                                            "object"
                                                ? currentAllocation
                                                      ?.room
                                                      ?._id
                                                : currentAllocation?.room;

                                        return (
                                            room._id !==
                                            currentRoomId
                                        );
                                    }
                                )
                                .map(
                                    (room) => (
                                        <option
                                            key={
                                                room._id
                                            }
                                            value={
                                                room._id
                                            }
                                        >
                                            Room{" "}
                                            {
                                                room.roomNumber
                                            }
                                            {" - "}
                                            {
                                                room.occupiedCount ||
                                                0
                                            }
                                            /
                                            {
                                                room.capacity
                                            }
                                            {" occupied - "}
                                            {
                                                room.hostel
                                                    ?.name ||
                                                "Hostel"
                                            }
                                        </option>
                                    )
                                )}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            disabled={
                                changingRoom
                            }
                        >
                            {changingRoom
                                ? "Changing Room..."
                                : "Change Room"}
                        </button>
                    </div>

                </form>

                {activeAllocations.length ===
                    0 && (
                    <div className="empty-state">
                        <p>
                            No active allocations
                            found.
                        </p>
                    </div>
                )}

            </div>

            {/* EXISTING ACTIVE ALLOCATIONS */}

            <div className="dashboard-card">

                <div className="dashboard-card-header">
                    <div>
                        <h2>
                            Existing Allocations
                        </h2>

                        <p className="dashboard-muted">
                            Total Active Allocations:{" "}
                            <strong>
                                {
                                    activeAllocations.length
                                }
                            </strong>
                        </p>
                    </div>
                </div>

                {/* SEARCH */}

                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder="Search by student name, student ID or room number"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    {search && (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* NO ACTIVE ALLOCATIONS */}

                {activeAllocations.length ===
                    0 && (
                    <div className="empty-state">
                        <h3>
                            No Active Allocations
                        </h3>

                        <p>
                            There are currently no active
                            room allocations.
                        </p>
                    </div>
                )}

                {/* NO SEARCH RESULT */}

                {activeAllocations.length > 0 &&
                    filteredAllocations.length ===
                        0 && (
                    <div className="empty-state">
                        <h3>
                            No Matching Allocations
                        </h3>

                        <p>
                            No allocations match your
                            search.
                        </p>
                    </div>
                )}

                {/* ALLOCATION CARDS */}

                {filteredAllocations.length > 0 && (
                    <div className="card-grid">

                        {filteredAllocations.map(
                            (allocation) => (
                                <div
                                    key={
                                        allocation._id
                                    }
                                    className="card"
                                >

                                    <div className="card-header">
                                        <div>
                                            <h3>
                                                {
                                                    allocation
                                                        .student
                                                        ?.name ||
                                                    "N/A"
                                                }
                                            </h3>

                                            <p className="dashboard-muted">
                                                {
                                                    allocation
                                                        .student
                                                        ?.studentId ||
                                                    "N/A"
                                                }
                                            </p>
                                        </div>

                                        <span className="badge badge-success">
                                            {
                                                allocation.status ||
                                                "ACTIVE"
                                            }
                                        </span>
                                    </div>

                                    <div className="info-list">

                                        <div className="info-row">
                                            <span>
                                                Student ID
                                            </span>

                                            <strong>
                                                {
                                                    allocation
                                                        .student
                                                        ?.studentId ||
                                                    "N/A"
                                                }
                                            </strong>
                                        </div>

                                        <div className="info-row">
                                            <span>
                                                Email
                                            </span>

                                            <strong>
                                                {
                                                    allocation
                                                        .student
                                                        ?.email ||
                                                    "N/A"
                                                }
                                            </strong>
                                        </div>

                                        <div className="info-row">
                                            <span>
                                                Room
                                            </span>

                                            <strong>
                                                {
                                                    allocation
                                                        .room
                                                        ?.roomNumber ||
                                                    "N/A"
                                                }
                                            </strong>
                                        </div>

                                        <div className="info-row">
                                            <span>
                                                Hostel
                                            </span>

                                            <strong>
                                                {
                                                    allocation
                                                        .room
                                                        ?.hostel
                                                        ?.name ||
                                                    "N/A"
                                                }
                                            </strong>
                                        </div>

                                        <div className="info-row">
                                            <span>
                                                Allocation Date
                                            </span>

                                            <strong>
                                                {allocation
                                                    .allocationDate
                                                    ? new Date(
                                                          allocation.allocationDate
                                                      ).toLocaleDateString()
                                                    : "N/A"}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="dashboard-actions">
                                        <button
                                            className="secondary-button"
                                            onClick={() =>
                                                handleVacate(
                                                    allocation._id
                                                )
                                            }
                                            disabled={
                                                vacatingId ===
                                                allocation._id
                                            }
                                        >
                                            {vacatingId ===
                                            allocation._id
                                                ? "Vacating..."
                                                : "Vacate Room"}
                                        </button>
                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </div>

        </div>
    );
};

export default WardenAllocations;