"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Sparkles,
  Calendar,
  Activity,
  Award,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Loader2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  SUGAR_THRESHOLDS,
  SUGAR_LEVEL_LABELS,
  MEAL_TAG_LABELS,
} from "@/lib/constants";
import {
  average,
  formatDate,
  getSugarLevel,
  getSugarBadgeClass,
  cn,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DoctorReportPDF } from "@/components/report/DoctorReportPDF";
import type { SugarReading } from "@/types";

export interface ReportViewProps {
  initialReadings: SugarReading[];
  username: string;
}

interface ParsedClinicalSection {
  title: string;
  content: string;
}

function parseClinicalSummary(text: string): ParsedClinicalSection[] {
  const sections: ParsedClinicalSection[] = [];
  const normalized = text.replace(/\r\n/g, "\n");

  const markers = [
    { key: "OVERVIEW:", title: "Clinical Overview" },
    { key: "PATTERNS:", title: "Glycemic Patterns & Variations" },
    { key: "CONCERNS:", title: "Spikes & Hypoglycemia Concerns" },
    { key: "RECOMMENDATIONS:", title: "Consultation Talking Points" },
  ];

  const found: Array<{ key: string; title: string; index: number }> = [];

  for (const m of markers) {
    const idx = normalized.toUpperCase().indexOf(m.key);
    if (idx !== -1) {
      found.push({ ...m, index: idx });
    }
  }

  found.sort((a, b) => a.index - b.index);

  if (found.length === 0) {
    return [{ title: "Clinical Summary", content: text.trim() }];
  }

  for (let i = 0; i < found.length; i++) {
    const cur = found[i];
    const start = cur.index + cur.key.length;
    const end = i + 1 < found.length ? found[i + 1].index : normalized.length;
    const content = normalized.slice(start, end).trim();
    if (content) {
      sections.push({ title: cur.title, content });
    }
  }

  return sections;
}

