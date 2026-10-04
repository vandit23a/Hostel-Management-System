import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminHostels = () => {
    const navigate = useNavigate();

    const [hostels, setHostels] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState(null);

    const detailsRef = useRef(null);

    const [name, setName] = useState("");
    const [blockCode, setBlockCode] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [search, setSearch] = useState("");

    const [isAdding, setIsAdding] = useState(false);
    const [editingHostel, setEditingHostel] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // -----------------------------
    // Reset form
    // -----------------------------

    const resetForm = () => {
        setName("");
        setBlockCode("");
        setDescription("");
        setIsActive(true);
    };

    // -----------------------------
    // Fetch all hostels
    // -----------------------------

    const fetchHostels = async () => {
        try {
            setLoading(true);
            setError("");

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

            setError(
                error.response?.data?.message ||
                "Failed to load hostels."
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

        fetchHostels();
    }, [token]);

    // -----------------------------
    // Scroll to Hostel Details
    // -----------------------------

    useEffect(() => {
        if (selectedHostel) {
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }, [selectedHostel]);

    // -----------------------------
    // Search
    // -----------------------------

    const filteredHostels = hostels.filter(
        (hostel) => {
            const searchText =
                search.trim().toLowerCase();

            if (!searchText) {
                return true;
            }

            return (
                hostel.name
                    ?.toLowerCase()
                    .includes(searchText) ||
                hostel.blockCode
                    ?.toLowerCase()
                    .includes(searchText) ||
                hostel.description
                    ?.toLowerCase()
                    .includes(searchText)
            );
        }
    );

    // -----------------------------
    // Add Hostel
    // -----------------------------

    const handleAddHostel = () => {
        resetForm();

        setSelectedHostel(null);
        setEditingHostel(null);

        setError("");
        setSuccess("");

        setIsAdding(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // -----------------------------
    // Edit Hostel
    // -----------------------------

    const handleEditHostel = (hostel) => {
        setEditingHostel(hostel);
        setSelectedHostel(null);
        setIsAdding(false);

        setError("");
        setSuccess("");

        setName(hostel.name || "");
        setBlockCode(hostel.blockCode || "");
        setDescription(
            hostel.description || ""
        );

        setIsActive(
            hostel.isActive !== false
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // -----------------------------
    // Cancel Form
    // -----------------------------

    const handleCancelForm = () => {
        resetForm();

        setEditingHostel(null);
        setIsAdding(false);

        setError("");
        setSuccess("");
    };

    // -----------------------------
    // Create / Update Hostel
    // -----------------------------

    const handleSaveHostel = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Hostel name is required.");
            return;
        }

        if (!blockCode.trim()) {
            setError("Block code is required.");
            return;
        }

        if (!description.trim()) {
            setError(
                "Hostel description is required."
            );
            return;
        }

        try {
            setSaving(true);

            if (editingHostel) {
                const hostelId =
                    editingHostel._id ||
                    editingHostel.id;

                const response =
                    await api.put(
                        `/hostels/${hostelId}`,
                        {
                            name: name.trim(),
                            blockCode:
                                blockCode.trim(),
                            description:
                                description.trim(),
                            isActive
                        },
                        authConfig
                    );

                setSuccess(
                    response.data.message ||
                    "Hostel updated successfully."
                );
            } else {
                const response =
                    await api.post(
                        "/hostels",
                        {
                            name: name.trim(),
                            blockCode:
                                blockCode.trim(),
                            description:
                                description.trim()
                        },
                        authConfig
                    );

                setSuccess(
                    response.data.message ||
                    "Hostel created successfully."
                );
            }

            resetForm();

            setEditingHostel(null);
            setIsAdding(false);

            await fetchHostels();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } catch (error) {
            console.error(
                "Save hostel error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to save hostel."
            );
        } finally {
            setSaving(false);
        }
    };

    // -----------------------------
    // Delete Hostel
    // -----------------------------

    const handleDeleteHostel = async (
        hostel
    ) => {
        const hostelId =
            hostel._id ||
            hostel.id;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${hostel.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/hostels/${hostelId}`,
                authConfig
            );

            setSuccess(
                "Hostel deleted successfully."
            );

            if (
                selectedHostel &&
                (
                    selectedHostel._id ||
                    selectedHostel.id
                ) === hostelId
            ) {
                setSelectedHostel(null);
            }

            await fetchHostels();
        } catch (error) {
            console.error(
                "Delete hostel error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete hostel."
            );
        }
    };

    // -----------------------------
    // View Hostel
    // -----------------------------

    const handleViewHostel = async (
        hostel
    ) => {
        try {
            setError("");
            setSuccess("");

            const hostelId =
                hostel._id ||
                hostel.id;

            const response =
                await api.get(
                    `/hostels/${hostelId}`,
                    authConfig
                );

            setSelectedHostel(
                response.data.hostel
            );

            setEditingHostel(null);
            setIsAdding(false);
        } catch (error) {
            console.error(
                "Get hostel details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load hostel details."
            );
        }
    };

    return (
        <div>
            <h1>Admin - Hostel Management</h1>

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
                onClick={handleAddHostel}
            >
                Add Hostel
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
                    placeholder="Search by hostel name, block code..."
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

            {/* Add / Edit Form */}

            {(isAdding ||
                editingHostel) && (
                <div>
                    <h2>
                        {editingHostel
                            ? "Edit Hostel"
                            : "Add Hostel"}
                    </h2>

                    <form
                        onSubmit={
                            handleSaveHostel
                        }
                    >
                        <p>
                            <strong>
                                Hostel Name:
                            </strong>
                            <br />

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        e.target
                                            .value
                                    )
                                }
                            />
                        </p>

                        <p>
                            <strong>
                                Block Code:
                            </strong>
                            <br />

                            <input
                                type="text"
                                value={
                                    blockCode
                                }
                                onChange={(e) =>
                                    setBlockCode(
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    !!editingHostel
                                }
                            />
                        </p>

                        <p>
                            <strong>
                                Description:
                            </strong>
                            <br />

                            <textarea
                                value={
                                    description
                                }
                                onChange={(e) =>
                                    setDescription(
                                        e.target
                                            .value
                                    )
                                }
                                rows="4"
                                cols="40"
                            />
                        </p>

                        {editingHostel && (
                            <p>
                                <strong>
                                    Status:
                                </strong>
                                <br />

                                <select
                                    value={
                                        isActive
                                            ? "true"
                                            : "false"
                                    }
                                    onChange={(e) =>
                                        setIsActive(
                                            e.target
                                                .value ===
                                                "true"
                                        )
                                    }
                                >
                                    <option value="true">
                                        Active
                                    </option>

                                    <option value="false">
                                        Inactive
                                    </option>
                                </select>
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingHostel
                                ? "Update Hostel"
                                : "Create Hostel"}
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

            {/* Hostel Details */}

            {selectedHostel && (
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
                        Hostel Details
                    </h2>

                    <p>
                        <strong>
                            Hostel Name:
                        </strong>{" "}
                        {selectedHostel.name ||
                            "N/A"}
                    </p>

                    <p>
                        <strong>
                            Block Code:
                        </strong>{" "}
                        {selectedHostel.blockCode ||
                            "N/A"}
                    </p>

                    <p>
                        <strong>
                            Description:
                        </strong>{" "}
                        {selectedHostel.description ||
                            "N/A"}
                    </p>

                    <p>
                        <strong>
                            Status:
                        </strong>{" "}
                        {selectedHostel.isActive ===
                        false
                            ? "Inactive"
                            : "Active"}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setSelectedHostel(
                                null
                            )
                        }
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Hostel List */}

            <h2>Hostels</h2>

            {loading ? (
                <p>Loading hostels...</p>
            ) : filteredHostels.length ===
              0 ? (
                <p>No hostels found.</p>
            ) : (
                <div>
                    {filteredHostels.map(
                        (hostel) => {
                            const hostelKey =
                                hostel._id ||
                                hostel.id;

                            return (
                                <div
                                    key={
                                        hostelKey
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
                                    <h3>
                                        {hostel.name ||
                                            "N/A"}
                                    </h3>

                                    <p>
                                        <strong>
                                            Block Code:
                                        </strong>{" "}
                                        {hostel.blockCode ||
                                            "N/A"}
                                    </p>

                                    <p>
                                        <strong>
                                            Description:
                                        </strong>{" "}
                                        {hostel.description ||
                                            "N/A"}
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {hostel.isActive ===
                                        false
                                            ? "Inactive"
                                            : "Active"}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleViewHostel(
                                                hostel
                                            )
                                        }
                                    >
                                        View
                                    </button>

                                    {" "}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEditHostel(
                                                hostel
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteHostel(
                                                hostel
                                            )
                                        }
                                    >
                                        Delete
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

export default AdminHostels;