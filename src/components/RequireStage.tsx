import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/lib/store";
import type { ReactNode } from "react";

/**
 * 路由守衛：依目前 stage 將使用者導到正確的入口。
 * - need="onboarding"：要求至少完成錢包步驟
 * - need="app"：要求完成 onboarding
 */
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
  if (need === "app" && stage !== "app") {
    return <Navigate to={stage === "wallet" ? "/login" : "/onboarding"} replace />;
  }
  return <>{children}</>;
}
