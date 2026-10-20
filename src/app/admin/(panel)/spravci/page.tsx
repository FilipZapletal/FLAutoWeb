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
      <ul className="card mb-6 divide-y divide-line md:hidden">
        {admins.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="min-w-0">
              <span className="block truncate font-semibold">{a.email}</span>
              <span className="text-xs text-muted">Založen {a.createdAt.toLocaleDateString("cs-CZ")}</span>
            </span>
            {a.id === session?.id ? <span className="text-xs text-muted">To jste vy</span> : admins.length > 1 && <AdminDeleteButton id={a.id} email={a.email} />}
          </li>
        ))}
      </ul>
      <div className="card mb-6 overflow-x-auto max-md:hidden">
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
