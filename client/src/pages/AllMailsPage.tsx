import React, { useState, useEffect, ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, ChevronsUpDown, Loader, Pencil } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/userContext";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Email {
  _id: string;
  sender: User | string;
  receiver: User | string;
  subject: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  receivedMails?: Email[];
  sentMails?: Email[];
}

interface EmployeeMail {
  label: string;
  value: string;
}

const ViewEmailsPage: React.FC = () => {
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [employeeMails, setEmployeeMails] = useState<EmployeeMail[]>([]);
  const [mailData, setMailData] = useState({
    sender: user?.id || "",
    receiver: "",
    subject: "",
    content: "",
  });

  const filter = searchParams.get("filter") || "all";

  useEffect(() => {
    const fetchEmails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/hr/get-mails?filter=${filter}`);
        if (!response.ok) {
          throw new Error("Failed to fetch emails");
        }
        const data: ApiResponse = await response.json();
        if (data.success) {
          let fetchedEmails: Email[] = [];
          if (filter === "received" && data.receivedMails) {
            fetchedEmails = data.receivedMails;
          } else if (filter === "sent" && data.sentMails) {
            fetchedEmails = data.sentMails;
          } else if (filter === "all") {
            fetchedEmails = [
              ...(data.receivedMails || []),
              ...(data.sentMails || []),
            ];
          }
          setEmails(fetchedEmails);
        } else {
          throw new Error("Failed to fetch emails");
        }
      } catch (err) {
        console.error("Error fetching emails:", err);
        toast({
          title: "Error",
          description: "Failed to fetch emails. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, [filter]);

  useEffect(() => {
    const fetchEmailIds = async () => {
      try {
        const res = await fetch("/api/hr/employee-mails");
        const data = await res.json();
        if (res.ok) {
          const employeeData = data.employees; // Update to match the API response structure
          setEmployeeMails(
            employeeData.map((e: { _id: string; email: string }) => ({
              value: e._id,
              label: e.email,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching employee emails:", error);
      }
    };
    fetchEmailIds();
  }, []);

  const handleFilterChange = (value: string) => {
    setSearchParams({ filter: value });
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMail = async () => {
    try {
      const res = await fetch("/api/hr/send-mail", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ ...mailData }),
      });

      const data = await res.json();

      if (res.ok) {
        setMailData({
          sender: user?.id || "",
          receiver: "",
          subject: "",
          content: "",
        });
        toast({
          title: "Success",
          description: data.message,
        });
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderEmailCard = (email: Email) => {
    const isReceived = typeof email.sender !== "string";
    const senderName = isReceived
      ? `${(email.sender as User).firstName} ${(email.sender as User).lastName}`
      : "You";
    const receiverName =
      typeof email.receiver !== "string"
        ? `${(email.receiver as User).firstName} ${
            (email.receiver as User).lastName
          }`
        : "You";

    return (
      <Card key={email._id} className="mb-4">
        <CardHeader>
          <CardTitle>{email.subject}</CardTitle>
          <CardDescription>
            From: {senderName} | To: {receiverName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{email.content}</p>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          {format(new Date(email.createdAt), "PPpp")}
        </CardFooter>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-center text-3xl font-semibold my-3">Your Inbox</h1>
        <div className="mb-4">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter emails" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Emails</SelectItem>
              <SelectItem value="received">Received Emails</SelectItem>
              <SelectItem value="sent">Sent Emails</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isLoading ? (
          <div className="flex size-full items-center justify-center">
            <Loader className="mx-auto h-6 w-6 animate-spin" />
          </div>
        ) : emails.length === 0 ? (
          <p className="text-center">No emails found.</p>
        ) : (
          emails.map(renderEmailCard)
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button
            onClick={() => setOpen(true)}
            className="py-5 px-3 h-12 w-32 fixed right-10 bottom-10 hover:scale-110 transition-all duration-300"
          >
            <Pencil />
            Compose
          </Button>
        </DialogTrigger>
        <DialogContent className="w-1/2">
          <DialogHeader>
            <DialogTitle>Write A Mail</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPopover}
                  className="w-full justify-between"
                >
                  {mailData.receiver
                    ? employeeMails.find(
                        (mail) => mail.value === mailData.receiver
                      )?.label || "Select a recipient"
                    : "Select a recipient"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command className="w-full">
                  <CommandInput placeholder="Search employee..." />
                  <CommandList>
                    <CommandEmpty>No Employees found!</CommandEmpty>
                    <CommandGroup>
                      {employeeMails.map((mail) => (
                        <CommandItem
                          key={mail.value}
                          value={mail.value}
                          onSelect={(currentValue) => {
                            setMailData((prev) => ({
                              ...prev,
                              receiver:
                                prev.receiver === currentValue
                                  ? ""
                                  : currentValue, // Ensure the return is a valid object
                            }));
                            setOpenPopover(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              mailData.receiver === mail.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <Avatar className="size-8">
                            <AvatarImage
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${mail.label[0]} ${mail.label[1]}`}
                            />
                            <AvatarFallback>
                              {mail.label[0]}
                              {mail.label[1]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="capitalize">{mail.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input
              placeholder="Subject"
              name="subject"
              value={mailData.subject}
              onChange={handleChange}
            />
            <Textarea
              className="min-h-32 max-h-60"
              name="content"
              value={mailData.content}
              onChange={handleChange}
              placeholder="Write your mail here..."
            />
            <span className="text-xs font-semibold text-muted-foreground">
              {500 - mailData.content.length} charecters remaining
            </span>
            <div className="w-full flex justify-between">
              <Button onClick={() => setOpen(false)} variant="destructive">
                Cancel
              </Button>
              <Button onClick={() => handleSendMail()}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ViewEmailsPage;
