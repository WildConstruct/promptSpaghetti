/**
 * User Provider
 * Simple context provider for user state
 */

import React, { createContext, useContext, useState } from 'react';

export interface AssetBrowserUser {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

interface UserContextType {
  user: AssetBrowserUser | null;
  setUser: (user: AssetBrowserUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<AssetBrowserUser | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
