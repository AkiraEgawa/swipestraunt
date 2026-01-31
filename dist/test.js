"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Create a new user
    const user = await prisma.user.create({
        data: { email: "akira@example.com" },
    });
    console.log("Created user:", user);
    // List all users
    const users = await prisma.user.findMany();
    console.log("All users:", users);
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
