import { jest } from '@jest/globals';
import { signup, login } from "./authControllers.js";
import authUser from '../models/userModels.js';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../models/userModels.js');
jest.mock('jsonwebtoken');

describe('Auth Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set up JWT mock
    process.env.JWT_SECRET = 'test-secret';
    jwt.sign.mockReturnValue('mocked-jwt-token');
  });

  describe('signup', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      fullName: 'Attah Ifeanyichukwu Sixtus',
      email: 'ify@example.com',
      password: 'hashedPassword'
    };

    beforeEach(() => {
      req.body = {
        fullName: 'Attah Ifeanyichukwu Sixtus',
        email: 'ify@example.com',
        password: 'password123'
      };
    });
;

    test('should create new user successfully', async () => {
      authUser.findOne.mockResolvedValue(null); 
      authUser.create.mockResolvedValue(mockUser);

      await signup(req, res);

     
      expect(authUser.findOne).toHaveBeenCalledWith({ email: 'ify@example.com' });
      
      expect(authUser.create).toHaveBeenCalledWith({
        fullName: 'Attah Ifeanyichukwu Sixtus',
        email: 'ify@example.com',
        password: 'password123'
      });

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        token: 'mocked-jwt-token',
        user: {
          id: mockUser._id,
          fullName: mockUser.fullName,
          email: mockUser.email
        }
      });
    });

    test('should return error if email already exists', async () => {
     
      authUser.findOne.mockResolvedValue(mockUser);

      await signup(req, res);

     
      expect(authUser.findOne).toHaveBeenCalledWith({ email: 'ify@example.com' });
      
      expect(authUser.create).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email already exists'
      });
    });

    test('should handle server errors during signup', async () => {
    
      authUser.findOne.mockRejectedValue(new Error('Database connection failed'));
    
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await signup(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('Signup error:', expect.any(Error));

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error'
      });

      consoleSpy.mockRestore();
    });

    test('should handle missing required fields', async () => {
      req.body = { email: 'ify@example.com' }; 

      authUser.findOne.mockResolvedValue(null);
      authUser.create.mockRejectedValue(new Error('Validation failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error'
      });

      consoleSpy.mockRestore();
    });
  });
   describe('login', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      fullName: 'Attah Ifeanyichukwu Sixtus',
      email: 'ify@example.com',
      comparePassword: jest.fn()
    };

    beforeEach(() => {
      req.body = {
        email: 'ify@example.com',
        password: 'password123'
      };
    });

    test('should login user successfully', async () => {
     
      authUser.findOne.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);

      await login(req, res);

      expect(authUser.findOne).toHaveBeenCalledWith({ email: 'ify@example.com' });
      
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "login successful",
        token: 'mocked-jwt-token',
        user: {
          id: mockUser._id,
          fullName: mockUser.fullName,
          email: mockUser.email
        }
      });
    });

    test('should return error if user not found', async () => {
 
      authUser.findOne.mockResolvedValue(null);

      await login(req, res);

   
      expect(authUser.findOne).toHaveBeenCalledWith({ email: 'ify@example.com' });
      
  
      expect(mockUser.comparePassword).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid email or password'
      });
    });

    test('should return error if password is incorrect', async () => {
  
      authUser.findOne.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      await login(req, res);

      expect(authUser.findOne).toHaveBeenCalledWith({ email: 'ify@example.com' });
    
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid email or password'
      });
    });

    test('should handle server errors during login', async () => {
      authUser.findOne.mockRejectedValue(new Error('Database connection failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await login(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error'
      });

      consoleSpy.mockRestore();
    });

    test('should handle comparePassword error', async () => {
      authUser.findOne.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockRejectedValue(new Error('Password comparison failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate token with correct parameters', async () => {
      const userId = '507f1f77bcf86cd799439011';
      
      req.body = {
        fullName: 'Attah Ifeanyichukwu Sixtus',
        email: 'ify@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: userId,
        fullName: 'Attah Ifeanyichukwu Sixtus',
        email: 'ify@example.com'
      };

      authUser.findOne.mockResolvedValue(null);
      authUser.create.mockResolvedValue(mockUser);

      await signup(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    });
  });
})
