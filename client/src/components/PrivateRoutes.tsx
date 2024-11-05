import { useUser } from "@/context/userContext";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const {user} = useUser();
  return user ? <Outlet/> : <Navigate to={"/sign-in"}/>
}

export default PrivateRoutes;