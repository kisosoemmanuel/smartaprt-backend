require('dotenv').config(); // 👈 Add this line first

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const roles = ['TENANT', 'CARETAKER', 'ADMIN'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  async function createUser(email, password, name, roleName) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const hash = await bcrypt.hash(password, 10);
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      await prisma.user.create({
        data: {
          name,
          email,
          password: hash,
          roleId: role.id,
        },
      });
      console.log(`✅ Created ${roleName}: ${email}`);
    } else {
      console.log(`ℹ️ User already exists: ${email}`);
    }
  }

  await createUser('admin@smartaprt.com', 'AdminPass123!', 'Admin User', 'ADMIN');
  await createUser('caretaker@smartaprt.com', 'CaretakerPass123!', 'Caretaker User', 'CARETAKER');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
