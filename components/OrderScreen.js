import React, { useState, useEffect } from "react";
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    ToastAndroid, Platform, PermissionsAndroid, Alert, Modal, TextInput, Linking
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { RadioButton, Button, Dialog, Portal, Provider } from 'react-native-paper';
import { DatePickerModal } from "react-native-paper-dates";
import * as OpenAnything from "react-native-openanything";
import SendIntentAndroid from "react-native-send-intent";
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const CustomersScreen = () => {
    const [orders, setOrders] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [paymentType, setPaymentType] = useState("Cash");
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [orderDate, setOrderDate] = useState(new Date());
    const [visible, setVisible] = useState(false);
    const [totalOrderPrice, setTotalOrderPrice] = useState(0);

    // fetch all the order list from the server
    useEffect(() => {
        const orderRef = collection(db, "orders");
        const unsubscribe = onSnapshot(orderRef, (querySnapshot) => {
            const orderList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setOrders(orderList);
        });
        return () => unsubscribe();

    }, []);

    // fetch all the product list from the server
    const getProducts = async () => {
        try {

            const productsRef = collection(db, "products");
            const querySnapshot = await getDocs(productsRef);

            const productsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                quantity: 0,
                ...doc.data()
            }));

            setProducts(productsList);

        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // for order date selectiong
    const onConfirm = (params) => {
        setVisible(false);
        if (params.date) {
            setOrderDate(params.date);
        }
    };

    const handleAddOrder = async () => {
        await getProducts();
        setName("");
        setMobileNumber("");
        setPaymentType("Cash");
        setIsUpdate(false);
        setModalVisible(true);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setName(order.CustomerName);
        setMobileNumber(order.MobileNumber);
        setProducts(order.ProductList);
        setTotalOrderPrice(order.TotalOrderPrice);
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
        if (!name || !mobileNumber || products.length === 0 || !paymentType || totalOrderPrice == 0) {
            alert("Please enter all details");
            return;
        }

        const newOrder = {
            CustomerName: name,
            MobileNumber: mobileNumber,
            ProductList: products,
            PaymentType: paymentType,
            TotalOrderPrice: totalOrderPrice,
            Date: new Date().toISOString()
        };

        try {
            if (isUpdate) {
                await updateDoc(doc(db, "orders", selectedOrder.id), newOrder);
                Platform.OS === "android" ? ToastAndroid.show("Order updated!", ToastAndroid.SHORT) : Alert.alert("Success", "Order updated!");

            } else {
                await addDoc(collection(db, "orders"), newOrder);
                Platform.OS === "android" ? ToastAndroid.show("Order added!", ToastAndroid.SHORT) : Alert.alert("Success", "Order added!");
            }
            setModalVisible(false);
        } catch (error) {
            console.error("Error saving order: ", error);
            Alert.alert("Error", "Failed to save order");
        }
    };

    const generateInvoice = async (order) => {
        try {
            // Request storage permission for Android
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Toast.show('Storage permission denied');
                    return;
                }
            }

            // HTML template for the invoice
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { text-align: center; color: #0073e6; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #0073e6; color: white; }
                        .total { font-weight: bold; background-color: #0073e6; color: white; padding: 10px; text-align: right; }
                    </style>
                </head>
                <body>
                    <h2>Invoice</h2>
                    <p><strong>Bill From:</strong> Express Mobile (SUFIYAN)</p>
                    <p><strong>Contact No:</strong> 8000098707</p>
                    <p><strong>Date:</strong> ${new Date(order.Date).toDateString()}</p>
                    
                    <table>
                        <tr>
                            <th>#</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Price/Unit</th>
                            <th>Amount</th>
                        </tr>
                        ${order.ProductList.map((product, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${product.name} (${product.description || ''})</td>
                                <td>${product.quantity}</td>
                                <td>₹ ${product.price}</td>
                                <td>₹ ${product.quantity * product.price}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <p class="total">Total: ₹ ${order.TotalOrderPrice}</p>
    
                    <h4>Bill Amount In Words</h4>
                    <p>${convertNumberToWords(order.TotalOrderPrice)} only</p>
    
                    <h4>Terms and Conditions</h4>
                    <p>Thanks for doing business with us!</p>
                </body>
                </html>
            `;

            // Generate the PDF
            const options = {
                html: htmlContent,
                fileName: `Invoice_${order.id}`,
                directory: 'Documents',
            };

            if (!RNHTMLtoPDF) {
                console.error('react-native-html-to-pdf is not properly installed');
                return;
            }

            console.log("Coming here", options);
            const file = await RNHTMLtoPDF.convert(options);

            Toast.show(`Invoice saved at: ${file.filePath}`);

        } catch (error) {
            console.error('Error generating invoice:', error);
            Toast.show('Failed to generate invoice');
        }
    };

    // Function to Convert Numbers to Words (Simplified)
    const convertNumberToWords = (num) => {
        const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

        if (num < 20) return words[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + words[num % 10] : "");
        return num;
    };

    return (
        <Provider>
            <View style={styles.container}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
                    <Text style={styles.addButtonText}>+ Add Order</Text>
                </TouchableOpacity>

                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {

                        return (
                            <View style={styles.orderItem}>
                                <View>
                                    <Text style={styles.name}>{item.CustomerName}</Text>
                                    <Text style={styles.contact}>{item.PaymentType}</Text>
                                    <Text style={styles.date}>{new Date(item.Date).toDateString()}</Text>
                                </View>
                                <View style={styles.buttons}>

                                    {/* Edit Icon */}
                                    <TouchableOpacity onPress={() => handleEditOrder(item)}>
                                        <Ionicons name="pencil" size={24} color="blue" />
                                    </TouchableOpacity>

                                    {/* Delete Icon */}
                                    <TouchableOpacity onPress={() => handleDeleteOrder(item.id)}>
                                        <Ionicons name="trash" size={24} color="red" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                />

                <Modal visible={modalVisible} transparent animationType="slide">

                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Order Details</Text>
                            <TextInput style={styles.input} placeholder="Customer Name" value={name} onChangeText={setName} />
                            <TextInput
                                style={styles.input}
                                placeholder="Customer Mobile Number"
                                keyboardType="numeric"
                                maxLength={10}
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
                            />


                            {products.map((product, index) => (

                                <View key={index} style={styles.productRow}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={{ marginRight: 10 }}>Rs. {product.price}</Text>
                                    <TextInput
                                        style={styles.quantityInput}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        value={product.quantity.toString()}
                                        onChangeText={(value) => {
                                            const updatedProducts = [...products];
                                            updatedProducts[index].quantity = value ? parseInt(value) : 0;
                                            setProducts(updatedProducts);
                                            setTotalOrderPrice(products.reduce((total, product) => {
                                                return total + product.price * product.quantity;
                                            }, 0));
                                        }}
                                    />
                                </View>
                            ))}

                            {/* Payment Type Selection */}
                            <Text style={styles.paymentTitle}>Payment Type</Text>
                            <RadioButton.Group onValueChange={setPaymentType} value={paymentType}>
                                <View style={styles.radioRow}>
                                    <RadioButton value="Cash" />
                                    <Text>Cash</Text>
                                    <RadioButton value="Credit" />
                                    <Text>Credit</Text>
                                </View>
                            </RadioButton.Group>

                            <View style={{ padding: 20 }}>
                                <Text variant="titleLarge" style={{ fontSize: 15 }}>Order Date: {orderDate.toDateString()}</Text>

                                <Button mode="contained" onPress={() => setVisible(true)}>
                                    Select Date
                                </Button>

                                <Portal>
                                    <DatePickerModal
                                        locale="en"
                                        mode="single"
                                        visible={visible}
                                        onDismiss={() => setVisible(false)}
                                        date={orderDate}
                                        onConfirm={onConfirm}
                                    />
                                </Portal>
                            </View>

                            <Text style={{ marginBottom: 10, fontSize: 16, fontWeight: "bold" }}>Total Order Price: Rs. {totalOrderPrice}</Text>

                            {/* save and cancel buttons */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                                <Button
                                    mode="contained"
                                    buttonColor="#007BFF"
                                    onPress={handleSaveOrder}
                                    style={{ flex: 1 }} // Takes equal space
                                >
                                    Save
                                </Button>

                                <Button
                                    mode="outlined"
                                    textColor="red"
                                    onPress={() => setModalVisible(false)}
                                    style={{ flex: 1, borderColor: "red", borderWidth: 1 }}
                                >
                                    Cancel
                                </Button>
                            </View>

                        </View>
                    </View>
                </Modal>
            </View >
        </Provider >
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
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    quantityInput: {
        width: 60,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
        borderRadius: 5,
        textAlign: 'center',
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-evenly',
        width: '100%',
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
});

export default CustomersScreen;
