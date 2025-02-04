import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RadioButton } from "react-native-paper"

// Dummy customer data
const initialCustomers = [
    { id: "1", name: "John Doe", mobile: "123-456-7890", gender: "Male" },
    { id: "2", name: "Jane Smith", mobile: "987-654-3210", gender: "Female" },
    { id: "3", name: "Sam Wilson", mobile: "555-555-5555", gender: "Other" },
];

// Customers Screen
const CustomersScreen = () => {
    const [customers, setCustomers] = useState(initialCustomers);
    const [modalVisible, setModalVisible] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerMobile, setCustomerMobile] = useState("");
    const [customerGender, setCustomerGender] = useState("Male");

    const handleAddCustomer = () => {

        // reset the form data
        setModalVisible(false); // Close modal
        setCustomerName(""); // Clear inputs
        setCustomerMobile("");
        setCustomerGender("Male");

        setModalVisible(true);
    };

    const handleSaveCustomer = () => {
        if (!customerName || !customerMobile) {
            alert("Please enter all details");
            return;
        }

        const newCustomer = {
            id: Math.random().toString(), // Unique ID
            name: customerName,
            mobile: customerMobile,
            gender: customerGender,
        };

        setCustomers([...customers, newCustomer]); // Add new customer
        setModalVisible(false); // Close modal
        setCustomerName(""); // Clear inputs
        setCustomerMobile("");
        setCustomerGender("Male");

        if (Platform.OS === "android") {
            ToastAndroid.show("Customer added successfully!", ToastAndroid.SHORT);
        } else {
            Alert.alert("Success", "Customer added successfully!");
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
                            <Text style={styles.customerName}>{item.name}</Text>
                            <Text style={styles.customerMobile}>{item.mobile}</Text>
                            <Text style={styles.customerGender}>{item.gender}</Text>
                        </View>
                        <View style={styles.buttons}>
                            <TouchableOpacity>
                                <Ionicons name="pencil" size={24} color="blue" />
                            </TouchableOpacity>
                            <TouchableOpacity>
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
                        <Text style={styles.modalTitle}>Add Customer</Text>

                        {/* Name Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Customer Name"
                            value={customerName}
                            onChangeText={setCustomerName}
                        />

                        {/* Mobile Number Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Mobile Number"
                            keyboardType="phone-pad"
                            value={customerMobile}
                            onChangeText={setCustomerMobile}
                        />

                        

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
        </View>
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
    customerName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    customerMobile: {
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
});

export default CustomersScreen;
