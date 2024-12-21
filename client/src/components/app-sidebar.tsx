import {
  Calendar,
  ChevronDown,
  Search,
  Settings,
  UsersRound,
  ChartPie,
  Users,
  SquarePen,
  BookOpen,
  Goal,
  Mail,
  MessageSquare,
  Pen,
  Flag,
  UserRoundPlus,
  Briefcase,
  Folder,
  NotebookText,
  LibraryBig
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "./ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useUser } from "@/context/userContext";
import SideFooter from "./sideBar-footer";
import { Link, useLocation } from "react-router-dom";

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
  { title: "Inbox", url: "/inbox", icon: Mail },
  { title: "New Opening", url: "/new-opening", icon: UserRoundPlus },
  { title: "Current Openings", url: "/careers", icon: Briefcase },
  { title: "Job Applications", url: "/all-job-applications", icon: Folder },
  { title: "Leave Applications", url: "/employee-leave-applications", icon: MessageSquare },
  { title: "Search", url: "/search", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

const employeeItems: Item[] = [
  { title: "Dashboard", url: "/dashboard", icon: ChartPie },
  { title: "Inbox", url: "/inbox", icon: Mail},
  { title: "Personal Goals", url: "/add-goals", icon: Flag },
  { title: "Apply A Leave", url: "/apply-leave", icon: Pen},
  { title: "Leave Applications", url: "/all-leaves", icon: MessageSquare},
  { title: "Settings", url: "#", icon: Settings },
  { title: "My Courses", url: "/my-courses", icon: NotebookText },
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

  { title: "Inbox", url: "/inbox", icon: Mail },
  { title: "New Opening", url: "/new-opening", icon: UserRoundPlus },
  { title: "Current Openings", url: "/careers", icon: Briefcase },
  { title: "Job Applications", url: "/all-job-applications", icon: Folder },
  { title: "Leave Applications", url: "/employee-leave-applications", icon: MessageSquare },
  { title: "Search", url: "/search", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
  { title: "Employee Training", url: "/courses", icon: LibraryBig },
  
];

const AppSidebar = () => {
  const { user } = useUser();
  const location = useLocation();
  
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
                    <CollapsibleTrigger 
                      className={`flex !text-[#3F3F46] items-center gap-2 !text-xl font-semibold hover:transition-transform hover:text-blue-600 py-5 ${
                        item.subItem.some(subItem => location.pathname === subItem.url) ? 'bg-blue-100 !text-blue-600' : ''
                      }`}
                    >
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
                          className={`hover:transition-transform hover:text-blue-600 py-5 ${
                            location.pathname === url ? 'bg-blue-100 text-blue-600' : ''
                          }`}
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
                  className={`flex items-center gap-2 text-xl font-semibold hover:transition-transform hover:text-blue-600 py-5 ${
                    location.pathname === item.url ? 'bg-blue-100 text-blue-600' : ''
                  }`}
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
      <SideFooter/>
    </Sidebar>
  );
};

export default AppSidebar;
