import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RadioButton } from "react-native-paper";
import { db } from "./firebaseConfig"; // Import Firebase
import { collection, getDocs } from "firebase/firestore";

// Screens
import CustomersScreen from "./components/CustomerScreen"

// check for database connection

const ProductsScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Products Screen</Text>
  </View>
);

const OrdersScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Orders Screen</Text>
  </View>
);

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Customers") {
              iconName = "people-outline";
            } else if (route.name === "Products") {
              iconName = "cart-outline";
            } else if (route.name === "Orders") {
              iconName = "document-text-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Customers" component={CustomersScreen} />
        <Tab.Screen name="Products" component={ProductsScreen} />
        <Tab.Screen name="Orders" component={OrdersScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

