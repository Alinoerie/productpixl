import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.argv[2];
  const credits = Number(process.argv[3]);

  if (!email || !Number.isFinite(credits)) {
    console.error("Usage: pnpm exec tsx scripts/set-user-credits.ts <email> <credits>");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { credits: Math.floor(credits) },
    select: { email: true, credits: true },
  });

  console.log(`Updated ${user.email} → ${user.credits.toLocaleString()} credits`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
