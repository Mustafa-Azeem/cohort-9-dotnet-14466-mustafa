import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

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
