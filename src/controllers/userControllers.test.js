import { jest } from "@jest/globals";

// --- Mock dependencies with unstable_mockModule (for ESM) ---
const bcrypt = await jest.unstable_mockModule("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn()
}));

const User = await jest.unstable_mockModule("../models/userModels.js", () => ({
  default: {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

// Import controllers AFTER mocks
const { getProfile, updateProfile, updatePassword } = await import("./userControllers.js");

describe("User Controllers", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: "123" }, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  // --- GET /api/users/me ---
  describe("getProfile", () => {
    test("should return 404 if user not found", async () => {
      User.default.findById.mockResolvedValue(null);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should return user profile if found", async () => {
      const mockUser = { _id: "123", fullName: "John Doe", email: "john@example.com" };
      User.default.findById.mockResolvedValue(mockUser);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  // --- PUT /api/users/me ---
  describe("updateProfile", () => {
    test("should update user profile successfully", async () => {
      const mockUser = {
        _id: "123",
        fullName: "Old Name",
        email: "old@example.com",
        save: jest.fn().mockResolvedValue(true)
      };
      User.default.findById.mockResolvedValue(mockUser);

      req.body = { fullName: "New Name", email: "new@example.com" };

      await updateProfile(req, res);

      expect(mockUser.fullName).toBe("New Name");
      expect(mockUser.email).toBe("new@example.com");
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: mockUser._id,
        fullName: "New Name",
        email: "new@example.com"
      });
    });

    test("should return 404 if user not found", async () => {
      User.default.findById.mockResolvedValue(null);

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  // --- PUT /api/users/me/password ---
  describe("updatePassword", () => {
    test("should update password if currentPassword is correct", async () => {
      const mockUser = {
        _id: "123",
        password: "hashedPass",
        save: jest.fn().mockResolvedValue(true)
      };
      User.default.findById.mockResolvedValue(mockUser);

      req.body = { currentPassword: "oldPass", newPassword: "NewPass123!" };

      bcrypt.compare.mockResolvedValue(true);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("newHashedPass");

      await updatePassword(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith("oldPass", "hashedPass");
      expect(bcrypt.hash).toHaveBeenCalledWith("NewPass123!", "salt");
      expect(mockUser.password).toBe("newHashedPass");
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test("should return 400 if currentPassword is incorrect", async () => {
      const mockUser = {
        _id: "123",
        password: "hashedPass",
        save: jest.fn()
      };
      User.default.findById.mockResolvedValue(mockUser);

      req.body = { currentPassword: "wrongPass", newPassword: "NewPass123!" };

      bcrypt.compare.mockResolvedValue(false);

      await updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Current password is incorrect" });
    });

    test("should return 404 if user not found", async () => {
      User.default.findById.mockResolvedValue(null);

      await updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });
});
