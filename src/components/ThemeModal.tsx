/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeColor } from '../types';
import { THEMES } from '../themeContext';
import { Palette, Check, X, Sparkles, Droplets } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const themeList = Object.values(THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Palette className="w-5 h-5 animate-spin" style={{ animationDuration: '15s' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Chọn Tông Màu Xanh Yêu Thích
              </h2>
              <p className="text-xs text-slate-400">Tùy biến giao diện theo đúng gu thẩm mỹ của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Options */}
        <div className="py-4 space-y-2.5">
          {themeList.map((t) => {
            const isSelected = currentTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch Pill */}
                  <div className="flex items-center -space-x-1">
                    {t.id === 'ocean' && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-cyan-400 border border-slate-900" />
                        <div className="w-4 h-4 rounded-full bg-sky-500 border border-slate-900" />
                        <div className="w-4 h-4 rounded-full bg-blue-600 border border-slate-900" />
                      </>
                    )}
                    {t.id === 'mint' && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-teal-400 border border-slate-900" />
                        <div className="w-4 h-4 rounded-full bg-emerald-400 border border-slate-900" />
                        <div className="w-4 h-4 rounded-full bg-green-500 border border-slate-900" />
                      </>
                    )}
                    {t.id === 'forest' && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-emerald-600 border border-slate-900" />
                        <div className="w-4 h-4 rounded-full bg-green-700 border border-slate-900" />
                        <div className="w-4 h-4 rounded-full bg-teal-800 border border-slate-900" />
                      </>
                    )}
                    {t.id === 'cyber' && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-blue-500 border border-slate-900" />
                        <div className="w-4 h-4 rounded-full bg-indigo-500 border border-slate-900" />
                        <div className="w-4 h-4 rounded-full bg-cyan-400 border border-slate-900" />
                      </>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {t.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-900 font-mono text-slate-300 border border-slate-700">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.desc}</p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'border border-slate-700 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
          <span>Áp dụng tức thì toàn bộ ứng dụng</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
