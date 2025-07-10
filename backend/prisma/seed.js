const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // Hash passwords for realism
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Alice Admin',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'guest@example.com',
      password: hashedPassword,
      name: 'Bob Guest',
      role: 'USER',
    },
  });

  // Create movies with reviews
  await prisma.movie.create({
    data: {
      title: 'Inception',
      synopsis: 'A mind-bending thriller by Christopher Nolan.',
      reviews: {
        create: {
          content: 'Absolutely amazing. 5/5.',
          user: { connect: { id: user.id } },
        },
      },
    },
  });

  await prisma.movie.create({
    data: {
      title: 'The Matrix',
      synopsis: 'A computer hacker learns the true nature of his reality.',
      reviews: {
        create: [
          {
            content: 'Changed my life.',
            user: { connect: { id: admin.id } },
          },
          {
            content: 'Still relevant decades later.',
            user: { connect: { id: user.id } },
          },
        ],
      },
    },
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
