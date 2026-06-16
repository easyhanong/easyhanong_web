export default function Header() {
  return (
    <header className="bg-main flex items-center justify-between text-white px-8 py-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌿</span>
        <a href="/" className="text-2xl font-bold">이지하농</a>
      </div>
      <ul className="text-green2 flex gap-6">
        <li><a href="/guides" className="hover:text-green1">작물 가이드</a></li>
        <li><a href="/features" className="hover:text-green1">기능</a></li>
        <li><a href="/ai-chat" className="hover:text-green1">AI 채팅</a></li>
        <li><a href="/attendance" className="hover:text-green1">출석 체크</a></li>
      </ul>
    </header>
  );
}