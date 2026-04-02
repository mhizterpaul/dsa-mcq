import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, '../src/infra/prisma/schema.prisma');
const testSchemaPath = path.join(__dirname, '../src/infra/prisma/schema.test.prisma');

let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace MongoDB specific parts with SQLite compatible ones
schema = schema.replace(/provider = "mongodb"/g, 'provider = "sqlite"');
schema = schema.replace(/url      = env\("DATABASE_URL"\)/g, 'url      = "file:./test.db"');

// Strip MongoDB attributes
schema = schema.replace(/ @map\("_id"\)/g, '');
schema = schema.replace(/@map\("_id"\)/g, '');
schema = schema.replace(/ @db\.ObjectId/g, '');
schema = schema.replace(/@db\.ObjectId/g, '');
schema = schema.replace(/@default\(auto\(\)\)/g, '@default(cuid())');

fs.writeFileSync(testSchemaPath, schema);
console.log('Test schema generated at', testSchemaPath);
