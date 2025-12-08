// index.js
import axios from "axios";

// 🔥 FIX: allow cookies for protected routes
import ReactDOM from "react-dom/client";


// ROUTER + REDUX
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { Provider } from "react-redux";
import store from "./store";

// GLOBAL CSS
import "./assets/style/bootstrap.custom.css";
import "./index.css";

// APP + SCREENS
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import HomeScreen from "./screen/HomeScreen";
import ProductScreen from "./screen/ProductScreen";
import InfoScreen from "./screen/InfoScreen";
import TrackedScreen from "./screen/TrackedScreen";
import AlertScreen from "./screen/AlertScreen";
import ProfileScreen from "./screen/ProfileScreen";
import LoginScreen from "./screen/LoginScreen";
import RegisterScreen from "./screen/RegisterScreen";
axios.defaults.withCredentials = true;


// ROUTES
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomeScreen />} />
      <Route path="/product/:id" element={<ProductScreen />} />
      <Route path="/info" element={<InfoScreen />} />
      <Route path="/tracked" element={<TrackedScreen />} />
      <Route path="/alerts" element={<AlertScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
    </Route>
  )
);

// RENDER
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
      <RouterProvider router={router} />
  </Provider>
);

reportWebVitals();
