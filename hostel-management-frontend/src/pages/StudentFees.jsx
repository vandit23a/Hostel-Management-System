import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentFees = () => {
    const { token } = useAuth();

    const [fee, setFee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFees = async () => {
    try {
        const response = await api.get("/fees/my", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.success) {
            const fees = response.data.fees;

            if (fees && fees.length > 0) {
                setFee(fees[0]);
            } else {
                setFee(null);
            }
        } else {
            setError(
                response.data.message ||
                "Failed to load fee details"
            );
        }

    } catch (error) {
        console.error("Fee details error:", error);

        setError(
            error.response?.data?.message ||
            "Failed to load fee details"
        );
    } finally {
        setLoading(false);
    }
};

        if (token) {
            fetchFees();
        }
    }, [token]);

    if (loading) {
        return <h3>Loading fee details...</h3>;
    }

    if (error) {
        return (
            <div>
                <h1>Fee Details</h1>

                <p style={{ color: "red" }}>
                    {error}
                </p>
            </div>
        );
    }

    if (!fee) {
        return (
            <div>
                <h1>Fee Details</h1>
                <p>No fee record found.</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Fee Details</h1>

            <hr />

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

            <p>
                <strong>Due Date:</strong>{" "}
                {new Date(
                    fee.dueDate
                ).toLocaleDateString()}
            </p>
        </div>
    );
};

export default StudentFees;