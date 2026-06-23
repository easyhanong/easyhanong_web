import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';
import { apiBase } from '../lib/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${apiBase()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 200) {
        const data = await response.json();
        const { access_token, refresh_token } = data.result ?? data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        window.location.href = '/';
        return;
      }

      if (response.status === 401) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      setError('로그인에 실패했습니다.');
    } catch {
      setError('로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex items-center justify-center flex-1 bg-linear-to-br from-sub1 to-sub2">
        <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="아이디"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green3"
            />
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green3"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green3 hover:bg-green5 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '로그인중...' : '로그인'}
            </button>
          </form>
          {error ? <p className="mt-4 text-sm text-red-500 text-center">{error}</p> : null}
          <p className="text-sm text-gray-500 mt-4 text-center">
            계정이 없으신가요? <a href="/signup" className="text-green3 hover:underline">회원가입</a>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}