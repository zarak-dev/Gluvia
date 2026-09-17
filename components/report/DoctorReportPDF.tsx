"use client";

import * as React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { SugarReading } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1e293b",
    lineHeight: 1.4,
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#0284c7",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0284c7",
  },
  brandSubtitle: {
    fontSize: 9,
    color: "#64748b",
  },
  metaRight: {
    textAlign: "right",
  },
  metaText: {
    fontSize: 8.5,
    color: "#475569",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 7.5,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    paddingBottom: 2,
  },
  summaryBlock: {
    backgroundColor: "#f0f9ff",
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderStyle: "solid",
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 9,
    color: "#334155",
    lineHeight: 1.45,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    borderBottomStyle: "solid",
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    paddingVertical: 4.5,
    paddingHorizontal: 6,
  },
  colDate: { width: "22%" },
  colGlucose: { width: "20%" },
  colTiming: { width: "20%" },
  colFood: { width: "38%" },
  disclaimerBox: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    borderStyle: "solid",
  },
  disclaimerText: {
    fontSize: 7.5,
    color: "#64748b",
    textAlign: "center",
  },
});

export interface DoctorReportPDFProps {
  username: string;
  readings: SugarReading[];
  summaryText?: string;
  stats: {
    average: number;
    highest: number;
    lowest: number;
    inRangePct: number;
    inRangeCount: number;
    dateRange: string;
  };
}

export function DoctorReportPDF({
  username,
  readings,
  summaryText,
  stats,
}: DoctorReportPDFProps): React.ReactElement {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>Gluvia</Text>
            <Text style={styles.brandSubtitle}>
              Clinical Glycemic Summary for South Asian Patients
            </Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaText}>Patient: {username}</Text>
            <Text style={styles.metaText}>
              Generated: {new Date().toLocaleDateString("en-PK")}
            </Text>
            <Text style={styles.metaText}>Period: {stats.dateRange}</Text>
          </View>
        </View>

        {/* Statistical Summary Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Period Average</Text>
            <Text style={styles.statValue}>
              {stats.average > 0 ? `${stats.average} mg/dL` : "—"}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>In-Range Ratio</Text>
            <Text style={styles.statValue}>{stats.inRangePct}%</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Highest Peak</Text>
            <Text style={styles.statValue}>
              {stats.highest > 0 ? `${stats.highest} mg/dL` : "—"}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lowest Reading</Text>
            <Text style={styles.statValue}>
              {stats.lowest > 0 ? `${stats.lowest} mg/dL` : "—"}
            </Text>
          </View>
        </View>

        {/* AI Clinical Summary (if available) */}
        {summaryText && (
          <View>
            <Text style={styles.sectionTitle}>
              AI Glycemic Analysis & Talking Points
            </Text>
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryText}>{summaryText}</Text>
            </View>
          </View>
        )}

        {/* Readings Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>
            Blood Glucose Logs (Last {readings.length} entries)
          </Text>

          <View style={styles.tableHeader}>
            <Text style={styles.colDate}>Date & Time</Text>
            <Text style={styles.colGlucose}>Glucose (mg/dL)</Text>
            <Text style={styles.colTiming}>Meal Tag</Text>
            <Text style={styles.colFood}>Food Context</Text>
          </View>

          {readings.slice(0, 25).map((r) => {
            const d = new Date(r.reading_date);
            const dateFormatted = d.toLocaleDateString("en-PK", {
              month: "short",
              day: "numeric",
            });
            const timeFormatted = d.toLocaleTimeString("en-PK", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <View key={r.id} style={styles.tableRow}>
                <Text style={styles.colDate}>
                  {dateFormatted} {timeFormatted}
                </Text>
                <Text style={styles.colGlucose}>{r.sugar_mg_dl} mg/dL</Text>
                <Text style={styles.colTiming}>{r.meal_tag}</Text>
                <Text style={styles.colFood}>{r.food_eaten || "—"}</Text>
              </View>
            );
          })}
        </View>

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            CONFIDENTIAL MEDICAL INFORMATION — FOR CLINICAL CONSULTATION ONLY.
            This report is an informational compilation generated by Gluvia to
            facilitate discussions between the patient and their licensed
            healthcare provider. The AI analysis and application thresholds do
            not constitute a clinical diagnosis or prescription.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
