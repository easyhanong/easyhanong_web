import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

type HeaderProps = {
  onAttendanceClick?: () => void;
  onChatClick?: () => void;
};

export default function Header({
  onAttendanceClick,
  onChatClick,
}: HeaderProps) {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access_token");

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    }
  };

  return (
    <header className="bg-main px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
      <Link to="/" className="flex items-center gap-2.5">
        <img src="/easyhanong.png" alt="" className="size-8" />
        <span className="text-white text-[22px] font-bold tracking-[-0.5px]">
          이지하농
        </span>
      </Link>

      <nav className="flex gap-7 items-center">
        <a
          href="/#crops"
          className="text-green2 no-underline text-[15px] font-medium hover:text-white transition-colors"
        >
          작물 가이드
        </a>
        <a
          href="/#features"
          className="text-green2 no-underline text-[15px] font-medium hover:text-white transition-colors"
        >
          기능
        </a>
        <button
          type="button"
          onClick={onChatClick}
          className="text-green2 bg-transparent border-none text-[15px] font-medium hover:text-white transition-colors cursor-pointer p-0"
        >
          AI 채팅
        </button>
        <button
          type="button"
          onClick={onAttendanceClick}
          className="text-green2 bg-transparent border-none text-[15px] font-medium hover:text-white transition-colors cursor-pointer p-0"
        >
          출석 체크
        </button>
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            className="text-green2 bg-transparent border-none text-[15px] font-medium hover:text-white transition-colors cursor-pointer p-0"
          >
            로그아웃
          </button>
        ) : (
          <Link
            to="/login"
            className="text-green2 no-underline text-[15px] font-medium hover:text-white transition-colors"
          >
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}
