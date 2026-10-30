/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount } from '../types';
import { 
  Droplets, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  Cpu,
  CheckCircle2,
  Waves
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserAccount = {
        email,
        name: isRegister ? (fullName || 'Kỹ Sư Quản Lý') : (email.split('@')[0] || 'Kỹ Sư Quản Lý'),
        role: 'Quản trị viên Hệ thống Nước',
        avatarSeed: email,
        token: 'token_' + Math.random().toString(36).substring(2),
      };

      localStorage.setItem('aquapump_auth_user', JSON.stringify(user));
      onLoginSuccess(user);
    }, 500);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser: UserAccount = {
        email: 'admin.iot@aquapump.vn',
        name: 'Nguyễn Quốc Hùng',
        role: 'Kỹ Sư IoT & Hệ Thống Nước Thông Minh',
        avatarSeed: 'quochung',
        token: 'demo_token_authenticated',
      };
      localStorage.setItem('aquapump_auth_user', JSON.stringify(demoUser));
      onLoginSuccess(demoUser);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-cyan-950 to-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ocean Ambient Lighting Gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] bg-sky-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 shadow-2xl shadow-cyan-500/30 mb-3 border border-cyan-300/40 animate-gentle">
            <Droplets className="w-10 h-10 text-white animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-md">
              <Waves className="w-4 h-4 text-cyan-300" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 bg-clip-text text-transparent">
            AquaPump IoT
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 font-medium">
            Hệ thống điều khiển 4 máy bơm nước & giám sát ESP32 MQTT
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-cyan-200">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 backdrop-blur-md">
              <Droplets className="w-3 h-3 text-cyan-400" /> 4 Máy Bơm
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 backdrop-blur-md">
              <Zap className="w-3 h-3 text-amber-300" /> Đo Điện Áp & Dòng
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 backdrop-blur-md">
              <Cpu className="w-3 h-3 text-sky-300" /> ESP32 Live
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                isRegister
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Đăng ký mới
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email quản lý
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aquapump.vn"
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Mật khẩu
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => alert('Mẹo: Nhấn nút "Đăng nhập nhanh 1 chạm" bên dưới để vào hệ thống ngay!')}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Tạo Tài Khoản & Bắt Đầu' : 'Đăng Nhập Vào Hệ Thống'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-900 text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Hoặc trải nghiệm ngay
            </span>
          </div>

          {/* One-Click Quick Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-cyan-500/40 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:border-cyan-400 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Đăng nhập nhanh 1 chạm (Tài khoản mẫu)</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400 ml-auto" />
          </button>

          <p className="text-center text-[11px] text-slate-500 mt-5">
            Bảo mật mã hóa • Kết nối thời gian thực qua MQTT ESP32
          </p>
        </div>
      </div>
    </div>
  );
};
