import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";

import { LoginForm } from "@/components/forms/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login — Gluvia",
  description:
    "Sign in to your Gluvia account to manage your glucose and diabetes health.",
};

export default function LoginPage(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105"
            aria-label="Gluvia Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Gluvia
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            South Asian Diabetes Management
          </p>
        </div>

        <Card className="shadow-lg border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center text-sm text-muted-foreground">
            <p>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
