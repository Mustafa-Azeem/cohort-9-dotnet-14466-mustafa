import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    // corrupted data - clear it out and start fresh instead of crashing
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());

  const login = (authData) => {
    localStorage.setItem("token", authData.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        userId: authData.userId,
        fullName: authData.fullName,
        email: authData.email,
        role: authData.role,
      })
    );
    setUser({
      userId: authData.userId,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAdmin = user?.role === "Admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);