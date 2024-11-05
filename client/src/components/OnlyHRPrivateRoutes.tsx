import { useUser } from "@/context/userContext";
import { Navigate, Outlet } from "react-router-dom";

const OnlyHRPrivateRoutes = () => {
  const { user } = useUser();

  return user ? (
    ["admin", "hr"].includes(user.role) ? (
      <Outlet />
    ) : (
      <Navigate to={"/dashboard"} />
    )
  ) : (
    <Navigate to={"/sign-in"} />
  );
};

export default OnlyHRPrivateRoutes;
