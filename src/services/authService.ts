import type { User } from '../types';

export interface SavedAccount {
  id: string;
  identifier: string; // username, phone, or email
  name: string;
  username: string;
  email: string;
  phone?: string;
  farmName: string;
  avatarUrl?: string;
  savedPassword?: string;
  lastLogin: string;
}

const USERS_STORAGE_KEY = 'quack_app_users_v1';
const CURRENT_USER_KEY = 'quack_current_session_user';
const SAVED_ACCOUNTS_KEY = 'pratama_saved_accounts_v2';

const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr-default-01',
    name: 'H. Pratama (Owner)',
    username: 'admin',
    email: 'admin@pratamagrup.com',
    phone: '085600172785',
    farmName: 'Peternakan Bebek Pratama Grup',
    role: 'OWNER',
    plan: 'PREMIUM',
    createdAt: new Date().toISOString(),
    passwordHash: 'bebeksaya123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr-demo-02',
    name: 'Budi Santoso',
    username: 'budi',
    email: 'budi@peternak.id',
    phone: '081398765432',
    farmName: 'Peternakan Bebek Pratama Cabang Budi',
    role: 'PETERNAN_PRO',
    plan: 'PREMIUM',
    createdAt: new Date().toISOString(),
    passwordHash: 'budi123',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
];

