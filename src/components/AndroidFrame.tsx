/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Smartphone, Monitor, Wifi, BatteryCharging, Signal, Droplets, Palette } from 'lucide-react';
import { ThemeConfig } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  isAndroidView: boolean;
  onToggleView: () => void;
  systemTime: string;
  theme: ThemeConfig;
  onOpenThemeModal: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isAndroidView,
  onToggleView,
  systemTime,
  theme,
  onOpenThemeModal,
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradientBg} text-slate-100 flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-cyan-500 selection:text-black transition-colors duration-500`}>
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-[650px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[650px] h-[350px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Floating Bar for View Mode & Color Theme Changer */}
      <div className="w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 z-40 flex items-center justify-between text-xs sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-extrabold text-white flex items-center gap-1.5 text-xs sm:text-sm">
            <Droplets className="w-4 h-4 text-cyan-400 animate-pulse" />
            AquaPump IoT
          </span>
          <span className="hidden sm:inline-block text-slate-400 font-mono text-[11px]">
            • Điều Khiển 4 Bơm Nước & ESP32 MQTT
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Color Theme Switcher Button */}
          <button
            type="button"
            onClick={onOpenThemeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 transition-all text-xs font-bold cursor-pointer shadow-sm shadow-cyan-500/10"
            title="Đổi tông màu xanh giao diện"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Tông màu:</span>
            <span className="text-white">{theme.name.split('/')[0]}</span>
          </button>

          {/* View Toggle */}
          <button
            type="button"
            onClick={onToggleView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all text-xs font-semibold cursor-pointer shadow-sm"
          >
            {isAndroidView ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Màn hình rộng</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Khung Android</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className={`w-full flex justify-center py-0 sm:py-4 transition-all duration-300 ${isAndroidView ? 'px-0 sm:px-4' : 'px-2 sm:px-6 max-w-5xl'}`}>
        {isAndroidView ? (
          /* Android Phone Mockup Wrapper */
          <div className="w-full max-w-[430px] min-h-[880px] bg-slate-950/95 sm:rounded-[44px] sm:border-[8px] sm:border-slate-800/90 sm:shadow-2xl sm:shadow-cyan-950/60 relative flex flex-col overflow-hidden sm:ring-1 sm:ring-slate-700/60">
            {/* Android Punch Hole Camera */}
            <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 rounded-full border border-slate-800 z-50 pointer-events-none" />

            {/* Android System Status Bar */}
            <div className="w-full bg-slate-950/95 backdrop-blur-md px-5 pt-2 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-400 z-40 select-none">
              <span className="font-mono text-slate-200">{systemTime}</span>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">5G</span>
                <Signal className="w-3 h-3 text-slate-300" />
                <Wifi className="w-3 h-3 text-cyan-400" />
                <div className="flex items-center gap-0.5 text-emerald-400">
                  <span className="text-[10px] font-mono">100%</span>
                  <BatteryCharging className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* App Screen Content */}
            <div className="flex-1 overflow-y-auto pb-8">
              {children}
            </div>

            {/* Android Gesture Bar */}
            <div className="w-full py-2 bg-slate-950 flex justify-center items-center select-none shrink-0 border-t border-slate-900">
              <div className="w-32 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>
        ) : (
          /* Full Wide Dashboard */
          <div className="w-full py-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
