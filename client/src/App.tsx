import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import Dashboard from "./pages/Dashboard";
import { UserProvider } from "./context/userContext";
import PrivateRoutes from "./components/PrivateRoutes";
import Employee from "./pages/Employee";
import SearchPage from "./pages/SearchPage";
import AllEmployees from "./pages/AllEmployees";
import OnlyHRPrivateRoutes from "./components/OnlyHRPrivateRoutes";
import EditEmployee from "./pages/EditEmployee";
import AddEmployee from "./pages/AddEmployee";
import { Toaster } from "./components/ui/toaster";
import AllHR from "./pages/AllHRs";
import AddHR from "./pages/AddHR";
import HRPage from "./pages/HR";
import HREdit from "./pages/EditHR";
import LeaveApplication from "./pages/LeaveApplicationPage";
import AppliedLeaves from "./pages/AppliedLeavesPage";
import HRLeaveApplications from "./pages/AllLeaveApplications";
import PersonalGoals from "./pages/PersonalGoals";
import ViewEmails from "./pages/AllHRMailsPage";
import JobOpenings from "./pages/JobOpeningsPage";
import JobDetails from "./pages/JobDetailsPage";
import JobApplication from "./pages/JobApplicationPage";
import AddJobOpening from "./pages/NewJobPage";
import AllJobApplications from "./pages/AllJobApplicationsPage";
import JobApplicationDetails from "./pages/JobApplicationDetails";
import EmployeeCourses from "./pages/EmployeeCourses";
import CoursesPage from "./pages/CoursePage";
import { SingleCourse } from "./pages/SingleCourse";
import VideoPlayerPage from "./pages/VideoPlayerPage";

const App = () => {
  return (
    <BrowserRouter>
      <SidebarProvider defaultOpen>
        <SidebarTrigger />
        <UserProvider>
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/apply-leave" element={<LeaveApplication />} />
              <Route path="/all-leaves" element={<AppliedLeaves />} />
              <Route path="/add-goals" element={<PersonalGoals />} />
              <Route path="/inbox" element={<ViewEmails />} />
              <Route path="/my-courses" element={< CoursesPage/>} />
              <Route path="/my-course/:courseId?" element={< SingleCourse/>} />
              <Route path="/my-course/:courseId/video/:videoId" element={< VideoPlayerPage/>} />
            </Route>
            <Route element={<OnlyHRPrivateRoutes />}>
              <Route path="/employee/:id?" element={<Employee />} />
              <Route path="/all-hr" element={<AllHR />} />
              <Route path="/employee/edit/:id" element={<EditEmployee />} />
              <Route path="/hr/edit/:id" element={<HREdit />} />
              <Route path="/employees" element={<AllEmployees />} />
              <Route path="/hr/:id?" element={<HRPage />} />
              <Route path="/create/employee" element={<AddEmployee />} />
              <Route path="/create/hr" element={<AddHR />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/new-opening" element={<AddJobOpening />} />
              <Route path="/all-job-applications" element={<AllJobApplications />} />
              <Route path="/job-application/:id" element={<JobApplicationDetails />} />
              <Route
                path="/employee-leave-applications"
                element={<HRLeaveApplications />}
              />
            </Route>
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/careers" element={<JobOpenings />} />
            <Route path="/job/:id?" element={<JobDetails />} />
            <Route path="/apply-job/:id" element={<JobApplication />} />
            <Route path="/courses" element={<EmployeeCourses/>} />
          </Routes>
        </UserProvider>
      </SidebarProvider>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
