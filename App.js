import React, { useContext } from "react";
import { ActivityIndicator, View, Text, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import Screens
import CustomersScreen from "./components/CustomerScreen";
import ProductScreen from "./components/ProductScreen";
import OrderScreen from "./components/OrderScreen";
import LoginScreen from "./components/LoginScreen";
import ReportScreen from "./components/ReportScreen";
import { AuthProvider, AuthContext } from "./context/AuthContext";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const LogoutScreen = () => {
  const { signOut } = useContext(AuthContext);

  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => signOut() },
    ],
    { cancelable: false }
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Logging out...</Text>
    </View>
  );
};

// Bottom Tab Navigation for Logged-in Users
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === "Orders") {
          iconName = "document-text-outline";
        } else if (route.name === "Customers") {
          iconName = "people-outline";
        } else if (route.name === "Products") {
          iconName = "cart-outline";
        } else if (route.name === "Reports") {
          iconName = "bar-chart-outline";
        } else if (route.name === "Logout") {
          iconName = "log-out-outline"; // Logout icon
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "tomato",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Orders" component={OrderScreen} />
    {/* <Tab.Screen name="Customers" component={CustomersScreen} /> */}
    {/* <Tab.Screen name="Products" component={ProductScreen} /> */}
    <Tab.Screen name="Reports" component={ReportScreen} />
    <Tab.Screen name="Logout" component={LogoutScreen} options={{ tabBarStyle: { display: "none" } }} />

  </Tab.Navigator>
);

// Authentication Flow
const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Wrapping with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
