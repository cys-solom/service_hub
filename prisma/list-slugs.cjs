const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
require('dotenv/config');

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

prisma.product.findMany({ 
  select: { slug: true, name: true }, 
  orderBy: { displayOrder: 'asc' } 
}).then(products => {
  products.forEach(p => console.log(p.slug, '|', p.name));
  return prisma.$disconnect();
}).catch(e => {
  console.error(e.message);
  return prisma.$disconnect();
});
