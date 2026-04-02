export class DropboxStorageService {
    async upload(file: any, userId: string): Promise<string> {
        return 'dropbox://path';
    }
    async delete(fileId: string): Promise<void> {}
    async update(fileId: string, file: any): Promise<void> {}
}
