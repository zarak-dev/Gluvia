import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  TrendingUp,
  Utensils,
  FileText,
  ShieldCheck,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Gluvia — South Asian Diabetes Management",
  description:
    "Your daily diabetes companion, built for South Asian lifestyles. Track blood glucose, observe trends, and manage metabolic health.",
};

const FEATURES = [
  {
    title: "Daily Log",
    description:
      "Quickly record blood sugar readings with South Asian meal tags like Fasting, Post-Prandial, and Bedtime with diet notes.",
    icon: ClipboardList,
    badge: "Core",
  },
  {
    title: "Trend Analysis",
    description:
      "Visualize 7-day, 30-day, and 90-day glycemic trajectories with in-range metrics and clear target thresholds.",
    icon: TrendingUp,
    badge: "Insights",
  },
  {
    title: "AI Diet Plans",
    description:
      "Tailored nutritional guidance aligned with South Asian culinary traditions (roti, lentils, curries) to stabilize glucose.",
    icon: Utensils,
    badge: "Personalized",
  },
  {
    title: "Doctor Report",
    description:
      "Generate clear, structured summaries of your blood glucose readings for productive consultations with your physician.",
    icon: FileText,
    badge: "Clinical",
  },
] as const;

export default function HomePage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
            aria-label="Gluvia Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl">Gluvia</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container px-4 py-16 text-center sm:py-24 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl space-y-6">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium"
            >
              <Heart className="h-3.5 w-3.5 text-primary" />
              Tailored for South Asian Glycemic Health
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Gluvia
            </h1>

            <p className="text-xl font-medium text-foreground/90 sm:text-2xl">
              &ldquo;Your daily diabetes companion, built for South Asian
              lifestyles&rdquo;
            </p>

            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Manage your blood glucose with contextual meal logging, understand
              glycemic trends across weeks and months, and achieve metabolic
              balance without sacrificing your culture.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row sm:gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="border-t bg-muted/20 py-16 sm:py-20">
          <div className="container px-4 sm:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Comprehensive Diabetes Care
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Tools specifically designed to address South Asian dietary
                patterns and glycemic variations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="flex flex-col justify-between transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {feature.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <section className="container px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-3xl rounded-xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-full bg-muted p-2 text-muted-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <h3 className="font-semibold text-foreground">
                  Important Medical Disclaimer
                </h3>
                <p className="leading-relaxed">
                  Gluvia is an informational digital logging and lifestyle
                  companion intended to assist personal diabetes self-care. It
                  does not constitute clinical diagnosis, medical counsel, or
                  therapeutic advice. Always seek the advice of your physician
                  or qualified healthcare professional with any questions
                  regarding your diabetes management, medication dosages, or
                  dietary adjustments.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container px-4 sm:px-8">
          <p>© {new Date().getFullYear()} Gluvia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
