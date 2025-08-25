import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.resolve(__dirname, '../../mcq_dataset_enriched.csv');

  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(parse({
      columns: true,
      skip_empty_lines: true
    }));

  for await (const record of parser) {
    const { question, a, b, c, d, correct, difficulty, category, tags } = record;

    // We need to create the category if it doesn't exist
    let categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category },
      });
    }

    // We need to create the tags if they don't exist
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

    const questionBody = `${question}\na) ${a}\nb) ${b}\nc) ${c}\nd) ${d}\ncorrect: ${correct}`;

    await prisma.question.upsert({
      where: { id: record.id },
      update: {},
      create: {
        id: record.id,
        title: question,
        body: questionBody,
        difficulty: difficulty.toUpperCase(),
        categoryId: categoryRecord.id,
        tagsText: tagNames,
        tags: {
          create: tagRecords.map(tag => ({
            tag: {
              connect: {
                id: tag.id
              }
            }
          }))
        }
      },
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
