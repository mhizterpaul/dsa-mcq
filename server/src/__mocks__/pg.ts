export const Pool = jest.fn(() => ({
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
}));
