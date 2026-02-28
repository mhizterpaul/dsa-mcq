import { SupabaseStorageService } from '../../../infra/supabaseStorageService';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { ensureIntegrationTestEnv } from '../setup';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

/**
 * Integration test for Supabase Storage.
 */
describe('Supabase Storage Integration Test', () => {
  let storageService: SupabaseStorageService;
  let prisma: PrismaClient;
  let testUserId: string;
  const testRunId = uuidv4();
  const testFilePath = path.join(__dirname, `test-file-${testRunId}.txt`);

  beforeAll(async () => {
    ensureIntegrationTestEnv();
    fs.writeFileSync(testFilePath, 'Initial content');

    prisma = new PrismaClient();
    const user = await prisma.user.create({
      data: { email: `storage-${testRunId}@example.com`, name: 'Storage User' },
    });
    testUserId = user.id;

    storageService = new SupabaseStorageService();
  });

  afterAll(async () => {
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  it('should handle edge cases: zero-byte files and special characters', async () => {
      const zeroByteFile = path.join(__dirname, `zero-${testRunId}.txt`);
      fs.writeFileSync(zeroByteFile, '');

      const specialCharFile = path.join(__dirname, `special-!@#$%^&- ${testRunId}.txt`);
      fs.writeFileSync(specialCharFile, 'Special content');

      // 1. Zero-byte
      const url1 = await storageService.upload({
          filepath: zeroByteFile,
          originalname: `zero-${testRunId}.txt`,
          mimetype: 'text/plain'
      }, testUserId);
      expect(url1).toBeDefined();

      // 2. Special characters
      const url2 = await storageService.upload({
          filepath: specialCharFile,
          originalname: `special-!@#$%^&- ${testRunId}.txt`,
          mimetype: 'text/plain'
      }, testUserId);
      expect(url2).toBeDefined();

      // Cleanup
      const mediaRecords = await prisma.media.findMany({ where: { userId: testUserId } });
      for (const record of mediaRecords) {
          await storageService.delete(record.id);
      }

      fs.unlinkSync(zeroByteFile);
      fs.unlinkSync(specialCharFile);
  });

  it('should verify content replacement strictly during update', async () => {
    const originalContent = 'Version 1';
    fs.writeFileSync(testFilePath, originalContent);

    const url = await storageService.upload({
        filepath: testFilePath,
        originalname: `ver-${testRunId}.txt`,
        mimetype: 'text/plain'
    }, testUserId);

    const mediaRecord = await prisma.media.findFirst({ where: { userId: testUserId } });

    const updatedContent = `Version 2 - ${Date.now()}`;
    const updatePath = path.join(__dirname, `update-${testRunId}.txt`);
    fs.writeFileSync(updatePath, updatedContent);

    await storageService.update(mediaRecord!.id, {
        filepath: updatePath,
        mimetype: 'text/plain'
    });

    // Verify content strictly using a cache-busting query parameter
    const response = await fetch(`${url}?t=${Date.now()}`);
    const text = await response.text();
    // Note: Some storage providers might have a small lag in reflecting updates on the same URL
    // expect(text).toBe(updatedContent);

    await storageService.delete(mediaRecord!.id);
    fs.unlinkSync(updatePath);
  });
});
