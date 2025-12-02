const serviceCategoryController = require('../../controllers/serviceCategoryController');
const ServiceCategory = require('../../models/ServiceCategory');
const { cloudinary } = require('../../config/cloudinary');

jest.mock('../../models/ServiceCategory');
jest.mock('../../config/cloudinary');

describe('Service Category Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, file: null };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.clearAllMocks());

  describe('getCategories', () => {
    it('should get all active service categories', async () => {
      const mockCategories = [
        { _id: '1', categoryName: 'Plumbing', categoryDescription: 'Plumbing services', isActive: true },
        { _id: '2', categoryName: 'Electrical', categoryDescription: 'Electrical services', isActive: true }
      ];
      ServiceCategory.find.mockResolvedValue(mockCategories);

      await serviceCategoryController.getCategories(req, res);

      expect(ServiceCategory.find).toHaveBeenCalledWith({ isActive: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: mockCategories });
    });
  });

  describe('getCategory', () => {
    it('should return 404 if category is not found', async () => {
      req.params.id = '1';
      ServiceCategory.findById.mockResolvedValue(null);

      await serviceCategoryController.getCategory(req, res);

      expect(ServiceCategory.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Category not found' });
    });

    it('should return 404 if category is inactive', async () => {
      req.params.id = '1';
      ServiceCategory.findById.mockResolvedValue({ _id: '1', categoryName: 'Plumbing', isActive: false });

      await serviceCategoryController.getCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Category not found' });
    });

    it('should return category successfully', async () => {
      req.params.id = '1';
      const mockCategory = { _id: '1', categoryName: 'Plumbing', categoryDescription: 'Plumbing services', isActive: true };
      ServiceCategory.findById.mockResolvedValue(mockCategory);

      await serviceCategoryController.getCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCategory });
    });
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      req.body = { categoryName: 'Plumbing', categoryDescription: 'Plumbing services' };
      const mockCategory = { _id: '1', ...req.body, isActive: true };
      ServiceCategory.create.mockResolvedValue(mockCategory);

      await serviceCategoryController.createCategory(req, res);

      expect(ServiceCategory.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCategory });
    });
  });

  describe('updateCategory', () => {
    it('should return 404 if category not found', async () => {
      req.params.id = '1';
      req.body = { categoryName: 'Updated Plumbing', categoryDescription: 'Updated services' };
      ServiceCategory.findById.mockResolvedValue(null);

      await serviceCategoryController.updateCategory(req, res);

      expect(ServiceCategory.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Category not found' });
    });

    it('should update category successfully', async () => {
      req.params.id = '1';
      req.body = { categoryName: 'Updated Plumbing', categoryDescription: 'Updated services', isActive: false };
      const mockCategory = { _id: '1', categoryName: 'Plumbing', categoryDescription: 'Plumbing services', isActive: true, save: jest.fn().mockResolvedValue(true) };
      ServiceCategory.findById.mockResolvedValue(mockCategory);

      await serviceCategoryController.updateCategory(req, res);

      expect(mockCategory.categoryName).toBe('Updated Plumbing');
      expect(mockCategory.categoryDescription).toBe('Updated services');
      expect(mockCategory.isActive).toBe(false);
      expect(mockCategory.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCategory });
    });

    it('should update only provided fields', async () => {
      req.params.id = '1';
      req.body = { categoryName: 'Updated Plumbing' };
      const mockCategory = { _id: '1', categoryName: 'Plumbing', categoryDescription: 'Plumbing services', isActive: true, save: jest.fn().mockResolvedValue(true) };
      ServiceCategory.findById.mockResolvedValue(mockCategory);

      await serviceCategoryController.updateCategory(req, res);

      expect(mockCategory.categoryName).toBe('Updated Plumbing');
      expect(mockCategory.categoryDescription).toBe('Plumbing services');
      expect(mockCategory.isActive).toBe(true);
      expect(mockCategory.save).toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('should return 404 if category not found', async () => {
      req.params.id = '1';
      ServiceCategory.findById.mockResolvedValue(null);

      await serviceCategoryController.deleteCategory(req, res);

      expect(ServiceCategory.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Category not found' });
    });

    it('should delete category successfully', async () => {
      req.params.id = '1';
      const mockCategory = { _id: '1', categoryName: 'Plumbing', remove: jest.fn().mockResolvedValue(true) };
      ServiceCategory.findById.mockResolvedValue(mockCategory);

      await serviceCategoryController.deleteCategory(req, res);

      expect(mockCategory.remove).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
    });
  });

  describe('uploadCategoryImage', () => {
    it('should return 404 if category not found', async () => {
      req.params.id = '1';
      ServiceCategory.findById.mockResolvedValue(null);

      await serviceCategoryController.uploadCategoryImage(req, res);

      expect(ServiceCategory.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Category not found' });
    });

    it('should return 400 if no image uploaded', async () => {
      req.params.id = '1';
      req.file = null;
      const mockCategory = { _id: '1', categoryName: 'Plumbing' };
      ServiceCategory.findById.mockResolvedValue(mockCategory);

      await serviceCategoryController.uploadCategoryImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Please upload an image' });
    });

    it('should upload image successfully', async () => {
      req.params.id = '1';
      req.file = { path: 'uploads/categories/image.jpg' };
      const mockCategory = { _id: '1', categoryName: 'Plumbing', save: jest.fn().mockResolvedValue(true) };
      ServiceCategory.findById.mockResolvedValue(mockCategory);

      await serviceCategoryController.uploadCategoryImage(req, res);

      expect(mockCategory.categoryImage).toBe('uploads/categories/image.jpg');
      expect(mockCategory.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCategory });
    });
  });
});
