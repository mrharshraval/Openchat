"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Settings, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUsername((session.user as any).username || "");
      setName(session.user.name || "");
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      // Update NextAuth local session state
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          username,
        },
      });

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const hasUsername = !!(session?.user as any)?.username;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-foreground" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
      </div>

      {!hasUsername && (
        <Card className="border-amber-500/20 bg-amber-500/10">
          <CardContent className="flex items-center space-x-3 p-4">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              You haven't set a username yet. Set one below to allow signing in with your username and password.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">Profile Information</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Update your public display name and unique login username
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                Display Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="username" className="text-xs font-semibold text-foreground">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="pl-9 h-10 border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                  disabled={loading}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                3-20 characters, letters, numbers, and underscores only.
              </p>
            </div>

            <Button type="submit" className="text-xs font-semibold h-10 px-6" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
