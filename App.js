import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Screens
import CustomersScreen from "./components/CustomerScreen";
import ProductScreen from "./components/ProductScreen";
import OrderScreen from "./components/OrderScreen";


const ReportsScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Reports Screen</Text>
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
            } else if (route.name === "Reports") {
              iconName = "bar-chart-outline"; // Icon for Reports
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Orders" component={OrderScreen} />
        <Tab.Screen name="Customers" component={CustomersScreen} />
        <Tab.Screen name="Products" component={ProductScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

