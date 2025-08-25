const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../prisma/models');
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const schemaHeaderPath = path.join(__dirname, '../prisma/schema.header.prisma');

async function main() {
  const modelFiles = await fs.promises.readdir(modelsDir);
  let finalSchema = await fs.promises.readFile(schemaHeaderPath, 'utf-8');

  for (const modelFile of modelFiles) {
    const modelPath = path.join(modelsDir, modelFile);
    const modelContent = await fs.promises.readFile(modelPath, 'utf-8');
    finalSchema += `\n${modelContent}`;
  }

  await fs.promises.writeFile(schemaPath, finalSchema);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
