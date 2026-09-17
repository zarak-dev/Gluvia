import type { Metadata } from "next";
import Link from "next/link";
import { Utensils, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Diet Plans — Gluvia",
  description: "Culturally tailored South Asian meal plans for diabetes care.",
};

export default function DietPage(): React.ReactElement {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="text-center p-8">
        <CardHeader className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
            <Utensils className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">AI Diet Plans</CardTitle>
          <CardDescription className="max-w-md mt-2">
            Culturally tailored nutritional guidance for South Asian meals is
            scheduled for Phase 3.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
