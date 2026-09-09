import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/geo/TopBar";
import { Sidebar, type SectionId } from "@/components/geo/Sidebar";
import { SectionPanel } from "@/components/geo/SectionPanel";
import { MapPane } from "@/components/geo/MapPane";
import { RightPanel } from "@/components/geo/RightPanel";
import { PipelineBar } from "@/components/geo/PipelineBar";
import { useAnalysisStore } from "@/state/analysis-store";
import {
  analysisService,
  aoiService,
  healthService,
  layerService,
  targetService,
} from "@/services";
import { ApiError, BACKEND_UNCONFIGURED, isNotImplemented, onApiLog } from "@/lib/api/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeoAnomaly Pro — Geospatial Anomaly Intelligence Workstation" },
      {
        name: "description",
        content:
          "Scientific GIS workstation for detecting statistically unusual geospatial signatures from Sentinel, Landsat, DEM and ASTER datasets. Targets require field verification.",
      },
      { property: "og:title", content: "GeoAnomaly Pro — Geospatial Anomaly Intelligence" },
      {
        property: "og:description",
        content:
          "Define an AOI, run multi-scale anomaly analysis on real satellite and terrain data, and review evidence-ranked investigation targets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workstation,
});

const POLL_INTERVAL_MS = 3000;
const TERMINAL = new Set(["completed", "failed"]);

function message(error: unknown): string {
  return error instanceof ApiError ? error.message : BACKEND_UNCONFIGURED;
}

function Workstation() {
  const [section, setSection] = useState<SectionId>("aoi");
  const [collapsed, setCollapsed] = useState(false);
  const [running, setRunning] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const store = useAnalysisStore();
  const {
    aoi,
    stages,
    setHealth,
    setHealthChecking,
    setEarthEngine,
    setServerAoi,
    setAnalysisId,
    applyStatus,
    setDatasets,
    applyBackendLayers,
    setTargets,
    setSamples,
    setResultIssues,
    setAnalysisError,
    clearErrors,
    resetAnalysis,
    pushLog,
  } = store;

  /** Mirror every HTTP call into the technical debug panel. */
  useEffect(() => onApiLog((entry) => pushLog(entry)), [pushLog]);

  const checkHealth = useCallback(async () => {
    setHealthChecking(true);
    try {
      setHealth(await healthService.check(), null);
    } catch (error) {
      setHealth(null, message(error));
    }
    try {
      setEarthEngine(await healthService.earthEngine(), null);
    } catch (error) {
      setEarthEngine(null, message(error));
    }
  }, [setEarthEngine, setHealth, setHealthChecking]);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    [],
  );

  /** Fetch backend-produced artefacts. Nothing is synthesised when absent. */
  const loadResults = useCallback(
    async (analysisId: string) => {
      /** Anything the backend failed to deliver is reported, never filled in. */
      const issues: string[] = [];

      try {
        const manifest = await analysisService.datasets(analysisId);
        setDatasets(manifest.datasets ?? []);
        if (!manifest.datasets?.length) issues.push("No dataset manifest returned.");
      } catch (error) {
        issues.push(`Datasets unavailable: ${message(error)}`);
        if (!isNotImplemented(error)) setAnalysisError(message(error));
      }

      try {
        const layers = await layerService.list(analysisId);
        applyBackendLayers(layers.layers ?? []);
        if (!layers.layers?.length) issues.push("No map layers returned.");
      } catch (error) {
        issues.push(`Layers unavailable: ${message(error)}`);
        if (!isNotImplemented(error)) setAnalysisError(message(error));
      }

      try {
        const targets = await targetService.list(analysisId);
        setTargets(targets.targets ?? []);
      } catch (error) {
        issues.push(`Targets unavailable: ${message(error)}`);
        if (!isNotImplemented(error)) setAnalysisError(message(error));
      }

      try {
        const samples = await analysisService.samples(analysisId);
        setSamples(samples.metadata ?? {}, samples.quality ?? {}, samples.samples ?? []);
        if (!samples.samples?.length) issues.push("No sampled feature cells returned.");
      } catch (error) {
        issues.push(`Samples unavailable: ${message(error)}`);
        if (!isNotImplemented(error)) setAnalysisError(message(error));
      }

      setResultIssues(issues);
    },
    [
      applyBackendLayers,
      setAnalysisError,
      setDatasets,
      setResultIssues,
      setSamples,
      setTargets,
    ],
  );


  const poll = useCallback(
    (analysisId: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        void (async () => {
          try {
            const status = await analysisService.status(analysisId);
            applyStatus(status);
            if (TERMINAL.has(status.status)) {
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = null;
              if (status.status === "failed") {
                setAnalysisError(status.error ?? status.message ?? "Backend reported a failed run.");
              } else {
                await loadResults(analysisId);
              }
            }
          } catch (error) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setAnalysisError(message(error));
          }
        })();
      }, POLL_INTERVAL_MS);
    },
    [applyStatus, loadResults, setAnalysisError],
  );

  const runAnalysis = useCallback(async () => {
    if (aoi.centerLat === null || aoi.centerLon === null) return;
    resetAnalysis();
    clearErrors();
    setRunning(true);
    try {
      // 1. POST /aoi — the backend validates geometry and owns the AOI id.
      const serverAoi = await aoiService.create({
        latitude: aoi.centerLat,
        longitude: aoi.centerLon,
        radius_m: aoi.radiusM,
        scale_m: aoi.scaleM,
        geometry_type: aoi.geometryType,
      });
      setServerAoi(serverAoi);

      // 2. POST /analysis/start
      const started = await analysisService.start({
        aoi_id: serverAoi.aoi_id,
        scale_m: aoi.scaleM,
        start_date: aoi.startDate,
        end_date: aoi.endDate,
        cloud_pct: aoi.cloudPct,
      });
      setAnalysisId(started.analysis_id);

      // 3. GET /analysis/{id}/status — real backend state, no local animation.
      const status = await analysisService.status(started.analysis_id);
      applyStatus(status);
      if (TERMINAL.has(status.status)) {
        if (status.status === "failed") {
          setAnalysisError(status.error ?? status.message ?? "Backend reported a failed run.");
        } else {
          await loadResults(started.analysis_id);
        }
      } else {
        poll(started.analysis_id);
      }
    } catch (error) {
      setAnalysisError(message(error));
    } finally {
      setRunning(false);
    }
  }, [
    aoi,
    applyStatus,
    clearErrors,
    loadResults,
    poll,
    resetAnalysis,
    setAnalysisError,
    setAnalysisId,
    setServerAoi,
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar onRefreshHealth={() => void checkHealth()} onOpenSection={setSection} />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          active={section}
          onSelect={setSection}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
        />
        <div className="hidden lg:flex">
          <SectionPanel
            section={section}
            onRunAnalysis={() => void runAnalysis()}
            running={running}
          />
        </div>
        <MapPane />
        <div className="hidden xl:flex">
          <RightPanel />
        </div>
      </div>
      <PipelineBar stages={stages} />
    </div>
  );
}
