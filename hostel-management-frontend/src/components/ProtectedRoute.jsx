import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleLayout from "./RoleLayout";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <RoleLayout>
            {children}
        </RoleLayout>
    );
};

export default ProtectedRoute;