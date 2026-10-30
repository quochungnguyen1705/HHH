/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SafetyThresholds } from '../types';
import { ShieldCheck, Check, X, Zap } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: SafetyThresholds;
  onSave: (thresholds: SafetyThresholds) => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSave,
}) => {
  const [overVoltage, setOverVoltage] = useState(thresholds.overVoltage);
  const [underVoltage, setUnderVoltage] = useState(thresholds.underVoltage);
  const [overCurrent, setOverCurrent] = useState(thresholds.overCurrent);
  const [maxRun, setMaxRun] = useState(thresholds.maxContinuousRunMinutes);
  const [autoCutoff, setAutoCutoff] = useState(thresholds.autoCutoffEnabled);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      overVoltage,
      underVoltage,
      overCurrent,
      maxContinuousRunMinutes: maxRun,
      autoCutoffEnabled: autoCutoff,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                Bảo Vệ Động Cơ & Ngưỡng An Toàn
              </h2>
              <p className="text-xs text-slate-400">Tự động ngắt 4 rơ-le khi phát hiện sự cố điện lưới</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 space-y-3.5 text-xs">
          {/* Master Interlock Switch */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Tự Động Cắt Điện Khi Có Lỗi (Auto Trip)</p>
              <p className="text-[11px] text-slate-400">Ngắt tức thì 4 máy bơm khi điện áp/dòng vượt ngưỡng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoCutoff}
                onChange={(e) => setAutoCutoff(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 border border-slate-700"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">Ngưỡng Quá Áp (Over Voltage)</span>
                <span className="font-mono text-amber-400 font-bold">{overVoltage} V</span>
              </div>
              <input
                type="range"
                min={230}
                max={260}
                value={overVoltage}
                onChange={(e) => setOverVoltage(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <span className="text-[10px] text-slate-500">Lưới điện Việt Nam thông thường: 220V ± 10% (Tối đa 242V)</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">Ngưỡng Sụt Áp (Under Voltage)</span>
                <span className="font-mono text-cyan-400 font-bold">{underVoltage} V</span>
              </div>
              <input
                type="range"
                min={170}
                max={210}
                value={underVoltage}
                onChange={(e) => setUnderVoltage(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">Sụt áp dưới 185V có thể làm cháy cuộn dây mô tơ máy bơm</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">Ngưỡng Dòng Cực Đại (Max Current)</span>
                <span className="font-mono text-rose-400 font-bold">{overCurrent} A</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                value={overCurrent}
                onChange={(e) => setOverCurrent(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <span className="text-[10px] text-slate-500">Bảo vệ kẹt cánh bơm hoặc chập cuộn dây động cơ</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">Thời Gian Chạy Liên Tục Tối Đa</span>
                <span className="font-mono text-sky-400 font-bold">{maxRun} phút</span>
              </div>
              <input
                type="range"
                min={30}
                max={300}
                step={15}
                value={maxRun}
                onChange={(e) => setMaxRun(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
              <span className="text-[10px] text-slate-500">Tự ngắt nếu người dùng quên tắt để tránh ngập úng & cháy máy</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 rounded-xl shadow-md cursor-pointer"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
