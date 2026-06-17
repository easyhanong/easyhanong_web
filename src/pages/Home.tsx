import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { SdgsBanner } from "../components/SdgsBanner";
import { CropsSection } from "../components/CropsSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { PointsSection } from "../components/PointsSection";
import { AiChatSection } from "../components/AiChatSection";
import { AttendanceCheckModal } from "../components/AttendanceCheckModal";
import { ChatSidebar } from "../components/ChatSidebar";
import { shouldAutoOpenAttendance } from "../lib/attendance";

export default function Home() {
  const [attendanceOpen, setAttendanceOpen] = useState(shouldAutoOpenAttendance);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col min-h-screen w-full">
        <Header
          onAttendanceClick={() => setAttendanceOpen(true)}
          onChatClick={() => setChatOpen(true)}
        />
        <HeroSection />
        <SdgsBanner />
        <CropsSection />
        <FeaturesSection />
        <PointsSection onAttendanceClick={() => setAttendanceOpen(true)} />
        <AiChatSection />
        <Footer />
      </div>

      <ChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} />

      <AttendanceCheckModal
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
      />
    </>
  );
}
