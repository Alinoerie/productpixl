import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.argv[2] ?? "alinoerie@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      brandProfile: true,
      products: { take: 5, orderBy: { updatedAt: "desc" }, select: { id: true, name: true, status: true } },
      _count: { select: { products: true } },
    },
  });

  if (!user) {
    console.log(JSON.stringify({ found: false, email }, null, 2));
    return;
  }

  console.log(
    JSON.stringify(
      {
        found: true,
        email: user.email,
        credits: user.credits,
        onboardingComplete: user.brandProfile?.onboardingComplete ?? false,
        displayName: user.brandProfile?.displayName ?? null,
        productCount: user._count.products,
        recentProducts: user.products,
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
