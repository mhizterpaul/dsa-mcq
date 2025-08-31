export const Kysely = jest.fn(() => ({
  selectFrom: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  selectAll: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue([]),
  executeTakeFirst: jest.fn().mockResolvedValue(null),
  insertInto: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
}));

export const PostgresDialect = jest.fn();
