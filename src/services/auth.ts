import { UserRole, UserSession } from '../types';

export interface AuthCredential {
  userId: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  roleDescription: string;
  passwordHash: string;
  createdAt?: string;
  createdBy?: string;
}

export const INITIAL_SYSTEM_USERS: AuthCredential[] = [
  {
    userId: 'Imran',
    name: 'Imran (Founder)',
    role: 'founder',
    roleTitle: 'Founder & Managing Partner',
    roleDescription: 'Full access to all dashboards, user creation, investor management, withdrawals, SIM approvals & global ledger.',
    passwordHash: '2610'
  },
  {
    userId: 'admin',
    name: 'Admin (Operations)',
    role: 'admin',
    roleTitle: 'Operations & Procurement Admin',
    roleDescription: 'Add newly purchased SIM numbers, check inventory statuses, manage SIM specifications and expenses.',
    passwordHash: 'admin890'
  },
  {
    userId: 'Sales1',
    name: 'Sales 1 (Executive)',
    role: 'sales1',
    roleTitle: 'Senior Sales Executive',
    roleDescription: 'Register customer sales against available VIP numbers and punch in logistical/activation expenses.',
    passwordHash: 'sell999'
  },
  {
    userId: 'sales2',
    name: 'Sales 2 (Executive)',
    role: 'sales2',
    roleTitle: 'VIP Accounts Sales Executive',
    roleDescription: 'Register customer sales against available VIP numbers and punch in logistical/activation expenses.',
    passwordHash: 'seel111'
  }
];

const AUTH_STORAGE_KEY = 'gvn_user_session_v1';
const USERS_STORAGE_KEY = 'gvn_system_users_v1';

export const authService = {
  getUsers(): AuthCredential[] {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_SYSTEM_USERS));
      return INITIAL_SYSTEM_USERS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return INITIAL_SYSTEM_USERS;
    } catch {
      return INITIAL_SYSTEM_USERS;
    }
  },

  saveUsers(users: AuthCredential[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  createUser(newUser: AuthCredential): { success: boolean; error?: string } {
    const users = this.getUsers();
    const cleanUserId = newUser.userId.trim();
    if (!cleanUserId) {
      return { success: false, error: 'User ID is required.' };
    }
    if (!newUser.passwordHash || newUser.passwordHash.trim().length < 3) {
      return { success: false, error: 'Password must be at least 3 characters long.' };
    }
    const exists = users.some(
      (u) => u.userId.toLowerCase() === cleanUserId.toLowerCase()
    );
    if (exists) {
      return { success: false, error: `User ID "${cleanUserId}" is already taken.` };
    }

    const userToAdd: AuthCredential = {
      ...newUser,
      userId: cleanUserId,
      createdAt: new Date().toISOString()
    };
    const updated = [...users, userToAdd];
    this.saveUsers(updated);
    return { success: true };
  },

  deleteUser(userIdToDelete: string): { success: boolean; error?: string } {
    if (userIdToDelete.toLowerCase() === 'imran') {
      return { success: false, error: 'The primary Founder account (Imran) cannot be deleted.' };
    }
    const users = this.getUsers();
    const filtered = users.filter(
      (u) => u.userId.toLowerCase() !== userIdToDelete.toLowerCase()
    );
    this.saveUsers(filtered);
    return { success: true };
  },

  getCurrentSession(): UserSession | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  authenticate(userIdInput: string, passwordInput: string): { success: boolean; session?: UserSession; error?: string } {
    const trimmedUser = userIdInput.trim();
    const trimmedPass = passwordInput.trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, error: 'Please enter both User ID and Password.' };
    }

    const users = this.getUsers();
    const matchedUser = users.find(
      (u) => u.userId.toLowerCase() === trimmedUser.toLowerCase()
    );

    if (!matchedUser) {
      return { success: false, error: 'Invalid User ID. Access restricted to authorized GVN personnel.' };
    }

    if (matchedUser.passwordHash !== trimmedPass) {
      return { success: false, error: 'Incorrect password for this user ID.' };
    }

    const session: UserSession = {
      userId: matchedUser.userId,
      name: matchedUser.name,
      role: matchedUser.role,
      token: `gvn_sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return { success: true, session };
  },

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
