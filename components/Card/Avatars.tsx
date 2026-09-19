import type { ClickUpUser } from "@/lib/types";
import { avatarTone, displayName, initials } from "@/lib/ui";

export function Avatars({ users, max = 3 }: { users: ClickUpUser[]; max?: number }) {
  if (users.length === 0) {
    return <span className="hub-meta">Sem responsável</span>;
  }

  const shown = users.slice(0, max);
  const rest = users.length - shown.length;

  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((user) => (
        <span
          key={user.id}
          title={displayName(user)}
          className="size-6 rounded-full grid place-items-center text-[10px] font-medium text-foreground/90 ring-2 ring-card"
          style={{ backgroundColor: avatarTone(displayName(user)) }}
        >
          {initials(displayName(user))}
        </span>
      ))}
      {rest > 0 && (
        <span className="size-6 rounded-full grid place-items-center bg-secondary text-[10px] text-muted-foreground ring-2 ring-card">
          +{rest}
        </span>
      )}
    </div>
  );
}
