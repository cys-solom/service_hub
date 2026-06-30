/**
 * add-account-type.ts
 * يضيف عمود accountType لجدول Product بدون data loss
 * تشغيل: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/add-account-type.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Add column safely (if not exists)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product"
    ADD COLUMN IF NOT EXISTS "accountType" TEXT NOT NULL DEFAULT 'no_account';
  `);
  console.log('✅ accountType column added to Product table (default: no_account)');

  const count = await prisma.$queryRaw<{count: string}[]>`
    SELECT COUNT(*) as count FROM "Product";
  `;
  console.log(`✅ Total products: ${count[0].count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
