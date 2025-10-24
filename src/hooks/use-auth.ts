import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import type { User } from '@shared/types';
interface AuthState {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  fetchUsers: () => Promise<void>;
  login: (credentials: { email: string; password?: string }) => Promise<boolean>;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      isAuthenticated: false,
      loading: false,
      fetchUsers: async () => {
        set({ loading: true });
        try {
          const res = await fetch('/api/users');
          const result = await res.json();
          if (result.success) {
            set({ users: result.data });
          } else {
            toast.error(`Failed to fetch users: ${result.error}`);
          }
        } catch (e) {
          toast.error('An error occurred while fetching users.');
        } finally {
          set({ loading: false });
        }
      },
      login: async (credentials) => {
        let users = get().users;
        if (users.length === 0) {
          await get().fetchUsers();
          users = get().users;
        }
        const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
        if (user && user.password === credentials.password) {
          // IMPORTANT: Do not store password in the frontend state
          const { password, ...userToStore } = user;
          set({ currentUser: userToStore, isAuthenticated: true });
          toast.success(`Welcome, ${user.name}!`);
          return true;
        } else {
          toast.error('Login failed: Invalid email or password.');
          return false;
        }
      },
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
        toast.info('You have been logged out.');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentUser: state.currentUser, isAuthenticated: state.isAuthenticated }),
    }
  )
);