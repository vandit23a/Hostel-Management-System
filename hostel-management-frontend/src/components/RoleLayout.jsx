import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigation = {
    STUDENT: [
        { label: "Dashboard", path: "/student" },
        { label: "Profile", path: "/student/profile" },
        { label: "Allocation", path: "/student/hostel" },
        { label: "Fees", path: "/student/fees" },
        { label: "Payments", path: "/student/payments" },
        { label: "Complaints", path: "/student/complaints" },
        { label: "Notices", path: "/student/notices" },
    ],

    WARDEN: [
        { label: "Dashboard", path: "/warden" },
        { label: "Students", path: "/warden/students" },
        { label: "Rooms", path: "/warden/rooms" },
        { label: "Allocations", path: "/warden/allocations" },
        { label: "Complaints", path: "/warden/complaints" },
        { label: "Notices", path: "/warden/notices" },
    ],

    ADMIN: [
        { label: "Dashboard", path: "/admin" },
        { label: "Students", path: "/admin/students" },
        { label: "Hostels", path: "/admin/hostels" },
        { label: "Rooms", path: "/admin/rooms" },
        { label: "Allocations", path: "/admin/allocations" },
        { label: "Fees", path: "/admin/fees" },
        { label: "Payments", path: "/admin/payments" },
        { label: "Complaints", path: "/admin/complaints" },
        { label: "Notices", path: "/admin/notices" },
    ],
};

const RoleLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const role = user?.role || "STUDENT";
    const menuItems = navigation[role] || [];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="app-layout">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

                <div className="sidebar-brand">
                    <div className="brand-icon">H</div>

                    <div>
                        <h2>HostelMS</h2>
                        <span>Management System</span>
                    </div>
                </div>

                <div className="sidebar-role">
                    <span className="role-label">ROLE</span>
                    <span className="role-value">{role}</span>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === `/${role.toLowerCase()}`}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="main-area">

                {/* Header */}
                <header className="top-header">

                    <button
                        type="button"
                        className="menu-button"
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>

                    <div className="header-title">
                        <h1>Hostel Management System</h1>
                    </div>

                    <div className="header-user">
                        <div className="user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div className="user-info">
                            <strong>{user?.name || "User"}</strong>
                            <span>{role}</span>
                        </div>
                    </div>

                </header>

                {/* Page Content */}
                <main className="main-content">
                    {children}
                </main>

            </div>
        </div>
    );
};

export default RoleLayout;