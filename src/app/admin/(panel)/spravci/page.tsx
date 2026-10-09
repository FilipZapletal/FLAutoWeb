import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { PageHead, tableClass } from "@/components/admin/ui";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata = { title: "Správci" };

export default async function AdminsPage() {
  const [session, admins] = await Promise.all([
    getSession(),
    db.admin.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, email: true, createdAt: true } }),
  ]);

  return (
    <>
      <PageHead title="Správci" />
      <p className="mb-4 max-w-2xl text-sm text-muted">
        Lidé, kteří se mohou přihlásit do administrace. Každý by měl mít vlastní účet. Sami sebe ani posledního správce
        odebrat nejde.
      </p>
      <div className="card mb-6 overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th>E-mail</th>
              <th>Založen</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="hover:bg-card2">
                <td className="font-semibold">{a.email}</td>
                <td className="whitespace-nowrap">{a.createdAt.toLocaleDateString("cs-CZ")}</td>
                <td>
                  {a.id === session?.id ? (
                    <span className="text-xs text-muted">To jste vy</span>
                  ) : (
                    admins.length > 1 && <AdminDeleteButton id={a.id} email={a.email} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminCreateForm />
    </>
  );
}
