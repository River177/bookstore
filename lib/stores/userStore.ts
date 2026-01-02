// lib/stores/userStore.ts - User, Admin and Cart State Management
import { reactive, readonly } from "vue";

// User types
interface User {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  phone?: string;
}

interface Admin {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  roles?: Array<{ role: { roleKey: string; roleName: string } }>;
  permissions?: string[];
}

interface CartState {
  itemCount: number;
  totalAmount: number;
}

interface AppStore {
  user: User | null;
  admin: Admin | null;
  cart: CartState;
  isLoading: boolean;
}

const state = reactive<AppStore>({
  user: null,
  admin: null,
  cart: {
    itemCount: 0,
    totalAmount: 0,
  },
  isLoading: false,
});

// Initialize from localStorage (client-side only)
export function initUserStore() {
  if (typeof window === "undefined") return;

  // Load user
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      state.user = JSON.parse(storedUser);
      if (state.user) {
        fetchCartCount();
      }
    } catch {
      localStorage.removeItem("user");
    }
  }

  // Load admin
  const storedAdmin = localStorage.getItem("adminUser");
  if (storedAdmin) {
    try {
      state.admin = JSON.parse(storedAdmin);
    } catch {
      localStorage.removeItem("adminUser");
    }
  }
}

// User Login
export async function login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
  state.isLoading = true;
  try {
    const response = await fetch("/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      duplex: "half",
    } as RequestInit);

    const result = await response.json();

    if (result.success && result.data) {
      state.user = result.data;
      localStorage.setItem("user", JSON.stringify(result.data));
      await fetchCartCount();
      return { success: true };
    }

    return { success: false, message: result.message || "登录失败" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "网络错误" };
  } finally {
    state.isLoading = false;
  }
}

// Admin Login
export async function adminLogin(username: string, password: string): Promise<{ success: boolean; message?: string }> {
  state.isLoading = true;
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      duplex: "half",
    } as RequestInit);

    const result = await response.json();

    if (result.success && result.data) {
      state.admin = result.data;
      localStorage.setItem("adminUser", JSON.stringify(result.data));
      return { success: true };
    }

    return { success: false, message: result.message || "登录失败" };
  } catch (error) {
    console.error("Admin login error:", error);
    return { success: false, message: "网络错误" };
  } finally {
    state.isLoading = false;
  }
}

// User Logout
export function logout() {
  state.user = null;
  state.cart = { itemCount: 0, totalAmount: 0 };
  localStorage.removeItem("user");
}

// Admin Logout
export function adminLogout() {
  state.admin = null;
  localStorage.removeItem("adminUser");
}

// Full Logout (both user and admin)
export function fullLogout() {
  logout();
  adminLogout();
}

// Fetch cart count
export async function fetchCartCount() {
  if (!state.user) {
    state.cart = { itemCount: 0, totalAmount: 0 };
    return;
  }

  try {
    const response = await fetch(`/api/cart?userId=${state.user.id}`);
    const result = await response.json();

    if (result.success && result.data) {
      state.cart = {
        itemCount: result.data.totalItems || 0,
        totalAmount: result.data.totalAmount || 0,
      };
    }
  } catch (error) {
    console.error("Failed to fetch cart:", error);
  }
}

// Add to cart
export async function addToCart(bookId: number, quantity: number = 1): Promise<{ success: boolean; message: string }> {
  if (!state.user) {
    return { success: false, message: "请先登录" };
  }

  try {
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: state.user.id,
        bookId,
        quantity,
      }),
      duplex: "half",
    } as RequestInit);

    const result = await response.json();

    if (result.success) {
      if (result.data) {
        state.cart = {
          itemCount: result.data.totalItems || 0,
          totalAmount: result.data.totalAmount || 0,
        };
      }
      return { success: true, message: "已添加到购物车！" };
    }

    return { success: false, message: result.message || "添加失败" };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, message: "网络错误" };
  }
}

// Getters
export function getUser() {
  return state.user;
}

export function getAdmin() {
  return state.admin;
}

export function getUserId(): number | null {
  return state.user?.id || null;
}

export function isLoggedIn() {
  return state.user !== null;
}

export function isAdminLoggedIn() {
  return state.admin !== null;
}

export function isAdmin() {
  return state.admin !== null;
}

export function getCartCount() {
  return state.cart.itemCount;
}

// Get display name (admin name takes priority if admin is logged in)
export function getDisplayName(): string {
  if (state.admin) {
    return state.admin.fullName || state.admin.username;
  }
  if (state.user) {
    return state.user.fullName || state.user.username;
  }
  return "";
}

// Export readonly state for components
export const userState = readonly(state);

export default {
  state: userState,
  initUserStore,
  login,
  adminLogin,
  logout,
  adminLogout,
  fullLogout,
  fetchCartCount,
  addToCart,
  getUser,
  getAdmin,
  getUserId,
  isLoggedIn,
  isAdminLoggedIn,
  isAdmin,
  getCartCount,
  getDisplayName,
};
