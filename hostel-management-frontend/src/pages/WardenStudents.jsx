import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const WardenStudents = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [allocations, setAllocations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [keyword, setKeyword] = useState("");
    const [searching, setSearching] = useState(false);

    // Fetch students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/students", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success !== false) {
                setStudents(response.data.students || []);
            } else {
                setError(
                    response.data.message ||
                    "Failed to load students."
                );
            }
        } catch (error) {
            console.error(
                "Warden students loading error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load students."
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch room allocations
    const fetchAllocations = async () => {
        try {
            const response = await api.get("/allocations", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success !== false) {
                setAllocations(
                    response.data.allocations || []
                );
            }
        } catch (error) {
            console.error(
                "Warden allocations loading error:",
                error
            );
        }
    };

    // Fetch students and allocations
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            await Promise.all([
                fetchStudents(),
                fetchAllocations()
            ]);
        } catch (error) {
            console.error(
                "Warden student data loading error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        const searchKeyword = keyword.trim();

        if (!searchKeyword) {
            fetchData();
            return;
        }

        try {
            setSearching(true);
            setError("");

            const response = await api.get(
                `/students/search?search=${encodeURIComponent(
                    searchKeyword
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success !== false) {
                setStudents(response.data.students || []);
            } else {
                setError(
                    response.data.message ||
                    "No students found."
                );

                setStudents([]);
            }
        } catch (error) {
            console.error(
                "Student search error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to search students."
            );

            setStudents([]);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    // Find active allocation for a student
    const getStudentAllocation = (studentId) => {
    return allocations.find(
        (allocation) =>
            allocation.student?.studentId === studentId &&
            allocation.status === "ACTIVE"
    );
};

    return (
        <div style={{ padding: "24px" }}>

            <button
                onClick={() => navigate("/warden")}
                style={{
                    marginBottom: "20px",
                    padding: "8px 16px",
                    cursor: "pointer"
                }}
            >
                ← Back to Dashboard
            </button>

            <h1>Students</h1>

            <p>
                View students registered in the hostel
                management system.
            </p>

            <form
                onSubmit={handleSearch}
                style={{
                    marginTop: "20px",
                    marginBottom: "20px"
                }}
            >
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(e.target.value)
                    }
                    placeholder="Search by name, student ID, or room number"
                    style={{
                        padding: "10px",
                        width: "350px",
                        marginRight: "10px"
                    }}
                />

                <button
                    type="submit"
                    disabled={searching}
                    style={{
                        padding: "10px 16px",
                        cursor: "pointer"
                    }}
                >
                    {searching
                        ? "Searching..."
                        : "Search"}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setKeyword("");
                        fetchData();
                    }}
                    style={{
                        padding: "10px 16px",
                        marginLeft: "10px",
                        cursor: "pointer"
                    }}
                >
                    Clear
                </button>
            </form>

            {loading && (
                <p>Loading students...</p>
            )}

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

            {!loading &&
                !error &&
                students.length === 0 && (
                    <p>No students found.</p>
                )}

            {!loading &&
                students.length > 0 && (
                    <div>

                        <p>
                            Total Students:{" "}
                            <strong>
                                {students.length}
                            </strong>
                        </p>

                        {students.map((student) => {
                            const allocation =
                                getStudentAllocation(
                                    student.studentId
                                );

                            return (
                                <div
                                    key={student._id}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "16px",
                                        marginBottom: "12px"
                                    }}
                                >
                                    <h3 style={{ color: "#000000" }}>
    {student.user?.name || "N/A"}
</h3>

<p style={{ color: "#000000" }}>
    <strong>Student ID:</strong> {student.studentId}
</p>

<p style={{ color: "#000000" }}>
    <strong>Email:</strong> {student.user?.email || "N/A"}
</p>

<p style={{ color: "#000000" }}>
    <strong>Course:</strong> {student.course || "N/A"}
</p>

<p style={{ color: "#000000" }}>
    <strong>Year:</strong> {student.year || "N/A"}
</p>

<p style={{ color: "#000000" }}>
    <strong>Room:</strong>{" "}
    {allocation?.room?.roomNumber ? (
        <span style={{ color: "#000000", fontWeight: "bold" }}>
            {allocation.room.roomNumber}
        </span>
    ) : (
        <span style={{ color: "#666666" }}>
            Not Allocated
        </span>
    )}
</p>

<p style={{ color: "#000000" }}>
    <strong>Status:</strong>{" "}
    {student.user?.isActive ? "Active" : "Inactive"}
</p>
                                </div>
                            );
                        })}
                    </div>
                )}
        </div>
    );
};

export default WardenStudents;