const { validateFileType, validateFileSize } = require('../../middleware/fileValidation');

describe('File Validation Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks(); // clear previous mock calls
  });

  describe('validateFileType', () => {
    it('should call next if no file is provided', () => {
      req.file = undefined;

      validateFileType(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid file types', () => {
      req.file = { originalname: 'document.pdf' };

      validateFileType(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Invalid file type. Only .jpg, .jpeg, .png files are allowed.'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow valid file types', () => {
      req.file = { originalname: 'image.png' };

      validateFileType(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('validateFileSize', () => {
    const maxSizeInMB = 1; // 1MB
    const middleware = validateFileSize(maxSizeInMB);

    it('should call next if no file is provided', () => {
      req.file = undefined;

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject files exceeding the max size', () => {
      req.file = { size: 2 * 1024 * 1024 }; // 2MB

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: `File size exceeds ${maxSizeInMB}MB limit.`
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow files within the max size', () => {
      req.file = { size: 0.5 * 1024 * 1024 }; // 0.5MB

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
