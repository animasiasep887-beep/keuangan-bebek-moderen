import type { User } from '../types';

const USERS_STORAGE_KEY = 'quack_app_users_v1';
const CURRENT_USER_KEY = 'quack_current_session_user';

const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr-default-01',
    name: 'H. Pratama (Owner)',
    email: 'admin@bebekjaya.com',
    phone: '085600172785',
    farmName: 'Peternakan Bebek Jaya Utama',
    role: 'OWNER',
    plan: 'PREMIUM',
    createdAt: new Date().toISOString(),
    passwordHash: 'bebeksaya123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr-demo-02',
    name: 'Budi Santoso',
    email: 'budi@peternak.id',
    phone: '081398765432',
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
      const list: (User & { passwordHash: string })[] = JSON.parse(stored);
      const admin = list.find((u) => u.id === 'usr-default-01');
      if (admin) {
        admin.phone = DEFAULT_USERS[0].phone;
        admin.passwordHash = DEFAULT_USERS[0].passwordHash;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
      } else {
        list.unshift(DEFAULT_USERS[0]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
      }
      return list;
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

  // Get active logged in user (null if unauthenticated in current session)
  getCurrentUser: (): User | null => {
    try {
      // Clear legacy permanent session from previous app versions
      if (localStorage.getItem('quack_current_user_v1')) {
        localStorage.removeItem('quack_current_user_v1');
      }
      const stored = sessionStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  },

  // Set current logged in user (per session)
  setCurrentUser: (user: User | null) => {
    try {
      if (user) {
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(CURRENT_USER_KEY);
      }
      localStorage.removeItem('quack_current_user_v1');
    } catch (e) {
      console.error('Failed to set current user:', e);
    }
  },

  // Google 1-Click Login / Register
  loginWithGoogle: async (googleData: {
    name: string;
    email: string;
    avatarUrl?: string;
    farmName?: string;
  }): Promise<{ success: boolean; user: User }> => {
    const users = AuthService.getUsers();
    const cleanEmail = googleData.email.toLowerCase().trim();
    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      const newUserFull: User & { passwordHash: string } = {
        id: `usr-g-${Date.now()}`,
        name: googleData.name.trim(),
        email: cleanEmail,
        farmName: googleData.farmName?.trim() || `Peternakan ${googleData.name.trim()}`,
        role: 'OWNER',
        plan: 'PREMIUM',
        createdAt: new Date().toISOString(),
        passwordHash: 'google-authenticated',
        avatarUrl:
          googleData.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleData.name)}`,
        isGoogleAuth: true,
      };
      users.push(newUserFull);
      AuthService.saveUsers(users);
      found = newUserFull;
    }

    const safeUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      phone: found.phone,
      farmName: found.farmName,
      role: found.role,
      plan: found.plan,
      createdAt: found.createdAt,
      avatarUrl: found.avatarUrl,
      isGoogleAuth: true,
    };

    AuthService.setCurrentUser(safeUser);
    return { success: true, user: safeUser };
  },

  // Login with email/phone and password
  login: async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const users = AuthService.getUsers();

    const found = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, ''))
    );

    if (!found) {
      return {
        success: false,
        message: 'Akun tidak ditemukan. Silakan registrasi akun peternak baru terlebih dahulu.',
      };
    }

    if (found.passwordHash && found.passwordHash !== password && found.passwordHash !== 'google-authenticated') {
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
    }

    const safeUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      phone: found.phone,
      farmName: found.farmName,
      role: found.role,
      plan: found.plan,
      createdAt: found.createdAt,
      avatarUrl: found.avatarUrl,
      isGoogleAuth: found.isGoogleAuth,
    };

    AuthService.setCurrentUser(safeUser);

    // Try backend sync if available
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: found.email, password }),
      });
    } catch {}

    return { success: true, user: safeUser };
  },

  // Register new farmer account
  register: async (params: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    farmName: string;
    plan?: 'PREMIUM' | 'ENTERPRISE' | 'STARTER';
  }): Promise<{ success: boolean; user?: User; message?: string }> => {
    const { name, email, phone, password, farmName, plan = 'PREMIUM' } = params;

    if (!name.trim() || !email.trim() || !password.trim() || !farmName.trim()) {
      return { success: false, message: 'Harap lengkapi semua kolom formulir pendaftaran.' };
    }

    const users = AuthService.getUsers();
    const cleanEmail = email.toLowerCase().trim();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        message: 'Email ini sudah terdaftar. Silakan masuk langsung dengan akun Anda.',
      };
    }

    const newUserFull: User & { passwordHash: string } = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim(),
      farmName: farmName.trim(),
      role: 'OWNER',
      plan: plan,
      createdAt: new Date().toISOString(),
      passwordHash: password,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    };

    users.push(newUserFull);
    AuthService.saveUsers(users);

    const safeUser: User = {
      id: newUserFull.id,
      name: newUserFull.name,
      email: newUserFull.email,
      phone: newUserFull.phone,
      farmName: newUserFull.farmName,
      role: newUserFull.role,
      plan: newUserFull.plan,
      createdAt: newUserFull.createdAt,
      avatarUrl: newUserFull.avatarUrl,
    };

    AuthService.setCurrentUser(safeUser);

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
    try {
      sessionStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem('quack_current_user_v1');
    } catch {}
  },

  // Guest demo mode
  switchToGuest: (): User => {
    const guestUser: User = {
      id: 'usr-guest-mode',
      name: 'Peternak Tamu (Demo)',
      email: 'tamu@bebekjaya.com',
      farmName: 'Peternakan Uji Coba (Demo)',
      role: 'PETERNAN_PRO',
      plan: 'STARTER',
      createdAt: new Date().toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    };
    AuthService.setCurrentUser(guestUser);
    return guestUser;
  },
};
