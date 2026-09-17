import type { Metadata } from "next";
import { PlusCircle, Clock, Info } from "lucide-react";

import { LogReadingForm } from "@/components/forms/LogReadingForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Log Reading — Gluvia",
  description: "Record a new blood glucose reading with meal tags and diet notes.",
};

export default function LogReadingPage(): React.ReactElement {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2.5">
          <PlusCircle className="h-7 w-7 text-primary" />
          Log Blood Glucose
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record your blood sugar measurement along with meal context to maintain
          an accurate glycemic log.
        </p>
      </div>

      {/* South Asian Context Tip */}
      <Alert className="bg-primary/5 border-primary/20 text-foreground">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-sm font-semibold flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Recommended Timing Guidance
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
          For post-meal readings (post-prandial), test exactly 2 hours after
          your first bite of roti or rice. For fasting, record immediately upon
          waking prior to tea or breakfast.
        </AlertDescription>
      </Alert>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Reading Details</CardTitle>
          <CardDescription>
            All blood glucose values are categorized according to standard target
            ranges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogReadingForm />
        </CardContent>
      </Card>
    </div>
  );
}
