import { useState } from "react";
import { Flag, Ban, ShieldAlert, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

const REASONS = [
  "可疑詐騙 / 投資話術",
  "誘導離開平台",
  "騷擾或不當言論",
  "假帳號 / 機器人",
  "未成年人",
  "其他",
];

export function ReportSheet({
  personId,
  personName,
  open,
  onClose,
}: {
  personId: string;
  personName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [view, setView] = useState<"menu" | "report" | "blocked">("menu");
  const [reason, setReason] = useState<string | null>(null);
  const { blocked, toggleBlock } = useApp();
  const isBlocked = blocked.includes(personId);

  if (!open) return null;

  const submitReport = () => {
    if (!reason) return;
    toast.success("已收到你的檢舉", { description: "我們會在 24 小時內審核處理" });
    onClose();
    setTimeout(() => { setView("menu"); setReason(null); }, 300);
  };

  const doBlock = () => {
    toggleBlock(personId);
    toast.success(isBlocked ? `已解除封鎖 ${personName}` : `已封鎖 ${personName}`);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end animate-pop-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full glass-strong rounded-t-3xl p-5 pb-7 animate-slide-up border-t border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" /> 安全選項
          </p>
          <button onClick={onClose} className="press p-1 rounded-full"><X className="h-4 w-4" /></button>
        </div>

        {view === "menu" && (
          <div className="space-y-2">
            <button
              onClick={() => setView("report")}
              className="press w-full flex items-center gap-3 p-4 rounded-2xl glass border border-border hover:border-warning/60"
            >
              <Flag className="h-5 w-5 text-warning" />
              <div className="text-left">
                <p className="text-sm font-medium">檢舉 {personName}</p>
                <p className="text-xs text-muted-foreground">回報詐騙、騷擾或假帳號</p>
              </div>
            </button>
            <button
              onClick={doBlock}
              className="press w-full flex items-center gap-3 p-4 rounded-2xl glass border border-border hover:border-rose/60"
            >
              <Ban className="h-5 w-5 text-rose" />
              <div className="text-left">
                <p className="text-sm font-medium">{isBlocked ? "解除封鎖" : "封鎖"} {personName}</p>
                <p className="text-xs text-muted-foreground">{isBlocked ? "對方將可再次聯繫你" : "對方無法再傳訊息給你"}</p>
              </div>
            </button>
          </div>
        )}

        {view === "report" && (
          <div className="space-y-2 animate-slide-right">
            <p className="text-xs text-muted-foreground mb-2">請選擇檢舉原因</p>
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`press w-full text-left p-3 rounded-xl border text-sm transition ${
                  reason === r ? "border-primary bg-primary/15 text-primary-glow" : "border-border"
                }`}
              >
                {r}
              </button>
            ))}
            <div className="flex gap-2 pt-3">
              <button onClick={() => setView("menu")} className="press flex-1 py-3 rounded-xl border border-border text-sm">
                返回
              </button>
              <button
                onClick={submitReport}
                disabled={!reason}
                className="ripple press flex-1 py-3 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-bold disabled:opacity-40"
              >
                送出檢舉
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
