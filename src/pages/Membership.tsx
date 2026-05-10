import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { ArrowLeft, Check, Crown, Sparkles, Network, AlertTriangle } from "lucide-react";
import {
  SUPPORTED_CHAINS, MEMBERSHIP_CONTRACTS, hasWallet, getChainId, switchChain,
  subscribe, formatEther, quotePrice, fetchMyMembership, listenSubscribed, TIER_NAME, type Tier,
} from "@/lib/contract";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

const plans = [
  {
    key: "basic" as const, tier: 1 as 1, name: "Basic", color: "from-sky-400 to-primary",
    feats: ["每日滑動 50 次", "Super Like 3/天", "Boost 1/月", "查看 5 個喜歡你"],
  },
  {
    key: "premium" as const, tier: 2 as 2, name: "Premium", color: "from-amber-300 via-primary to-accent",
    feats: ["無限滑動 + 已讀回執", "Super Like 10/天 · Boost 1/週", "查看全部喜歡你", "語音破冰 · MBTI 篩選 · Passport"],
  },
];

// 推薦的以太生態系鏈（Mainnet + L2 + 測試網）
const PREFERRED_CHAINS = [1, 8453, 42161, 10, 137, 11155111];

type Step = "select" | "checkout" | "paying" | "done";

export default function Membership() {
  const { wallet } = useApp();
  const [step, setStep] = useState<Step>("select");
  const [planKey, setPlanKey] = useState<"basic" | "premium">("premium");
  const [yearly, setYearly] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [price, setPrice] = useState<bigint>(0n);
  const [txHash, setTxHash] = useState<string>("");
  const [myTier, setMyTier] = useState<Tier>(0);
  const [myExpires, setMyExpires] = useState(0);

  const sel = plans.find((p) => p.key === planKey)!;
  const chain = chainId ? SUPPORTED_CHAINS[chainId] : null;
  const contractAddr = chainId ? MEMBERSHIP_CONTRACTS[chainId] : undefined;
  const wrongChain = chainId !== null && !SUPPORTED_CHAINS[chainId];

  // 偵測錢包鏈
  useEffect(() => {
    if (!hasWallet()) return;
    getChainId().then(setChainId).catch(() => {});
    const handler = (hex: string) => setChainId(parseInt(hex, 16));
    window.ethereum?.on?.("chainChanged", handler);
    return () => window.ethereum?.removeListener?.("chainChanged", handler);
  }, []);

  // 報價（鏈/方案/週期變動時）
  useEffect(() => {
    if (!contractAddr) { setPrice(0n); return; }
    quotePrice(sel.tier, yearly ? 12 : 1, yearly)
      .then(setPrice)
      .catch(() => setPrice(0n));
  }, [contractAddr, sel.tier, yearly]);

  // 載入目前會員狀態
  useEffect(() => {
    if (!wallet?.address || !contractAddr) return;
    fetchMyMembership(wallet.address).then((m) => {
      setMyTier(m.tier);
      setMyExpires(m.expiresAt);
    });
  }, [wallet?.address, contractAddr]);

  // 監聽合約 Subscribed 事件 — 即時更新等級/到期日
  useEffect(() => {
    if (!wallet?.address || !contractAddr) return;
    let cancelled = false;
    let off: (() => void) | null = null;
    listenSubscribed(wallet.address, (ev) => {
      if (cancelled) return;
      setMyTier(ev.tier);
      setMyExpires(ev.newExpiresAt);
      if (ev.txHash) setTxHash(ev.txHash);
      setStep("done");
      toast.success(
        `已升級到 ${TIER_NAME[ev.tier]} · 到期 ${new Date(ev.newExpiresAt * 1000).toLocaleDateString()}`,
      );
    }).then((unsub) => {
      if (cancelled) unsub();
      else off = unsub;
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, [wallet?.address, contractAddr, chainId]);

  const onPay = async () => {
    if (!hasWallet()) { toast.error("找不到錢包，請安裝 MetaMask"); return; }
    if (wrongChain) { toast.error("請切換到支援的以太鏈"); return; }
    if (!contractAddr) {
      // demo 模式 — 模擬上鏈
      setStep("paying");
      setTimeout(() => {
        setTxHash("0xDEMO" + Math.random().toString(16).slice(2, 10));
        setMyTier(sel.tier as Tier);
        setMyExpires(Math.floor(Date.now() / 1000) + (yearly ? 365 : 30) * 86400);
        setStep("done");
        toast.success(`(Demo) 已升級到 ${sel.name}`);
      }, 2200);
      return;
    }
    setStep("paying");
    try {
      const tx = await subscribe(sel.tier, { yearly });
      setTxHash(tx.hash);
      await tx.wait();
      setStep("done");
      toast.success("付款成功！");
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "交易失敗");
      setStep("checkout");
    }
  };

  const priceLabel = price > 0n
    ? `${Number(formatEther(price)).toFixed(6)} ${chain?.symbol ?? "ETH"}`
    : (yearly ? "年付（約省 30%）" : "月付");

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        <header className="h-14 px-3 flex items-center gap-3 shrink-0">
          <Link to="/profile" className="press p-2 rounded-full hover:bg-primary/10"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-bold">會員方案</h1>
          {chain && (
            <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-primary/15 text-primary-glow border border-primary/30 flex items-center gap-1">
              <Network className="h-3 w-3" /> {chain.name}
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
          {step === "select" && (
            <>
              <div className="text-center pt-2 animate-slide-up">
                <Crown className="h-10 w-10 text-amber-300 mx-auto animate-float-up drop-shadow-[0_0_12px_hsl(var(--warning))]" />
                <h2 className="mt-2 text-2xl font-black text-gradient">解鎖完整體驗</h2>
                <p className="text-sm text-muted-foreground mt-1">智能合約上鏈 · 以原生幣支付</p>
              </div>

              {/* 目前會員狀態 */}
              {myTier !== 0 && (
                <div className="rounded-2xl glass border border-primary/30 p-3 text-xs flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  目前等級：<span className="font-bold text-primary-glow">{TIER_NAME[myTier]}</span>
                  {myExpires > 0 && (
                    <span className="ml-auto text-muted-foreground">
                      到期：{new Date(myExpires * 1000).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {/* 鏈選擇 */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Network className="h-3 w-3" /> 支付網路（以太生態系）
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PREFERRED_CHAINS.map((id) => {
                    const c = SUPPORTED_CHAINS[id];
                    const active = chainId === id;
                    return (
                      <button key={id} onClick={() => switchChain(id).catch((e) => toast.error(e?.message ?? "切換失敗"))}
                        className={`press py-2 px-1 rounded-xl border-2 text-[11px] ${active ? "border-primary bg-primary/15" : "border-border"}`}>
                        <p className="font-bold truncate">{c.name}</p>
                        <p className="text-[9px] text-muted-foreground">{c.symbol}{c.testnet ? " · 測試" : ""}</p>
                      </button>
                    );
                  })}
                </div>
                {wrongChain && (
                  <p className="mt-2 text-[11px] text-warning flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> 目前鏈不支援，請切換上方任一鏈
                  </p>
                )}
              </div>

              {/* 週期切換 */}
              <div className="mx-auto inline-flex p-1 rounded-full bg-muted self-center">
                <button onClick={() => setYearly(false)} className={`px-4 py-1.5 rounded-full text-xs ${!yearly ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>月付</button>
                <button onClick={() => setYearly(true)} className={`px-4 py-1.5 rounded-full text-xs flex items-center gap-1 ${yearly ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  年付 <span className="text-[10px] bg-success/30 text-success px-1.5 rounded-full">省 30%</span>
                </button>
              </div>

              {plans.map((p, i) => (
                <button key={p.key} onClick={() => setPlanKey(p.key)} style={{ animationDelay: `${i * 80}ms` }}
                  className={`animate-slide-up press w-full text-left rounded-3xl p-5 border-2 transition ${
                    planKey === p.key ? "border-primary bg-gradient-to-br " + p.color + " bg-opacity-20 shadow-glow" : "border-border glass"
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold flex items-center gap-1">
                      {p.name}
                      {p.tier === 2 && <Crown className="h-3.5 w-3.5 text-amber-300" />}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">tier {p.tier}</p>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    {p.feats.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-foreground/80"><Check className="h-3 w-3 text-success" /> {f}</li>
                    ))}
                  </ul>
                </button>
              ))}

              <button onClick={() => setStep("checkout")}
                disabled={wrongChain}
                className="ripple press w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-glow disabled:opacity-50">
                繼續結帳 · {priceLabel}
              </button>
              {!contractAddr && (
                <p className="text-[10px] text-center text-muted-foreground">
                  ⓘ 此鏈合約尚未部署，將以 demo 模式模擬上鏈
                </p>
              )}
            </>
          )}

          {step === "checkout" && (
            <div className="space-y-4 animate-slide-up">
              <div className="rounded-2xl glass border border-border p-4 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">方案</span><span className="font-bold">{sel.name}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">週期</span><span>{yearly ? "12 個月" : "1 個月"}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">網路</span><span>{chain?.name ?? "—"}</span></div>
                <div className="flex justify-between items-end mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">應付</span>
                  <span className="text-2xl font-black text-gradient">{priceLabel}</span>
                </div>
                {contractAddr && (
                  <p className="text-[10px] text-muted-foreground font-mono break-all">合約：{contractAddr}</p>
                )}
              </div>

              <div className="rounded-2xl bg-warning/10 border border-warning/30 p-3 text-[11px] text-warning leading-relaxed">
                ⚠️ 將呼叫智能合約 <code>subscribe{yearly ? "Yearly" : "Monthly"}({sel.tier})</code><br />
                請在錢包確認 gas 與金額，鏈上交易無法撤銷
              </div>

              <button onClick={onPay} className="ripple press w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-glow">
                簽名並支付
              </button>
              <button onClick={() => setStep("select")} className="press w-full py-2 text-sm text-muted-foreground">返回</button>
            </div>
          )}

          {step === "paying" && (
            <div className="text-center py-12 animate-pop-in">
              <div className="text-5xl mb-6 animate-spin-slow">⛓</div>
              <p className="font-bold mb-2">交易上鏈中…</p>
              <p className="text-xs text-muted-foreground">請於錢包中確認簽名，等待區塊確認</p>
              <div className="h-2 mt-6 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-primary animate-pulse" style={{ width: "70%" }} />
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-8 animate-pop-in space-y-4">
              <div className="text-6xl animate-heart-beat">🎉</div>
              <h2 className="text-2xl font-black text-gradient">付款成功</h2>
              <p className="text-sm text-muted-foreground">已升級到 {sel.name}</p>
              {txHash && chain && (
                <a href={`${chain.explorer}/tx/${txHash}`} target="_blank" rel="noreferrer"
                  className="block text-[11px] text-primary-glow font-mono break-all underline">
                  {txHash.slice(0, 14)}…{txHash.slice(-8)} ↗
                </a>
              )}
              <div className="rounded-2xl glass p-4 text-left text-sm space-y-2">
                <p className="text-xs text-muted-foreground">解鎖功能</p>
                {sel.feats.map((f) => (
                  <p key={f} className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-primary" /> {f}</p>
                ))}
              </div>
              <Link to="/profile" className="ripple press inline-block w-full py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold">回到我的</Link>
            </div>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}
