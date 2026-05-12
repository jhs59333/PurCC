// 反詐騙工具：關鍵字偵測 + 速率限制 + 內容雜訊判斷

const SCAM_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /(usdt|btc|eth|虛擬貨幣|加密貨幣|空投|airdrop)/i, reason: "提及加密貨幣" },
  { re: /(投資|理財|穩賺|高報酬|包賺|帶單|老師|內線)/i, reason: "可疑投資話術" },
  { re: /(加我|私訊我|加賴|加 ?line|telegram|微信|wechat|whatsapp)/i, reason: "誘導離開平台" },
  { re: /(轉帳|匯款|借錢|急用|代收|代付|刷單|兼職)/i, reason: "金錢請求" },
  { re: /(https?:\/\/|www\.|\.com|\.net|bit\.ly|t\.me)/i, reason: "外部連結" },
  { re: /(裸聊|約炮|包養|sugar daddy)/i, reason: "違規內容" },
];

export type ScamHit = { reason: string; match: string };

export function detectScam(text: string): ScamHit[] {
  const hits: ScamHit[] = [];
  for (const { re, reason } of SCAM_PATTERNS) {
    const m = text.match(re);
    if (m) hits.push({ reason, match: m[0] });
  }
  return hits;
}

// 簡易速率限制：回傳剩餘冷卻秒數，0 表示可發送
export function rateLimit(history: number[], windowMs = 10_000, max = 6): number {
  const now = Date.now();
  const recent = history.filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    const wait = Math.ceil((windowMs - (now - recent[0])) / 1000);
    return Math.max(1, wait);
  }
  return 0;
}

// 偵測機器人式行為：完全相同訊息連發
export function isRepeating(history: string[], text: string): boolean {
  if (history.length < 2) return false;
  return history.slice(-2).every((h) => h.trim() === text.trim());
}
