import {
  Calendar,
  ChevronDown,
  Inbox,
  Search,
  Settings,
  UsersRound,
  ChartPie,
  Users,
  SquarePen,
  BookOpen,
  Goal,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "./ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useUser } from "@/context/userContext";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import SideFooter from "./sideBar-footer";

// Define menu items for different roles
interface Item {
  title: string;
  url: string;
  icon: any;
  subItem?: { title: string; url: string }[];
}

const hrItems: Item[] = [
  { title: "Dashboard", url: "/dashboard", icon: ChartPie },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Leave Applications", url: "/employee-leave-applications", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "/search", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

const employeeItems: Item[] = [
  { title: "Dashboard", url: "/dashboard", icon: ChartPie },
  { title: "Inbox", url: "#", icon: Inbox},
  { title: "Personal Goals", url: "/add-goals", icon: Goal },
  { title: "Apply A Leave", url: "/apply-leave", icon: SquarePen},
  { title: "Leave Applications", url: "/all-leaves", icon: BookOpen},
  { title: "Settings", url: "#", icon: Settings },
  
];

const adminItems: Item[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ChartPie,
  },
  {
    title: "Employee",
    url: "/",
    icon: Users,
    subItem: [
      { title: "All Employees", url: "/employees" },
      { title: "New Employee", url: "/create/employee" },
    ],
  },
  {
    title: "HR",
    url: "/employees",
    icon: UsersRound,
    subItem: [
      { title: "All HR", url: "/all-hr" },
      { title: "New HR", url: "/create/hr" },
    ],
  },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "/search", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

const AppSidebar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const { open } = useSidebar();
  

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

  


  const items =
    user?.role === "admin"
      ? adminItems
      : user?.role === "hr"
      ? hrItems
      : employeeItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          to="/"
          className="text-blue-600 font-semibold text-4xl font-libre"
        >
          Hyro
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-3 mt-3">
          {items.map((item) =>
            item.subItem ? (
              <Collapsible key={item.title} className="group/collapsible">
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="flex !text-[#3F3F46] items-center gap-2 !text-xl font-semibold hover:transition-transform hover:text-blue-600">
                      <item.icon className="!size-6" />
                      <span>{item.title}</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroup className="pl-4">
                      {item.subItem.map(({ title, url }) => (
                        <SidebarMenuButton
                          asChild
                          key={title}
                          className="hover:transition-transform hover:text-blue-600"
                        >
                          <Link
                            to={url}
                            className="font-semibold hover:text-blue-600"
                          >
                            {title}
                          </Link>
                        </SidebarMenuButton>
                      ))}
                    </SidebarGroup>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-2 text-xl font-semibold hover:transition-transform hover:text-blue-600"
                >
                  <Link to={item.url}>
                    <item.icon className="!size-6" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarContent>
      {/* {user && (
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
                <Dialog>
                  <DialogTrigger className="w-full">
                    <Button className="w-full">Sign Out</Button>
                    <Button className="w-full mt-2 mb-2 bg-green-500 text-white hover:bg-green-600">Edit Profile</Button>

                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Are you sure, you want to Sign Out
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="flex justify-around">
                      <DialogClose>
                        <Button>Cancel</Button>
                      </DialogClose>
                      <Button onClick={() => handleSignout()}>Sign Out</Button>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarFooter>
      )} */}
      <SideFooter/>
    </Sidebar>
  );
};

export default AppSidebar;
