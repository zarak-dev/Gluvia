"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [isTokenInvalid, setIsTokenInvalid] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const supabase = createClient();

    // 1. Check if error is present in query parameters
    const errorParam = searchParams.get("error");
    const errorCode = searchParams.get("error_code");

    if (errorParam || errorCode) {
      setIsTokenInvalid(true);
      setIsCheckingSession(false);
      return;
    }

    // 2. Check if error is present in hash fragment (e.g. #error=access_denied&error_code=otp_expired)
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get("error") || hashParams.get("error_code")) {
        setIsTokenInvalid(true);
        setIsCheckingSession(false);
        return;
      }
    }

    // 3. Listen to auth state changes for PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsTokenInvalid(false);
        setIsCheckingSession(false);
      }
    });

    // 4. Check for active recovery session or client token_hash
    const verifySession = async () => {
      try {
        const tokenHash = searchParams.get("token_hash");
        const type = (searchParams.get("type") as "recovery" | null) ?? "recovery";

        // Direct token_hash fallback if redirected directly to page
        if (tokenHash) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (!error && data.session) {
            setIsTokenInvalid(false);
            setIsCheckingSession(false);
            return;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsTokenInvalid(false);
        } else {
          // If no session found yet, wait slightly in case hash token is being parsed by client SDK
          setTimeout(async () => {
            const {
              data: { session: retrySession },
            } = await supabase.auth.getSession();
            if (!retrySession) {
              setIsTokenInvalid(true);
            }
            setIsCheckingSession(false);
          }, 600);
          return;
        }
      } catch (err) {
        console.error("Session verification error:", err);
        setIsTokenInvalid(true);
      } finally {
        setIsCheckingSession(false);
      }
    };

    verifySession();

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const onSubmit = async (values: UpdatePasswordFormValues): Promise<void> => {
    setServerError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        // If the token expired during form completion
        if (
          error.message.toLowerCase().includes("expired") ||
          error.message.toLowerCase().includes("invalid") ||
          error.status === 401
        ) {
          setIsTokenInvalid(true);
          return;
        }
        setServerError(error.message);
        return;
      }

      // Successful password update
      setIsSuccess(true);

      // Sign out temporary recovery session so the user logs in fresh with new password
      await supabase.auth.signOut();
    } catch (err: unknown) {
      console.error("Password update exception:", err);
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  // Checking session loading state
  if (isCheckingSession) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Verifying security token...</p>
      </div>
    );
  }

  // 32.10 INVALID / EXPIRED RESET LINK
  if (isTokenInvalid) {
    return (
      <div className="space-y-6 text-center animate-in fade-in-50 duration-200" role="alert">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Invalid or expired link
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your password reset link is invalid or has expired.
          </p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm mx-auto">
            For security reasons, password recovery links are time-sensitive and single-use.
          </p>
        </div>

        <div className="pt-2">
          <Button asChild className="w-full font-medium">
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 32.9 SUCCESSFUL PASSWORD UPDATE
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center animate-in fade-in-50 duration-200" role="status">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Password updated successfully
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your new password has been set. You can now use your updated credentials to access your Gluvia account.
          </p>
        </div>

        <div className="pt-2">
          <Button asChild className="w-full font-medium">
            <Link href="/login">Continue to login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 32.6 & 32.7 & 32.8 UPDATE PASSWORD FORM
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
      aria-busy={isSubmitting}
    >
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "new-password-error" : undefined}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="new-password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-error" : undefined
            }
            className="pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label={
              showConfirmPassword ? "Hide password" : "Show password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full font-medium"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
