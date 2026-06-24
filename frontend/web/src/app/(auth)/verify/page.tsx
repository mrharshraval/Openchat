"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, CheckCircle2 } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error("Please enter both email and OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Verification failed");
        return;
      }

      setSuccess(true);
      toast.success("Email verified successfully! You can now log in.");
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}&verified=true`);
      }, 2000);
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
        <div className="mx-auto my-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Verify Email
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter the 6-digit OTP code sent to your email address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-6 text-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
            <h3 className="font-bold text-foreground text-sm">Verification Complete!</h3>
            <p className="text-xs text-muted-foreground">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                disabled={loading || !!emailParam}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="otp" className="text-xs font-semibold text-foreground">
                One-Time Password (OTP)
              </Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="h-12 border-border bg-background text-center text-xl font-bold tracking-[8px] text-foreground focus:ring-1 focus:ring-primary"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full h-10 text-xs font-semibold" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t border-border/40 p-4 text-center">
        <span className="text-[11px] text-muted-foreground">Didn't receive the code?</span>
        <Link href="/signup" className="text-[11px] font-semibold text-primary hover:underline">
          Try Signing Up Again
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 dark-first">
      <Suspense fallback={
        <Card className="w-full max-w-md border-border bg-card shadow-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">Loading verification screen...</p>
        </Card>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
