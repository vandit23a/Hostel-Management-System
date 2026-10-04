import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminPayments = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [selectedPayment, setSelectedPayment] =
        useState(null);

    const [error, setError] = useState("");

    // Reference for Payment Details section
    const detailsRef = useRef(null);

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // =========================
    // Fetch all payments
    // =========================

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError("");

            const [paymentsResponse, studentsResponse] =
                await Promise.all([
                    api.get("/payments", authConfig),
                    api.get("/students", authConfig)
                ]);

            console.log(
                "Payments API response:",
                paymentsResponse.data
            );

            console.log(
                "Students API response:",
                studentsResponse.data
            );

            if (paymentsResponse.data.success !== false) {
                setPayments(
                    paymentsResponse.data.payments || []
                );
            } else {
                setError(
                    paymentsResponse.data.message ||
                    "Failed to load payments."
                );
            }

            if (studentsResponse.data.success !== false) {
                setStudents(
                    studentsResponse.data.students || []
                );
            }
        } catch (error) {
            console.error(
                "Admin payments loading error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load payments."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchPayments();
        }
    }, [token]);

    // =========================
    // Scroll to Payment Details
    // =========================

    useEffect(() => {
        if (selectedPayment) {
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }, [selectedPayment]);

    // =========================
    // Helper functions
    // =========================

    const getStudentName = (payment) => {
        if (!payment?.student) {
            return "N/A";
        }

        if (
            typeof payment.student === "object"
        ) {
            return (
                payment.student.name ||
                "N/A"
            );
        }

        return "N/A";
    };

    const getStudentId = (payment) => {
        if (!payment?.student) {
            return "";
        }

        // If Student ID is directly available
        if (
            typeof payment.student === "object" &&
            payment.student.studentId
        ) {
            return payment.student.studentId;
        }

        // Payment.student is the User
        const userId =
            typeof payment.student === "object"
                ? payment.student._id
                : payment.student;

        if (!userId) {
            return "";
        }

        // Find Student profile whose user matches
        const studentRecord = students.find(
            (student) => {
                const studentUserId =
                    typeof student.user === "object"
                        ? student.user._id
                        : student.user;

                return String(studentUserId) ===
                    String(userId);
            }
        );

        return studentRecord?.studentId || "";
    };

    const getStudentEmail = (payment) => {
        if (!payment?.student) {
            return "N/A";
        }

        if (
            typeof payment.student === "object"
        ) {
            return (
                payment.student.email ||
                "N/A"
            );
        }

        return "N/A";
    };

    const getFeeId = (payment) => {
        if (!payment?.fee) {
            return "N/A";
        }

        if (
            typeof payment.fee === "object"
        ) {
            return (
                payment.fee._id ||
                "N/A"
            );
        }

        return payment.fee;
    };

    const getPaymentMethod = (payment) => {
        return (
            payment?.paymentMethod ||
            "N/A"
        );
    };

    const getPaymentStatus = (payment) => {
        return (
            payment?.status ||
            "N/A"
        );
    };

    const getTransactionId = (payment) => {
        return (
            payment?.transactionId ||
            "N/A"
        );
    };

    const getRazorpayPaymentId = (payment) => {
        return (
            payment?.razorpayPaymentId ||
            payment?.razorpay_payment_id ||
            "N/A"
        );
    };

    const getRazorpayOrderId = (payment) => {
        return (
            payment?.razorpayOrderId ||
            payment?.razorpay_order_id ||
            "N/A"
        );
    };

    // =========================
    // Search + filters
    // =========================

    const filteredPayments = payments.filter(
        (payment) => {
            const keyword =
                search.trim().toLowerCase();

            const studentName =
                getStudentName(payment)
                    .toLowerCase();

            const studentId =
                getStudentId(payment)
                    .toLowerCase();

            const transactionId =
                getTransactionId(payment)
                    .toLowerCase();

            const razorpayPaymentId =
                getRazorpayPaymentId(payment)
                    .toLowerCase();

            const matchesSearch =
                !keyword ||
                studentName.includes(keyword) ||
                studentId.includes(keyword) ||
                transactionId.includes(keyword) ||
                razorpayPaymentId.includes(
                    keyword
                );

            const matchesMethod =
                !methodFilter ||
                getPaymentMethod(payment) ===
                    methodFilter;

            const matchesStatus =
                !statusFilter ||
                getPaymentStatus(payment) ===
                    statusFilter;

            return (
                matchesSearch &&
                matchesMethod &&
                matchesStatus
            );
        }
    );

    // =========================
    // View payment details
    // =========================

    const handleView = (payment) => {
        setSelectedPayment(payment);
    };

    const closeDetails = () => {
        setSelectedPayment(null);
    };

    // =========================
    // Loading
    // =========================

    if (loading) {
        return (
            <div style={{ padding: "24px" }}>
                <h1>Admin Payments</h1>
                <p>Loading payments...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>

            <button
                type="button"
                onClick={() =>
                    navigate("/admin")
                }
                style={{
                    marginBottom: "20px",
                    padding: "8px 16px",
                    cursor: "pointer"
                }}
            >
                ← Back to Dashboard
            </button>

            <h1>Admin Payments</h1>

            <p>
                View and manage payment records.
            </p>

            <hr />

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

            {/* ========================= */}
            {/* SEARCH & FILTER */}
            {/* ========================= */}

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    marginTop: "20px",
                    marginBottom: "25px"
                }}
            >
                <h2>Search & Filter</h2>

                <div
                    style={{
                        marginBottom: "15px"
                    }}
                >
                    <label>
                        <strong>
                            Search:
                        </strong>
                    </label>

                    <br />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Student name, student ID, transaction ID..."
                        style={{
                            padding: "10px",
                            width: "400px",
                            marginTop: "6px"
                        }}
                    />
                </div>

                <div
                    style={{
                        marginBottom: "15px"
                    }}
                >
                    <label>
                        <strong>
                            Payment Method:
                        </strong>
                    </label>

                    <br />

                    <select
                        value={methodFilter}
                        onChange={(e) =>
                            setMethodFilter(
                                e.target.value
                            )
                        }
                        style={{
                            padding: "10px",
                            width: "250px",
                            marginTop: "6px"
                        }}
                    >
                        <option value="">
                            All Methods
                        </option>

                        <option value="UPI">
                            UPI
                        </option>

                        <option value="CARD">
                            CARD
                        </option>

                        <option value="NETBANKING">
                            NETBANKING
                        </option>

                        <option value="WALLET">
                            WALLET
                        </option>

                        <option value="OTHER">
                            OTHER
                        </option>
                    </select>
                </div>

                <div>
                    <label>
                        <strong>
                            Payment Status:
                        </strong>
                    </label>

                    <br />

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        style={{
                            padding: "10px",
                            width: "250px",
                            marginTop: "6px"
                        }}
                    >
                        <option value="">
                            All Statuses
                        </option>

                        <option value="PENDING">
                            PENDING
                        </option>

                        <option value="SUCCESS">
                            SUCCESS
                        </option>

                        <option value="FAILED">
                            FAILED
                        </option>
                    </select>
                </div>
            </div>

            {/* ========================= */}
            {/* PAYMENT DETAILS */}
            {/* ========================= */}

            {selectedPayment && (
                <div
                    ref={detailsRef}
                    style={{
                        border:
                            "2px solid #333",
                        borderRadius: "8px",
                        padding: "20px",
                        marginTop: "20px",
                        marginBottom: "30px"
                    }}
                >
                    <h2>
                        Payment Details
                    </h2>

                    <p>
                        <strong>
                            Payment ID:
                        </strong>{" "}
                        {selectedPayment._id ||
                            "N/A"}
                    </p>

                    <p>
                        <strong>
                            Student:
                        </strong>{" "}
                        {getStudentName(
                            selectedPayment
                        )}
                    </p>

                    <p>
                        <strong>
                            Student ID:
                        </strong>{" "}
                        {getStudentId(
                            selectedPayment
                        ) || "N/A"}
                    </p>

                    <p>
                        <strong>
                            Student Email:
                        </strong>{" "}
                        {getStudentEmail(
                            selectedPayment
                        )}
                    </p>

                    <p>
                        <strong>
                            Fee ID:
                        </strong>{" "}
                        {getFeeId(
                            selectedPayment
                        )}
                    </p>

                    <p>
                        <strong>
                            Amount:
                        </strong>{" "}
                        ₹
                        {
                            selectedPayment.amount ??
                            0
                        }
                    </p>

                    <p>
                        <strong>
                            Payment Method:
                        </strong>{" "}
                        {getPaymentMethod(
                            selectedPayment
                        )}
                    </p>

                    <p>
                        <strong>
                            Status:
                        </strong>{" "}
                        {getPaymentStatus(
                            selectedPayment
                        )}
                    </p>

                    <p>
                        <strong>
                            Transaction ID:
                        </strong>{" "}
                        {getTransactionId(
                            selectedPayment
                        )}
                    </p>

                    <p>
                        <strong>
                            Razorpay Order ID:
                        </strong>{" "}
                        {getRazorpayOrderId(
                            selectedPayment
                        )}
                    </p>

                    <p>
                        <strong>
                            Razorpay Payment ID:
                        </strong>{" "}
                        {getRazorpayPaymentId(
                            selectedPayment
                        )}
                    </p>

                    <p>
                        <strong>
                            Payment Date:
                        </strong>{" "}
                        {selectedPayment.paymentDate
                            ? new Date(
                                  selectedPayment.paymentDate
                              ).toLocaleString()
                            : selectedPayment.createdAt
                            ? new Date(
                                  selectedPayment.createdAt
                              ).toLocaleString()
                            : "N/A"}
                    </p>

                    {selectedPayment.errorCode && (
                        <p>
                            <strong>
                                Error Code:
                            </strong>{" "}
                            {
                                selectedPayment.errorCode
                            }
                        </p>
                    )}

                    {selectedPayment.errorDescription && (
                        <p>
                            <strong>
                                Error Description:
                            </strong>{" "}
                            {
                                selectedPayment.errorDescription
                            }
                        </p>
                    )}

                    {selectedPayment.errorReason && (
                        <p>
                            <strong>
                                Error Reason:
                            </strong>{" "}
                            {
                                selectedPayment.errorReason
                            }
                        </p>
                    )}

                    <br />

                    <button
                        type="button"
                        onClick={closeDetails}
                        style={{
                            padding:
                                "8px 14px",
                            cursor: "pointer"
                        }}
                    >
                        Close Details
                    </button>
                </div>
            )}

            {/* ========================= */}
            {/* PAYMENT COUNT */}
            {/* ========================= */}

            <h2>Payment Records</h2>

            <p>
                Showing{" "}
                <strong>
                    {filteredPayments.length}
                </strong>{" "}
                payment(s)
            </p>

            {/* ========================= */}
            {/* PAYMENT LIST */}
            {/* ========================= */}

            {filteredPayments.length === 0 ? (
                <p>
                    No payment records found.
                </p>
            ) : (
                <div>
                    {filteredPayments.map(
                        (payment) => (
                            <div
                                key={
                                    payment._id
                                }
                                style={{
                                    border:
                                        "1px solid #ddd",
                                    borderRadius:
                                        "8px",
                                    padding: "16px",
                                    marginBottom:
                                        "12px"
                                }}
                            >
                                <h3>
                                    {
                                        getStudentName(
                                            payment
                                        )
                                    }
                                </h3>

                                <p>
                                    <strong>
                                        Student ID:
                                    </strong>{" "}
                                    {
                                        getStudentId(
                                            payment
                                        ) ||
                                        "N/A"
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Amount:
                                    </strong>{" "}
                                    ₹
                                    {
                                        payment.amount ??
                                        0
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Payment Method:
                                    </strong>{" "}
                                    {
                                        getPaymentMethod(
                                            payment
                                        )
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{" "}
                                    {
                                        getPaymentStatus(
                                            payment
                                        )
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Transaction ID:
                                    </strong>{" "}
                                    {
                                        getTransactionId(
                                            payment
                                        )
                                    }
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleView(
                                            payment
                                        )
                                    }
                                    style={{
                                        padding:
                                            "8px 14px",
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPayments;