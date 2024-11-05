import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  FC,
  useContext,
} from "react";

// Define the shape of the user data
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "employee" | "admin" | "hr";
  createdAt: Date,
  updatedAt: Date,
}

// Define the context's shape
export interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// Create the UserContext with default values
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// Create a provider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  // Initialize user state with data from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Function to log in the user and save the data to localStorage
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Save user data to localStorage
  };

  // Function to log out the user and remove the data from localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Remove user data from localStorage
  };

  // Automatically save user data to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  
  // Ensure the hook is used within a UserProvider
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  
  return context;
};