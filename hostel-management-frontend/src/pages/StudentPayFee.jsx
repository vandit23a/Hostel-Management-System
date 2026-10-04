import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentPayFee = () => {
    const { token, user } = useAuth();

    const [fee, setFee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paying, setPaying] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFee = async () => {
            try {
                const response = await api.get("/fees/my", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    const fees = response.data.fees || [];

                    if (fees.length > 0) {
                        setFee(fees[0]);
                        setError("");
                    } else {
                        setFee(null);
                        setError("No fee record found.");
                    }
                }
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load fee details"
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchFee();
        }
    }, [token]);

    const handleAmountChange = (e) => {
        const value = e.target.value;

        if (/^\d*$/.test(value)) {
            setPaymentAmount(value);
            setError("");
        }
    };

    const handlePayment = async () => {
        if (!fee) {
            setError("Fee not found.");
            return;
        }

        const amount = Number(paymentAmount);

        if (!amount || amount <= 0) {
            setError("Please enter a valid payment amount.");
            return;
        }

        if (amount > fee.remainingAmount) {
            setError(
                `Payment amount cannot be greater than ₹${fee.remainingAmount}.`
            );
            return;
        }

        setPaying(true);
        setError("");
        setMessage("");

        try {
            const response = await api.post(
                "/payments/create-order",
                {
                    feeId: fee._id,
                    amount: amount,
                    paymentMethod: "UPI"
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const orderData = response.data;

            if (!orderData.success) {
                throw new Error(
                    orderData.message ||
                    "Failed to create payment order"
                );
            }

            const options = {
                key: orderData.keyId,

                amount: orderData.amount,

                currency: orderData.currency,

                name: "Hostel Management System",

                description: "Hostel Fee Payment",

                order_id: orderData.orderId,

                prefill: {
                    name: user?.name || "",
                    email: user?.email || ""
                },

                theme: {
                    color: "#3399cc"
                },

                handler: async function (paymentResponse) {
                    try {
                        const verifyResponse = await api.post(
                            "/payments/verify",
                            {
                                paymentId: orderData.paymentId,

                                razorpay_order_id:
                                    paymentResponse.razorpay_order_id,

                                razorpay_payment_id:
                                    paymentResponse.razorpay_payment_id,

                                razorpay_signature:
                                    paymentResponse.razorpay_signature
                            },
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );

                        if (verifyResponse.data.success) {
                            setMessage(
                                "Payment successful!"
                            );

                            setFee(
                                verifyResponse.data.fee
                            );

                            setPaymentAmount("");
                        } else {
                            setError(
                                verifyResponse.data.message ||
                                "Payment verification failed"
                            );
                        }
                    } catch (error) {
                        setError(
                            error.response?.data?.message ||
                            "Payment verification failed"
                        );
                    } finally {
                        setPaying(false);
                    }
                }
            };

            const razorpay =
                new window.Razorpay(options);

            razorpay.on("payment.failed", async function (response) {
    console.log("========== RAZORPAY PAYMENT FAILED ==========");
    console.log("Full Response:", response);
    console.log("Error:", response.error);
    console.log("Code:", response.error?.code);
    console.log("Description:", response.error?.description);
    console.log("Source:", response.error?.source);
    console.log("Step:", response.error?.step);
    console.log("Reason:", response.error?.reason);
    console.log("============================================");

    try {
        await api.post(
            "/payments/failed",
            {
                paymentId: orderData.paymentId,
                razorpayOrderId:
                    response.error?.metadata?.order_id ||
                    orderData.orderId,
                errorCode:
                    response.error?.code,
                errorDescription:
                    response.error?.description,
                errorReason:
                    response.error?.reason
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    } catch (error) {
        console.error(
            "Failed to update payment status:",
            error
        );
    }

    setError(
        response.error?.description ||
        response.error?.reason ||
        "Payment failed"
    );

    setPaying(false);
});

            razorpay.open();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to start payment"
            );

            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div>
                <h1>Pay Fee</h1>
                <p>Loading fee details...</p>
            </div>
        );
    }

    if (!fee) {
        return (
            <div>
                <h1>Pay Fee</h1>

                <p style={{ color: "red" }}>
                    {error || "Fee not found"}
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>Pay Fee</h1>

            <hr />

            {message && (
                <p style={{ color: "green" }}>
                    {message}
                </p>
            )}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <p>
                <strong>Total Fee:</strong>{" "}
                ₹{fee.totalAmount}
            </p>

            <p>
                <strong>Paid Amount:</strong>{" "}
                ₹{fee.paidAmount}
            </p>

            <p>
                <strong>Remaining Amount:</strong>{" "}
                ₹{fee.remainingAmount}
            </p>

            <p>
                <strong>Status:</strong>{" "}
                {fee.status}
            </p>

            <hr />

            {fee.remainingAmount > 0 ? (
                <div>
                    <h3>Make Payment</h3>

                    <label>
                        Amount to Pay:
                    </label>

                    <br />

                    <input
                        type="number"
                        min="1"
                        max={fee.remainingAmount}
                        value={paymentAmount}
                        onChange={handleAmountChange}
                        placeholder={
                            `Maximum ₹${fee.remainingAmount}`
                        }
                    />

                    <br />
                    <br />

                    <button
                        onClick={handlePayment}
                        disabled={paying}
                    >
                        {paying
                            ? "Processing..."
                            : paymentAmount
                                ? `Pay ₹${paymentAmount}`
                                : "Pay Fee"}
                    </button>
                </div>
            ) : (
                <p>
                    <strong>
                        No pending fee.
                        Your fee is fully paid.
                    </strong>
                </p>
            )}
        </div>
    );
};

export default StudentPayFee;