// start.ts
import * as dotenv from "dotenv"
dotenv.config({ path: "./.env" })

// force library engine type
process.env.PRISMA_CLIENT_ENGINE_TYPE = "library"

// import PrismaClient AFTER setting env
import { prisma } from "./src/lib/prisma"

async function main() {
  console.log("Testing Prisma connection...")

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