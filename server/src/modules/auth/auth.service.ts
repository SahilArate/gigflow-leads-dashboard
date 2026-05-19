import jwt from "jsonwebtoken";
import { User } from "./auth.model";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error.middleware";
import { IUser, IUserPayload, UserRole } from "../../types";
import { RegisterInput, LoginInput } from "./auth.schema";

export class AuthService {
  // Generate JWT token
  private generateToken(user: IUser): string {
    const payload: IUserPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  // Register new user
  async register(input: RegisterInput): Promise<{ user: IUser; token: string }> {
    const existingUser = await User.findOne({ email: input.email });

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const user = await User.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role || UserRole.SALES,
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  // Login user
  async login(input: LoginInput): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: input.email }).select("+password");

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await user.comparePassword(input.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  // Get current user profile
  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<IUser[]> {
    return User.find().select("-password").sort({ createdAt: -1 });
  }
}

export const authService = new AuthService();