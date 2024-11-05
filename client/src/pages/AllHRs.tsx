// Other imports remain unchanged
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

interface HR {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  createdAt?: string;
}

interface HRData {
  totalHRs: number;
  hrs: HR[];
}

type SortKey = "name" | "role" | "email" | "createdAt";

export default function AllHR() {
  const [hrData, setHrData] = useState<HRData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchHRs = async () => {
      try {
        const response = await fetch("/api/admin/hrs");
        if (response.ok) {
          const data: HRData = await response.json();
          setHrData(data);
        } else {
          console.error("Failed to fetch HR data");
        }
      } catch (error) {
        console.error("Error fetching HR data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHRs();
  }, []);

  const sortHRs = (hrs: HR[]): HR[] => {
    return [...hrs].sort((a, b) => {
      if (sortKey === "name") {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (sortKey === "createdAt") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return 0;
    });
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedHRs = hrData ? sortHRs(hrData.hrs) : [];

  console.log(hrData);

  return (
    <Layout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      ) : !hrData ? (
        <div className="flex justify-center items-center h-screen">
          <p>No HR data available</p>
        </div>
      ) : (
        <div className="container mx-auto py-10">
          <h1 className="text-2xl font-bold mb-4">
            Total HRs: {hrData.totalHRs}
          </h1>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button variant="ghost" onClick={() => handleSort("name")}>
                      Name{" "}
                      {sortKey === "name" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("role")}>
                      Role{" "}
                      {sortKey === "role" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("email")}>
                      Email{" "}
                      {sortKey === "email" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                    >
                      Join Date{" "}
                      {sortKey === "createdAt" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHRs.map((hr) => (
                  <TableRow key={hr._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/6.x/initials/svg?seed=${hr.firstName} ${hr.lastName}`}
                          />
                          <AvatarFallback>
                            {hr.firstName[0]}
                            {hr.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Link to={`/hr/${hr._id}`}>
                          {hr.firstName} {hr.lastName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{hr.role}</TableCell>
                    <TableCell>{hr.email}</TableCell>
                    <TableCell className="text-right">
                      {hr.createdAt
                        ? new Date(hr.createdAt).toDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Layout>
  );
}
