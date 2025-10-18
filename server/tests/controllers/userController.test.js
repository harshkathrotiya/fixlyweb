const userController = require('../../controllers/userController');
const User = require('../../models/Users');
const ServiceProvider = require('../../models/ServiceProvider');

// Mock models
jest.mock('../../models/Users');
jest.mock('../../models/ServiceProvider');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: '60d0fe4f5311236168a109ca', userType: 'admin' }
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.clearAllMocks());

  // ---------- getUsers ----------
  describe('getUsers', () => {
    it('should get all users with default pagination', async () => {
      const mockUsers = [{ _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', userType: 'customer' }];
      User.countDocuments.mockResolvedValue(1);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers)
      });

      await userController.getUsers(req, res);

      expect(User.countDocuments).toHaveBeenCalled();
      expect(User.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        total: 1,
        page: 1,
        pages: 1,
        data: mockUsers
      });
    });

    it('should filter users by role', async () => {
      req.query.role = 'customer';
      User.countDocuments.mockResolvedValue(0);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });

      await userController.getUsers(req, res);

      expect(User.countDocuments).toHaveBeenCalledWith({ userType: 'customer' });
      expect(User.find).toHaveBeenCalledWith({ userType: 'customer' });
    });

    it('should filter users by status', async () => {
      req.query.status = 'active';
      User.countDocuments.mockResolvedValue(0);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });

      await userController.getUsers(req, res);

      expect(User.countDocuments).toHaveBeenCalledWith({ isActive: true });
      expect(User.find).toHaveBeenCalledWith({ isActive: true });
    });

    it('should search users by name or email', async () => {
      req.query.search = 'john';
      User.countDocuments.mockResolvedValue(0);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });

      await userController.getUsers(req, res);

      expect(User.countDocuments).toHaveBeenCalledWith({
        $or: [
          { firstName: { $regex: 'john', $options: 'i' } },
          { lastName: { $regex: 'john', $options: 'i' } },
          { email: { $regex: 'john', $options: 'i' } }
        ]
      });
    });
  });

  // ---------- getUserById ----------
  describe('getUserById', () => {
    it('should return 404 if user not found', async () => {
      req.params.id = '1';
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should get user by id successfully', async () => {
      req.params.id = '1';
      const mockUser = { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });
  });

  // ---------- createUser ----------
  describe('createUser', () => {
    it('should create user successfully', async () => {
      req.body = { firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: '123', userType: 'customer' };
      const mockUser = { _id: '1', ...req.body, password: undefined };
      User.create.mockResolvedValue(mockUser);

      await userController.createUser(req, res);

      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });
  });

  // ---------- updateUser ----------
  describe('updateUser', () => {
    it('should return 404 if user not found', async () => {
      req.params.id = '1'; req.body = { firstName: 'New' };
      User.findByIdAndUpdate.mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should update user successfully', async () => {
      req.params.id = '1'; req.body = { firstName: 'New' };
      const mockUser = { _id: '1', firstName: 'New', email: 'john@example.com' };
      User.findByIdAndUpdate.mockResolvedValue(mockUser);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });
  });

  // ---------- deleteUser ----------
  describe('deleteUser', () => {
    it('should return 404 if user not found', async () => {
      req.params.id = '1';
      User.findById.mockResolvedValue(null);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should prevent deletion of last admin', async () => {
      req.params.id = '1';
      const mockUser = { _id: '1', userType: 'admin' };
      User.findById.mockResolvedValue(mockUser);
      User.countDocuments.mockResolvedValue(1);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot delete the last admin user' });
    });

    it('should deactivate service provider with data', async () => {
      req.params.id = '1';
      const mockUser = { _id: '1', userType: 'service_provider', isActive: true, save: jest.fn().mockResolvedValue(true) };
      User.findById.mockResolvedValue(mockUser);
      User.countDocuments.mockResolvedValue(2);
      ServiceProvider.findOne.mockResolvedValue({ userId: '1' });

      await userController.deleteUser(req, res);

      expect(mockUser.isActive).toBe(false);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User has been deactivated instead of deleted due to associated provider data',
        data: mockUser
      });
    });

    it('should delete user successfully', async () => {
      req.params.id = '1';
      const mockUser = { _id: '1', userType: 'customer' };
      User.findById.mockResolvedValue(mockUser);
      ServiceProvider.findOne.mockResolvedValue(null);
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User deleted successfully', data: {} });
    });
  });

  // ---------- toggleUserStatus ----------
  describe('toggleUserStatus', () => {
    it('should return 404 if user not found', async () => {
      req.params.id = '1';
      User.findById.mockResolvedValue(null);

      await userController.toggleUserStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should prevent deactivation of last active admin', async () => {
      req.params.id = '1';
      const mockUser = { _id: '1', userType: 'admin', isActive: true };
      User.findById.mockResolvedValue(mockUser);
      User.countDocuments.mockResolvedValue(1);

      await userController.toggleUserStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot deactivate the last active admin user' });
    });

    it('should activate an inactive user', async () => {
      req.params.id = '1';
      const mockUser = { _id: '1', userType: 'customer', isActive: false, save: jest.fn().mockResolvedValue(true) };
      User.findById.mockResolvedValue(mockUser);

      await userController.toggleUserStatus(req, res);

      expect(mockUser.isActive).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User activated successfully', data: mockUser });
    });

    it('should deactivate an active user', async () => {
      req.params.id = '1';
      const mockUser = { _id: '1', userType: 'customer', isActive: true, save: jest.fn().mockResolvedValue(true) };
      User.findById.mockResolvedValue(mockUser);

      await userController.toggleUserStatus(req, res);

      expect(mockUser.isActive).toBe(false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User deactivated successfully', data: mockUser });
    });
  });
});
