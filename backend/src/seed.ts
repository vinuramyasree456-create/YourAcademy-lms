import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.videoProgress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.section.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding extended demo data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create a Demo User
  await prisma.user.create({
    data: {
      email: 'demo@youracademy.com',
      password: hashedPassword,
      name: 'Demo Student',
    },
  });

  const subjectsData = [
    {
      title: 'Python for Beginners',
      slug: 'python-for-beginners',
      description: 'Learn Python programming from scratch. Python is widely used in data science, AI, and web development.',
      youtubeId: 'kqtD5dpn9C8', // Programming with Mosh
      videoTitle: 'Python Tutorial for Beginners',
    },
    {
      title: 'Java Programming Masterclass',
      slug: 'java-masterclass',
      description: 'Master Java, one of the most popular programming languages for enterprise applications.',
      youtubeId: 'eIrMbAQSU34', // Programming with Mosh
      videoTitle: 'Java Tutorial for Beginners',
    },
    {
      title: 'JavaScript Fundamentals',
      slug: 'javascript-fundamentals',
      description: 'Learn the language of the web. Essential for front-end and back-end development.',
      youtubeId: 'W6NZfCO5SIk', // Programming with Mosh
      videoTitle: 'JavaScript Tutorial for Beginners',
    },
    {
      title: 'C Programming',
      slug: 'c-programming',
      description: 'A comprehensive guide to C programming, the foundation of modern computing.',
      youtubeId: 'KJgsSFOSQv0', // FreeCodeCamp
      videoTitle: 'C Programming Tutorial for Beginners',
    },
    {
      title: 'C++ Programming',
      slug: 'cpp-programming',
      description: 'Learn C++ to build high-performance applications and games.',
      youtubeId: 'vLnPwxZdW4Y', // FreeCodeCamp
      videoTitle: 'C++ Tutorial for Beginners',
    },
    {
      title: 'Embedded Systems',
      slug: 'embedded-systems',
      description: 'An introduction to programming microcontrollers and embedded systems.',
      youtubeId: 'mJ-R0X29zU8',
      videoTitle: 'Introduction to Embedded Systems',
    },
    {
      title: 'VLSI Design',
      slug: 'vlsi-design',
      description: 'Learn the fundamentals of Very Large Scale Integration (VLSI) design and hardware.',
      youtubeId: 'gG9jU2p5fHU', 
      videoTitle: 'VLSI Basics',
    },
    {
      title: 'React Fundamentals',
      slug: 'react-fundamentals',
      description: 'Build modern user interfaces effortlessly with React.',
      youtubeId: 'bMknfKXIFA8', // FreeCodeCamp
      videoTitle: 'React Course - Beginner\'s Tutorial',
    },
    {
      title: 'HTML & CSS Fast Track',
      slug: 'html-css',
      description: 'Learn HTML and CSS to create responsive and beautiful websites.',
      youtubeId: 'G3e-cpL7ofc', // SuperSimpleDev
      videoTitle: 'HTML & CSS Full Course',
    },
    {
      title: 'SQL & Database Design',
      slug: 'sql-database',
      description: 'Learn how to query databases and design robust schemas.',
      youtubeId: 'HXV3zeJZ1EQ', // FreeCodeCamp
      videoTitle: 'SQL Tutorial - Full Database Course',
    }
  ];

  for (const sub of subjectsData) {
    await prisma.subject.create({
      data: {
        title: sub.title,
        slug: sub.slug,
        description: sub.description,
        isPublished: true,
        sections: {
          create: [
            {
              title: 'Course Content',
              orderIndex: 0,
              videos: {
                create: [
                  {
                    title: sub.videoTitle,
                    description: 'Watch the full tutorial to master the basics.',
                    youtubeUrl: `https://www.youtube.com/watch?v=${sub.youtubeId}`,
                    orderIndex: 0,
                    durationSeconds: 3600, // Estimate 1 hour placeholder
                  },
                ]
              }
            }
          ]
        }
      }
    });
  }

  console.log('Seed completed successfully!');
  console.log(`Created ${subjectsData.length} Subjects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