export function ReportView({
  initialReadings,
  username,
}: ReportViewProps): React.ReactElement {
  const [readings] = useState<SugarReading[]>(initialReadings);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Compute summary stats
  const stats = useMemo(() => {
    if (readings.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        inRangeCount: 0,
        inRangePct: 0,
        dateRange: "No readings recorded",
      };
    }

    const values = readings.map((r) => r.sugar_mg_dl);
    const avg = Math.round(average(values));
    const max = Math.max(...values);
    const min = Math.min(...values);

    const inRange = values.filter(
      (v) => v >= SUGAR_THRESHOLDS.LOW && v <= SUGAR_THRESHOLDS.NORMAL_MAX
    ).length;

    const inRangePct = Math.round((inRange / values.length) * 100);

    const sortedDates = [...readings].sort(
      (a, b) =>
        new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime()
    );
    const earliest = formatDate(sortedDates[0].reading_date);
    const latest = formatDate(sortedDates[sortedDates.length - 1].reading_date);
    const range = `${earliest} - ${latest}`;

    return {
      average: avg,
      highest: max,
      lowest: min,
      inRangeCount: inRange,
      inRangePct,
      dateRange: range,
    };
  }, [readings]);

  const parsedSections = useMemo(
    () => (analysisSummary ? parseClinicalSummary(analysisSummary) : []),
    [analysisSummary]
  );

  const handleGenerateAnalysis = async (): Promise<void> => {
    if (readings.length === 0) {
      toast.error(
        "Please log at least one reading before generating analysis."
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          readings,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errObj = data as { message?: string };
        throw new Error(
          errObj.message || "Failed to generate clinical analysis"
        );
      }

      const resObj = data as { summary: string };
      setAnalysisSummary(resObj.summary);
      toast.success("AI clinical summary generated successfully!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error analyzing readings";
      setAnalyzeError(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async (): Promise<void> => {
    if (readings.length === 0) {
      toast.error("No readings available to export.");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <DoctorReportPDF
          username={username}
          readings={readings}
          summaryText={analysisSummary || undefined}
          stats={stats}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Gluvia_Doctor_Report_${username.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Doctor Report PDF downloaded successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating PDF";
      toast.error(msg);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2.5 text-foreground">
            <FileText className="h-7 w-7 text-primary" />
            Doctor Glycemic Report
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Structured glycemic records and AI clinical summary for consultation
            with your physician.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleGenerateAnalysis}
            disabled={isAnalyzing || readings.length === 0}
            variant="outline"
            className="gap-2 shadow-xs"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Readings...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-primary" />
                {analysisSummary ? "Regenerate Summary" : "Generate AI Summary"}
              </>
            )}
          </Button>

          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF || readings.length === 0}
            className="gap-2 shadow-sm"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Compiling PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export PDF Report
              </>
            )}
          </Button>
        </div>
      </div>

      {analyzeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{analyzeError}</AlertDescription>
        </Alert>
      )}

      {/* Statistical Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Period Average</span>
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.average > 0 ? `${stats.average}` : "—"}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              mg/dL
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Across {readings.length} logs
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>In-Range Target</span>
            <Award className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.inRangePct}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            {stats.inRangeCount} of {readings.length} in range
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Highest Peak</span>
            <ArrowUp className="h-3.5 w-3.5 text-sugar-high" />
          </div>
          <div className="text-2xl font-bold text-sugar-high">
            {stats.highest > 0 ? `${stats.highest}` : "—"}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              mg/dL
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Maximum recorded</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Lowest Reading</span>
            <ArrowDown className="h-3.5 w-3.5 text-sugar-low" />
          </div>
          <div className="text-2xl font-bold text-sugar-low">
            {stats.lowest > 0 ? `${stats.lowest}` : "—"}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              mg/dL
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Minimum recorded</p>
        </Card>
      </div>

      {/* Date Range Meta Banner */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <strong>Recorded Window:</strong> {stats.dateRange}
        </span>
        <span>
          <strong>Patient:</strong> {username}
        </span>
      </div>

      {/* AI Clinical Summary (if generated) */}
      {isAnalyzing && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">
              Generating clinical overview, pattern analysis, and talking points
              with Gemini...
            </span>
          </div>
        </Card>
      )}

      {analysisSummary && !isAnalyzing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              AI Clinical Summary for Consultation
            </h2>
            <span className="text-xs text-muted-foreground">
              Generated via Gemini 2.0
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {parsedSections.map((sec) => (
              <Card key={sec.title} className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-primary">
                    {sec.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Readings Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Detailed Blood Glucose History ({readings.length} entries)
          </CardTitle>
          <CardDescription className="text-xs">
            Chronological readings formatted for endocrinologist review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {readings.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No readings available. Please log readings to generate a report.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[160px]">Date & Time</TableHead>
                    <TableHead className="w-[130px]">Glucose</TableHead>
                    <TableHead className="w-[120px]">Meal Tag</TableHead>
                    <TableHead>Food Eaten</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readings.map((r) => {
                    const level = getSugarLevel(r.sugar_mg_dl);
                    const d = new Date(r.reading_date);
                    const formattedDate = formatDate(r.reading_date);
                    const timeString = d.toLocaleTimeString("en-PK", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs">
                          <div className="font-medium">{formattedDate}</div>
                          <div className="text-muted-foreground">
                            {timeString}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm">
                              {r.sugar_mg_dl}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              mg/dL
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2 py-0.2 text-[10px] font-semibold",
                                getSugarBadgeClass(level)
                              )}
                            >
                              {SUGAR_LEVEL_LABELS[level]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                            {MEAL_TAG_LABELS[r.meal_tag]}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {r.food_eaten || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {r.notes || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mandatory Medical Safety Disclaimer */}
      <Alert className="bg-muted/40 border-border/70 text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-foreground" />
        <AlertTitle className="text-xs font-semibold text-foreground">
          Clinical Consultation Notice
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed mt-1">
          This report and AI clinical synthesis are compiled strictly as an
          informational aid to assist discussion during professional medical
          consultations. It does not constitute a clinical diagnosis, nor does
          it establish or modify any medical treatment regimen. Target glycemic
          ranges must always be established by your personal healthcare
          physician.
        </AlertDescription>
      </Alert>
    </div>
  );
}
