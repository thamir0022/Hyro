import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useUser } from "@/context/userContext";
import {
  Dialog,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "./ui/dialog";

const   Header = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/auth/sign-out");
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        return;
      }
      logout();
      navigate("/sign-in");
    } catch (error) {
      console.log(error);
    }
  };

  const hrItems = [
    {
      title: "Employees",
      url: "/employees",
    },
    {
      title: "Inbox",
      url: "#",
    },
    {
      title: "Calendar",
      url: "#",
    },
    {
      title: "Search",
      url: "/search",
    },
    {
      title: "Settings",
      url: "#",
    },
  ];

  const employeeItems = [
    {
      title: "Inbox",
      url: "#",
    },
    {
      title: "Calendar",
      url: "#",
    },
    {
      title: "Settings",
      url: "#",
    },
  ];

  const defaultItems = [
    {
      title: "Inbox",
      url: "#",
    },
    {
      title: "Calendar",
      url: "#",
    },
    {
      title: "Settings",
      url: "#",
    },
  ];

  const adminItems = [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "Calendar",
      url: "#",
    },
    {
      title: "Settings",
      url: "#",
    },
  ];

  const items = user
    ? user?.role === "admin"
      ? adminItems
      : user?.role === "hr"
      ? hrItems
      : employeeItems
    : defaultItems;

  return (
    <header className="h-16 w-full py-3 px-6 flex items-center">
      <nav className="hidden mx-auto md:flex items-center md:justify-between w-2/6 font-poppins">
        {items?.map(({ title, url }) => (
          <Link key={title} to={url} className="capitalize">
            {title}
          </Link>
        ))}
      </nav>
      <div className="w-1/3 flex items-center justify-between">
        {user && (
          <p>
            Welcome{" "}
            <span className="capitalize font-semibold">
              {user.firstName} {user.lastName}
            </span>
          </p>
        )}
        {user && (
          <span className="capitalize bg-blue-500 px-3 text-white font-semibold rounded-md shadow-md">
            {user.role}
          </span>
        )}
        {user ? (
          <Dialog>
            <DialogTrigger>
              <Button>Sign Out</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">Are you sure, you want to Sign Out</DialogTitle>
              </DialogHeader>
              <DialogDescription className="flex justify-around">
                <DialogClose>
                  <Button>Cancel</Button>
                </DialogClose>
                  <Button onClick={() => handleSignout()}>Sign Out</Button>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        ) : (
          <Link to={"/sign-in"}>
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
