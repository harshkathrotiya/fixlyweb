const mongoose = require('mongoose');
const connectDB = require('../../config/db');

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('Database Connection', () => {
  it('should connect to MongoDB successfully', async () => {
    mongoose.connect.mockResolvedValueOnce({ connection: { host: 'localhost' } });
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI, expect.any(Object));
  });

  it('should exit process on connection failure', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    mongoose.connect.mockRejectedValueOnce(new Error('Connection failed'));
    await connectDB();
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
