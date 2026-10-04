import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentProfile = () => {
    const { token } = useAuth();

    const [student, setStudent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/students/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const studentData = response.data.student;

                setStudent(studentData);

                // Set editable fields
                setName(studentData.user?.name || "");

                setPhone(
                    studentData.phone || ""
                );

                setDateOfBirth(
                    studentData.dateOfBirth
                        ? new Date(studentData.dateOfBirth)
                              .toISOString()
                              .split("T")[0]
                        : ""
                );

                setAddress(
                    studentData.address || ""
                );

            } catch (error) {
                console.error("Profile error:", error);

                setError(
                    error.response?.data?.message ||
                    "Failed to load profile"
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    const handleEdit = () => {
        setError("");
        setSuccess("");

        setName(student.user?.name || "");

        setPhone(
            student.phone || ""
        );

        setDateOfBirth(
            student.dateOfBirth
                ? new Date(student.dateOfBirth)
                      .toISOString()
                      .split("T")[0]
                : ""
        );

        setAddress(
            student.address || ""
        );

        setIsEditing(true);
    };

    const handleCancel = () => {
        setError("");
        setSuccess("");

        setName(student.user?.name || "");

        setPhone(
            student.phone || ""
        );

        setDateOfBirth(
            student.dateOfBirth
                ? new Date(student.dateOfBirth)
                      .toISOString()
                      .split("T")[0]
                : ""
        );

        setAddress(
            student.address || ""
        );

        setIsEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Name is required.");
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

        if (!address.trim()) {
            setError("Address is required.");
            return;
        }

        try {
            setSaving(true);

            const response = await api.put(
                "/students/me",
                {
                    name: name.trim(),
                    phone: phone.trim(),
                    dateOfBirth: dateOfBirth,
                    address: address.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Profile update response:",
                response.data
            );

            // Use updated student returned by backend
            if (response.data.student) {
                setStudent(response.data.student);
            } else {
                // Fallback in case backend doesn't return student
                setStudent((previousStudent) => ({
                    ...previousStudent,
                    phone: phone.trim(),
                    dateOfBirth: dateOfBirth,
                    address: address.trim(),
                    user: {
                        ...previousStudent.user,
                        name: name.trim()
                    }
                }));
            }

            setSuccess(
                response.data.message ||
                "Profile updated successfully."
            );

            setIsEditing(false);

        } catch (error) {
            console.error(
                "Update profile error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <h3>Loading profile...</h3>;
    }

    if (error && !student) {
        return (
            <p style={{ color: "red" }}>
                {error}
            </p>
        );
    }

    if (!student) {
        return (
            <p>
                Student profile not found.
            </p>
        );
    }

    return (
        <div>
            <h1>My Profile</h1>

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

            {!isEditing ? (
                <>
                    <p>
                        <strong>Student ID:</strong>{" "}
                        {student.studentId}
                    </p>

                    <p>
                        <strong>Name:</strong>{" "}
                        {student.user?.name}
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {student.user?.email}
                    </p>

                    <p>
                        <strong>Phone:</strong>{" "}
                        {student.phone || "N/A"}
                    </p>

                    <p>
                        <strong>Date of Birth:</strong>{" "}
                        {student.dateOfBirth
                            ? new Date(
                                  student.dateOfBirth
                              ).toLocaleDateString()
                            : "N/A"}
                    </p>

                    <p>
                        <strong>Gender:</strong>{" "}
                        {student.gender}
                    </p>

                    <p>
                        <strong>Course:</strong>{" "}
                        {student.course}
                    </p>

                    <p>
                        <strong>Year:</strong>{" "}
                        {student.year}
                    </p>

                    <p>
                        <strong>Address:</strong>{" "}
                        {student.address || "N/A"}
                    </p>

                    <button
                        type="button"
                        onClick={handleEdit}
                    >
                        Edit Profile
                    </button>
                </>
            ) : (
                <form onSubmit={handleSave}>
                    <p>
                        <strong>Student ID:</strong>{" "}
                        {student.studentId}
                    </p>

                    <p>
                        <strong>Name:</strong>
                        <br />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                        />
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {student.user?.email}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        <br />
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value)
                            }
                        />
                    </p>

                    <p>
                        <strong>Date of Birth:</strong>
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
                        <strong>Gender:</strong>{" "}
                        {student.gender}
                    </p>

                    <p>
                        <strong>Course:</strong>{" "}
                        {student.course}
                    </p>

                    <p>
                        <strong>Year:</strong>{" "}
                        {student.year}
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
                            : "Save Changes"}
                    </button>

                    {" "}

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
};

export default StudentProfile;