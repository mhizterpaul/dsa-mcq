import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService } from './storageService';

export class SupabaseStorageService implements IStorageService {
  public readonly name = 'supabase';
  private supabase;
  private prisma: PrismaClient;
  private bucketName: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucketName = process.env.SUPABASE_BUCKET_NAME || 'media';

    if (!supabaseUrl || !supabaseKey) {
      if (process.env.NODE_ENV === 'test') {
        this.supabase = {
            storage: {
                from: () => ({
                    upload: async (path: string) => ({ data: { path }, error: null }),
                    getPublicUrl: (path: string) => ({ data: { publicUrl: `https://test.supabase.co/${path}` } }),
                    remove: async () => ({ error: null }),
                    update: async () => ({ error: null })
                })
            }
        } as any;
        this.prisma = new PrismaClient();
        return;
      }
      throw new Error('Supabase URL and Key are not configured.');
    }

    this.prisma = new PrismaClient();
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async upload(file: any, userId: string): Promise<string> {
    const fileName = `${uuidv4()}-${file.originalname || file.newFilename}`;
    const filePath = `${userId}/${fileName}`;

    const fileBuffer = fs.readFileSync(file.filepath || file.path);

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    await this.prisma.media.create({
      data: {
        userId,
        provider: 'supabase',
        providerId: data.path,
        url: publicUrl,
      },
    });

    return publicUrl;
  }

  async delete(fileId: string): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id: fileId } });
    if (!media) {
      throw new Error('Media not found');
    }

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([media.providerId]);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }

    await this.prisma.media.delete({ where: { id: fileId } });
  }

  async update(fileId: string, file: any): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id: fileId } });
    if (!media) {
      throw new Error('Media not found');
    }

    const fileBuffer = fs.readFileSync(file.filepath || file.path);

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .update(media.providerId, fileBuffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      throw new Error(`Supabase update error: ${error.message}`);
    }
  }
}
