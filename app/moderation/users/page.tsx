import { requireAdmin } from "@/features/auth/lib/requireAdmin";
import { createClient } from "@/lib/supabase/server";

export default async function ModerationUsersPage() {
  await requireAdmin();
  const supabase = createClient();

  // profils + count commentaires (relation comments.user_id -> profiles.id)
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, comments(count)")
    .order("role", { ascending: false })
    .order("full_name", { ascending: true });

  return (
    <main className="min-h-screen bg-black text-white pt-28 md:pt-40 pb-16 md:pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide">
          Liste utilisateurs
        </h1>
        <p className="mt-3 md:mt-4 text-white/60 text-sm md:text-base">
          Vue globale des comptes et de leur activité.
        </p>

        {error && (
          <div className="mt-8 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error.message}
          </div>
        )}

        {/* ===== Desktop / Tablet : TABLE ===== */}
        <div className="mt-10 md:mt-12 border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hidden md:block">
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

        {/* ===== Mobile : CARDS ===== */}
        <div className="mt-10 space-y-4 md:hidden">
          {(data ?? []).map((u: any) => {
            const commentCount = u.comments?.[0]?.count ?? 0;
            const name = u.full_name || "—";
            const mail = u.email || "—";
            const role = (u.role || "user") as string;

            return (
              <div
                key={u.id}
                className="border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-light text-white/85">
                      {name}
                    </div>
                    <div className="mt-1 text-sm text-white/60 break-all">
                      {mail}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-white/15 bg-white/5 text-white/80">
                      {role}
                    </span>
                    {role === "admin" && (
                      <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-white/20 bg-white/10 text-white/85">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.35em] uppercase text-white/50">
                    Commentaires
                  </span>
                  <span className="text-sm text-white/75">{commentCount}</span>
                </div>
              </div>
            );
          })}

          {(data ?? []).length === 0 && !error && (
            <p className="text-white/40 text-sm">Aucun utilisateur.</p>
          )}
        </div>
      </div>
    </main>
  );
}