import type { Metadata } from "next";
import { Apple, ShieldCheck } from "lucide-react";

import { FoodSuggester } from "@/components/FoodSuggester";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Food Suggestions — Gluvia",
  description:
    "Glycemic-friendly South Asian food combinations, macro breakdowns, and fiber balancing.",
};

export default function FoodsPage(): React.ReactElement {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2.5 text-foreground">
          <Apple className="h-7 w-7 text-primary" />
          South Asian Food Suggestions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore carbohydrate-controlled South Asian meal pairings designed to
          minimize post-prandial glycemic spikes while honoring traditional
          recipes.
        </p>
      </div>

      <FoodSuggester />

      <Alert className="bg-muted/40 border-border/70 text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-foreground" />
        <AlertTitle className="text-xs font-semibold text-foreground">
          Nutritional Guidance Notice
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed mt-1">
          Nutritional metrics represent standard recipe estimates for South
          Asian cooking. Preparation methods, oil volumes, and portion sizes
          will alter carbohydrate and calorie impact. Regularly check your
          post-prandial blood sugar 2 hours after meals to observe individual
          glycemic responses.
        </AlertDescription>
      </Alert>
    </div>
  );
}
