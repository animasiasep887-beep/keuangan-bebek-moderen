import type { User } from '../types';

const USERS_STORAGE_KEY = 'quack_app_users_v1';
const CURRENT_USER_KEY = 'quack_current_user_v1';

const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr-default-01',
    name: 'H. Pratama (Owner)',
    email: 'admin@bebekjaya.com',
    farmName: 'Peternakan Bebek Jaya Utama',
    role: 'OWNER',
    plan: 'PREMIUM',
    createdAt: new Date().toISOString(),
    passwordHash: 'admin123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr-demo-02',
    name: 'Budi Santoso',
    email: 'budi@peternak.id',
    farmName: 'Bebek Barokah Farm',
    role: 'PETERNAN_PRO',
    plan: 'PREMIUM',
    createdAt: new Date().toISOString(),
    passwordHash: 'budi123',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
];

export const AuthService = {
  // Get all registered users from storage
  getUsers: (): (User & { passwordHash: string })[] => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_USERS;
    }
  },

  // Save users list
  saveUsers: (users: (User & { passwordHash: string })[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  },

  // Get active logged in user
  getCurrentUser: (): User => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    
    // Auto-login default user if none is set
    const users = AuthService.getUsers();
    const defaultUser = users[0];
    const userWithoutPass: User = {
      id: defaultUser.id,
      name: defaultUser.name,
      email: defaultUser.email,
      farmName: defaultUser.farmName,
      role: defaultUser.role,
      plan: defaultUser.plan,
      createdAt: defaultUser.createdAt,
      avatarUrl: defaultUser.avatarUrl,
    };
    AuthService.setCurrentUser(userWithoutPass);
    return userWithoutPass;
  },

  // Set current logged in user
  setCurrentUser: (user: User | null) => {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to set current user:', e);
    }
  },

  // Login with email and password
  login: async (email: string, passwordHash: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    const users = AuthService.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!found) {
      return { success: false, message: 'Email tidak terdaftar.' };
    }

    if (found.passwordHash && found.passwordHash !== passwordHash) {
      return { success: false, message: 'Kata sandi tidak cocok.' };
    }

    const safeUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      farmName: found.farmName,
      role: found.role,
      plan: found.plan,
      createdAt: found.createdAt,
      avatarUrl: found.avatarUrl,
    };

    AuthService.setCurrentUser(safeUser);

    // Try backend sync if online
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordHash }),
      });
    } catch {}

    return { success: true, user: safeUser };
  },

  // Register new account
  register: async (params: {
    name: string;
    email: string;
    passwordHash: string;
    farmName: string;
    plan?: 'PREMIUM' | 'ENTERPRISE' | 'STARTER';
  }): Promise<{ success: boolean; user?: User; message?: string }> => {
    const { name, email, passwordHash, farmName, plan = 'PREMIUM' } = params;

    if (!name.trim() || !email.trim() || !passwordHash.trim() || !farmName.trim()) {
      return { success: false, message: 'Harap isi semua kolom formulir pendaftaran.' };
    }

    const users = AuthService.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return { success: false, message: 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.' };
    }

    const newUserFull = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      farmName: farmName.trim(),
      role: 'OWNER' as const,
      plan: plan,
      createdAt: new Date().toISOString(),
      passwordHash: passwordHash,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
    };

    users.push(newUserFull);
    AuthService.saveUsers(users);

    const safeUser: User = {
      id: newUserFull.id,
      name: newUserFull.name,
      email: newUserFull.email,
      farmName: newUserFull.farmName,
      role: newUserFull.role,
      plan: newUserFull.plan,
      createdAt: newUserFull.createdAt,
      avatarUrl: newUserFull.avatarUrl,
    };

    AuthService.setCurrentUser(safeUser);

    // Sync register with backend server
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserFull),
      });
    } catch {}

    return { success: true, user: safeUser };
  },

  // Logout current user
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Switch to demo mode / guest mode
  switchToGuest: () => {
    const guestUser: User = {
      id: 'usr-guest-mode',
      name: 'Pengguna Tamu (Demo)',
      email: 'guest@demo.local',
      farmName: 'Peternakan Uji Coba (Demo)',
      role: 'PETERNAN_PRO',
      plan: 'STARTER',
      createdAt: new Date().toISOString(),
    };
    AuthService.setCurrentUser(guestUser);
    return guestUser;
  },
};
