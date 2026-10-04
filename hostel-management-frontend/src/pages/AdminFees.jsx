import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminFees = () => {
    const navigate = useNavigate();

    // =========================
    // DATA
    // =========================

    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);

    // =========================
    // SEARCH
    // =========================

    const [search, setSearch] = useState("");

    // =========================
    // CREATE FEE FORM
    // =========================

    const [showForm, setShowForm] = useState(false);

    const [selectedStudent, setSelectedStudent] =
        useState("");

    const [totalAmount, setTotalAmount] =
        useState("");

    const [dueDate, setDueDate] =
        useState("");

    // =========================
    // DETAILS
    // =========================

    const [selectedFee, setSelectedFee] =
        useState(null);

    const detailsRef = useRef(null);

    // =========================
    // LOADING
    // =========================

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    // =========================
    // MESSAGES
    // =========================

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    // =========================
    // AUTH
    // =========================

    const token =
        localStorage.getItem("token");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // =========================================================
    // GET STUDENT ID
    // =========================================================

    const getStudentId = (student) => {
        if (!student) {
            return "";
        }

        return String(
            student._id ||
            student.id ||
            ""
        );
    };

    // =========================================================
    // GET STUDENT USER ID
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
            student.user ||
            ""
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
                student.name ||
                "N/A"
            );
        }

        return (
            student.name ||
            "N/A"
        );
    };

    // =========================================================
    // FIND STUDENT FOR FEE
    // =========================================================

    const getFeeStudent = (fee) => {
        if (!fee) {
            return undefined;
        }

        // If backend returns populated student object
        if (
            fee.student &&
            typeof fee.student === "object"
        ) {
            return fee.student;
        }

        // If backend returns studentId
        if (fee.studentId) {
            const studentId =
                String(
                    fee.studentId
                );

            const student =
                students.find(
                    (student) =>
                        String(
                            student.studentId ||
                            ""
                        ) === studentId
                );

            if (student) {
                return student;
            }
        }

        // If backend returns student as ID
        if (fee.student) {
            const studentRef =
                String(
                    fee.student
                );

            let student =
                students.find(
                    (student) =>
                        getStudentId(
                            student
                        ) === studentRef
                );

            if (student) {
                return student;
            }

            student =
                students.find(
                    (student) =>
                        getStudentUserId(
                            student
                        ) === studentRef
                );

            if (student) {
                return student;
            }
        }

        return undefined;
    };

    // =========================================================
    // FETCH FEES
    // =========================================================

    const fetchFees = async () => {
        try {
            const response =
                await api.get(
                    "/fees",
                    authConfig
                );

            setFees(
                response.data.fees ||
                []
            );
        } catch (error) {
            console.error(
                "Fetch fees error:",
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
            const response =
                await api.get(
                    "/students",
                    authConfig
                );

            setStudents(
                response.data.students ||
                []
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
    // LOAD DATA
    // =========================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            await Promise.all([
                fetchFees(),
                fetchStudents()
            ]);
        } catch (error) {
            console.error(
                "Load fee data error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load fee data."
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
    // SCROLL TO FEE DETAILS
    // =========================================================

    useEffect(() => {
        if (selectedFee) {
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }, [selectedFee]);

    // =========================================================
    // STUDENTS WHO DO NOT HAVE A FEE
    // =========================================================

    const studentsWithFees =
        new Set(
            fees
                .map((fee) => {
                    if (
                        fee.studentId
                    ) {
                        return String(
                            fee.studentId
                        );
                    }

                    const student =
                        getFeeStudent(
                            fee
                        );

                    return student?.studentId
                        ? String(
                              student.studentId
                          )
                        : "";
                })
                .filter(Boolean)
        );

    const studentsWithoutFees =
        students.filter(
            (student) =>
                student.studentId &&
                !studentsWithFees.has(
                    String(
                        student.studentId
                    )
                )
        );

    // =========================================================
    // SEARCH FEES
    // =========================================================

    const filteredFees =
        fees.filter((fee) => {
            const student =
                getFeeStudent(
                    fee
                );

            const studentName =
                getStudentName(
                    student
                ).toLowerCase();

            const studentId =
                (
                    student?.studentId ||
                    fee.studentId ||
                    ""
                )
                    .toString()
                    .toLowerCase();

            const status =
                (
                    fee.status ||
                    ""
                )
                    .toString()
                    .toLowerCase();

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
                status.includes(
                    searchText
                )
            );
        });

    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {
        setSelectedStudent("");
        setTotalAmount("");
        setDueDate("");
        setShowForm(false);
    };

    // =========================================================
    // CREATE FEE
    // =========================================================

    const handleCreateFee = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!selectedStudent) {
            setError(
                "Please select a student."
            );

            return;
        }

        if (!totalAmount) {
            setError(
                "Please enter the total fee amount."
            );

            return;
        }

        const amount =
            Number(totalAmount);

        if (
            Number.isNaN(amount) ||
            amount <= 0
        ) {
            setError(
                "Fee amount must be greater than 0."
            );

            return;
        }

        if (!dueDate) {
            setError(
                "Please select a due date."
            );

            return;
        }

        try {
            setSaving(true);

            const response =
                await api.post(
                    "/fees",
                    {
                        student:
                            selectedStudent,

                        totalAmount:
                            amount,

                        dueDate:
                            dueDate
                    },
                    authConfig
                );

            setSuccess(
                response.data.message ||
                "Fee record created successfully."
            );

            resetForm();

            await loadData();
        } catch (error) {
            console.error(
                "Create fee error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create fee record."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // VIEW FEE
    // =========================================================

    const handleViewFee = (fee) => {
        setSelectedFee(
            fee
        );

        setError("");
        setSuccess("");
    };

    // =========================================================
    // CLOSE DETAILS
    // =========================================================

    const handleCloseDetails = () => {
        setSelectedFee(
            null
        );
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(
            date
        ).toLocaleDateString();
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div>
            <h1>
                Admin - Fee Management
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
                    setSelectedFee(null);
                    setSelectedStudent("");
                    setTotalAmount("");
                    setDueDate("");
                    setShowForm(true);

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }}
            >
                Create Fee
            </button>

            <hr />

            {/* =========================
                SUCCESS
            ========================= */}

            {success && (
                <p
                    style={{
                        color: "green"
                    }}
                >
                    {success}
                </p>
            )}

            {/* =========================
                ERROR
            ========================= */}

            {error && (
                <p
                    style={{
                        color: "red"
                    }}
                >
                    {error}
                </p>
            )}

            {/* =====================================================
                CREATE FEE FORM
            ===================================================== */}

            {showForm && (
                <div>
                    <h2>
                        Create Fee Record
                    </h2>

                    <form
                        onSubmit={
                            handleCreateFee
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

                                {studentsWithoutFees.map(
                                    (student) => {
                                        return (
                                            <option
                                                key={
                                                    student.studentId
                                                }
                                                value={
                                                    student.studentId
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

                        {/* TOTAL AMOUNT */}

                        <p>
                            <strong>
                                Total Amount:
                            </strong>
                            <br />

                            <input
                                type="number"
                                min="1"
                                value={
                                    totalAmount
                                }
                                onChange={(e) =>
                                    setTotalAmount(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Enter total fee"
                                disabled={
                                    saving
                                }
                            />
                        </p>

                        {/* DUE DATE */}

                        <p>
                            <strong>
                                Due Date:
                            </strong>
                            <br />

                            <input
                                type="date"
                                value={
                                    dueDate
                                }
                                onChange={(e) =>
                                    setDueDate(
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    saving
                                }
                            />
                        </p>

                        {/* NO STUDENTS */}

                        {studentsWithoutFees.length ===
                            0 && (
                            <p>
                                All students already
                                have fee records.
                            </p>
                        )}

                        {/* SUBMIT */}

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                studentsWithoutFees.length ===
                                    0
                            }
                        >
                            {saving
                                ? "Creating..."
                                : "Create Fee"}
                        </button>

                        {" "}

                        {/* CANCEL */}

                        <button
                            type="button"
                            onClick={
                                resetForm
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
                    placeholder="Search by student name, student ID, or status..."
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
                FEE DETAILS
            ===================================================== */}

            {selectedFee && (
                <div
                    ref={detailsRef}
                    style={{
                        border:
                            "2px solid #333",
                        padding:
                            "20px",
                        marginBottom:
                            "25px",
                        backgroundColor:
                            "#fff"
                    }}
                >
                    <h2>
                        Fee Details
                    </h2>

                    {(() => {
                        const student =
                            getFeeStudent(
                                selectedFee
                            );

                        const studentName =
                            getStudentName(
                                student
                            );

                        const studentId =
                            student?.studentId ||
                            selectedFee.studentId ||
                            "N/A";

                        return (
                            <div>
                                <p>
                                    <strong>
                                        Student:
                                    </strong>{" "}
                                    {
                                        studentName
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Student ID:
                                    </strong>{" "}
                                    {
                                        studentId
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Total Amount:
                                    </strong>{" "}
                                    ₹
                                    {
                                        selectedFee.totalAmount ??
                                        0
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Paid Amount:
                                    </strong>{" "}
                                    ₹
                                    {
                                        selectedFee.paidAmount ??
                                        0
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Remaining Amount:
                                    </strong>{" "}
                                    ₹
                                    {
                                        selectedFee.remainingAmount ??
                                        0
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Due Date:
                                    </strong>{" "}
                                    {formatDate(
                                        selectedFee.dueDate
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{" "}
                                    {
                                        selectedFee.status ||
                                        "N/A"
                                    }
                                </p>
                            </div>
                        );
                    })()}

                    <button
                        type="button"
                        onClick={
                            handleCloseDetails
                        }
                    >
                        Close
                    </button>
                </div>
            )}

            {/* =====================================================
                FEES LIST
            ===================================================== */}

            <h2>
                All Fee Records
            </h2>

            {loading ? (
                <p>
                    Loading fee records...
                </p>
            ) : filteredFees.length ===
              0 ? (
                <p>
                    No fee records found.
                </p>
            ) : (
                <div>
                    <p>
                        <strong>
                            Total Fee Records:
                        </strong>{" "}
                        {
                            filteredFees.length
                        }
                    </p>

                    {filteredFees.map(
                        (fee) => {
                            const feeId =
                                fee._id ||
                                fee.id;

                            const student =
                                getFeeStudent(
                                    fee
                                );

                            const studentName =
                                getStudentName(
                                    student
                                );

                            const studentId =
                                student?.studentId ||
                                fee.studentId ||
                                "N/A";

                            return (
                                <div
                                    key={
                                        feeId
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
                                    {/* STUDENT */}

                                    <h3>
                                        {
                                            studentName
                                        }
                                    </h3>

                                    <p>
                                        <strong>
                                            Student ID:
                                        </strong>{" "}
                                        {
                                            studentId
                                        }
                                    </p>

                                    {/* TOTAL */}

                                    <p>
                                        <strong>
                                            Total Amount:
                                        </strong>{" "}
                                        ₹
                                        {
                                            fee.totalAmount ??
                                            0
                                        }
                                    </p>

                                    {/* PAID */}

                                    <p>
                                        <strong>
                                            Paid Amount:
                                        </strong>{" "}
                                        ₹
                                        {
                                            fee.paidAmount ??
                                            0
                                        }
                                    </p>

                                    {/* REMAINING */}

                                    <p>
                                        <strong>
                                            Remaining Amount:
                                        </strong>{" "}
                                        ₹
                                        {
                                            fee.remainingAmount ??
                                            0
                                        }
                                    </p>

                                    {/* DUE DATE */}

                                    <p>
                                        <strong>
                                            Due Date:
                                        </strong>{" "}
                                        {formatDate(
                                            fee.dueDate
                                        )}
                                    </p>

                                    {/* STATUS */}

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {
                                            fee.status ||
                                            "N/A"
                                        }
                                    </p>

                                    {/* VIEW */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleViewFee(
                                                fee
                                            )
                                        }
                                    >
                                        View
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

export default AdminFees;