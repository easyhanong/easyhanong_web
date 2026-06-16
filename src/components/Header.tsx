import { apiFetch } from '../lib/api';

export default function Header() {
  const isLoggedIn = !!localStorage.getItem('access_token');

  const handleAuthClick = (e: React.MouseEvent) => {
    if (isLoggedIn) {
      e.preventDefault();
      apiFetch('/auth/logout', { method: 'POST' }).finally(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      });
    }
  };

  return (
    <header className="bg-main flex items-center justify-between text-white px-8 py-4">
      <a href='/' className="flex items-center gap-2">
        <img src="/easyhanong.png" alt="" className='size-8'/>
        <span className="text-xl font-bold">이지하농</span>
      </a>
      <ul className="text-green2 flex gap-6">
        <li><a href="/guides" className="hover:text-green1">작물 가이드</a></li>
        <li><a href="/features" className="hover:text-green1">기능</a></li>
        <li><a href="/ai-chat" className="hover:text-green1">AI 채팅</a></li>
        <li><a href="/attendance" className="hover:text-green1">출석 체크</a></li>
        <li>
          <a href="/login" onClick={handleAuthClick} className="hover:text-green1">
            {isLoggedIn ? '로그아웃' : '로그인'}
          </a>
        </li>
      </ul>
    </header>
  );
}