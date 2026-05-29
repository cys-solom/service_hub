import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const adapter = new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    });
    const client = new PrismaClient({ adapter });
    return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Pre-warm the connection on module load to avoid cold-start delays on first request
if (typeof window === 'undefined') {
    prisma.$connect().catch(() => {
        // Silently ignore — connection will be established on first query
    });
}
