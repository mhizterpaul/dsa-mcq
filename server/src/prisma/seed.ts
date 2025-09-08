import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log(`🌱 Starting seed in ${process.env.NODE_ENV || "development"} mode...`);

  // ✅ Skip seeding if questions already exist
  const existingCount = await prisma.question.count();
  if (existingCount > 0) {
    console.log(`✅ Seed skipped: ${existingCount} questions already in DB.`);
    return;
  }

  // ✅ Pick CSV path
  const csvFilePath = path.resolve(__dirname, '../../mcq_dataset_enriched.csv');

  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(parse({
      columns: true,
      skip_empty_lines: true,
    }));

  for await (const record of parser) {
    const { question, a, b, c, d, correct, difficulty, category, tags } = record;

    // 1. Ensure Category
    let categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category },
      });
    }

    // 2. Ensure Tags
    const tagNames = tags.split(',').map((t: string) => t.trim());
    const tagRecords = await Promise.all(
      tagNames.map(async (tagName: string) => {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName },
        });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName },
          });
        }
        return tag;
      })
    );

    // 3. Create Question
    await prisma.question.create({
      data: {
        title: question,
        body: `${question}\nOptions: A) ${a}, B) ${b}, C) ${c}, D) ${d}`,
        difficulty: difficulty.toUpperCase(),
        categoryId: categoryRecord.id,
        tagsText: tagNames,

        // ✅ Insert MCQ options into their own columns
        a,
        b,
        c,
        d,
        correct,

        tags: {
          create: tagRecords.map(tag => ({
            tagId: tag.id,
          }))
        }
      },
    });
  }

  console.log('✅ Seed completed successfully');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
