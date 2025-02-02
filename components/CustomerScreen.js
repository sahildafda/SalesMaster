import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Dummy customer data
const initialCustomers = [
    { id: "1", name: "John Doe", mobile: "123-456-7890" },
    { id: "2", name: "Jane Smith", mobile: "987-654-3210" },
    { id: "3", name: "Sam Wilson", mobile: "555-555-5555" },
];

// Customers Screen
const CustomersScreen = () => {
    const [customers, setCustomers] = useState(initialCustomers);

    const handleEdit = (id) => {
        console.log(`Edit customer with ID: ${id}`);
        // You can navigate to an edit form or show an edit modal
    };

    const handleDelete = (id) => {
        setCustomers(customers.filter((customer) => customer.id !== id));
        console.log(`Deleted customer with ID: ${id}`);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={customers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.customerItem}>
                        <View>
                            <Text style={styles.customerName}>{item.name}</Text>
                            <Text style={styles.customerMobile}>{item.mobile}</Text>
                        </View>
                        <View style={styles.buttons}>
                            <TouchableOpacity onPress={() => handleEdit(item.id)}>
                                <Ionicons name="pencil" size={24} color="blue" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Ionicons name="trash" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    customerItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
        marginBottom: 10,
    },
    customerName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    customerMobile: {
        fontSize: 14,
        color: "gray",
    },
    buttons: {
        flexDirection: "row",
        alignItems: "center",
    },
});

export default CustomersScreen;
