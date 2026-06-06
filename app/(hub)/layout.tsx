import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, total_xp, current_level, current_streak")
    .eq("id", user.id)
    .single();

  const userName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Usuário";

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar userName={userName} avatarUrl={profile?.avatar_url ?? null} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          level={profile?.current_level ?? 1}
          totalXp={profile?.total_xp ?? 0}
          streak={profile?.current_streak ?? 0}
          userName={userName}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
