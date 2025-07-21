import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const saltRounds = 10;
  const password = 'senha123';
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.upsert({
    where: { email: 'admin@lojadebrinquedos.com' },
    update: {},
    create: {
      email: 'admin@lojadebrinquedos.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });

  console.log({ user });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
