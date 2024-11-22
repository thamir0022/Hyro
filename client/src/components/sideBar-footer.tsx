import { ChangeEvent, FormEvent, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SidebarFooter, useSidebar } from "./ui/sidebar";
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
  const { user, logout, login } = useUser();
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        toast({
          title: "Failed to update your profile",
          description: data.message || "Please try again!",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile updated successfully",
        description: data.message || "",
      });

      data.user && login(data.user);

      setTimeout(() => {
        window.location.reload();
      }, 3000);

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
          <PopoverContent className="relative left-64 top-[60px] w-64">
            <div className="space-y-2">
              <h4 className="font-medium">My Profile</h4>
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

              <div className="flex gap-2 items-center justify-center">
                {/* Sign Out Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                      Sign Out
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Are you sure you want to Sign Out?
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="flex justify-around">
                      <DialogClose>
                        <Button variant="outline" className="hover:bg-gray-200">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={handleSignout}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Sign Out
                      </Button>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>

                {/* Edit Profile Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-yellow-400 text-white hover:bg-yellow-500">
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-center text-xl">Edit Your Profile</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      <div className="space-y-4">
                      <Avatar className="mx-auto h-24 w-24">
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                        <div className="grid grid-cols-2 gap-3">
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
                        </div>
                        <Input
                          type="password"
                          name="oldPassword"
                          value={profileData.oldPassword}
                          onChange={handleChange}
                          placeholder="Old Password"
                        />
                        <div className="grid grid-cols-2 gap-3">
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
                      </div>
                    </DialogDescription>
                    <div className="flex justify-between mt-4">
                      <DialogClose asChild>
                        <Button variant="outline" className="hover:bg-gray-200">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button onClick={handleProfileUpdate}>
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    )
  );
};

export default SideFooter;
