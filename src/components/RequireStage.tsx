import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/lib/store";
import type { ReactNode } from "react";

/**
 * 路由守衛：依目前 stage 將使用者導到正確的入口。
 * - need="onboarding"：要求至少完成錢包步驟
 * - need="verify"：要求完成 onboarding（可進入驗證頁）
 * - need="app"：要求完成 onboarding + 真人驗證
 */
export function RequireStage({
  need,
  children,
}: {
  need: "onboarding" | "verify" | "app";
  children: ReactNode;
}) {
  const stage = useApp((s) => s.stage);
  const verified = useApp((s) => s.verified);
  const loc = useLocation();

  if (need === "onboarding" && stage === "wallet") {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (need === "verify") {
    if (stage === "wallet") return <Navigate to="/login" replace />;
    if (stage === "onboarding") return <Navigate to="/onboarding" replace />;
  }
  if (need === "app") {
    if (stage === "wallet") return <Navigate to="/login" replace />;
    if (stage === "onboarding") return <Navigate to="/onboarding" replace />;
    if (!verified || stage === "verify") return <Navigate to="/verify" replace />;
  }
  return <>{children}</>;
}
