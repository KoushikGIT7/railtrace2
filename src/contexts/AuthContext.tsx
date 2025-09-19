import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'approved'>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  getPendingUsers: () => Promise<User[]>;
  getAllUsers: () => Promise<User[]>;
  isAdminEmail: (email?: string | null) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hardcoded admin disabled (use Firebase/Auth only)

  // Hardcoded admin credentials - no approval required
  const ADMIN_EMAILS = useMemo(() => [
    'admin@railtrace.com',
    'admin@railtrace.gov.in',
    'admin@indianrailways.gov.in',
    'hq@railtrace.gov.in'
  ], []);

  const refreshUserData = useCallback(async () => {
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({ 
            id: currentUser.uid, 
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined
          } as User);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  }, [currentUser]);

  // Ensure admin emails are auto-approved and role is enforced
  const ensureAdminPrivileges = useCallback(async (user: FirebaseUser) => {
    try {
      if (!user?.email) return;
      const email = user.email.toLowerCase();
      if (!ADMIN_EMAILS.includes(email)) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const adminData: User = {
          id: user.uid,
          email,
          name: user.displayName || 'Administrator',
          role: 'admin',
          approved: true,
          createdAt: new Date()
        } as unknown as User;
        await setDoc(userRef, adminData, { merge: true });
        setUserData(adminData);
        return;
      }

      const data = userSnap.data() as User;
      if (data.role !== 'admin' || !data.approved) {
        await setDoc(userRef, { role: 'admin', approved: true }, { merge: true });
      }
    } catch (e) {
      console.error('Failed to ensure admin privileges:', e);
    }
  }, [ADMIN_EMAILS]);

  const register = async (
    email: string, 
    password: string, 
    userDataInput: Omit<User, 'id' | 'createdAt' | 'approved'>
  ) => {
    try {
      // If not using hardcoded admin, go via Firebase
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Check if this is an admin email - no approval required
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      
      const newUserData: User = {
        ...userDataInput,
        id: user.uid,
        email,
        createdAt: new Date(),
        approved: isAdmin, // Admin accounts auto-approved
        role: isAdmin ? 'admin' : userDataInput.role // Force admin role for admin emails
      };

      console.log('Registering user:', newUserData);
      
      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...newUserData,
        createdAt: newUserData.createdAt.toISOString() // Convert Date to string for Firestore
      });
      
      console.log('User registered successfully:', user.uid);
      setUserData(newUserData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
      lastLogin: new Date()
    });
    // If this is an admin email, enforce auto-approval and role immediately
    if (auth.currentUser?.email && ADMIN_EMAILS.includes(auth.currentUser.email.toLowerCase())) {
      await ensureAdminPrivileges(auth.currentUser);
      await refreshUserData();
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const approveUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), {
      approved: true,
      approvedAt: new Date()
    });
  };

  const rejectUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), {
      approved: false,
      rejectedAt: new Date()
    });
  };

  const getPendingUsers = async (): Promise<User[]> => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const usersRef = collection(db, 'users');
      const pendingQuery = query(usersRef, where('approved', '==', false));
      const snapshot = await getDocs(pendingQuery);
      
      console.log('Found pending users:', snapshot.docs.length);
      
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined
        } as User;
      });
      
      console.log('Pending users:', users);
      return users;
    } catch (error) {
      console.error('Error fetching pending users:', error);
      return [];
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      console.log('Found total users:', snapshot.docs.length);
      
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined
        } as User;
      });
      
      console.log('All users:', users);
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Enforce admin privileges on session change if needed
        await ensureAdminPrivileges(user);
        await refreshUserData();
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [ensureAdminPrivileges, refreshUserData]);

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    refreshUserData,
    approveUser,
    rejectUser,
    getPendingUsers,
    getAllUsers,
    isAdminEmail: (email?: string | null) => !!email && ADMIN_EMAILS.includes(email.toLowerCase())
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}