import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";

import { RegisterForm } from "@/components/forms/RegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Register — Gluvia",
  description:
    "Create your Gluvia account to start tracking diabetes and glucose metrics.",
};

export default function RegisterPage(): React.ReactElement {
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
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>
              Enter your details below to begin tracking your blood glucose
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center text-sm text-muted-foreground">
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
