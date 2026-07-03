import { prisma } from "@/lib/db/prisma";

export async function ensureUserProfile(
  userId: string,
  email: string
): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email },
    update: { email },
  });
}

export async function getCurrentUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      plans: {
        where: { isActive: true },
        include: {
          days: {
            orderBy: { dayIndex: "asc" },
            include: {
              exercises: {
                orderBy: { orderIndex: "asc" },
                include: {
                  variation: { include: { exercise: true } },
                },
              },
            },
          },
          nutrition: true,
        },
      },
    },
  });
}
