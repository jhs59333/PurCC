import { Navigate } from "react-router-dom";
import { useApp } from "@/lib/store";

export default function Index() {
  const stage = useApp((s) => s.stage);
  if (stage === "wallet") return <Navigate to="/login" replace />;
  if (stage === "onboarding") return <Navigate to="/onboarding" replace />;
  return <Navigate to="/discover" replace />;
}
