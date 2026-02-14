import ClientOnlyAdd from "./ClientOnlyAdd";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export default async function AddArticlePage() {
  await requireAdmin();
  return <ClientOnlyAdd />;
}