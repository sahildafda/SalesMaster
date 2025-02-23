import React, { useState, useEffect } from "react";
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    ToastAndroid, Platform, Alert, Modal, TextInput
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { Picker } from "@react-native-picker/picker";

const CustomersScreen = () => {
    const [customers, setCustomers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState("");
    const [products, setProducts] = useState([{ product: "", quantity: "1" }]);
    const [paymentType, setPaymentType] = useState("cash");
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const customersRef = collection(db, "orders");
        const unsubscribe = onSnapshot(customersRef, (querySnapshot) => {
            const orderList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCustomers(orderList);
        });
        return () => unsubscribe();
    }, []);

    const handleAddOrder = () => {
        setName("");
        setProducts([{ product: "", quantity: "1" }]);
        setPaymentType("cash");
        setIsUpdate(false);
        setModalVisible(true);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setName(order.CustomerName);
        setProducts(order.ProductList);
        setPaymentType(order.PaymentType);
        setIsUpdate(true);
        setModalVisible(true);
    };

    const handleDeleteOrder = async (id) => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this order?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", onPress: async () => {
                    await deleteDoc(doc(db, "orders", id));
                    Platform.OS === "android" ? ToastAndroid.show("Order deleted!", ToastAndroid.SHORT) : Alert.alert("Success", "Order deleted!");
                }, style: "destructive"
            }
        ]);
    };

    const handleSaveOrder = async () => {
        if (!name || products.length === 0 || !paymentType) {
            alert("Please enter all details");
            return;
        }

        const newOrder = {
            CustomerName: name,
            ProductList: products,
            PaymentType: paymentType,
            date: new Date().toISOString()
        };

        try {
            if (isUpdate) {
                await updateDoc(doc(db, "orders", selectedOrder.id), newOrder);
                Alert.alert("Success", "Order updated!");
            } else {
                await addDoc(collection(db, "orders"), newOrder);
                Alert.alert("Success", "Order added!");
            }
            setModalVisible(false);
        } catch (error) {
            console.error("Error saving order: ", error);
            Alert.alert("Error", "Failed to save order");
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
                <Text style={styles.addButtonText}>+ Add Order</Text>
            </TouchableOpacity>

            <FlatList
                data={customers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.orderItem}>
                        <View>
                            <Text style={styles.name}>{item.CustomerName}</Text>
                            <Text style={styles.contact}>{item.PaymentType}</Text>
                            <Text style={styles.date}>{formatDate(item.date)}</Text>
                        </View>
                        <View style={styles.buttons}>
                            <TouchableOpacity onPress={() => handleEditOrder(item)}>
                                <Ionicons name="pencil" size={24} color="blue" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteOrder(item.id)}>
                                <Ionicons name="trash" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput style={styles.input} placeholder="Customer Name" value={name} onChangeText={setName} />
                        <Picker selectedValue={paymentType} onValueChange={setPaymentType}>
                            <Picker.Item label="Cash" value="cash" />
                            <Picker.Item label="Credit" value="credit" />
                        </Picker>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveOrder}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    addButton: { backgroundColor: "#007BFF", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
    addButtonText: { color: "white", fontSize: 16 },
    orderItem: { flexDirection: "row", justifyContent: "space-between", padding: 15, backgroundColor: "white", borderRadius: 8, marginBottom: 10 },
    name: { fontSize: 18, fontWeight: "bold" },
    contact: { fontSize: 14, color: "gray" },
    date: { fontSize: 14, color: "gray", fontStyle: "italic" },
    buttons: { flexDirection: "row", gap: 10 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { width: "90%", backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" },
    input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10 },
    saveButton: { backgroundColor: "green", padding: 10, borderRadius: 5, width: "100%", alignItems: "center" },
    saveButtonText: { color: "white", fontSize: 16 },
    cancelButton: { marginTop: 10 },
    cancelButtonText: { color: "red", fontSize: 16 },
});

export default CustomersScreen;
