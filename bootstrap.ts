import * as dotenv from "dotenv"
dotenv.config({ path: "./.env" })

// THIS MUST BE BEFORE ANY PrismaClient IMPORT
process.env.PRISMA_CLIENT_ENGINE_TYPE = "library"

// Now import the file that uses PrismaClient
import "./app/api/test"
