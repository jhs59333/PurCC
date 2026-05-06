import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { TabBar } from "@/components/TabBar";
import { AppHeader } from "@/components/AppHeader";
import { ME, ALL_TAGS } from "@/lib/mock";
import { useApp } from "@/lib/store";
import { WarmthRing } from "@/components/WarmthRing";
import { Camera, Crown, Edit3, LogOut, Plus, Settings, ShieldCheck, Wallet, X } from "lucide-react";

export default function Profile() {
  const nav = useNavigate();
  const { wallet, nickname, tags: myTags, setTags, setStage } = useApp();
  const tags = myTags.length ? myTags : ME.tags;
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(ME.bio);
  const [showAdd, setShowAdd] = useState(false);

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));
  const addTag = (t: string) => { if (!tags.includes(t)) setTags([...tags, t]); };

  const logout = () => { setStage("wallet"); nav("/"); };

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        <AppHeader title="我的" />
        <div className="flex-1 overflow-y-auto px-5 pb-[88px] space-y-4">

          {/* 個人資訊 */}
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-rose/20 p-5 animate-slide-up">
            <button onClick={() => setEditing(!editing)} className="absolute top-3 right-3 press text-xs px-3 py-1 rounded-full bg-white/15 backdrop-blur flex items-center gap-1">
              {editing ? <><X className="h-3 w-3" /> 完成</> : <><Edit3 className="h-3 w-3" /> 編輯</>}
            </button>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full bg-gradient-warm grid place-items-center text-4xl">
                💜
                {editing && <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary grid place-items-center"><Camera className="h-3.5 w-3.5 text-white" /></button>}
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{nickname || ME.name} <span className="text-base text-muted-foreground">· {ME.age}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">{ME.mbti} · 信任 {ME.trust}</p>
                <p className="mt-1 text-[11px] flex items-center gap-1 text-success"><ShieldCheck className="h-3 w-3" /> 已驗證身份</p>
              </div>
              <WarmthRing value={ME.warmth} size={56} stroke={5} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
              {[["配對", ME.matches], ["回覆率", `${ME.replyRate}%`], ["評分", ME.rating]].map(([k, v]) => (
                <div key={k as string} className="rounded-xl bg-white/15 backdrop-blur py-2">
                  <p className="text-base font-bold">{v}</p>
                  <p className="text-white/70">{k}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 自介 + 標籤 */}
          <div className="rounded-2xl glass border border-border p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">自我介紹</p>
              {editing ? (
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-input rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" rows={3} />
              ) : (
                <p className="text-sm">{bio}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">喜好</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary-glow border border-primary/30 flex items-center gap-1">
                    {t}
                    {editing && <button onClick={() => removeTag(t)}><X className="h-3 w-3" /></button>}
                  </span>
                ))}
                {editing && (
                  <button onClick={() => setShowAdd(!showAdd)} className="press text-xs px-3 py-1 rounded-full border border-dashed border-primary/50 text-primary flex items-center gap-1">
                    <Plus className="h-3 w-3" /> 新增
                  </button>
                )}
              </div>
              {showAdd && editing && (
                <div className="mt-3 flex flex-wrap gap-1.5 animate-slide-down">
                  {ALL_TAGS.filter((t) => !tags.includes(t)).map((t) => (
                    <button key={t} onClick={() => addTag(t)} className="press text-xs px-2 py-1 rounded-full border border-border hover:border-primary">{t}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 照片 */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">照片</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <button key={i} className="aspect-square rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 grid place-items-center text-2xl press hover-lift">
                  {["🌸","🌙","☕️","📷","🎨","🍓"][i]}
                </button>
              ))}
            </div>
          </div>

          {/* 會員卡片 */}
          <Link to="/membership" className="press block rounded-3xl p-5 bg-gradient-to-r from-amber-400/30 via-primary/30 to-accent/30 border border-amber-300/40 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-warm grid place-items-center"><Crown className="h-6 w-6 text-white" /></div>
              <div className="flex-1">
                <p className="font-bold">{ME.plan} · 升級解鎖更多</p>
                <p className="text-[11px] text-muted-foreground">無限滑動 · Boost · 看誰喜歡你</p>
              </div>
              <span className="text-primary-glow">→</span>
            </div>
          </Link>

          {/* 錢包 */}
          <div className="rounded-2xl glass border border-border p-4 flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium flex items-center gap-2">
                {wallet?.name ?? ME.wallet.name}
                <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">{wallet?.address ?? ME.wallet.address}</p>
            </div>
          </div>

          {/* 設定 */}
          <div className="rounded-2xl glass border border-border divide-y divide-border">
            <button className="press w-full p-4 flex items-center gap-3 text-sm"><Settings className="h-4 w-4 text-muted-foreground" /> 設定與隱私</button>
            <button onClick={logout} className="press w-full p-4 flex items-center gap-3 text-sm text-rose"><LogOut className="h-4 w-4" /> 斷開錢包 / 登出</button>
          </div>
        </div>
        <TabBar />
      </div>
    </PhoneShell>
  );
}
