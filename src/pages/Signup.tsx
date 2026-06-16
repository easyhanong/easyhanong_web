import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || '';

    try {
      const response = await fetch(`${API_BASE.replace(/\/$/, '')}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // send fields as: username, password, email (all strings)
        body: JSON.stringify({ username, password, email }),
      });

      if (response.status === 200 || response.status === 201) {
        window.location.href = '/login';
        return;
      }

      if (response.status === 409) {
        setError('User already exists');
        return;
      }
      const errorBody = await response.text();
      console.error('signup 실패:', response.status, errorBody);
      setError(`Signup failed (${response.status})`);

    } catch {
      setError('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex items-center justify-center flex-1 bg-linear-to-br from-sub1 to-sub2">
        <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
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
              type="email"
              name="email"
              placeholder="이메일"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? '회원가입중...' : '회원가입'}
            </button>
          </form>
          {error ? <p className="mt-4 text-sm text-red-500 text-center">{error}</p> : null}
          <p className="text-sm text-gray-500 mt-4 text-center">
            이미 계정이 있으신가요? <a href="/login" className="text-green3 hover:underline">로그인</a>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}