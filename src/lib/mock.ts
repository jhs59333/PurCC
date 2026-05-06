// Mock data for PurCC
export type Person = {
  id: string;
  name: string;
  age: number;
  city: string;
  mbti: string;
  bio: string;
  warmth: number; // 0-100
  tags: string[];
  prompt: { q: string; a: string };
  avatar: string; // emoji as placeholder
  color: string;
};

export const ALL_TAGS = [
  "咖啡控","旅行","電影","攝影","健身","閱讀","音樂","美食",
  "登山","桌遊","插畫","寵物","瑜珈","酒吧","看展","自駕"
];

export const CITIES = ["台北","東京","首爾","紐約","倫敦","巴黎","曼谷","新加坡","柏林"];

const palette = ["from-violet-400 to-fuchsia-400","from-pink-400 to-rose-400","from-indigo-400 to-purple-400","from-amber-300 to-pink-400","from-emerald-300 to-cyan-400","from-sky-400 to-violet-400"];
const avatars = ["🌸","🦊","🌙","☕️","🎨","🍓","🪐","🐱","🍃","🎧","🌊","🍷"];

const names = ["小雨","Aiden","檸檬","Mika","星野","Luca","可可","Yuki","River","桃子","Noah","Nova"];
const mbtis = ["INFJ","ENFP","INTP","ESFJ","ISFP","ENTJ","INFP","ESTP"];
const prompts = [
  { q: "我最不擅長的事", a: "假裝自己有在運動" },
  { q: "週末的完美畫面", a: "咖啡 + 一本書 + 雨聲" },
  { q: "最近迷上的事", a: "陶藝課，但我做的杯子全部歪掉" },
  { q: "想一起做的事", a: "深夜便利店、無目的散步" },
  { q: "不可妥協的小事", a: "一定要先洗手再吃飯" },
];

export const PEOPLE: Person[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `p${i}`,
  name: names[i % names.length],
  age: 22 + ((i * 3) % 12),
  city: CITIES[i % CITIES.length],
  mbti: mbtis[i % mbtis.length],
  bio: ["最近想學陶藝","愛貓人士、咖啡因依賴","週末爬山週間追劇","正在環島中","設計師 / 業餘攝影"][i % 5],
  warmth: 65 + ((i * 7) % 35),
  tags: [ALL_TAGS[i % 16], ALL_TAGS[(i + 3) % 16], ALL_TAGS[(i + 7) % 16], ALL_TAGS[(i + 11) % 16]],
  prompt: prompts[i % prompts.length],
  avatar: avatars[i % avatars.length],
  color: palette[i % palette.length],
}));

export const ME = {
  name: "我",
  age: 25,
  mbti: "INFJ",
  warmth: 82,
  trust: 91,
  tags: ["咖啡控","旅行","攝影","音樂","看展"],
  bio: "白天設計師，晚上躺平愛好者。",
  matches: 23,
  replyRate: 87,
  rating: 4.8,
  wallet: { name: "MetaMask", address: "0x1a2b···c3d4" },
  plan: "Free" as "Free" | "Basic" | "Premium",
};

export const POSTS = [
  { id: "po1", author: "小雨", avatar: "🌸", time: "2h", text: "今天的雲很像棉花糖，誰跟我一起吃下午茶 🍰", likes: 24, comments: 6, liked: false },
  { id: "po2", author: "Aiden", avatar: "🦊", time: "5h", text: "新買的相機到了！週末有人想當麻豆嗎 📷", likes: 58, comments: 12, liked: true },
  { id: "po3", author: "檸檬", avatar: "🍓", time: "1d", text: "獨自旅行的第七天，東京很冷但便利商店很暖。", likes: 102, comments: 21, liked: false },
  { id: "po4", author: "星野", avatar: "🌙", time: "2d", text: "今天的 playlist：lofi + 雨聲，誰要連線一起寫 code", likes: 41, comments: 8, liked: false },
];

export const NOTIFICATIONS = [
  { id: "n1", type: "match", text: "你和小雨配對成功！", time: "剛剛", read: false },
  { id: "n2", type: "message", text: "Aiden 傳了訊息給你", time: "10 分鐘前", read: false },
  { id: "n3", type: "super", text: "檸檬給了你 Super Like ⭐", time: "1 小時前", read: false },
  { id: "n4", type: "topic", text: "今日話題：你最理想的週末？", time: "3 小時前", read: true },
];
