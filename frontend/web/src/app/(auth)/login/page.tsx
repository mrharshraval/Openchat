"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Lock } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const verified = searchParams.get("verified");
    const error = searchParams.get("error");

    if (emailParam) {
      setIdentifier(emailParam);
    }
    if (verified === "true") {
      toast.success("Account verified successfully! Please log in.");
    }
    if (error) {
      if (error === "CredentialsSignin") {
        toast.error("Invalid username/email or password.");
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please enter your credentials");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid username/email or password");
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border bg-card shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Welcome to Moots
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your username/email and password to log in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="identifier" className="text-xs font-semibold text-foreground">
              Username or Email
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="identifier"
                type="text"
                placeholder="username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-9 h-10 border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-10 border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                disabled={loading}
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-10 text-xs font-semibold" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t border-border/40 p-4 text-center">
        <span className="text-[11px] text-muted-foreground">New to Moots?</span>
        <Link href="/signup" className="text-[11px] font-semibold text-primary hover:underline">
          Create an Account
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 dark-first">
      <Suspense fallback={
        <Card className="w-full max-w-md border-border bg-card shadow-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">Loading login screen...</p>
        </Card>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
