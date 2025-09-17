import { useState, useEffect } from 'react';
import GLOBALS from '../Globals';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [userSession, setUserSession] = useState(null);

    const checkSession = () => {
        fetch(`${GLOBALS.url}/checkSession`, {
            method: "GET",
            mode: "cors",
            cache: "default",
            credentials: "include"
        })
        .then((res) => res.json())
        .then((response) => {
            setIsAuthenticated(response.authenticated);
            if (response.authenticated && response.session) {
                setUserSession(response.session); 
            } else {
                setUserSession(null);
            }
        })
        .catch((error) => {
            console.error("Error en checkSession:", error);
            setIsAuthenticated(false);
            setUserSession(null);
        })
        .finally(() => {
            setIsAuthLoading(false);
        });
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = (info) => {
        setIsAuthLoading(true);
        return fetch(`${GLOBALS.url}/login`, {
            method: "POST",
            body: JSON.stringify(info),
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            credentials: "include"
        })
        .then((res) => res.json())
        .then((response) => {
            if (response.sts) {
                setIsAuthenticated(true);
                if (response.session) {
                    setUserSession(response.session);
                }
            }
            return response;
        })
        .catch((error) => {
            console.error("Error en login:", error);
            setUserSession(null);
            return { sts: false, msg: "Error en la red." };
        })
        .finally(() => {
            setIsAuthLoading(false);
        });
    };

    const logout = async () => {
        try {
            const res = await fetch(`${GLOBALS.url}/logout`, {
                method: "POST",
                mode: "cors",
                cache: "default",
                credentials: "include",
            });
            const response = await res.json();
            if (response.sts) {
                setIsAuthenticated(false);
                setUserSession(null);
                return { sts: true };
            } else {
                return { sts: false, msg: response.msg };
            }
        } catch (error) {
            console.error("Error en logout:", error);
            return { sts: false, msg: "Error de red al cerrar sesión." };
        }
    };

    return { isAuthenticated, isAuthLoading, login, logout, userSession };
};