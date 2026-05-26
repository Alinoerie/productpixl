import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Account</h1>
      {params.success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Payment successful — credits added.</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{user?.name}</p>
          <p className="text-[var(--muted-fg)]">{user?.email}</p>
          <p className="font-medium">{user?.credits ?? 0} credits</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {!user?.orders?.length ? (
            <p className="text-sm text-[var(--muted-fg)]">No purchases yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {user!.orders.map((o) => (
                <li key={o.id} className="flex justify-between border-b border-[var(--border)] py-2">
                  <span>
                    {o.package} · {o.credits} credits
                  </span>
                  <span className="text-[var(--muted-fg)]">{o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
