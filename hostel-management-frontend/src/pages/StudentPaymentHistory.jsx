import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentPaymentHistory = () => {
    const { token } = useAuth();

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            try {
                const response = await api.get(
                    "/payments/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    setPayments(
                        response.data.payments || []
                    );
                } else {
                    setError(
                        response.data.message ||
                        "Failed to load payment history"
                    );
                }

            } catch (error) {
                console.error(
                    "Payment history error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load payment history"
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchPaymentHistory();
        }
    }, [token]);

    if (loading) {
        return <h3>Loading payment history...</h3>;
    }

    if (error) {
        return (
            <div>
                <h1>Payment History</h1>

                <p style={{ color: "red" }}>
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>Payment History</h1>

            <hr />

            {payments.length === 0 ? (
                <p>No payment history found.</p>
            ) : (
                payments.map((payment) => (
                    <div
                        key={payment._id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            marginBottom: "15px"
                        }}
                    >
                        <h3>Payment</h3>

                        <p>
                            <strong>Amount:</strong>{" "}
                            ₹{payment.amount}
                        </p>

                        <p>
                            <strong>Payment Method:</strong>{" "}
                            {payment.paymentMethod}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {payment.status}
                        </p>

                        <p>
                            <strong>Transaction ID:</strong>{" "}
                            {payment.transactionId ||
                                "Not available"}
                        </p>

                        <p>
                            <strong>Razorpay Order ID:</strong>{" "}
                            {payment.razorpayOrderId ||
                                "Not available"}
                        </p>

                        <p>
                            <strong>Razorpay Payment ID:</strong>{" "}
                            {payment.razorpayPaymentId ||
                                "Not available"}
                        </p>

                        <p>
                            <strong>Payment Date:</strong>{" "}
                            {payment.paymentDate
                                ? new Date(
                                      payment.paymentDate
                                  ).toLocaleDateString()
                                : "Not available"}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
};

export default StudentPaymentHistory;