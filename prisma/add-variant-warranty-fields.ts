/**
 * add-variant-warranty-fields.ts
 * يضيف warrantyType و warrantyDuration لجدول ProductVariant
 */
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ProductVariant"
    ADD COLUMN IF NOT EXISTS "warrantyType" TEXT NOT NULL DEFAULT 'none';
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ProductVariant"
    ADD COLUMN IF NOT EXISTS "warrantyDuration" INTEGER NOT NULL DEFAULT 0;
  `);

  // Migrate existing warrantyDays > 0 to warrantyType='days'
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE "ProductVariant"
    SET "warrantyType" = 'days', "warrantyDuration" = "warrantyDays"
    WHERE "warrantyDays" > 0 AND "warrantyType" = 'none';
  `);

  console.log('✅ ProductVariant warrantyType and warrantyDuration columns added');
  console.log(`✅ Migrated ${updated} variants with warrantyDays > 0 to warrantyType='days'`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
