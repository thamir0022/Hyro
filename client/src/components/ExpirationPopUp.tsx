import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/userContext";

interface DecodedToken {
  exp?: number; // Mark as optional since it might not always be present
}

const checkTokenExpiration = (): number => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1];

  if (token) {
    const decodedToken: DecodedToken = jwtDecode(token);
    const expirationTime = decodedToken.exp ? decodedToken.exp * 1000 : 0; // Convert to milliseconds if present
    const currentTime = Date.now();

    return expirationTime > currentTime ? expirationTime - currentTime : 0;
  }
  return 0;
};

function ExpirationPopup() {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();
  const { logout } = useUser();

  useEffect(() => {
    const timeLeft = checkTokenExpiration();

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setPopupVisible(true); // Show popup when token expires
      }, timeLeft);

      return () => clearTimeout(timer);
    } else {
      setPopupVisible(true); // Show popup if token is already expired
    }
  }, []);

  const handleSignIn = () => {
    logout();
    setPopupVisible(false);
    navigate("/sign-in");
  };

  return (
    <Dialog open={isPopupVisible}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Your Session Has Expired!
          </DialogTitle>
          <DialogDescription className="flex items-center justify-around">
            <DialogClose>
              <Button>Close</Button>
            </DialogClose>
            <Button onClick={handleSignIn}>Sign In</Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ExpirationPopup;
