import { prisma } from "../src/lib/prisma";
import { resetAllStuckProducts } from "../src/lib/reset-stuck-run";

async function main() {
  const email = process.argv[2] ?? "alinoerie@gmail.com";

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const stuck = await prisma.product.findMany({
    where: {
      userId: user.id,
      status: { in: ["QUEUED", "PROCESSING"] },
    },
    select: { id: true, name: true, status: true },
  });

  if (stuck.length === 0) {
    console.log(`No stuck projects for ${email}`);
    return;
  }

  const result = await resetAllStuckProducts(user.id);

  console.log(`Reset ${result.count} stuck project(s) for ${email}:`);
  for (const p of stuck) {
    console.log(`  - ${p.name} (${p.status}) → FAILED`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
