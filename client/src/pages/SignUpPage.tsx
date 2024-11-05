import Layout2 from "@/components/Layout2";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(null);
    try {
      const res = await fetch("/api/auth/sign-up", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ ...userData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsSuccess(false);
        setMessage(data.message);
        return;
      }

      setUserData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setIsSuccess(true);
      setMessage(data.message);
      setTimeout(() => {
        setMessage("");
        setIsSuccess(null);
        navigate("/sign-in");
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Layout2>
      <Card className="w-1/4 min-w-[300px] mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h1 className="text-2xl text-center font-semibold">
              Create Your Account
            </h1>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="">
              <Label>First Name</Label>
              <Input
                placeholder="John"
                value={userData.firstName}
                id="firstName"
                onChange={handleChange}
                required
              />
            </div>
            <div className="">
              <Label>Last Name</Label>
              <Input
                type="text"
                placeholder="Doe"
                value={userData.lastName}
                id="lastName"
                onChange={handleChange}
                required
              />
            </div>
            <div className="">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={userData.email}
                id="email"
                onChange={handleChange}
                required
              />
            </div>
            <div className="">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={userData.password}
                id="password"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center justify-around">
              <Input className="size-5" type="checkbox" required/>
              <p>
                I am agreed to the{" "}
                <span className="cursor-pointer font-semibold text-blue-600">
                  Terms
                </span>{" "}
                and{" "}
                <span className="cursor-pointer font-semibold text-blue-600">
                  Conditions
                </span>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              Create Account
            </Button>
            <p className="text-center">
              Already have an account?{" "}
              <Link className="font-semibold text-blue-600" to={"/sign-in"}>
                Sign In
              </Link>
            </p>
            {message && (
              <p
                className={`${
                  isSuccess ? "text-green-600" : "text-red-600"
                } font-semibold text-center`}
              >
                {message}
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </Layout2>
  );
};

export default SignUpPage;
