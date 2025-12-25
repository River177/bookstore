// server/services/user.service.ts - User Service
import prisma from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../lib/utils/password";
import type { UserInfo } from "../../lib/types";

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone?: string;
}

export interface LoginResult {
  success: boolean;
  user?: UserInfo;
  message?: string;
}

export class UserService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<LoginResult> {
    // Check if username exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === data.username) {
        return { success: false, message: "Username already exists" };
      }
      return { success: false, message: "Email already exists" };
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
      },
    });

    // Create empty cart for user
    await prisma.shoppingCart.create({
      data: { userId: user.id },
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone ?? undefined,
      },
    };
  }

  /**
   * Login user
   */
  static async login(username: string, password: string): Promise<LoginResult> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, message: "Invalid username or password" };
    }

    if (user.status !== 1) {
      return { success: false, message: "Account is disabled" };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { success: false, message: "Invalid username or password" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone ?? undefined,
        address: user.address ?? undefined,
        city: user.city ?? undefined,
        postalCode: user.postalCode ?? undefined,
      },
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<UserInfo | null> {
    const user = await prisma.user.findUnique({
      where: { id, status: 1 },
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? undefined,
      address: user.address ?? undefined,
      city: user.city ?? undefined,
      postalCode: user.postalCode ?? undefined,
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: number,
    data: Partial<Pick<UserInfo, "fullName" | "phone" | "address" | "city" | "postalCode">>
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
