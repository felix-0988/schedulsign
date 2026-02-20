import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Cache the Prisma client in all environments (including production/Lambda)
// to reuse the database connection across requests within the same process.
export const prisma = globalForPrisma.prisma || new PrismaClient()
globalForPrisma.prisma = prisma

export default prisma
