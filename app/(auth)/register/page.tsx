import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Droplet, ShieldCheck, Sparkles } from "lucide-react";

import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = {
  title: "Register — Gluvia",
  description:
    "Create your Gluvia account to start tracking diabetes and glucose metrics.",
};

export default function RegisterPage(): React.ReactElement {
  return (
    <main className="min-h-screen w-full bg-muted/30 flex items-center justify-center p-3.5 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-card shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        {/* Left Column: Medical Visual Section (Desktop Only, ~45%) */}
        <div className="relative hidden lg:flex lg:col-span-5 bg-muted flex-col justify-between overflow-hidden p-8 xl:p-10">
          {/* Background Medical Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/auth-medical.jpg"
              alt="Clinical digital tablet with medical diagnostic scans, stethoscope, and healthcare equipment"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-center"
              quality={85}
            />
            {/* Subtle gradient overlay for contrast and medical warmth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-background/25" />
          </div>

          {/* Top Brand Identity */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#20B486] to-[#3DD5A3] text-white shadow-md">
              <Droplet className="h-6 w-6 fill-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground block">
                Gluvia
              </span>
              <span className="text-[11px] text-muted-foreground font-medium block">
                South Asian Diabetes Management
              </span>
            </div>
          </div>

          {/* Bottom Supporting Message */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Personalized Wellness</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground tracking-tight leading-snug">
                Better health starts with better tracking.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Take control of your glycemic patterns with culturally adapted
                meal guidance and daily glucose analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Form Section (Desktop & Mobile) */}
        <div className="lg:col-span-7 flex flex-col justify-center p-5 sm:p-8 lg:p-12 bg-card">
          <div className="w-full max-w-md mx-auto space-y-5 sm:space-y-6">
            {/* Mobile Header: GLUVIA branding */}
            <div className="flex lg:hidden flex-col items-center text-center space-y-1">
              <Link
                href="/"
                className="flex items-center gap-2 transition-transform hover:scale-105"
                aria-label="Gluvia Home"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#20B486] to-[#3DD5A3] text-white shadow-md">
                  <Droplet className="h-5 w-5 fill-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  Gluvia
                </span>
              </Link>
              <p className="text-xs text-muted-foreground">
                South Asian Diabetes Management
              </p>
            </div>

            {/* Mobile Compact Medical Image Banner */}
            <div className="relative lg:hidden h-28 sm:h-32 w-full rounded-xl overflow-hidden shadow-xs border border-border/50">
              <Image
                src="/images/auth-medical.jpg"
                alt="Medical stethoscope and clipboard"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover object-center"
                quality={80}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent flex items-end p-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-xs">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  <span>Begin your glycemic journey</span>
                </div>
              </div>
            </div>

            {/* Welcome Heading */}
            <div className="space-y-1 text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Create an account
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Enter your details below to begin tracking your blood glucose
              </p>
            </div>

            {/* Register Form */}
            <RegisterForm />

            {/* Secondary Navigation Link */}
            <div className="border-t border-border/60 pt-4 text-center text-xs sm:text-sm text-muted-foreground">
              <p>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

