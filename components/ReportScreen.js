import React, { useState, useEffect } from "react";
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    ToastAndroid, Platform, PermissionsAndroid, Alert, Modal, TextInput, Linking
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { RadioButton, Button, Dialog, Portal, Provider, Card } from 'react-native-paper';
import { DatePickerModal } from "react-native-paper-dates";
import * as OpenAnything from "react-native-openanything";
import SendIntentAndroid from "react-native-send-intent";
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import DatePicker from 'react-native-date-picker'


const ReportScreen = () => {

    const [orders, setOrders] = useState([]);
    const [dailyCount, setDailyCount] = useState(0);
    const [weeklyCount, setWeeklyCount] = useState(0);
    const [yearlyCount, setYearlyCount] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, []);

    // Fetch orders from Firestore
    const fetchOrders = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "orders"));
            const orderList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setOrders(orderList);
            calculateCounts(orderList);
        } catch (error) {
            console.error("Error fetching orders: ", error);
        }
    };

    // Function to filter orders by timeframe
    const filterOrdersByTimeframe = (timeframe) => {
        const now = new Date();
        let startDate;

        switch (timeframe) {
            case "weekly":
                startDate = new Date();
                startDate.setDate(now.getDate() - 7);
                break;
            case "monthly":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "yearly":
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return [];
        }

        return orders.filter(order => new Date(order.Date) >= startDate);
    };

    // Function to generate customer report
    const generateCustomerReport = () => {
        const customerOrders = {};

        orders.forEach(order => {
            if (!customerOrders[order.customerName]) {
                customerOrders[order.customerName] = [];
            }
            customerOrders[order.customerName].push(order);
        });

        const data = [["Customer Name", "Total Orders", "Total Amount"]];

        Object.keys(customerOrders).forEach(customer => {
            const totalOrders = customerOrders[customer].length;
            const totalAmount = customerOrders[customer].reduce((sum, order) => sum + order.amount, 0);
            data.push([customer, totalOrders, totalAmount]);
        });

        generateExcelFile("Customer_Report", data);
    };

    // Request storage permission (Android)
    const requestStoragePermission = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    // Generate Excel Report
    const generateExcelReport = async (type) => {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            ToastAndroid.show("Storage permission denied", ToastAndroid.SHORT);
            return;
        }

        let filteredOrders = type === "customer" ? [] : filterOrdersByTimeframe(type);

        if (type !== "customer" && filteredOrders.length === 0) {
            ToastAndroid.show("No data available for the selected timeframe", ToastAndroid.SHORT);
            return;
        }

        let data;
        if (type === "customer") {
            generateCustomerReport();
            return;
        } else {
            data = [
                ["Order ID", "Customer Name", "Amount", "Date", "Payment Type"], // Header row
                ...filteredOrders.map(order => [
                    order.id,
                    order.CustomerName,
                    order.TotalOrderPrice,
                    order.Date,
                    order.PaymentType,
                    // order.ProductList,
                ]),
            ];
        }

        console.log("Generating excel file");
        generateExcelFile(`${new Date().toTimeString()}.xlsx`, data);
    };

    // Function to create and save Excel file
    const generateExcelFile = async (filename, data) => {
        try {

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            const base64 = XLSX.write(wb, { type: "base64" });
            const fileUri = FileSystem.documentDirectory + "Report.xlsx";

            await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

            // Share the file after saving
            await Sharing.shareAsync(fileUri);

        } catch (error) {
            console.log(error)
        }
    };

    // Calculate counts for Daily, Weekly, and Yearly Orders
    const calculateCounts = (orderList) => {
        const now = new Date();
        let daily = 0, weekly = 0, yearly = 0;

        orderList.forEach(order => {
            const orderDate = new Date(order.Date);

            // Daily Orders
            if (orderDate.toDateString() === now.toDateString()) {
                daily++;
            }

            // Weekly Orders (Past 7 Days)
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            if (orderDate >= weekAgo) {
                weekly++;
            }

            // Yearly Orders (Current Year)
            if (orderDate.getFullYear() === now.getFullYear()) {
                yearly++;
            }
        });

        setDailyCount(daily);
        setWeeklyCount(weekly);
        setYearlyCount(yearly);
    };

    return (
        <View style={styles.container}>
            {/* Overview Section */}
            <View style={styles.overviewContainer}>
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Today's Orders</Text>
                    <Text style={styles.cardCount}>{dailyCount}</Text>
                </Card>
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Weekly Orders</Text>
                    <Text style={styles.cardCount}>{weeklyCount}</Text>
                </Card>
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Yearly Orders</Text>
                    <Text style={styles.cardCount}>{yearlyCount}</Text>
                </Card>
            </View>

            <Text style={styles.header}>Generate Reports</Text>
            <FlatList
                data={["weekly", "monthly", "yearly", "customer"]}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <Button
                        mode="contained"
                        onPress={() => generateExcelReport(item)}
                        style={styles.button}
                    >
                        {item.charAt(0).toUpperCase() + item.slice(1)} Report
                    </Button>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    button: { marginVertical: 5, backgroundColor: "#007BFF", borderRadius: 10 },

    // Overview Section
    overviewContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    card: {
        flex: 1,
        padding: 15,
        marginHorizontal: 5,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        alignItems: "center",
        elevation: 3, // Shadow effect
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    cardCount: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#007bff",
        marginTop: 5,
    },
});

export default ReportScreen;