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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
  readAt?: Date;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  receivedMails?: Email[];
  sentMails?: Email[];
  message?: string;
}

interface EmployeeMail {
  label: string;
  value: string;
}

const EmailCard: React.FC<{
  email: Email;
  onMarkAsRead: (id: string) => Promise<void>;
  isLoading: boolean;
}> = ({ email, onMarkAsRead, isLoading }) => {
  const { user } = useUser();
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
        <CardTitle className="flex items-center gap-2">
          Subject: <p className="capitalize text-xl">{email.subject}</p>
        </CardTitle>
        <CardDescription>
          From: {senderName} | To: {receiverName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{email.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm font-semibold text-muted-foreground">
          Send At : {new Date(email.createdAt).toLocaleString()}
        </span>
        {email.readAt ? (
          <span className="text-sm font-semibold text-muted-foreground">
            Read At : {new Date(email.readAt).toLocaleString()}
          </span>
        ) : email.sender === user?.id ? (
          <Badge className="capitalize">{email.status}</Badge>
        ) : (
          <Button onClick={() => onMarkAsRead(email._id)}>
            {isLoading ? (
              <Loader className="size-6 animate-spin" />
            ) : (
              "Mark As Read"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const ViewEmailsPage: React.FC = () => {
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [employeeMails, setEmployeeMails] = useState<EmployeeMail[]>([]);
  const [mailData, setMailData] = useState({
    sender: user?.id || "",
    receiver: "",
    subject: "",
    content: "",
  });
  const [openCompose, setOpenCompose] = useState(false);
  const [openComboBox, setopenComboBox] = useState(false);
  const filter = searchParams.get("filter") || "all";

  // Fetch emails based on filter
  useEffect(() => {
    const fetchEmails = async () => {
      setEmails([]);
      setIsLoading(true);
      try {
        const response = await fetch(`/api/hr/get-mails?filter=${filter}`);
        const data: ApiResponse = await response.json();

        if (!response.ok) {
          toast({
            title: data.message,
            variant: "destructive",
          });
          return;
        }

        const fetchedEmails =
          filter === "received"
            ? data.receivedMails || []
            : filter === "sent"
            ? data.sentMails || []
            : [...(data.receivedMails || []), ...(data.sentMails || [])];

        setEmails(fetchedEmails);
      } catch (err: any) {
        toast({
          title: "Failed to fetch emails. Please try again.",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, [filter]);

  // Fetch employee mail IDs
  useEffect(() => {
    const fetchEmployeeMails = async () => {
      try {
        const res = await fetch("/api/hr/employee-mails");
        const data = await res.json();
        if (res.ok) {
          setEmployeeMails(
            data.employees.map((e: { _id: string; email: string }) => ({
              value: e._id,
              label: e.email,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching employee emails:", err);
      }
    };

    fetchEmployeeMails();
  }, []);

  const handleFilterChange = (value: string) => {
    setSearchParams({ filter: value });
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMail = async () => {
    try {
      const res = await fetch("/api/hr/send-mail", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(mailData),
      });

      const data = await res.json();
      if (res.ok) {
        setMailData({
          sender: user?.id || "",
          receiver: "",
          subject: "",
          content: "",
        });
        toast({ title: "Success", description: data.message });
        setOpenCompose(false);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to send email.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (mailId: string) => {
    setMarkingRead(mailId);
    try {
      const res = await fetch("/api/hr/mark-as-read", {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        body: JSON.stringify({ mailId, status: "read" }),
      });

      if (!res.ok) throw new Error("Failed to mark email as read");
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingRead(null);
    }
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
          <div className="flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : emails.length === 0 ? (
          <p className="text-center">No emails found.</p>
        ) : (
          emails.map((email) => (
            <EmailCard
              key={email._id}
              email={email}
              onMarkAsRead={handleMarkAsRead}
              isLoading={markingRead === email._id}
            />
          ))
        )}
      </div>
      <Dialog open={openCompose} onOpenChange={setOpenCompose}>
        <DialogTrigger asChild>
          <Button className="fixed right-10 bottom-10 h-12 w-32">
            <Pencil />
            Compose
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Compose Mail</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <Popover open={openComboBox} onOpenChange={setopenComboBox}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {employeeMails.find((m) => m.value === mailData.receiver)
                    ?.label || "Select Employee"}
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search employee..." />
                  <CommandList>
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup>
                      {employeeMails.map((mail) => (
                        <CommandItem
                          key={mail.value}
                          onSelect={() => {
                            setMailData((prev) => ({
                              ...prev,
                              receiver: mail.value,
                            }));
                            setopenComboBox(false);
                          }}
                        >
                          <Avatar className="size-8">
                            <AvatarImage
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${mail.label[0]} ${mail.label[1]}`}
                            />
                            <AvatarFallback>
                              {mail.label[0]}
                              {mail.label[1]}
                            </AvatarFallback>
                          </Avatar>
                          {mail.label}
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              mailData.receiver === mail.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input
              type="text"
              name="subject"
              value={mailData.subject}
              onChange={handleInputChange}
              placeholder="Subject"
              className="border p-2 w-full"
              required
            />
            <Textarea
              name="content"
              value={mailData.content}
              onChange={handleInputChange}
              placeholder="Email content"
              rows={4}
              className="border p-2 w-full min-h-32 max-h-56"
              minLength={10}
            />
            <Button type="button" onClick={handleSendMail}>
              Send Email
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ViewEmailsPage;
