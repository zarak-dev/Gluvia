"use client";

import {
  AlertTriangle,
  Droplets,
  Footprints,
  Ban,
  Clock,
  PhoneCall,
  Sparkles,
  AlertOctagon,
  HeartPulse,
  Candy,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SugarReading } from "@/types";

export interface GlycemicActionModalProps {
  reading: SugarReading | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GlycemicActionModal({
  reading,
  isOpen,
  onClose,
}: GlycemicActionModalProps): React.ReactElement | null {
  if (!reading) return null;

  const value = reading.sugar_mg_dl;
  const isLow = value < 70;
  const isSevereHigh = value >= 250;
  const isHigh = value > 180 && value < 250;

  // If in normal or slightly elevated range (70 - 180), no action modal is needed
  if (!isLow && !isHigh && !isSevereHigh) {
    return null;
  }

  const handleAskAssistant = () => {
    onClose();
    let query = `My blood sugar reading was ${value} mg/dL. What immediate steps should I take and what foods should I avoid?`;
    if (isLow) {
      query = `My blood sugar is low at ${value} mg/dL. I feel shaky. What should I do right now?`;
    } else if (isSevereHigh) {
      query = `My blood sugar is very high at ${value} mg/dL. What should I do immediately?`;
    }
    window.dispatchEvent(
      new CustomEvent("open-ai-chat", {
        detail: { query },
      })
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-2 shadow-2xl">
        {/* Modal Top Banner */}
        <div
          className={`p-5 text-white ${
            isLow
              ? "bg-gradient-to-r from-blue-600 to-indigo-600"
              : isSevereHigh
              ? "bg-gradient-to-r from-rose-600 to-red-700"
              : "bg-gradient-to-r from-amber-500 to-orange-600"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isLow ? (
                <Candy className="h-6 w-6 text-white" />
              ) : isSevereHigh ? (
                <AlertOctagon className="h-6 w-6 text-white animate-pulse" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-white" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                {isLow
                  ? "Hypoglycemia Alert: Low Sugar"
                  : isSevereHigh
                  ? "Critical Spike: Severe High Sugar"
                  : "Elevated Glucose Warning"}
              </span>
            </div>
            <span className="text-2xl font-black">
              {value} <span className="text-xs font-normal">mg/dL</span>
            </span>
          </div>

          <DialogTitle className="text-lg font-bold text-white mt-2">
            {isLow
              ? "Immediate Action Required: Rule of 15"
              : isSevereHigh
              ? "Significant Glucose Spike Detected"
              : "Blood Sugar is Above Target Range"}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/90 mt-1">
            {isLow
              ? "Your blood sugar is critically low. Treat immediately to prevent fainting or hypoglycemia complications."
              : isSevereHigh
              ? "Your glucose is severely high (≥ 250 mg/dL). Follow these immediate steps and monitor for key warning signs."
              : "Your reading is above the standard safe target (70–180 mg/dL). Follow these steps to help bring your numbers down."}
          </DialogDescription>
        </div>

        {/* Action Protocol Steps */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <HeartPulse className="h-3.5 w-3.5 text-primary" />
            <span>Recommended Immediate Protocol</span>
          </div>

          {/* Low Sugar (Hypoglycemia < 70) Protocol */}
          {isLow && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xs">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    Consume 15g of Fast-Acting Sugar NOW
                  </h4>
                  <p className="text-[11px] text-blue-800/90 dark:text-blue-300 mt-0.5">
                    Drink <strong>1/2 cup fruit juice</strong> or regular soda, or take{" "}
                    <strong>1 tablespoon honey/sugar</strong>, or 3–4 glucose candies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xs">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    Rest & Wait 15 Minutes
                  </h4>
                  <p className="text-[11px] text-blue-800/90 dark:text-blue-300 mt-0.5">
                    Sit down and rest quietly. Avoid walking, driving, or physical activity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xs">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    Re-test Your Blood Sugar
                  </h4>
                  <p className="text-[11px] text-blue-800/90 dark:text-blue-300 mt-0.5">
                    If still below 70 mg/dL, repeat step 1. Once above 70 mg/dL, eat a small
                    carb/protein snack (e.g. 1 slice of bread or milk) to stabilize.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* High Sugar (> 180 mg/dL) Protocol */}
          {!isLow && (
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    1. Drink 1–2 Large Glasses of Water
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Water dilutes blood glucose and helps your kidneys flush excess sugar out through urine.
                  </p>
                </div>
              </div>

              {!isSevereHigh ? (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <Footprints className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      2. Take a 15–20 Minute Gentle Walk (Chahal Qadmi)
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Light walking activates muscle glucose uptake directly, lowering your blood sugar naturally.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white">
                    <Ban className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      2. Avoid Strenuous Exercise
                    </h4>
                    <p className="text-[11px] text-rose-800/90 dark:text-rose-300 mt-0.5">
                      At very high glucose levels (≥ 250 mg/dL), heavy workouts can raise ketones. Rest and hydrate instead.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <Ban className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    3. Pause All Carbohydrates & Sweets
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Avoid roti, rice, fruit juice, mithai, and sweetened chai for the next 2–3 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500 text-white">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    4. Check Medication & Re-test in 2 Hours
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Verify you took your doctor-prescribed diabetes medications. Set a timer to recheck your sugar in 2 hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Red Flag Emergency Box */}
          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/60">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>When to Seek Immediate Medical Help</span>
            </div>
            <p className="text-[11px] text-rose-700/90 dark:text-rose-400 mt-1 leading-relaxed">
              If accompanied by <strong>nausea/vomiting</strong>, <strong>extreme confusion</strong>,{" "}
              <strong>fruity breath</strong>, or <strong>shortness of breath</strong>, contact your
              physician or visit an emergency room immediately.
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-muted/30 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleAskAssistant}
            className="w-full sm:w-auto gap-1.5 text-xs text-[#20B486] border-[#20B486]/30 hover:bg-[#20B486]/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask Gluvia Assistant</span>
          </Button>

          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-semibold"
          >
            <span>I Understand, Got It</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
