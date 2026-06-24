"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Mail, Calendar, Quote, Shield } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setUsername((session.user as any).username || "");
      setBio((session.user as any).bio || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        toast.error("File size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio, image }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          username,
          bio,
          image,
        },
      });

      toast.success("Profile identity updated!");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const user = session?.user;
  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  const initials = (name || user.email || "U").substring(0, 2).toUpperCase();
  const memberSince = (user as any).createdAt 
    ? new Date((user as any).createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "June 2026";

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-2">
        <User className="h-6 w-6 text-foreground" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h2>
      </div>

      <Card className="border-border bg-card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10" />
        <CardHeader className="relative pb-4">
          <div className="absolute -top-12 left-6 flex items-end gap-4">
            <Avatar className="size-20 border-4 border-card rounded-full shadow-md">
              {image ? (
                <AvatarImage src={image} alt={name || "User"} />
              ) : (
                <AvatarFallback className="text-xl font-bold bg-[#d95f02] text-white">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="pb-1">
              <Label htmlFor="avatar-upload" className="cursor-pointer text-xs font-semibold text-primary hover:underline bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted/80">
                Upload Avatar
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="pt-8 pl-1">
            <CardTitle className="text-xl font-bold text-foreground">
              {name || user.email?.split("@")[0] || "User"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {username ? `@${username}` : "No username set"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                  Display Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-10 border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                    placeholder="Display name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="username" className="text-xs font-semibold text-foreground">
                  Username
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="pl-9 h-10 border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                    placeholder="username"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  className="pl-9 h-10 border-border bg-muted/40 text-sm text-muted-foreground cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bio" className="text-xs font-semibold text-foreground">
                Bio
              </Label>
              <div className="relative">
                <Quote className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="pl-9 min-h-[80px] border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                  placeholder="Tell us about yourself..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Member since {memberSince}</span>
            </div>

            <Button type="submit" className="text-xs font-semibold h-10 px-6 mt-2" disabled={loading}>
              {loading ? "Saving Profile..." : "Save Identity"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
