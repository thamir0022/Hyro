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
import { useUser } from "@/context/userContext";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignInPage = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const {login} = useUser();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(null);
    setMessage("");
    try {
      const res = await fetch("/api/auth/sign-in", {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({...userData})
      })

      const data = await res.json();

      if(!res.ok){
        setIsSuccess(data.success);
        setMessage(data.message);
        return
      }

      setIsSuccess(data.success);
      setMessage(data.message);
      login(data.user);

      setTimeout(() => {
        setIsSuccess(null);
        setMessage("");
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <Layout2>
      <Card className="min-w-[300px] w-1/4 mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h1 className="text-2xl text-center font-semibold">Welcome Back</h1>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="">
              <Label>Email</Label>
              <Input
                type="email"
                value={userData.email}
                id="email"
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            <div className="">
              <Label>Password</Label>
              <Input
                type="password"
                value={userData.password}
                id="password"
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              Log In
            </Button>
            <p className="text-center">
              Don't have an account?{" "}
              <Link className="font-semibold text-blue-600" to={"/sign-up"}>
                Sign Up
              </Link>
            </p>
            <p className="text-center">
              By signing in, you agree to our{" "}
              <span className="cursor-pointer font-semibold text-blue-600">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="cursor-pointer font-semibold text-blue-600">
                Privacy Policy.
              </span>
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

export default SignInPage;
