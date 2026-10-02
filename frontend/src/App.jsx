import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Placeholder from "./pages/Placeholder.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        {/* Member 2 replaces these */}
        <Route path="/report-lost" element={<Placeholder title="Report lost item" owner="Member 2" />} />
        <Route path="/report-found" element={<Placeholder title="Report found item" owner="Member 2" />} />
        <Route path="/items/:id" element={<Placeholder title="Item details" owner="Member 2" />} />
        {/* Member 3 replaces these */}
        <Route path="/search" element={<Placeholder title="Search items" owner="Member 3" />} />
        <Route path="/my-reports" element={<Placeholder title="My reports" owner="Member 3" />} />
        <Route path="/admin" element={<Placeholder title="Admin dashboard" owner="Member 3" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
