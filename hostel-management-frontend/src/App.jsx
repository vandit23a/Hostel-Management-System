import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentHostel from "./pages/StudentHostel";
import StudentFees from "./pages/StudentFees";
import StudentPaymentHistory from "./pages/StudentPaymentHistory";
import StudentPayFee from "./pages/StudentPayFee";
import StudentComplaints from "./pages/StudentComplaints";
import SubmitComplaint from "./pages/SubmitComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";
import StudentNotices from "./pages/StudentNotices";
import NoticeDetails from "./pages/NoticeDetails";
import WardenStudents from "./pages/WardenStudents";
import WardenRooms from "./pages/WardenRooms";
import WardenAllocations from "./pages/WardenAllocations";
import WardenComplaints from "./pages/WardenComplaints";
import WardenNotices from "./pages/WardenNotices";
import WardenDashboard from "./pages/WardenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import AdminHostels from "./pages/AdminHostels";
import AdminRooms from "./pages/AdminRooms";
import AdminAllocations from "./pages/AdminAllocations";
import AdminFees from "./pages/AdminFees";
import AdminPayments from "./pages/AdminPayments";
import AdminComplaints from "./pages/AdminComplaints";
import AdminNotices from "./pages/AdminNotices";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
    return (
        <BrowserRouter>
    <ScrollToTop />

    <Routes>

                {/* Public Route */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Default Route */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* Admin */}
                <Route
    path="/admin"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/students"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminStudents />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/hostels"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminHostels />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/rooms"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminRooms />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/allocations"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminAllocations />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/fees"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminFees />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/payments"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminPayments />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/complaints"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminComplaints />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/notices"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminNotices />
        </ProtectedRoute>
    }
/>

                {/* Warden */}
                <Route
    path="/warden"
    element={
        <ProtectedRoute allowedRoles={["WARDEN"]}>
            <WardenDashboard />
        </ProtectedRoute>
    }
/>

                <Route
    path="/warden/students"
    element={
        <ProtectedRoute
            allowedRoles={["WARDEN"]}
        >
            <WardenStudents />
        </ProtectedRoute>
    }
/>

<Route
    path="/warden/rooms"
    element={
        <ProtectedRoute allowedRoles={["WARDEN"]}>
            <WardenRooms />
        </ProtectedRoute>
    }
/>

<Route
    path="/warden/allocations"
    element={
        <ProtectedRoute allowedRoles={["WARDEN"]}>
            <WardenAllocations />
        </ProtectedRoute>
    }
/>

<Route
    path="/warden/complaints"
    element={
        <ProtectedRoute allowedRoles={["WARDEN"]}>
            <WardenComplaints />
        </ProtectedRoute>
    }
/>

<Route
    path="/warden/notices"
    element={
        <ProtectedRoute allowedRoles={["WARDEN"]}>
            <WardenNotices />
        </ProtectedRoute>
    }
/>

                {/* Student */}
                <Route
                    path="/student"
                    element={
                        <ProtectedRoute
                            allowedRoles={["STUDENT"]}
                        >
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Unauthorized */}
                <Route
                    path="/unauthorized"
                    element={
                        <h2>
                            403 - Unauthorized Access
                        </h2>
                    }
                />

                {/* Unknown URL */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                <Route
    path="/student/profile"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentProfile />
        </ProtectedRoute>
    }
/>

<Route
    path="/student/hostel"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentHostel />
        </ProtectedRoute>
    }
/>

<Route
    path="/student/fees"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentFees />
        </ProtectedRoute>
    }
/>

<Route
    path="/student/payments"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentPaymentHistory />
        </ProtectedRoute>
    }
/>

<Route
    path="/student/pay"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentPayFee />
        </ProtectedRoute>
    }
/>

<Route
    path="/student/complaints"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentComplaints />
        </ProtectedRoute>
    }
/>

<Route
    path="/student/complaints/new"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <SubmitComplaint />
        </ProtectedRoute>
    }
/>

<Route
    path="/student/complaints/:id"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <ComplaintDetails />
        </ProtectedRoute>
    }
/>

<Route
    path="/student/notices"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentNotices />
        </ProtectedRoute>
    }
/>

<Route
    path="/student/notices/:id"
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <NoticeDetails />
        </ProtectedRoute>
    }
/>



            </Routes>
        </BrowserRouter>
    );
};

export default App;