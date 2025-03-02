import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is already logged in when the app starts
    useEffect(() => {
        const checkLogin = async () => {
            const token = await AsyncStorage.getItem("userToken");
            setUserToken(token);
            setIsLoading(false);
        };
        checkLogin();
    }, []);

    // Function to log in
    const signIn = async () => {
        await AsyncStorage.setItem("userToken", "logged_in");
        setUserToken("logged_in");
    };

    // Function to log out
    const signOut = async () => {
        await AsyncStorage.removeItem("userToken");
        setUserToken(null);
    };

    return (
        <AuthContext.Provider value={{ userToken, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
