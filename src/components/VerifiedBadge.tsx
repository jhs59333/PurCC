import { ShieldCheck, ShieldAlert } from "lucide-react";

export function VerifiedBadge({
  verified,
  size = "sm",
  showLabel = false,
}: {
  verified: boolean;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
}) {
  const px = size === "xs" ? "h-3 w-3" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  if (verified) {
    return (
      <span
        title="已通過真人驗證"
        className="inline-flex items-center gap-1 text-success"
      >
        <ShieldCheck className={px} />
        {showLabel && <span className="text-[11px] font-medium">已驗證</span>}
      </span>
    );
  }
  return (
    <span
      title="尚未通過真人驗證"
      className="inline-flex items-center gap-1 text-warning"
    >
      <ShieldAlert className={px} />
      {showLabel && <span className="text-[11px] font-medium">未驗證</span>}
    </span>
  );
}
