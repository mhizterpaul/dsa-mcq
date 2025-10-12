export const createClient = jest.fn(() => ({
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: 'https://test.com/public-url' },
        error: null,
      }),
      download: jest.fn().mockResolvedValue({ data: Buffer.from('ok'), error: null }),
      remove: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
}));