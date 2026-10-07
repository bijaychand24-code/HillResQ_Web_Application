import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mountain,
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  UserCheck,
  User,
  AlertCircle
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Card from '../components/common/Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-800/20 mb-3">
            <Mountain className="w-8 h-8 text-emerald-200" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to HillResQ
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Access citizen reporting, responder dispatch, or administrative control
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6">
          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@hillresq.org"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={LogIn}
              className="w-full font-semibold mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Quick Test Role Accounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('citizen@hillresq.org', 'citizen123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-slate-700 transition-all text-xs group"
              >
                <User className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-semibold text-[11px]">Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('responder@hillresq.org', 'responder123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 text-slate-700 transition-all text-xs group"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600 mb-1" />
                <span className="font-semibold text-[11px]">Responder</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hillresq.org', 'admin123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-200 text-slate-700 transition-all text-xs group"
              >
                <UserCheck className="w-4 h-4 text-red-600 mb-1" />
                <span className="font-semibold text-[11px]">Admin</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-emerald-700 hover:text-emerald-800"
            >
              Register as Citizen
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
