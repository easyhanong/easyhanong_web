import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Grow from "./pages/Grow";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/grow" element={<Grow />} />
        </Routes>
      </main>
    </div>
  );
}