# PurCC 💜

> 溫暖的地方，等你來分享 — 一個讓每個人都能在平台上開心分享彼此生活的溫馨社交 App

**版本：** v1.0 MVP　|　**主題：** 溫柔薰衣草紫　|　**平台：** Web (Mobile RWD)

---

## ✨ 核心特色

- 🔐 **Web3 錢包登入** — MetaMask / Trust Wallet 模擬流程，Email 備援
- 🎨 **3D 滑卡探索** — 透視傾斜、視差、發光戳記、可即時調參
- 💞 **Vibe Score 配對** — Cosine Similarity + Tag Jaccard + 距離懲罰
- 🤖 **AI Agent 助手** — DELULU 聊天建議、Soul 維度分析
- 💎 **Web3 會員付款** — USDT / USDC (ERC-20) 模擬鏈上動畫

---

## 🗺️ 功能完整列表

### 一、登入系統
- **Web3 錢包登入**
  - MetaMask（Ethereum，橘色主題）
  - Trust Wallet（Multi-Chain，藍色主題）
  - 3 步驟動畫：連接錢包 → 簽名驗證 → 載入身份
  - 10% 機率模擬失敗（真實感），可重試
  - 安全說明：僅簽名驗證，不存取或轉移資產
  - 連接成功顯示縮短地址（`0x1a2b···c3d4`）
- **Email 備用登入**（非 Web3 用戶）

### 二、Onboarding 新手引導
| 步驟 | 內容 |
|------|------|
| 歡迎頁 | 品牌介紹、加入 PurCC 按鈕 |
| 步驟 1 | 輸入暱稱（必填驗證） |
| 步驟 2 | 選擇喜好標籤（3–8 個，共 16 種） |
| 步驟 3 | 上傳個人照片（最多 4 張，可跳過） |

- 進度條動態填充
- 每步驟有進場動畫（滑入 + 彈跳）

### 三、探索（Discover）頁面
- **3D 透視滑卡**：拖拽傾斜、視差、發光 LIKE / PASS / SUPER 戳記
- **5 個操作鈕**：Undo / Pass / Super Like / Like / Boost
- **4 種模式**：
  - 一般模式
  - Blind Date（神秘人，5 訊息後解鎖）
  - Passport（切換城市探索）
  - 今日話題 Quiz（3 題找到共鳴朋友）
- **暖度環**：每張卡片顯示對方溫度
- **共同標籤**高亮顯示
- **配對成功**：彩屑動畫 + 直接開聊
- **🎛️ 調參面板**：即時調整 Swipe Threshold、戳記距離、旋轉、透視、視差，自動保存

### 四、聊天（Chat）
- 雙擊愛心動畫（`likeFloat`）
- AI 建議回覆（DELULU）
- 語音錄製 UI（動態波形）
- 訊息氣泡進場動畫

### 五、Agent AI 助手
- 即時執行日誌
- Soul 維度條（17 個維度顯示）
- 對話式互動

### 六、會員（Membership）
- 4 步驟付款流程：選擇 → 結帳 → 鏈上動畫 → 成功
- 模擬 USDT / USDC 付款

### 七、社群（Community）
- 貼文 Feed
- 24 小時配對倒數計時器

### 八、個人檔案（Profile）
- 可編輯資料
- 標籤管理
- 照片上傳

---

## 🛠️ 技術棧

### Frontend
- **React 18** + **Vite 5** + **TypeScript 5**
- **Tailwind CSS v3** — 設計系統 (HSL semantic tokens)
- **React Router** — 路由
- **Zustand** — 全域狀態管理
- **shadcn/ui** + **Radix UI** — 元件庫
- **Lucide Icons**

### Backend（規劃 / 部分啟用）
- **Lovable Cloud**（Supabase 底層）
  - Auth — 身份驗證
  - Firestore-like DB — 即時資料
  - Storage — 照片 / 影片
  - Edge Functions — 匹配觸發、通知

### Web3（模擬）
- WalletConnect / wagmi — 錢包連接
- ethers.js — 簽名驗證
- USDT / USDC — 會員付款（ERC-20）

### AI / Matching
- **Vibe Score 引擎**：Cosine Similarity + Tag Jaccard + 距離懲罰
- **Bayesian Feedback Loop**：從滑動行為學習偏好
- **Trust Score**：17 個維度假帳號過濾

---

## 🎨 設計系統

採用 **溫柔薰衣草紫** 主題：

| Token | 值 |
|-------|-----|
| `--primary` | `262 83% 76%` (#a78bfa) |
| `--primary-glow` | `280 90% 85%` (#e9d5ff) |
| `--background` | `258 30% 12%` |
| `--accent` | `280 70% 80%` |

特色動畫：`cardEntry`、`heartBeat`、`glow`、`waveBar`、`confettiFall`、`likeFloat`、`particleFloat`

---

## 🚀 開發

```bash
# 安裝依賴
bun install

# 啟動開發伺服器
bun run dev

# 建置
bun run build
```

---

## 📂 專案結構

```
src/
├── components/          # 共用元件 (PhoneShell, TabBar, TuningPanel...)
├── pages/               # 頁面 (Discover, Chat, Onboarding...)
├── lib/
│   ├── store.ts        # Zustand 全域狀態
│   ├── mock.ts         # 假資料
│   └── tuning.ts       # Discover 調參 hook
└── index.css           # Design tokens + 動畫
```

---

最後更新：2026 年 5 月　|　**PurCC — 溫暖的地方，等你來分享 💜**
