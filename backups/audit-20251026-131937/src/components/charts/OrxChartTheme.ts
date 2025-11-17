import { Theme } from "@nivo/core";

export const OrxChartTheme: Theme = {
  background: "var(--orx-bg-light)",
  text: {
    fontSize: 12,
    fill: "var(--orx-text-primary)",
    fontFamily: "var(--orx-font-family)",
  },
  axis: {
    domain: {
      line: { stroke: "var(--orx-border)", strokeWidth: 1 },
    },
    ticks: {
      line: { stroke: "var(--orx-border)", strokeWidth: 1 },
      text: { fill: "var(--orx-text-secondary)", fontSize: 11 },
    },
    legend: { text: { fill: "var(--orx-text-primary)", fontSize: 12 } },
  },
  grid: {
    line: {
      stroke: "var(--orx-border-muted)",
      strokeWidth: 1,
      strokeDasharray: "3 4",
    },
  },
  legends: {
    text: { fill: "var(--orx-text-secondary)", fontSize: 11 },
  },
  tooltip: {
    container: {
      background: "var(--orx-surface)",
      color: "var(--orx-text-primary)",
      fontSize: 12,
      borderRadius: 8,
      boxShadow: "var(--orx-shadow-light-1)",
    },
  },
  crosshair: {
    line: { stroke: "var(--orx-primary)", strokeOpacity: 0.3, strokeWidth: 1 },
  },
};
