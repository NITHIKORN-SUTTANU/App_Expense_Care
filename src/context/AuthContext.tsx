/**
 * Authentication context provider.
 *
 * Manages global auth state and provides auth actions
 * to all child components via React Context.
 *
 * Usage:
 *   Wrap your app root with <AuthProvider>
 *   Access with: const { user, isLoading } = useAuth();
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import * as authService from '../services/authService';
import { AuthState, User } from '../types';

// ─── Context Types ───────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
    /** Register a new user account */
    register: (email: string, password: string, displayName: string) => Promise<void>;
    /** Sign in an existing user */
    login: (email: string, password: string) => Promise<void>;
    /** Sign out the current user */
    logout: () => Promise<void>;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type AuthAction =
    | { type: 'SET_LOADING' }
    | { type: 'SET_USER'; user: User | null }
    | { type: 'SET_ERROR' };

const initialState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: true };
        case 'SET_USER':
            return {
                user: action.user,
                isLoading: false,
                isAuthenticated: action.user !== null,
            };
        case 'SET_ERROR':
            return { ...state, isLoading: false };
        default:
            return state;
    }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider Component ──────────────────────────────────────────────────────

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Listen for Firebase auth state changes
    useEffect(() => {
        let timeout: any;

        const unsubscribe = authService.onAuthStateChanged((user) => {

            // If we get an auth update (user or null), clear the safety timeout
            clearTimeout(timeout);
            dispatch({ type: 'SET_USER', user });
        });

        // Safety timeout: if auth state never resolves (e.g. network hang), stop loading after 10s
        timeout = setTimeout(() => {
            console.log('[AuthContext] Safety timeout hit - forcing stop loading');
            dispatch({ type: 'SET_ERROR' }); // Just stop loading, don't force logout if we might be valid
        }, 10000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    // ─── Auth Actions (memoized to prevent unnecessary re-renders) ───────────

    const register = useCallback(
        async (email: string, password: string, displayName: string) => {
            dispatch({ type: 'SET_LOADING' });
            try {
                await authService.register(email, password, displayName);
                // Auth state listener will update the user automatically
            } catch (error) {
                dispatch({ type: 'SET_ERROR' });
                throw error; // Re-throw so the calling screen can show the error
            }
        },
        []
    );

    const login = useCallback(async (email: string, password: string) => {
        dispatch({ type: 'SET_LOADING' });
        try {
            await authService.login(email, password);
        } catch (error) {
            dispatch({ type: 'SET_ERROR' });
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('[AuthContext] Logout error:', error);
            throw error;
        }
    }, []);

    // ─── Memoized context value ──────────────────────────────────────────────

    const value = useMemo<AuthContextValue>(
        () => ({
            ...state,
            register,
            login,
            logout,
        }),
        [state, register, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Access auth state and actions from any component.
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider. Wrap your app root with <AuthProvider>.');
    }
    return context;
}
