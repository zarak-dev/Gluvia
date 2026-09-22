"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { getURL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordForm(): React.ReactElement {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const sendResetEmail = async (email: string): Promise<void> => {
    setServerError(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${getURL()}auth/callback?next=/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        // Only show rate limit or generic network errors; never disclose account existence
        if (error.status === 429) {
          setServerError("Too many requests. Please wait a moment before trying again.");
          return;
        }
        console.error("Password reset error:", error.message);
      }

      // Always show generic success state to prevent account enumeration
      setIsSubmitted(true);
      setSubmittedEmail(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      console.error("Password reset request exception:", err);
      setServerError("Unable to send reset email. Please try again later.");
    }
  };

  const onSubmit = async (values: ForgotPasswordFormValues): Promise<void> => {
    await sendResetEmail(values.email);
  };

  const handleResend = async (): Promise<void> => {
    if (cooldown > 0 || !submittedEmail) return;
    await sendResetEmail(submittedEmail);
  };

  // 32.4 SUCCESS STATE
  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center animate-in fade-in-50 duration-200" role="status">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Check your email
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            If an account exists for this email, we&apos;ve sent a password reset link.
          </p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm mx-auto">
            Please check your inbox and follow the link to create a new password.
          </p>
        </div>

        <div className="pt-2 space-y-4">
          <Button asChild className="w-full font-medium">
            <Link href="/login">Back to login</Link>
          </Button>

          <div className="text-xs text-muted-foreground">
            <span>Didn&apos;t receive it? </span>
            {cooldown > 0 ? (
              <span className="text-muted-foreground/70 font-medium">
                Try again in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 32.2 & 32.3 REQUEST FORM
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

      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email Address</Label>
        <Input
          id="forgot-email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "forgot-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="forgot-email-error" className="text-xs text-destructive">
            {errors.email.message}
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
            Sending reset link...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>

      <div className="pt-1 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </form>
  );
}
