import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AppHeader({ title, unread = 3 }: { title: string; unread?: number }) {
  const nav = useNavigate();
  return (
    <header className="h-14 px-5 flex items-center justify-between shrink-0 animate-slide-down">
      <h1 className="text-xl font-bold tracking-tight text-gradient">{title}</h1>
      <button onClick={() => nav("/notifications")} className="relative ripple press p-2 rounded-full hover:bg-primary/10">
        <Bell className="h-5 w-5 text-foreground/80" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose text-[10px] font-bold text-white grid place-items-center animate-pop-in">
            {unread}
          </span>
        )}
      </button>
    </header>
  );
}
