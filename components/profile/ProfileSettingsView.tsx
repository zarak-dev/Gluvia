"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  KeyRound,
  ShieldCheck,
  LogOut,
  Loader2,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { updateUsernameAction, changePasswordAction } from "@/app/actions/profile";
import { logoutAction } from "@/app/actions/auth";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserProfile } from "@/types";

interface ProfileSettingsViewProps {
  user: UserProfile | null;
  email: string | null;
}

export function ProfileSettingsView({
  user,
  email,
}: ProfileSettingsViewProps): React.ReactElement {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);

  // Username form state
  const [username, setUsername] = useState<string>(user?.username || "");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState<boolean>(false);

  // Password form state
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : "ZK";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  // Handle Username update
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsUpdatingUsername(true);
    try {
      const res = await updateUsernameAction(username.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || "Username updated successfully!");
        if (user) {
          setUser({ ...user, username: username.trim() });
        }
        router.refresh();
      }
    } catch {
      toast.error("Failed to update username");
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // Handle Password update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changePasswordAction(newPassword, confirmPassword);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || "Password changed successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Overview Card */}
      <Card className="border-[#E8EEF2] dark:border-border overflow-hidden shadow-xs">
        <div className="h-28 bg-gradient-to-r from-[#20B486]/20 via-[#3DD5A3]/25 to-sky-400/20 dark:from-[#20B486]/10 dark:to-sky-950/20" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarFallback className="bg-gradient-to-tr from-[#20B486] to-[#3DD5A3] text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="mb-1">
                <h2 className="text-xl font-bold text-foreground">
                  {username || "Patient Account"}
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {email || "patient@gluvia.health"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                <ShieldCheck className="h-3.5 w-3.5" />
                Active Patient Account
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#E8EEF2] dark:border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Member since {memberSince}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Verified Health Data Encryption</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Username Card */}
        <Card className="border-[#E8EEF2] dark:border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <User className="h-5 w-5" />
              <CardTitle className="text-base">Personal Information</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Update how your name appears across your reports, assistant, and dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold">
                  Display Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="h-10 text-sm"
                  maxLength={40}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdatingUsername || !username.trim()}
                className="w-full gap-2 text-xs font-medium"
              >
                {isUpdatingUsername ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Username</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border-[#E8EEF2] dark:border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <KeyRound className="h-5 w-5" />
              <CardTitle className="text-base">Change Password</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Ensure your account stays secure by using a strong password with at least 6 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-semibold">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="h-10 text-sm pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs font-semibold">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="h-10 text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                className="w-full gap-2 text-xs font-medium"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Session & Sign Out Card */}
      <Card className="border-rose-100 dark:border-rose-950/50 bg-rose-50/30 dark:bg-rose-950/10 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
            <LogOut className="h-5 w-5" />
            <CardTitle className="text-base">Session & Sign Out</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Sign out of your active session on this browser. Your glycemic data and logs remain safely stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Signed in as <strong className="text-foreground">{email}</strong>
          </p>

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="destructive"
              className="gap-2 text-xs font-medium shadow-xs cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out of Gluvia</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
