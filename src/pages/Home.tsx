import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { SdgsBanner } from "../components/SdgsBanner";
import { CropsSection } from "../components/CropsSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { PointsSection } from "../components/PointsSection";
import { AiChatSection } from "../components/AiChatSection";
import {
  AttendanceCheckModal,
  shouldAutoOpenAttendance,
} from "../components/AttendanceCheckModal";
import { ChatSidebar } from "../components/ChatSidebar";

export default function Home() {
  const [attendanceOpen, setAttendanceOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (shouldAutoOpenAttendance()) {
      setAttendanceOpen(true);
    }
  }, []);

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
      </div>

      <ChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} />

      <AttendanceCheckModal
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
      />
    </>
  );
}
