import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/lib/store";
import type { ReactNode } from "react";

export function RequireStage({
  need,
  children,
}: {
  need: "onboarding" | "app";
  children: ReactNode;
}) {
  const stage = useApp((s) => s.stage);
  const loc = useLocation();

  if (need === "onboarding" && stage === "wallet") {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (need === "app") {
    if (stage === "wallet") return <Navigate to="/login" replace />;
    if (stage === "onboarding") return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}
