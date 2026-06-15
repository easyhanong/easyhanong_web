import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="w-full">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}