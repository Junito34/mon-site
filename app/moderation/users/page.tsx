import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";

export default async function ModerationUsersPage() {
  await requireAdmin();
  const supabase = createClient();

  // On récupère profils + count commentaires (relation comments.user_id -> profiles.id)
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, comments(count)")
    .order("role", { ascending: false })
    .order("full_name", { ascending: true });

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-wide">
          Liste utilisateurs
        </h1>
        <p className="mt-4 text-white/60 text-sm md:text-base">
          Vue globale des comptes et de leur activité.
        </p>

        {error && (
          <div className="mt-8 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error.message}
          </div>
        )}

        <div className="mt-12 border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-white/60">
              <tr>
                <th className="px-6 py-4 font-light tracking-widest uppercase text-xs">
                  Username
                </th>
                <th className="px-6 py-4 font-light tracking-widest uppercase text-xs">
                  Email
                </th>
                <th className="px-6 py-4 font-light tracking-widest uppercase text-xs">
                  Role
                </th>
                <th className="px-6 py-4 font-light tracking-widest uppercase text-xs">
                  Commentaires
                </th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((u: any) => {
                const commentCount = u.comments?.[0]?.count ?? 0;

                return (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="px-6 py-4 text-white/85">
                      {u.full_name || "—"}
                    </td>
                    <td className="px-6 py-4 text-white/70">{u.email || "—"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-white/80 tracking-widest uppercase text-xs">
                          {u.role || "user"}
                        </span>
                        {u.role === "admin" && (
                          <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-white/20 bg-white/10 text-white/80">
                            Admin
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70">{commentCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}