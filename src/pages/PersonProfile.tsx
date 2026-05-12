import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { PEOPLE } from "@/lib/mock";
import { WarmthRing } from "@/components/WarmthRing";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ReportSheet } from "@/components/ReportSheet";
import { ArrowLeft, MapPin, MessageCircle, MoreVertical, Sparkles } from "lucide-react";

export default function PersonProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const person = PEOPLE.find((p) => p.id === id) ?? PEOPLE[0];
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        {/* 大圖 */}
        <div className="relative h-[55%] shrink-0 overflow-hidden">
          <img src={person.photo} alt={person.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <button onClick={() => nav(-1)} className="absolute top-4 left-4 press h-10 w-10 rounded-full glass-strong grid place-items-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setReportOpen(true)} className="absolute top-4 right-16 press h-10 w-10 rounded-full glass-strong grid place-items-center" aria-label="安全選項">
            <MoreVertical className="h-5 w-5" />
          </button>
          <div className="absolute top-4 right-4">
            <WarmthRing value={person.warmth} size={48} stroke={4} />
          </div>
          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-3xl font-bold flex items-center gap-2">
              {person.name} <span className="text-xl text-muted-foreground">· {person.age}</span>
              <VerifiedBadge verified={person.verified} size="md" />
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{person.city}</span>
              <span>{person.mbti}</span>
              <span>信任 {person.trust}</span>
            </p>
          </div>
        </div>

        {/* 內容 */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-4">
          {/* 安全資訊 */}
          <div className={`rounded-2xl p-4 border ${person.verified ? "border-success/40 bg-success/10" : "border-warning/50 bg-warning/10"}`}>
            <div className="flex items-center gap-2">
              <VerifiedBadge verified={person.verified} size="sm" showLabel />
              <span className="text-xs text-muted-foreground">· 信任分數 {person.trust}/100</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {person.verified
                ? "此用戶已完成活體偵測與行為驗證"
                : "此用戶尚未完成真人驗證，請保持警覺"}
            </p>
          </div>

          <div className="rounded-2xl glass border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">關於我</p>
            <p className="text-sm">{person.bio}</p>
          </div>

          <div className="rounded-2xl glass border border-primary/30 p-4">
            <p className="text-xs flex items-center gap-1 text-primary-glow mb-2">
              <Sparkles className="h-3 w-3" /> {person.prompt.q}
            </p>
            <p className="text-sm">{person.prompt.a}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">喜好</p>
            <div className="flex flex-wrap gap-1.5">
              {person.tags.map((t) => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary-glow border border-primary/30">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <Link to={`/chat/${person.id}`} className="press flex items-center justify-center gap-2 h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow">
            <MessageCircle className="h-4 w-4" /> 傳送訊息
          </Link>
        </div>

        <ReportSheet
          personId={person.id}
          personName={person.name}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      </div>
    </PhoneShell>
  );
}
