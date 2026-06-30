/**
 * add-warranty-fields.ts
 * يضيف warrantyType و warrantyDuration للمنتجات
 */
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product"
    ADD COLUMN IF NOT EXISTS "warrantyType" TEXT NOT NULL DEFAULT 'none';
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product"
    ADD COLUMN IF NOT EXISTS "warrantyDuration" INTEGER NOT NULL DEFAULT 0;
  `);

  // Migrate existing fullWarranty=true products to warrantyType='full'
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE "Product"
    SET "warrantyType" = 'full'
    WHERE "fullWarranty" = true AND "warrantyType" = 'none';
  `);

  console.log('✅ warrantyType and warrantyDuration columns added');
  console.log(`✅ Migrated ${updated} products with fullWarranty=true to warrantyType='full'`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
