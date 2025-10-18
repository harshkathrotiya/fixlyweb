const { validateProviderRegistration } = require('../../middleware/validateProvider');

describe('validateProviderRegistration Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 400 if any required field is missing', () => {
    req.body = {
      email: 'test@example.com',
      password: 'password123'
      // missing firstName, lastName, serviceDescription, serviceCategory
    };

    validateProviderRegistration(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Please provide all required information'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if availability is invalid', () => {
    req.body = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      serviceDescription: 'Cleaning services',
      serviceCategory: ['Cleaning'],
      availability: 'InvalidValue'
    };

    validateProviderRegistration(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Invalid availability value'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if all required fields are valid and availability is valid', () => {
    req.body = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      serviceDescription: 'Cleaning services',
      serviceCategory: ['Cleaning'],
      availability: 'Weekdays'
    };

    validateProviderRegistration(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next if availability is not provided', () => {
    req.body = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      serviceDescription: 'Cleaning services',
      serviceCategory: ['Cleaning']
      // no availability
    };

    validateProviderRegistration(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});