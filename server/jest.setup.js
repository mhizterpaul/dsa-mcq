import path from 'path';
import jestOpenAPI from 'jest-openapi';

// Load OpenAPI spec for contract testing
jestOpenAPI(path.resolve(__dirname, './docs/openapi.yaml'));

// Removed global Prisma mock to allow using real DB in integration tests.
// individual tests can still mock it if needed, or rely on infra/prisma/client.ts
