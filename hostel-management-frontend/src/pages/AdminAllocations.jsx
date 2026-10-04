import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminAllocations = () => {
    const navigate = useNavigate();

    // =========================
    // DATA
    // =========================

    const [allocations, setAllocations] = useState([]);
    const [students, setStudents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [hostels, setHostels] = useState([]);

    // =========================
    // SEARCH
    // =========================

    const [search, setSearch] = useState("");

    // =========================
    // ALLOCATE ROOM
    // =========================

    const [showAllocateForm, setShowAllocateForm] =
        useState(false);

    const [selectedStudent, setSelectedStudent] =
        useState("");

    const [selectedRoom, setSelectedRoom] =
        useState("");

    // =========================
    // CHANGE ROOM
    // =========================

    const [changingAllocation, setChangingAllocation] =
        useState(null);

    const [changeRoom, setChangeRoom] =
        useState("");

    // =========================
    // VIEW DETAILS
    // =========================

    const [selectedAllocation, setSelectedAllocation] =
        useState(null);

    const detailsRef = useRef(null);

    // =========================
    // LOADING / MESSAGES
    // =========================

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // AUTH
    // =========================

    const token = localStorage.getItem("token");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // =========================================================
    // FETCH ALLOCATIONS
    // =========================================================

    const fetchAllocations = async () => {
        try {
            const response = await api.get(
                "/allocations",
                authConfig
            );

            const allAllocations =
                response.data.allocations || [];

            // Admin page displays only ACTIVE allocations
            const activeAllocations =
                allAllocations.filter(
                    (allocation) =>
                        allocation.status === "ACTIVE"
                );

            setAllocations(activeAllocations);
        } catch (error) {
            console.error(
                "Fetch allocations error:",
                error
            );

            throw error;
        }
    };

    // =========================================================
    // FETCH STUDENTS
    // =========================================================

    const fetchStudents = async () => {
        try {
            const response = await api.get(
                "/students",
                authConfig
            );

            setStudents(
                response.data.students || []
            );
        } catch (error) {
            console.error(
                "Fetch students error:",
                error
            );

            throw error;
        }
    };

    // =========================================================
    // FETCH ROOMS
    // =========================================================

    const fetchRooms = async () => {
        try {
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

            throw error;
        }
    };

    // =========================================================
    // FETCH HOSTELS
    // =========================================================

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

            throw error;
        }
    };

    // =========================================================
    // LOAD ALL DATA
    // =========================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            await Promise.all([
                fetchStudents(),
                fetchRooms(),
                fetchHostels(),
                fetchAllocations()
            ]);
        } catch (error) {
            console.error(
                "Load allocation data error:",
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

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        if (!token) {
            setError(
                "Authentication token not found."
            );

            setLoading(false);

            return;
        }

        loadData();
    }, [token]);

    // =========================================================
    // SCROLL TO ALLOCATION DETAILS
    // =========================================================

    useEffect(() => {
        if (selectedAllocation) {
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }, [selectedAllocation]);

    // =========================================================
    // GET USER ID FROM STUDENT
    // =========================================================

    const getStudentUserId = (student) => {
        if (!student) {
            return "";
        }

        if (
            student.user &&
            typeof student.user === "object"
        ) {
            return String(
                student.user._id ||
                student.user.id ||
                ""
            );
        }

        return String(
            student.user || ""
        );
    };

    // =========================================================
    // GET STUDENT NAME
    // =========================================================

    const getStudentName = (student) => {
        if (!student) {
            return "N/A";
        }

        if (
            student.user &&
            typeof student.user === "object"
        ) {
            return (
                student.user.name ||
                "N/A"
            );
        }

        return (
            student.name ||
            "N/A"
        );
    };

    // =========================================================
    // GET STUDENT ID
    // =========================================================

    const getStudentId = (student) => {
        if (!student) {
            return "N/A";
        }

        return (
            student.studentId ||
            "N/A"
        );
    };

    // =========================================================
    // GET STUDENT FROM ALLOCATION
    // =========================================================

    const getAllocationStudent = (allocation) => {
        if (!allocation?.student) {
            return undefined;
        }

        const allocationStudentId =
            typeof allocation.student === "object"
                ? String(
                      allocation.student._id ||
                      allocation.student.id ||
                      ""
                  )
                : String(allocation.student);

        // 1. Match Student document _id
        let student = students.find(
            (student) =>
                String(
                    student._id ||
                    student.id ||
                    ""
                ) === allocationStudentId
        );

        if (student) {
            return student;
        }

        // 2. Match Student.user
        student = students.find(
            (student) =>
                getStudentUserId(student) ===
                allocationStudentId
        );

        if (student) {
            return student;
        }

        // 3. If allocation.student is a populated User object
        if (
            allocation.student &&
            typeof allocation.student === "object"
        ) {
            const userId = String(
                allocation.student._id ||
                allocation.student.id ||
                ""
            );

            student = students.find(
                (student) =>
                    getStudentUserId(student) ===
                    userId
            );

            if (student) {
                return student;
            }

            if (allocation.student.name) {
                return {
                    ...allocation.student,
                    studentId:
                        allocation.student.studentId ||
                        "N/A"
                };
            }
        }

        return undefined;
    };

    // =========================================================
    // GET ROOM FROM ALLOCATION
    // =========================================================

    const getAllocationRoom = (allocation) => {
        if (!allocation?.room) {
            return undefined;
        }

        if (
            typeof allocation.room === "object"
        ) {
            return allocation.room;
        }

        const allocationRoomId =
            String(
                allocation.room
            );

        return rooms.find(
            (room) =>
                String(
                    room._id ||
                    room.id ||
                    ""
                ) === allocationRoomId
        );
    };

    // =========================================================
    // GET HOSTEL FROM ROOM
    // =========================================================

    const getRoomHostel = (room) => {
        if (!room?.hostel) {
            return undefined;
        }

        if (
            typeof room.hostel === "object"
        ) {
            return room.hostel;
        }

        const roomHostelId =
            String(
                room.hostel
            );

        return hostels.find(
            (hostel) =>
                String(
                    hostel._id ||
                    hostel.id ||
                    ""
                ) === roomHostelId
        );
    };

    // =========================================================
    // ACTIVE STUDENT USER IDS
    // =========================================================

    const activeStudentIds =
        new Set(
            allocations
                .map((allocation) => {
                    if (
                        allocation.student &&
                        typeof allocation.student ===
                            "object"
                    ) {
                        return String(
                            allocation.student._id ||
                            allocation.student.id ||
                            ""
                        );
                    }

                    return String(
                        allocation.student ||
                        ""
                    );
                })
                .filter(Boolean)
        );

    // =========================================================
    // UNALLOCATED STUDENTS
    // =========================================================

    const unallocatedStudents =
        students.filter((student) => {
            const userId =
                getStudentUserId(student);

            return (
                userId &&
                !activeStudentIds.has(
                    userId
                )
            );
        });

    // =========================================================
    // AVAILABLE ROOMS
    // =========================================================

    const availableRooms =
        rooms.filter((room) => {
            const occupied =
                Number(
                    room.occupiedCount || 0
                );

            const capacity =
                Number(
                    room.capacity || 0
                );

            return (
                room.status === "AVAILABLE" &&
                occupied < capacity
            );
        });

    // =========================================================
    // SEARCH ACTIVE ALLOCATIONS
    // =========================================================

    const filteredAllocations =
        allocations.filter(
            (allocation) => {
                const student =
                    getAllocationStudent(
                        allocation
                    );

                const room =
                    getAllocationRoom(
                        allocation
                    );

                const studentName =
                    getStudentName(
                        student
                    ).toLowerCase();

                const studentId =
                    getStudentId(
                        student
                    ).toLowerCase();

                const roomNumber =
                    room?.roomNumber
                        ?.toString()
                        .toLowerCase() ||
                    "";

                const searchText =
                    search
                        .trim()
                        .toLowerCase();

                if (!searchText) {
                    return true;
                }

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

    // =========================================================
    // RESET ALLOCATE FORM
    // =========================================================

    const resetAllocateForm = () => {
        setSelectedStudent("");
        setSelectedRoom("");
        setShowAllocateForm(false);
    };

    // =========================================================
    // ALLOCATE ROOM
    // =========================================================

    const handleAllocate = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

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
            setSaving(true);

            const response =
                await api.post(
                    "/allocations",
                    {
                        student:
                            selectedStudent,
                        room:
                            selectedRoom
                    },
                    authConfig
                );

            setSuccess(
                response.data.message ||
                "Room allocated successfully."
            );

            resetAllocateForm();

            await loadData();
        } catch (error) {
            console.error(
                "Allocate room error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to allocate room."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // START CHANGE ROOM
    // =========================================================

    const handleStartChangeRoom = (
        allocation
    ) => {
        setChangingAllocation(
            allocation
        );

        setChangeRoom("");

        setSelectedAllocation(null);

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =========================================================
    // CHANGE ROOM
    // =========================================================

    const handleChangeRoom = async (
        e
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!changeRoom) {
            setError(
                "Please select a new room."
            );

            return;
        }

        if (!changingAllocation) {
            setError(
                "Allocation not selected."
            );

            return;
        }

        try {
            setSaving(true);

            const allocationId =
                changingAllocation._id ||
                changingAllocation.id;

            const response =
                await api.put(
                    `/allocations/${allocationId}/change-room`,
                    {
                        newRoom:
                            changeRoom
                    },
                    authConfig
                );

            setSuccess(
                response.data.message ||
                "Room allocation changed successfully."
            );

            setChangingAllocation(
                null
            );

            setChangeRoom("");

            await loadData();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
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
            setSaving(false);
        }
    };

    // =========================================================
    // VACATE ROOM
    // =========================================================

    const handleVacate = async (
        allocation
    ) => {
        const student =
            getAllocationStudent(
                allocation
            );

        const studentName =
            getStudentName(
                student
            );

        const confirmed =
            window.confirm(
                `Are you sure you want to vacate ${studentName}'s room?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            setSaving(true);

            const allocationId =
                allocation._id ||
                allocation.id;

            const response =
                await api.put(
                    `/allocations/${allocationId}/vacate`,
                    {},
                    authConfig
                );

            setSuccess(
                response.data.message ||
                "Room vacated successfully."
            );

            setSelectedAllocation(
                null
            );

            await loadData();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
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
            setSaving(false);
        }
    };

    // =========================================================
    // VIEW ALLOCATION
    // =========================================================

    const handleViewAllocation = (
        allocation
    ) => {
        setSelectedAllocation(
            allocation
        );

        setChangingAllocation(
            null
        );

        setError("");
        setSuccess("");
    };

    // =========================================================
    // CANCEL CHANGE ROOM
    // =========================================================

    const handleCancelChange = () => {
        setChangingAllocation(
            null
        );

        setChangeRoom("");

        setError("");
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div>
            <h1>
                Admin - Allocation Management
            </h1>

            {/* =========================
                NAVIGATION
            ========================= */}

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
                onClick={() => {
                    setError("");
                    setSuccess("");
                    setSelectedAllocation(
                        null
                    );
                    setChangingAllocation(
                        null
                    );
                    setSelectedStudent("");
                    setSelectedRoom("");
                    setShowAllocateForm(
                        true
                    );

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }}
            >
                Allocate Room
            </button>

            <hr />

            {/* =========================
                SUCCESS MESSAGE
            ========================= */}

            {success && (
                <p style={{ color: "green" }}>
                    {success}
                </p>
            )}

            {/* =========================
                ERROR MESSAGE
            ========================= */}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {/* =====================================================
                ALLOCATE ROOM FORM
            ===================================================== */}

            {showAllocateForm && (
                <div>
                    <h2>
                        Allocate Room
                    </h2>

                    <form
                        onSubmit={
                            handleAllocate
                        }
                    >
                        {/* STUDENT */}

                        <p>
                            <strong>
                                Student:
                            </strong>
                            <br />

                            <select
                                value={
                                    selectedStudent
                                }
                                onChange={(e) =>
                                    setSelectedStudent(
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    saving
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

                                        return (
                                            <option
                                                key={
                                                    userId
                                                }
                                                value={
                                                    userId
                                                }
                                            >
                                                {getStudentName(
                                                    student
                                                )}{" "}
                                                -{" "}
                                                {
                                                    student.studentId
                                                }
                                            </option>
                                        );
                                    }
                                )}
                            </select>
                        </p>

                        {/* ROOM */}

                        <p>
                            <strong>
                                Available Room:
                            </strong>
                            <br />

                            <select
                                value={
                                    selectedRoom
                                }
                                onChange={(e) =>
                                    setSelectedRoom(
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    saving
                                }
                            >
                                <option value="">
                                    Select Room
                                </option>

                                {availableRooms.map(
                                    (room) => {
                                        const roomId =
                                            room._id ||
                                            room.id;

                                        const availableBeds =
                                            Number(
                                                room.capacity ||
                                                    0
                                            ) -
                                            Number(
                                                room.occupiedCount ||
                                                    0
                                            );

                                        return (
                                            <option
                                                key={
                                                    roomId
                                                }
                                                value={
                                                    roomId
                                                }
                                            >
                                                Room{" "}
                                                {
                                                    room.roomNumber
                                                }{" "}
                                                -{" "}
                                                {
                                                    availableBeds
                                                }{" "}
                                                bed(s)
                                                available
                                            </option>
                                        );
                                    }
                                )}
                            </select>
                        </p>

                        {/* NO STUDENTS */}

                        {unallocatedStudents.length ===
                            0 && (
                            <p>
                                No unallocated
                                students available.
                            </p>
                        )}

                        {/* NO ROOMS */}

                        {availableRooms.length ===
                            0 && (
                            <p>
                                No available rooms
                                found.
                            </p>
                        )}

                        {/* ALLOCATE */}

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                unallocatedStudents.length ===
                                    0 ||
                                availableRooms.length ===
                                    0
                            }
                        >
                            {saving
                                ? "Allocating..."
                                : "Allocate"}
                        </button>

                        {" "}

                        {/* CANCEL */}

                        <button
                            type="button"
                            onClick={
                                resetAllocateForm
                            }
                            disabled={
                                saving
                            }
                        >
                            Cancel
                        </button>
                    </form>

                    <hr />
                </div>
            )}

            {/* =====================================================
                CHANGE ROOM FORM
            ===================================================== */}

            {changingAllocation && (
                <div>
                    <h2>
                        Change Room
                    </h2>

                    {(() => {
                        const student =
                            getAllocationStudent(
                                changingAllocation
                            );

                        const room =
                            getAllocationRoom(
                                changingAllocation
                            );

                        return (
                            <div>
                                <p>
                                    <strong>
                                        Student:
                                    </strong>{" "}
                                    {getStudentName(
                                        student
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Student ID:
                                    </strong>{" "}
                                    {getStudentId(
                                        student
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Current Room:
                                    </strong>{" "}
                                    {room?.roomNumber ||
                                        "N/A"}
                                </p>
                            </div>
                        );
                    })()}

                    <form
                        onSubmit={
                            handleChangeRoom
                        }
                    >
                        <p>
                            <strong>
                                New Room:
                            </strong>
                            <br />

                            <select
                                value={
                                    changeRoom
                                }
                                onChange={(e) =>
                                    setChangeRoom(
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    saving
                                }
                            >
                                <option value="">
                                    Select New Room
                                </option>

                                {availableRooms
                                    .filter(
                                        (room) => {
                                            const currentRoom =
                                                getAllocationRoom(
                                                    changingAllocation
                                                );

                                            return (
                                                String(
                                                    room._id ||
                                                    room.id ||
                                                    ""
                                                ) !==
                                                String(
                                                    currentRoom?._id ||
                                                    currentRoom?.id ||
                                                    ""
                                                )
                                            );
                                        }
                                    )
                                    .map(
                                        (room) => {
                                            const roomId =
                                                room._id ||
                                                room.id;

                                            const availableBeds =
                                                Number(
                                                    room.capacity ||
                                                        0
                                                ) -
                                                Number(
                                                    room.occupiedCount ||
                                                        0
                                                );

                                            return (
                                                <option
                                                    key={
                                                        roomId
                                                    }
                                                    value={
                                                        roomId
                                                    }
                                                >
                                                    Room{" "}
                                                    {
                                                        room.roomNumber
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        availableBeds
                                                    }{" "}
                                                    bed(s)
                                                    available
                                                </option>
                                            );
                                        }
                                    )}
                            </select>
                        </p>

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                availableRooms.length ===
                                    0
                            }
                        >
                            {saving
                                ? "Changing..."
                                : "Change Room"}
                        </button>

                        {" "}

                        <button
                            type="button"
                            onClick={
                                handleCancelChange
                            }
                            disabled={
                                saving
                            }
                        >
                            Cancel
                        </button>
                    </form>

                    <hr />
                </div>
            )}

            {/* =====================================================
                SEARCH
            ===================================================== */}

            <div>
                <input
                    type="text"
                    placeholder="Search by student name, student ID, or room number..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                {" "}

                <button
                    type="button"
                    onClick={() =>
                        setSearch("")
                    }
                >
                    Clear
                </button>
            </div>

            <hr />

            {/* =====================================================
                ALLOCATION DETAILS
            ===================================================== */}

            {selectedAllocation && (
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
                        Allocation Details
                    </h2>

                    {(() => {
                        const student =
                            getAllocationStudent(
                                selectedAllocation
                            );

                        const room =
                            getAllocationRoom(
                                selectedAllocation
                            );

                        const hostel =
                            getRoomHostel(
                                room
                            );

                        return (
                            <div>
                                <p>
                                    <strong>
                                        Student:
                                    </strong>{" "}
                                    {getStudentName(
                                        student
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Student ID:
                                    </strong>{" "}
                                    {getStudentId(
                                        student
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Room:
                                    </strong>{" "}
                                    {room?.roomNumber ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Hostel:
                                    </strong>{" "}
                                    {hostel?.name ||
                                        hostel?.blockCode ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Allocation
                                        Date:
                                    </strong>{" "}
                                    {selectedAllocation.allocationDate
                                        ? new Date(
                                              selectedAllocation.allocationDate
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{" "}
                                    {
                                        selectedAllocation.status
                                    }
                                </p>
                            </div>
                        );
                    })()}

                    <button
                        type="button"
                        onClick={() =>
                            setSelectedAllocation(
                                null
                            )
                        }
                    >
                        Close
                    </button>
                </div>
            )}

            {/* =====================================================
                ACTIVE ALLOCATIONS
            ===================================================== */}

            <h2>
                Active Allocations
            </h2>

            {loading ? (
                <p>
                    Loading allocations...
                </p>
            ) : filteredAllocations.length ===
              0 ? (
                <p>
                    No active allocations
                    found.
                </p>
            ) : (
                <div>
                    <p>
                        <strong>
                            Total Active
                            Allocations:
                        </strong>{" "}
                        {
                            filteredAllocations.length
                        }
                    </p>

                    {filteredAllocations.map(
                        (allocation) => {
                            const allocationKey =
                                allocation._id ||
                                allocation.id;

                            const student =
                                getAllocationStudent(
                                    allocation
                                );

                            const room =
                                getAllocationRoom(
                                    allocation
                                );

                            const hostel =
                                getRoomHostel(
                                    room
                                );

                            return (
                                <div
                                    key={
                                        allocationKey
                                    }
                                    style={{
                                        border:
                                            "1px solid #ccc",
                                        padding:
                                            "15px",
                                        marginBottom:
                                            "10px"
                                    }}
                                >
                                    {/* STUDENT NAME */}

                                    <h3>
                                        {getStudentName(
                                            student
                                        )}
                                    </h3>

                                    {/* STUDENT ID */}

                                    <p>
                                        <strong>
                                            Student ID:
                                        </strong>{" "}
                                        {getStudentId(
                                            student
                                        )}
                                    </p>

                                    {/* ROOM */}

                                    <p>
                                        <strong>
                                            Room:
                                        </strong>{" "}
                                        {room?.roomNumber ||
                                            "N/A"}
                                    </p>

                                    {/* HOSTEL */}

                                    <p>
                                        <strong>
                                            Hostel:
                                        </strong>{" "}
                                        {hostel?.name ||
                                            hostel?.blockCode ||
                                            "N/A"}
                                    </p>

                                    {/* ALLOCATION DATE */}

                                    <p>
                                        <strong>
                                            Allocation
                                            Date:
                                        </strong>{" "}
                                        {allocation.allocationDate
                                            ? new Date(
                                                  allocation.allocationDate
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </p>

                                    {/* STATUS */}

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {
                                            allocation.status
                                        }
                                    </p>

                                    {/* VIEW */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleViewAllocation(
                                                allocation
                                            )
                                        }
                                    >
                                        View
                                    </button>

                                    {" "}

                                    {/* CHANGE ROOM */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleStartChangeRoom(
                                                allocation
                                            )
                                        }
                                    >
                                        Change Room
                                    </button>

                                    {" "}

                                    {/* VACATE */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleVacate(
                                                allocation
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Vacate
                                    </button>
                                </div>
                            );
                        }
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminAllocations;