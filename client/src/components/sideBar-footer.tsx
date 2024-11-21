import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useUser } from "@/context/userContext";
import { Input } from "./ui/input"; // Assuming you have an Input component
import { toast } from "@/hooks/use-toast";

const SideFooter = () => {
  const { user, logout } = useUser(); 
  const navigate = useNavigate();
  const { open } = useSidebar();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/auth/sign-out");
      const data = await res.json();
      if (!res.ok) return console.log(data.message);
      logout();
      navigate("/sign-in");
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await fetch("/api/auth/edit-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Failed to update Profile");
        return;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      // Update user context if necessary
      if (data.user) {
        setUser(data.user); // Update the user context
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update Profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    user && (
      <SidebarFooter>
        <Popover>
          <PopoverTrigger>
            <div
              className={`flex items-center justify-between px-3 py-2 ${
                open ? "bg-blue-600" : "bg-none"
              } text-white rounded-md shadow-md`}
            >
              <Avatar className="mr-3">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>HY</AvatarFallback>
              </Avatar>
              <div
                className={`${
                  open ? "flex" : "hidden"
                } flex-col text-left transition-transform`}
              >
                <span className="capitalize">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs">{user.email}</span>
              </div>
              <ChevronDown />
            </div>
          </PopoverTrigger>
          <PopoverContent className="relative left-64 top-20 w-64">
            <div className="space-y-2">
              <h4 className="font-medium">Account</h4>
              <p className="text-sm text-gray-500">Your Account Details</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p>First Name</p>
                <span className="capitalize">{user.firstName}</span>
              </div>
              <div className="flex justify-between">
                <p>Last Name</p>
                <span className="capitalize">{user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <p>Role</p>
                <span className="capitalize">{user.role}</span>
              </div>

              {/* Sign Out Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">Sign Out</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Are you sure you want to Sign Out?
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="flex justify-around">
                    <DialogClose>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={handleSignout}
                      className="bg-red-600 text-white"
                    >
                      Sign Out
                    </Button>
                  </DialogDescription>
                </DialogContent>
              </Dialog>

              {/* Edit Profile Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-2 bg-green-500 text-white hover:bg-green-600">
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    <div className="space-y-4">
                      <Input
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                      />
                      <Input
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                      />
                      <Input
                        type="password"
                        name="oldPassword"
                        value={profileData.oldPassword}
                        onChange={handleChange}
                        placeholder="Old Password"
                      />
                      <Input
                        type="password"
                        name="newPassword"
                        value={profileData.newPassword}
                        onChange={handleChange}
                        placeholder="New Password"
                      />
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={profileData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                      />
                    </div>
                  </DialogDescription>
                  <div className="flex justify-between mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleProfileUpdate}>Save Changes</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    )
  );
};

export default SideFooter;
