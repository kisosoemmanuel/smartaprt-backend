import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Roles
  const roles = ['TENANT', 'CARETAKER', 'ADMIN'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2️⃣ Helper for user creation
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
    }
  }

  // 3️⃣ Create Admin & Caretaker
  await createUser('admin@smartaprt.com', 'AdminPass123!', 'Admin User', 'ADMIN');
  await createUser('caretaker@smartaprt.com', 'CaretakerPass123!', 'Caretaker User', 'CARETAKER');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());