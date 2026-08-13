import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { TopBar } from "@/components/geo/TopBar";
import { Sidebar, type SectionId } from "@/components/geo/Sidebar";
import { SectionPanel } from "@/components/geo/SectionPanel";
import { MapPane } from "@/components/geo/MapPane";
import { RightPanel } from "@/components/geo/RightPanel";
import { PipelineBar } from "@/components/geo/PipelineBar";
import { useAnalysisStore } from "@/state/analysis-store";
import { analysisService, healthService } from "@/lib/api/services";
import { ApiError, BACKEND_UNCONFIGURED } from "@/lib/api/client";

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

function Workstation() {
  const [section, setSection] = useState<SectionId>("aoi");
  const [collapsed, setCollapsed] = useState(false);
  const [running, setRunning] = useState(false);

  const { aoi, stages, setHealth, setHealthChecking, applyRun, setAnalysisError, clearErrors } =
    useAnalysisStore();

  const checkHealth = useCallback(async () => {
    setHealthChecking(true);
    try {
      const health = await healthService.check();
      setHealth(health, null);
    } catch (error) {
      setHealth(null, error instanceof ApiError ? error.message : BACKEND_UNCONFIGURED);
    }
  }, [setHealth, setHealthChecking]);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const runAnalysis = useCallback(async () => {
    if (aoi.centerLat === null || aoi.centerLon === null) return;
    clearErrors();
    setRunning(true);
    try {
      const run = await analysisService.start({
        aoi: {
          name: aoi.name,
          shape: aoi.shape,
          center_lat: aoi.centerLat,
          center_lon: aoi.centerLon,
          radius_m: aoi.radiusM,
          crs: "EPSG:4326",
          scale_m: aoi.scaleM,
        },
        scales_m: [10, 20, 50, 100, 200, 300, 500],
      });
      applyRun(run);
    } catch (error) {
      setAnalysisError(error instanceof ApiError ? error.message : BACKEND_UNCONFIGURED);
    } finally {
      setRunning(false);
    }
  }, [aoi, applyRun, clearErrors, setAnalysisError]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar onRefreshHealth={() => void checkHealth()} />
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
