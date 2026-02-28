import { SupabaseStorageService } from '../../../infra/supabaseStorageService';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

/**
 * Integration test for Supabase Storage.
 * Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_BUCKET_NAME.
 */
describe('Supabase Storage Integration Test', () => {
  let storageService: SupabaseStorageService;
  let prisma: PrismaClient;
  let testUserId: string;
  const testFilePath = path.join(__dirname, 'test-image.txt');

  beforeAll(async () => {
    // Create a dummy file for testing
    fs.writeFileSync(testFilePath, 'Hello Supabase Storage!');

    prisma = new PrismaClient();
    const user = await prisma.user.create({
      data: {
        email: `storage-test-${Date.now()}@example.com`,
        name: 'Storage Test User',
      },
    });
    testUserId = user.id;

    storageService = new SupabaseStorageService();
  });

  afterAll(async () => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  it('should upload, update, and delete a file', async () => {
    const mockFile = {
      filepath: testFilePath,
      originalname: 'test-image.txt',
      mimetype: 'text/plain',
    };

    // 1. Upload
    const publicUrl = await storageService.upload(mockFile, testUserId);
    expect(publicUrl).toContain('supabase.co');

    const mediaRecord = await prisma.media.findFirst({
      where: { userId: testUserId, provider: 'supabase' },
    });
    expect(mediaRecord).toBeDefined();
    const mediaId = mediaRecord!.id;

    // 2. Update
    await storageService.update(mediaId, mockFile);

    // 3. Delete
    await storageService.delete(mediaId);
    const deletedMedia = await prisma.media.findUnique({ where: { id: mediaId } });
    expect(deletedMedia).toBeNull();
  });
});
