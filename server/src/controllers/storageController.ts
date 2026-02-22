import { SupabaseClient, createClient } from '@supabase/supabase-js';

export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  async upload(file: any, path: string) {
    const { data, error } = await this.supabase.storage
      .from('storage')
      .upload(path, file);

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('storage')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }
}