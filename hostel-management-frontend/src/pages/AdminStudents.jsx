import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminStudents = () => {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const detailsRef = useRef(null);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isAdding, setIsAdding] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const token = localStorage.getItem("token");

    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [studentId, setStudentId] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [course, setCourse] = useState("");
    const [year, setYear] = useState("");
    const [address, setAddress] = useState("");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // --------------------------------
    // Reset form
    // --------------------------------

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setStudentId("");
        setPhone("");
        setDateOfBirth("");
        setGender("");
        setCourse("");
        setYear("");
        setAddress("");
    };

    // --------------------------------
    // Fetch students
    // --------------------------------

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError("");

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

            setError(
                error.response?.data?.message ||
                "Failed to load students."
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

        fetchStudents();
    }, [token]);

    // --------------------------------
    // Scroll to Student Details
    // --------------------------------

    useEffect(() => {
        if (selectedStudent) {
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }, [selectedStudent]);

    // --------------------------------
    // Search
    // --------------------------------

    const handleSearch = async () => {
        if (!search.trim()) {
            fetchStudents();
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/students/search?search=${encodeURIComponent(
                    search.trim()
                )}`,
                authConfig
            );

            setStudents(
                response.data.students || []
            );
        } catch (error) {
            console.error(
                "Search students error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to search students."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearch("");
        fetchStudents();
    };

    // --------------------------------
    // Add Student
    // --------------------------------

    const handleAddStudent = () => {
        resetForm();

        setEditingStudent(null);
        setSelectedStudent(null);

        setError("");
        setSuccess("");

        setIsAdding(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // --------------------------------
    // Edit Student
    // --------------------------------

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setSelectedStudent(null);

        setError("");
        setSuccess("");

        setName(student.user?.name || "");
        setEmail(student.user?.email || "");
        setPassword("");

        setStudentId(student.studentId || "");
        setPhone(student.phone || "");

        setDateOfBirth(
            student.dateOfBirth
                ? new Date(student.dateOfBirth)
                      .toISOString()
                      .split("T")[0]
                : ""
        );

        setGender(student.gender || "");
        setCourse(student.course || "");
        setYear(student.year || "");
        setAddress(student.address || "");

        setIsAdding(false);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // --------------------------------
    // Cancel Form
    // --------------------------------

    const handleCancelForm = () => {
        resetForm();

        setEditingStudent(null);
        setIsAdding(false);

        setError("");
        setSuccess("");
    };

    // --------------------------------
    // Save Student
    // --------------------------------

    const handleSaveStudent = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!editingStudent && !password.trim()) {
            setError("Password is required.");
            return;
        }

        if (!studentId.trim()) {
            setError("Student ID is required.");
            return;
        }

        if (!phone.trim()) {
            setError("Phone number is required.");
            return;
        }

        if (!dateOfBirth) {
            setError("Date of birth is required.");
            return;
        }

        if (!gender) {
            setError("Gender is required.");
            return;
        }

        if (!course.trim()) {
            setError("Course is required.");
            return;
        }

        if (!year) {
            setError("Year is required.");
            return;
        }

        if (!address.trim()) {
            setError("Address is required.");
            return;
        }

        try {
            setSaving(true);

            if (editingStudent) {
                const studentIdValue =
                    editingStudent._id ||
                    editingStudent.id;

                const response = await api.put(
                    `/students/${studentIdValue}`,
                    {
                        name: name.trim(),
                        email: email.trim(),
                        phone: phone.trim(),
                        dateOfBirth,
                        gender,
                        course: course.trim(),
                        year: Number(year),
                        address: address.trim()
                    },
                    authConfig
                );

                setSuccess(
                    response.data.message ||
                    "Student updated successfully."
                );
            } else {
                const response = await api.post(
                    "/students",
                    {
                        name: name.trim(),
                        email: email.trim(),
                        password: password.trim(),
                        studentId: studentId.trim(),
                        phone: phone.trim(),
                        dateOfBirth,
                        gender,
                        course: course.trim(),
                        year: Number(year),
                        address: address.trim()
                    },
                    authConfig
                );

                setSuccess(
                    response.data.message ||
                    "Student created successfully."
                );
            }

            resetForm();
            setEditingStudent(null);
            setIsAdding(false);

            await fetchStudents();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {
            console.error(
                "Save student error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to save student."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------
    // Delete Student
    // --------------------------------

    const handleDeleteStudent = async (student) => {
        const studentIdValue =
            student._id ||
            student.id;

        const studentName =
            student.user?.name ||
            "this student";

        const confirmed = window.confirm(
            `Are you sure you want to delete ${studentName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/students/${studentIdValue}`,
                authConfig
            );

            setSuccess(
                "Student deleted successfully."
            );

            if (
                selectedStudent &&
                (
                    selectedStudent._id ||
                    selectedStudent.id
                ) === studentIdValue
            ) {
                setSelectedStudent(null);
            }

            await fetchStudents();

        } catch (error) {
            console.error(
                "Delete student error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete student."
            );
        }
    };

    // --------------------------------
    // View Student
    // --------------------------------

    const handleViewStudent = async (student) => {
        try {
            setError("");
            setSuccess("");

            const studentIdValue =
                student._id ||
                student.id;

            const response = await api.get(
                `/students/${studentIdValue}`,
                authConfig
            );

            setSelectedStudent(
                response.data.student
            );

            setEditingStudent(null);
            setIsAdding(false);

        } catch (error) {
            console.error(
                "Get student details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load student details."
            );
        }
    };

    return (
        <div>
            <h1>Admin - Student Management</h1>

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
                onClick={handleAddStudent}
            >
                Add Student
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
                    placeholder="Search by name, student ID, room, phone, course..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
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
                    onClick={handleClearSearch}
                >
                    Clear
                </button>
            </div>

            <hr />

            {/* Add / Edit Form */}

            {(isAdding || editingStudent) && (
                <div>
                    <h2>
                        {editingStudent
                            ? "Edit Student"
                            : "Add Student"}
                    </h2>

                    <form
                        onSubmit={
                            handleSaveStudent
                        }
                    >
                        <p>
                            <strong>Name:</strong>
                            <br />

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                    )
                                }
                            />
                        </p>

                        <p>
                            <strong>Email:</strong>
                            <br />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                            />
                        </p>

                        {!editingStudent && (
                            <p>
                                <strong>
                                    Password:
                                </strong>
                                <br />

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                />
                            </p>
                        )}

                        <p>
                            <strong>
                                Student ID:
                            </strong>
                            <br />

                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) =>
                                    setStudentId(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    !!editingStudent
                                }
                            />
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            <br />

                            <input
                                type="text"
                                value={phone}
                                onChange={(e) =>
                                    setPhone(
                                        e.target.value
                                    )
                                }
                            />
                        </p>

                        <p>
                            <strong>
                                Date of Birth:
                            </strong>
                            <br />

                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) =>
                                    setDateOfBirth(
                                        e.target.value
                                    )
                                }
                            />
                        </p>

                        <p>
                            <strong>Gender:</strong>
                            <br />

                            <select
                                value={gender}
                                onChange={(e) =>
                                    setGender(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Select Gender
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </p>

                        <p>
                            <strong>Course:</strong>
                            <br />

                            <input
                                type="text"
                                value={course}
                                onChange={(e) =>
                                    setCourse(
                                        e.target.value
                                    )
                                }
                            />
                        </p>

                        <p>
                            <strong>Year:</strong>
                            <br />

                            <input
                                type="number"
                                min="1"
                                value={year}
                                onChange={(e) =>
                                    setYear(
                                        e.target.value
                                    )
                                }
                            />
                        </p>

                        <p>
                            <strong>Address:</strong>
                            <br />

                            <textarea
                                value={address}
                                onChange={(e) =>
                                    setAddress(
                                        e.target.value
                                    )
                                }
                                rows="4"
                                cols="40"
                            />
                        </p>

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingStudent
                                ? "Update Student"
                                : "Create Student"}
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

            {/* Student Details */}

            {selectedStudent && (
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
                        Student Details
                    </h2>

                    <p>
                        <strong>
                            Student ID:
                        </strong>{" "}
                        {
                            selectedStudent.studentId
                        }
                    </p>

                    <p>
                        <strong>Name:</strong>{" "}
                        {
                            selectedStudent.user
                                ?.name
                        }
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {
                            selectedStudent.user
                                ?.email
                        }
                    </p>

                    <p>
                        <strong>Phone:</strong>{" "}
                        {
                            selectedStudent.phone ||
                            "N/A"
                        }
                    </p>

                    <p>
                        <strong>
                            Date of Birth:
                        </strong>{" "}
                        {selectedStudent.dateOfBirth
                            ? new Date(
                                  selectedStudent.dateOfBirth
                              ).toLocaleDateString()
                            : "N/A"}
                    </p>

                    <p>
                        <strong>Gender:</strong>{" "}
                        {
                            selectedStudent.gender ||
                            "N/A"
                        }
                    </p>

                    <p>
                        <strong>Course:</strong>{" "}
                        {
                            selectedStudent.course ||
                            "N/A"
                        }
                    </p>

                    <p>
                        <strong>Year:</strong>{" "}
                        {
                            selectedStudent.year ||
                            "N/A"
                        }
                    </p>

                    <p>
                        <strong>Address:</strong>{" "}
                        {
                            selectedStudent.address ||
                            "N/A"
                        }
                    </p>

                    <p>
                        <strong>Status:</strong>{" "}
                        {
                            selectedStudent.user
                                ?.isActive
                                ? "Active"
                                : "Inactive"
                        }
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setSelectedStudent(null)
                        }
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Students */}

            <h2>Students</h2>

            {loading ? (
                <p>Loading students...</p>
            ) : students.length === 0 ? (
                <p>No students found.</p>
            ) : (
                <div>
                    {students.map((student) => {
                        const studentKey =
                            student._id ||
                            student.id;

                        return (
                            <div
                                key={studentKey}
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
                                    {student.user
                                        ?.name ||
                                        "N/A"}
                                </h3>

                                <p>
                                    <strong>
                                        Student ID:
                                    </strong>{" "}
                                    {
                                        student.studentId
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Email:
                                    </strong>{" "}
                                    {student.user
                                        ?.email ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Phone:
                                    </strong>{" "}
                                    {student.phone ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Course:
                                    </strong>{" "}
                                    {student.course ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Year:
                                    </strong>{" "}
                                    {student.year ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{" "}
                                    {student.user
                                        ?.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleViewStudent(
                                            student
                                        )
                                    }
                                >
                                    View
                                </button>

                                {" "}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleEditStudent(
                                            student
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                {" "}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteStudent(
                                            student
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

export default AdminStudents;