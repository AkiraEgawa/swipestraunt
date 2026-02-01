// quick test in `app/api/test.ts`
import { prisma } from "@/lib/prisma";

async function main() {
  const rooms = await prisma.room.findMany();
  console.log(rooms);
}

main();
