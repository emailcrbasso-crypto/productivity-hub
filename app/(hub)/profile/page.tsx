import { Trophy, Flame, Zap, TrendingUp, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { xpForLevel } from "@/lib/gamification/xp-rules";
import { ModuleHeader } from "@/components/module-header";
import { ProfileNameForm } from "./ProfileNameForm";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/(auth)/actions";

export const metadata = { title: "Perfil" };

type AchievementRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
};

function ProfileLogo() {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 shadow-sm ring-1 ring-black/5 dark:bg-indigo-950/40 dark:ring-white/10">
      <Trophy size={24} className="fill-indigo-400 text-indigo-500" />
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: allAchievements }, { data: ownedRows }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "full_name, avatar_url, total_xp, current_level, current_streak, longest_streak, created_at",
        )
        .eq("id", user.id)
        .single(),
      supabase
        .from("achievements")
        .select("id, slug, title, description, icon, xp_reward")
        .order("xp_reward", { ascending: true }),
      supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", user.id),
    ]);

  const level = profile?.current_level ?? 1;
  const totalXp = profile?.total_xp ?? 0;
  const streak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const xpInLevel = totalXp - xpForLevel(level);
  const xpRange = xpForLevel(level + 1) - xpForLevel(level);
  const progressPct = Math.min(100, Math.round((xpInLevel / xpRange) * 100));

  const name = profile?.full_name ?? user.email?.split("@")[0] ?? "Usuário";
  const memberSince = profile?.created_at
    ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
        new Date(profile.created_at),
      )
    : null;

  const achievements = (allAchievements ?? []) as AchievementRow[];
  const ownedMap = new Map(
    (ownedRows ?? []).map((r) => [r.achievement_id as string, r.unlocked_at as string]),
  );
  const unlockedCount = achievements.filter((a) => ownedMap.has(a.id)).length;

  const stats = [
    { icon: TrendingUp, color: "text-indigo-500", label: "Nível", value: level },
    { icon: Zap, color: "text-amber-500", label: "XP total", value: totalXp.toLocaleString("pt-BR") },
    { icon: Flame, color: "text-orange-500", label: "Sequência", value: `${streak}d` },
    { icon: Trophy, color: "text-emerald-500", label: "Recorde", value: `${longestStreak}d` },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <ModuleHeader
        logo={<ProfileLogo />}
        title="Perfil"
        subtitle="Suas estatísticas, conquistas e configurações de conta."
      />

      {/* Identidade */}
      <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-16 w-16 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-zinc-900 dark:text-white">
            {name}
          </p>
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
          {memberSince && (
            <p className="mt-0.5 text-xs text-zinc-400">Membro desde {memberSince}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ icon: Icon, color, label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <Icon size={15} className={color} />
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Barra de progresso de nível */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Progresso do nível {level}
          </span>
          <span className="text-xs text-zinc-400">
            {xpInLevel} / {xpRange} XP
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Conquistas */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
          <Trophy size={15} className="text-amber-500" />
          Conquistas
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {unlockedCount}/{achievements.length}
          </span>
        </h3>

        {achievements.length === 0 ? (
          <p className="text-xs italic text-zinc-400">Nenhuma conquista cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {achievements.map((ach) => {
              const unlocked = ownedMap.has(ach.id);
              return (
                <div
                  key={ach.id}
                  className={
                    unlocked
                      ? "flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20"
                      : "flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 opacity-70 dark:border-zinc-800 dark:bg-zinc-900/40"
                  }
                >
                  <span className={`text-2xl leading-none ${unlocked ? "" : "grayscale"}`}>
                    {unlocked ? ach.icon : "🔒"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-semibold text-zinc-900 dark:text-white">
                        {ach.title}
                      </p>
                      {!unlocked && <Lock size={10} className="shrink-0 text-zinc-400" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {ach.description}
                    </p>
                    {ach.xp_reward > 0 && (
                      <p
                        className={`mt-1 text-[10px] font-semibold ${unlocked ? "text-amber-600 dark:text-amber-400" : "text-zinc-400"}`}
                      >
                        +{ach.xp_reward} XP
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Configurações de conta */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
          Configurações da conta
        </h3>
        <ProfileNameForm currentName={profile?.full_name ?? ""} />

        <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Aparência
          </p>
          <ThemeToggle />
        </div>

        <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
            >
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
