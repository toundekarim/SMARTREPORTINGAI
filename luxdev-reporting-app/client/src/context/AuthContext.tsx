import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (role: 'admin' | 'partner', partnerId?: number, name?: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('lux_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (role: 'admin' | 'partner', partnerId?: number, name?: string) => {
        const mockUser: User = {
            id: role === 'admin' ? 1 : 2,
            email: role === 'admin' ? 'admin@luxdev.lu' : 'partner@alpha.lu',
            role: role,
            name: name || (role === 'admin' ? 'Admin LuxDev' : 'Partenaire Alpha'),
            partner_id: role === 'partner' ? (partnerId || 19) : undefined
        };
        setUser(mockUser);
        localStorage.setItem('lux_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('lux_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
