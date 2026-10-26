import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "zh" | "en";

export const useLang = create<{ lang: Lang; toggle: () => void }>()(
  persist((set, get) => ({ lang: "zh", toggle: () => set({ lang: get().lang === "zh" ? "en" : "zh" }) }), { name: "purcc-lang" }),
);

/** t("中文", "English") */
export function useT() {
  const lang = useLang((s) => s.lang);
  return (zh: string, en: string) => (lang === "en" ? en : zh);
}

/** English for Chinese sample content and shared UI text. Unknown strings are returned as-is. */
export const EN: Record<string, string> = {
  // tags
  咖啡控: "Coffee lover", 旅行: "Travel", 電影: "Movies", 攝影: "Photography", 健身: "Fitness", 閱讀: "Reading",
  音樂: "Music", 美食: "Foodie", 登山: "Hiking", 桌遊: "Board games", 插畫: "Illustration", 寵物: "Pets",
  瑜珈: "Yoga", 酒吧: "Bars", 看展: "Exhibitions", 自駕: "Road trips",
  // cities
  台北: "Taipei", 東京: "Tokyo", 首爾: "Seoul", 紐約: "New York", 倫敦: "London", 巴黎: "Paris", 曼谷: "Bangkok", 新加坡: "Singapore", 柏林: "Berlin",
  // names
  小雨: "Rain", 檸檬: "Lemon", 星野: "Hoshino", 可可: "Coco", 桃子: "Peach", 我: "Me",
  // prompts & bios
  我最不擅長的事: "What I'm worst at", 假裝自己有在運動: "Pretending I work out",
  週末的完美畫面: "My perfect weekend", "咖啡 + 一本書 + 雨聲": "Coffee + a book + the sound of rain",
  最近迷上的事: "Currently obsessed with", "陶藝課，但我做的杯子全部歪掉": "Pottery class, but all my cups come out crooked",
  想一起做的事: "Something to do together", "深夜便利店、無目的散步": "Late-night convenience store runs, aimless walks",
  不可妥協的小事: "My non-negotiable", 一定要先洗手再吃飯: "Always wash hands before eating",
  最近想學陶藝: "Want to learn pottery", "愛貓人士、咖啡因依賴": "Cat person, caffeine dependent",
  週末爬山週間追劇: "Hikes on weekends, binge-watching on weekdays", 正在環島中: "Currently on a round-island trip",
  "設計師 / 業餘攝影": "Designer / amateur photographer",
  // posts
  "今天的雲很像棉花糖，誰跟我一起吃下午茶 🍰": "Today's clouds look like cotton candy. Anyone up for afternoon tea? 🍰",
  "新買的相機到了！週末有人想當麻豆嗎 📷": "My new camera arrived! Anyone want to model this weekend? 📷",
  "獨自旅行的第七天，東京很冷但便利商店很暖。": "Day 7 of solo travel. Tokyo is cold but the convenience stores are warm.",
  "今天的 playlist：lofi + 雨聲，誰要連線一起寫 code": "Today's playlist: lofi + rain. Anyone want to code together?",
  // notifications
  "你和小雨配對成功！": "You matched with Rain!", "Aiden 傳了訊息給你": "Aiden sent you a message",
  "檸檬給了你 Super Like ⭐": "Lemon gave you a Super Like ⭐", "今日話題：你最理想的週末？": "Today's topic: your ideal weekend?",
  // times
  剛剛: "Just now", "10 分鐘前": "10 min ago", "1 小時前": "1 hr ago", "3 小時前": "3 hr ago", "5 分鐘前": "5 min ago",
  今天: "Today", 昨天: "Yesterday", 週一: "Mon",
  // matches previews
  "哈囉～你也喜歡爬山！": "Hey~ you like hiking too!", "你今天有空嗎？": "Are you free today?",
  "看到你的照片，超有質感": "Your photos have such great vibes", "明天一起去咖啡廳？": "Café together tomorrow?",
  "晚安 🌙": "Good night 🌙", "謝謝你的 Super Like！": "Thanks for the Super Like!",
  // chat
  "嗨！很高興認識你 👋": "Hi! Nice to meet you 👋", "你好～看到你也喜歡攝影!": "Hey~ I see you're into photography too!",
  "哈哈，我也是！": "Haha, me too!", "週末有空一起拍照嗎？": "Free to take photos together this weekend?", "你都用什麼相機？": "What camera do you use?",
  "真的嗎！": "Really!", "我也這樣覺得 😊": "I think so too 😊", "好哦！週末約？": "Sure! This weekend?", "嘿嘿，被你發現了": "Hehe, you caught me",
  "線上 · 24h 倒數中": "Online · 24h countdown", 更多: "More", "DELULU AI 建議": "DELULU AI suggestions",
  "按住說話 🎤": "Hold to talk 🎤", "說點什麼…": "Say something…", 語音: "Voice",
  // discover
  一般: "Normal", 今日話題: "Daily topic", 神秘人: "Mystery person", "傳 5 則訊息後解鎖真實樣貌": "Send 5 messages to reveal their look",
  今天先到這裡: "That's all for today", 明天再為你帶來新朋友: "New friends arrive tomorrow", 重新整理推薦: "Refresh picks",
  共同: "In common", 的照片: "'s photo",
  "你週末最想做的事？": "What do you most want to do on weekends?", 睡到自然醒: "Sleep in", 出門探險: "Go exploring", 在家看劇: "Watch shows at home", 找朋友吃飯: "Eat with friends",
  "理想的約會場景？": "Ideal date setting?", 咖啡廳聊天: "Chatting in a café", 看一場電影: "Catching a movie", 市集散步: "Strolling a market", 開車兜風: "A scenic drive",
  "你是？": "You are…", 夜貓子: "Night owl", 晨型人: "Early bird", 看心情: "Depends on my mood", 永遠很累: "Always tired",
  為你找到5位有共鳴的朋友: "Found 5 friends who resonate with you", 已加入今日推薦: "Added to today's picks",
  "配對成功！": "It's a match!", 互相喜歡了: "liked each other", 你和: "You and",
  直接開聊: "Start chatting", 稍後再說: "Maybe later",
  // matches / feed / notifications / profile
  最新配對: "New matches", 訊息: "Messages", "今天有什麼想分享？": "What would you like to share today?",
  取消: "Cancel", 發布: "Post", "分享你的此刻…": "Share your moment…", 通知: "Notifications", 全部已讀: "Mark all read",
  "白天設計師，晚上躺平愛好者。": "Designer by day, professional couch potato by night.",
  關於我: "About me", 喜好: "Interests", 傳送訊息: "Send message",
};

export function useTx() {
  const lang = useLang((s) => s.lang);
  return (s: string) => (lang === "en" ? EN[s] ?? s : s);
}
