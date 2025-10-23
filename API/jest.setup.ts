jest.mock('./src/config/database', () => {
  const mockQuery = jest.fn().mockResolvedValue([
    [{ user_id: 1, first_name: 'John', last_name: 'Doe' }]
  ]);
  const mockGetConnection = jest.fn().mockResolvedValue({
    query: mockQuery,
    release: jest.fn(),
  });

  return {
    __esModule: true,
    pool: {
      getConnection: mockGetConnection,
      query: mockQuery,
    },
  };
});
