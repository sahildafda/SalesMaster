import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ToastAndroid,
    Platform,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    Button
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RadioButton } from "react-native-paper"
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig.js"; // Import Firebase

// Customers Screen
const CustomersScreen = () => {
    const [customers, setCustomers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [gender, setGender] = useState("male");
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // fetch customer list
    useEffect(() => {
        // Reference to Firestore collection
        const customersRef = collection(db, "customers");

        // Real-time listener for Firestore
        const unsubscribe = onSnapshot(customersRef, (querySnapshot) => {
            const customersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setCustomers(customersList); // Update state with customer data
        });

        // Cleanup function to stop listening when component unmounts
        return () => unsubscribe();
    }, []);

    const handleAddCustomer = () => {

        setName("");
        setContact("");
        setGender("male");
        setModalVisible(true);
    };

    const handleEdit = (customer) => {

        setSelectedCustomer(customer);
        setIsUpdate(true);
        setName(customer.name);
        setContact(customer.contact);
        setGender(customer.gender);
        setModalVisible(true);
    };

    const handleUpdateCustomer = async () => {
        if (!selectedCustomer) return;

        try {
            const customerRef = doc(db, "customers", selectedCustomer.id);
            await updateDoc(customerRef, {
                name,
                contact,
                gender,
            });

            Alert.alert("Success", "Customer updated!");
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Error", "Failed to update customer");
            console.error("Update Error:", error);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this customer?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => deleteCustomer(id), style: "destructive" }
            ]
        );
    };

    const deleteCustomer = async (id) => {
        try {
            await deleteDoc(doc(db, "customers", id));

            if (Platform.OS === "android") {
                ToastAndroid.show("Customer deleted successfully!", ToastAndroid.SHORT);
            } else {
                Alert.alert("Success", "Customer deleted successfully!");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to delete customer");
            console.error("Delete Error:", error);
        }
    };

    const handleSaveCustomer = async () => {
        if (!name || !contact) {
            alert("Please enter all details");
            return;
        }

        const newCustomer = {
            name: name,
            contact: contact,
            gender: gender,
        };

        try {

            if (!isUpdate) {
                // Add a new document in collection "customers"
                const docRef = await addDoc(collection(db, "customers"), newCustomer);

                if (Platform.OS === "android") {
                    ToastAndroid.show("Customer added successfully!", ToastAndroid.SHORT);
                } else {
                    Alert.alert("Success", "Customer added successfully!");
                }
            }
            else {

                const customerRef = doc(db, "customers", selectedCustomer.id);
                await updateDoc(customerRef, {
                    name,
                    contact,
                    gender,
                });

                Alert.alert("Success", "Customer updated!");
                setModalVisible(false);
            }

            setName(""); // Reset input fields
            setContact("");
            setGender("male");
            setModalVisible(false);

        } catch (error) {
            console.error("Error adding document: ", error);
            Alert.alert("Error", "Failed to add customer");
        }

    };

    return (
        <View style={styles.container}>
            {/* Add Customer Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddCustomer}>
                <Text style={styles.addButtonText}>+ Add Customer</Text>
            </TouchableOpacity>


            {/* Customer List */}
            <FlatList
                data={customers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.customerItem}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.contact}>{item.contact}</Text>
                            <Text style={styles.customerGender}>{item.gender}</Text>
                        </View>
                        <View style={styles.buttons}>
                            <TouchableOpacity onPress={() => handleEdit(item)}>
                                <Ionicons name="pencil" size={24} color="blue" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Ionicons name="trash" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />


            {/* Modal for Adding Customer */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Customer Details</Text>

                        {/* Name Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Customer Name"
                            value={name}
                            onChangeText={setName}
                        />

                        {/* Mobile Number Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Mobile Number"
                            keyboardType="phone-pad"
                            value={contact}
                            onChangeText={setContact}
                        />

                        {/* Customer Gender Radio button */}
                        <View style={styles.radioGroup}>
                            <RadioButton.Group onValueChange={setGender} value={gender}>
                                <View style={styles.radioItem}>
                                    <RadioButton value="male" />
                                    <Text>Male</Text>
                                </View>
                                <View style={styles.radioItem}>
                                    <RadioButton value="female" />
                                    <Text>Female</Text>
                                </View>
                            </RadioButton.Group>
                        </View>

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCustomer}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#f5f5f5",
    },
    addButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    customerItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor: "white",
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
    },
    contact: {
        fontSize: 14,
        color: "gray",
    },
    customerGender: {
        fontSize: 14,
        color: "gray",
        fontStyle: "italic",
    },
    buttons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    /* Modal Styles */
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        width: "100%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 10,
    },
    picker: {
        width: "100%",
        height: 50,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: "red",
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "white",
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: "green",
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: "center",
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
    },
    radioGroup: {
        flexDirection: "row", alignItems: "center", marginVertical: 10
    },
    radioItem: {
        flexDirection: "row", alignItems: "center", marginRight: 20
    },
});

export default CustomersScreen;