export const AuthService = {
  // Get all saved accounts on this device (Google-style smart saved accounts)
  getSavedAccounts: (): SavedAccount[] => {
    try {
      const stored = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse saved accounts:', e);
    }
    return [];
  },

  // Save account to device for 1-click quick login
  saveAccount: (identifier: string, password: string, user: User) => {
    try {
      const list = AuthService.getSavedAccounts();
      const cleanId = identifier.trim().toLowerCase();
      const newEntry: SavedAccount = {
        id: user.id,
        identifier: cleanId,
        name: user.name,
        username: user.username || user.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        email: user.email,
        phone: user.phone,
        farmName: user.farmName,
        avatarUrl: user.avatarUrl,
        savedPassword: password,
        lastLogin: new Date().toISOString(),
      };

      // Filter out duplicate
      const filtered = list.filter(
        (a) =>
          a.id !== user.id &&
          a.email.toLowerCase() !== user.email.toLowerCase() &&
          a.identifier.toLowerCase() !== cleanId &&
          (a.username || '').toLowerCase() !== (newEntry.username || '').toLowerCase()
      );

      filtered.unshift(newEntry);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered.slice(0, 5)));
    } catch (e) {
      console.error('Failed to save account on device:', e);
    }
  },

  // Remove saved account from device
  removeSavedAccount: (accountIdOrIdentifier: string) => {
    try {
      const list = AuthService.getSavedAccounts();
      const target = accountIdOrIdentifier.trim().toLowerCase();
      const filtered = list.filter(
        (a) =>
          a.id !== accountIdOrIdentifier &&
          a.identifier.toLowerCase() !== target &&
          (a.username || '').toLowerCase() !== target &&
          (a.email || '').toLowerCase() !== target
      );
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to remove saved account:', e);
    }
  },

  // Clear all saved accounts
  clearSavedAccounts: () => {
    try {
      localStorage.removeItem(SAVED_ACCOUNTS_KEY);
    } catch {}
  },

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

  // Parse Google JWT credential token
  decodeGoogleJwt: (credential: string): { name: string; email: string; picture?: string; sub?: string } | null => {
    try {
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode Google JWT:', e);
      return null;
    }
  },

  // Google 1-Click Login / Register with real token or profile
  loginWithGoogle: async (googleData: {
    name: string;
    email: string;
    avatarUrl?: string;
    farmName?: string;
    credential?: string;
  }): Promise<{ success: boolean; user: User }> => {
    let name = googleData.name;
    let email = googleData.email;
    let avatarUrl = googleData.avatarUrl;

    if (googleData.credential) {
      const decoded = AuthService.decodeGoogleJwt(googleData.credential);
      if (decoded) {
        name = decoded.name || name;
        email = decoded.email || email;
        avatarUrl = decoded.picture || avatarUrl;
      }
    }

    const users = AuthService.getUsers();
    const cleanEmail = email.toLowerCase().trim();
    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      const newUserFull: User & { passwordHash: string } = {
        id: `usr-g-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        farmName: googleData.farmName?.trim() || `Peternakan ${name.trim()}`,
        role: 'OWNER',
        plan: 'PREMIUM',
        createdAt: new Date().toISOString(),
        passwordHash: 'google-authenticated',
        avatarUrl:
          avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        isGoogleAuth: true,
        activeCommodity: 'BEBEK_PETELUR',
      };
      users.push(newUserFull);
      AuthService.saveUsers(users);
      found = newUserFull;
    } else {
      found.isGoogleAuth = true;
      if (avatarUrl && !found.avatarUrl) found.avatarUrl = avatarUrl;
      AuthService.saveUsers(users);
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
      activeCommodity: found.activeCommodity || 'BEBEK_PETELUR',
    };

    AuthService.setCurrentUser(safeUser);

    // Sync to backend VPS hard disk
    try {
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: safeUser.name,
          email: safeUser.email,
          avatarUrl: safeUser.avatarUrl,
          farmName: safeUser.farmName,
        }),
      });
    } catch {}

    return { success: true, user: safeUser };
  },

  // Reset / Recover Password Instantly
  resetPassword: async (params: {
    identifier?: string;
    email?: string;
    verification?: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const rawTarget = (params.identifier || params.email || '').trim().toLowerCase();
    const cleanDigits = rawTarget.replace(/[^0-9]/g, '');

    if (!rawTarget || !params.newPassword) {
      return { success: false, message: 'Harap masukkan Username/No. HP/Email dan Kata Sandi baru.' };
    }

    if (params.newPassword.length < 5) {
      return { success: false, message: 'Kata sandi baru minimal 5 karakter.' };
    }

    // Try backend reset first
    try {
      const resp = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: rawTarget,
          email: rawTarget,
          verification: params.verification || '',
          newPassword: params.newPassword,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        // Update local users store
        const users = AuthService.getUsers();
        const user = users.find((u) => {
          const uEmail = (u.email || '').toLowerCase().trim();
          const uUser = (u.username || '').toLowerCase().trim();
          const uPhone = (u.phone || '').replace(/[^0-9]/g, '');
          const uName = (u.name || '').toLowerCase().trim();
          return (
            uEmail === rawTarget ||
            uUser === rawTarget ||
            (cleanDigits.length >= 6 && uPhone && (uPhone === cleanDigits || uPhone.endsWith(cleanDigits) || cleanDigits.endsWith(uPhone))) ||
            uName === rawTarget
          );
        });
        if (user) {
          user.passwordHash = params.newPassword;
          AuthService.saveUsers(users);
        }
        return { success: true, message: data.message || 'Kata sandi berhasil diperbarui! Silakan masuk kembali.' };
      } else {
        return { success: false, message: data.message || 'Akun tidak ditemukan.' };
      }
    } catch {
      // Offline / Local fallback
      const users = AuthService.getUsers();
      const user = users.find((u) => {
        const uEmail = (u.email || '').toLowerCase().trim();
        const uUser = (u.username || '').toLowerCase().trim();
        const uPhone = (u.phone || '').replace(/[^0-9]/g, '');
        const uName = (u.name || '').toLowerCase().trim();
        return (
          uEmail === rawTarget ||
          uUser === rawTarget ||
          (cleanDigits.length >= 6 && uPhone && (uPhone === cleanDigits || uPhone.endsWith(cleanDigits) || cleanDigits.endsWith(uPhone))) ||
          uName === rawTarget
        );
      });

      if (!user) {
        return { success: false, message: 'Akun dengan Username, No. WhatsApp, atau Email tersebut tidak ditemukan.' };
      }

      user.passwordHash = params.newPassword;
      AuthService.saveUsers(users);
      return {
        success: true,
        message: `Kata sandi akun ${user.name || user.username || user.email} berhasil diperbarui! Silakan masuk kembali.`,
      };
    }
  },

  // Login with Username, No. WhatsApp, or Email + password
  login: async (
    identifier: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = cleanId.replace(/[^0-9]/g, '');
    const users = AuthService.getUsers();

    const found = users.find((u) => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const uUser = (u.username || '').toLowerCase().trim();
      const uPhone = (u.phone || '').replace(/[^0-9]/g, '');
      const uName = (u.name || '').toLowerCase().trim();

      if (uEmail === cleanId) return true;
      if (uUser && uUser === cleanId) return true;
      if (cleanDigits.length >= 6 && uPhone && (uPhone === cleanDigits || uPhone.endsWith(cleanDigits) || cleanDigits.endsWith(uPhone))) return true;
      if (uName === cleanId) return true;
      return false;
    });

    if (!found) {
      return {
        success: false,
        message: 'Akun tidak ditemukan. Periksa kembali Username/No. WhatsApp/Email Anda atau daftar akun baru.',
      };
    }

    if (found.passwordHash && found.passwordHash !== password && found.passwordHash !== 'google-authenticated') {
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
    }

    const safeUser: User = {
      id: found.id,
      name: found.name,
      username: found.username || found.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
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

    // Save account to device for 1-click quick login if rememberMe is true
    if (rememberMe && password) {
      AuthService.saveAccount(cleanId, password, safeUser);
    }

    // Try backend sync if available
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, email: found.email, password }),
      });
    } catch {}

    return { success: true, user: safeUser };
  },

  // Register new farmer account
  register: async (params: {
    name: string;
    username?: string;
    email: string;
    phone?: string;
    password: string;
    farmName: string;
    plan?: 'PREMIUM' | 'ENTERPRISE' | 'STARTER';
    rememberMe?: boolean;
  }): Promise<{ success: boolean; user?: User; message?: string }> => {
    const { name, email, phone, password, farmName, plan = 'PREMIUM', rememberMe = true } = params;
    const cleanUsername = (params.username || name.toLowerCase().replace(/[^a-z0-9]/g, '')).trim().toLowerCase();
    const cleanEmail = email.toLowerCase().trim();

    if (!name.trim() || !cleanEmail || !password.trim() || !farmName.trim()) {
      return { success: false, message: 'Harap lengkapi semua kolom formulir pendaftaran wajib.' };
    }

    const users = AuthService.getUsers();

    // Check existing email
    const existingEmail = users.find((u) => (u.email || '').toLowerCase().trim() === cleanEmail);
    if (existingEmail) {
      return {
        success: false,
        message: 'Email ini sudah terdaftar. Silakan masuk langsung dengan akun Anda.',
      };
    }

    // Check existing username
    if (cleanUsername) {
      const existingUser = users.find((u) => (u.username || '').toLowerCase().trim() === cleanUsername);
      if (existingUser) {
        return {
          success: false,
          message: 'Username ini sudah digunakan peternak lain. Silakan pilih username lain.',
        };
      }
    }

    const newUserFull: User & { passwordHash: string } = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: phone?.trim(),
      farmName: farmName.trim(),
      role: 'OWNER',
      plan: plan,
      createdAt: new Date().toISOString(),
      passwordHash: password,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanUsername || name)}`,
    };

    users.push(newUserFull);
    AuthService.saveUsers(users);

    const safeUser: User = {
      id: newUserFull.id,
      name: newUserFull.name,
      username: newUserFull.username,
      email: newUserFull.email,
      phone: newUserFull.phone,
      farmName: newUserFull.farmName,
      role: newUserFull.role,
      plan: newUserFull.plan,
      createdAt: newUserFull.createdAt,
      avatarUrl: newUserFull.avatarUrl,
    };

    AuthService.setCurrentUser(safeUser);

    // Auto save account to device for 1-click quick login
    if (rememberMe) {
      AuthService.saveAccount(cleanUsername || cleanEmail, password, safeUser);
    }

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
