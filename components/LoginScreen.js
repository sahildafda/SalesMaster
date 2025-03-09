import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider, AuthContext } from "../context/AuthContext";

// firebase 
import { db } from "../firebaseConfig.js"; // Import Firebase
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";

const LoginScreen = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { signIn } = useContext(AuthContext);


    const handleLogin = async () => {

        try {
            if (username.trim() === "" || password.trim() === "") {
                Alert.alert("Error", "Please Enter Valid Data!");
                return;
            }

            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("username", "==", username), where("password", "==", password));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    // User exists, proceed to login
                    await AsyncStorage.setItem("userToken", "logged_in");
                    signIn();
                } else {
                    Alert.alert("Login Failed", "Invalid username or password");
                }
            } catch (error) {
                console.error("Error during login:", error);
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        } catch (error) {

            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button title="Login" style={{ backgroundColor: "#007BFF", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 }} onPress={handleLogin} />
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },

});
