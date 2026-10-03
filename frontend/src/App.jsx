import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Alerts from "./components/Alerts.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import ReportItem from "./pages/ReportItem.jsx";
import ItemDetails from "./pages/ItemDetails.jsx";
import Search from "./pages/Search.jsx";
import MyReports from "./pages/MyReports.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><><Alerts /><Layout /></></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report-lost" element={<ReportItem type="lost" />} />
        <Route path="/report-found" element={<ReportItem type="found" />} />
        <Route path="/items/:id" element={<ItemDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
