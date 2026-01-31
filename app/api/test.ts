import { prisma } from "../../src/lib/prisma"

async function main() {
  console.log("Testing Prisma client with engine type 'client'")

  const user = await prisma.user.create({
    data: { email: "akira@example.com" },
  })
  console.log("Created user:", user)

  const users = await prisma.user.findMany()
  console.log("All users:", users)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
