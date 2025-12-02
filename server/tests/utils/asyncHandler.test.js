const asyncHandler = require('../../utils/asyncHandler');

describe('asyncHandler', () => {
  it('should call the wrapped async function with req, res, next', async () => {
    const mockFn = jest.fn(async (req, res, next) => {
      return 'success';
    });

    const req = {};
    const res = {};
    const next = jest.fn();

    const wrapped = asyncHandler(mockFn);

    await wrapped(req, res, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch errors and call next with error', async () => {
    const error = new Error('Test error');
    const mockFn = jest.fn(async () => {
      throw error;
    });

    const req = {};
    const res = {};
    const next = jest.fn();

    const wrapped = asyncHandler(mockFn);

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
