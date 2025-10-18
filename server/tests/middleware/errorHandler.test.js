const errorHandler = require('../../middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let res;
  let req;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    console.log = jest.fn(); // mock console.log to prevent logs during test
  });

  it('should handle generic errors', () => {
    const err = new Error('Something went wrong');
    
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: 'Something went wrong'
    }));
  });

  it('should handle Mongoose CastError', () => {
    const err = { name: 'CastError' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: 'Resource not found'
    }));
  });

  it('should handle Mongoose duplicate key error', () => {
    const err = { code: 11000, message: 'Duplicate key error' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: 'Duplicate field value entered'
    }));
  });

  it('should handle Mongoose validation errors', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        field1: { message: 'Field1 is required' },
        field2: { message: 'Field2 is invalid' }
      }
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({  
      success: false,
      error: 'Field1 is required,Field2 is invalid'
    }));
  });
});
