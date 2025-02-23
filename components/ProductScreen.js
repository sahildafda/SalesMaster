import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ToastAndroid,
    Alert,
    Modal,
    TextInput,
    Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig.js"; // Import Firebase

const ProductListScreen = () => {
    const [products, setProducts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Fetch product list
    useEffect(() => {
        const productsRef = collection(db, "products");

        const unsubscribe = onSnapshot(productsRef, (querySnapshot) => {
            const productsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productsList);
        });

        return () => unsubscribe();
    }, []);

    // Show modal to add product
    const handleAddProduct = () => {
        setName("");
        setPrice("");
        setIsUpdate(false);
        setModalVisible(true);
    };

    // Show modal to edit product
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsUpdate(true);
        setName(product.name);
        setPrice(product.price.toString());
        setModalVisible(true);
    };

    // Delete product with confirmation
    const handleDelete = (id) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this product?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => deleteProduct(id), style: "destructive" }
            ]
        );
    };

    // Delete product from Firestore
    const deleteProduct = async (id) => {
        try {
            await deleteDoc(doc(db, "products", id));

            if (Platform.OS === "android") {
                ToastAndroid.show("Product deleted successfully!", ToastAndroid.SHORT);
            } else {
                Alert.alert("Success", "Product deleted successfully!");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to delete product");
            console.error("Delete Error:", error);
        }
    };

    // Save new or updated product
    const handleSaveProduct = async () => {
        if (!name || !price) {
            alert("Please enter all details");
            return;
        }

        const newProduct = {
            name: name,
            price: parseFloat(price),
        };

        try {
            if (!isUpdate) {
                // Add new product
                await addDoc(collection(db, "products"), newProduct);
                ToastAndroid.show("Product added successfully!", ToastAndroid.SHORT);
            } else {
                // Update existing product
                const productRef = doc(db, "products", selectedProduct.id);
                await updateDoc(productRef, {
                    name,
                    price: parseFloat(price),
                });
                setIsUpdate(false);

                ToastAndroid.show("Product Updated successfully!", ToastAndroid.SHORT);
            }

            setName("");
            setPrice("");
            setModalVisible(false);

        } catch (error) {
            console.error("Error adding/updating product: ", error);
            Alert.alert("Error", "Failed to save product");
        }
    };

    return (
        <View style={styles.container}>
            {/* Add Product Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                <Text style={styles.addButtonText}>+ Add Product</Text>
            </TouchableOpacity>

            {/* Product List */}
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.productItem}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.price}>Rs. {item.price}</Text>
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

            {/* Modal for Adding or Editing Product */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Product Details</Text>

                        {/* Name Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Product Name"
                            placeholderTextColor="gray"
                            value={name}
                            onChangeText={setName}
                        />

                        {/* Price Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Price"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// 🔹 **Styles (Same as CustomersScreen, with minor tweaks)**
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
    productItem: {
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
    price: {
        fontSize: 16,
        color: "green",
    },
    buttons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
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
    saveButton: {
        backgroundColor: "green",
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: "center",
    },
});

export default ProductListScreen;
