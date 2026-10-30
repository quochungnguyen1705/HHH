/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pump, ThemeConfig } from '../types';
import { 
  Droplets, 
  Power, 
  Clock, 
  RotateCw, 
  Edit3, 
  Check, 
  X, 
  Timer,
  Sprout,
  Leaf,
  Flower2,
  Trees,
  Fish
} from 'lucide-react';

interface PumpCardProps {
  pump: Pump;
  onToggle: (pumpId: number, newState: boolean) => void;
  onSetCountdownTimer: (pumpId: number, minutes: number | null) => void;
  onUpdatePumpInfo: (pumpId: number, name: string, location: string, powerW: number) => void;
  theme?: ThemeConfig;
}

export const PumpCard: React.FC<PumpCardProps> = ({
  pump,
  onToggle,
  onSetCountdownTimer,
  onUpdatePumpInfo,
  theme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showTimerSelector, setShowTimerSelector] = useState(false);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(15);

  const [editName, setEditName] = useState(pump.name);
  const [editLocation, setEditLocation] = useState(pump.location);
  const [editPower, setEditPower] = useState(pump.ratedPowerW);

  // Pick suitable nature icon based on pump id
  const getNatureIcon = () => {
    switch (pump.id) {
      case 1:
        return <Flower2 className="w-5 h-5 text-cyan-300" />;
      case 2:
        return <Leaf className="w-5 h-5 text-emerald-300" />;
      case 3:
        return <Trees className="w-5 h-5 text-sky-300" />;
      case 4:
        return <Fish className="w-5 h-5 text-blue-300" />;
      default:
        return <Droplets className="w-5 h-5 text-cyan-300" />;
    }
  };

  const getPlantTag = () => {
    switch (pump.id) {
      case 1:
        return { label: 'Vườn Lan & Bonsai', advice: 'Phun sương giữ ẩm' };
      case 2:
        return { label: 'Rau Sạch & Thảo Mộc', advice: 'Tưới nhỏ giọt tiết kiệm' };
      case 3:
        return { label: 'Vườn Cây & Bãi Cỏ', advice: 'Béc xoay diện rộng' };
      case 4:
        return { label: 'Hồ Cá & Thác Nước', advice: 'Tuần hoàn sinh thái' };
      default:
        return { label: 'Khu Vườn Xanh', advice: 'Tưới tiêu thông minh' };
    }
  };

  const plantInfo = getPlantTag();

  // Format running duration
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  // Format countdown remaining
  const formatCountdown = (remainingSec: number) => {
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate estimated total water pumped in liters
  const totalWaterLiters = Math.round((pump.runDurationSeconds / 60) * pump.flowRateLpm);

  const handleSaveInfo = () => {
    onUpdatePumpInfo(pump.id, editName, editLocation, editPower);
    setIsEditing(false);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 border transition-all duration-300 ${
        pump.state
          ? 'bg-gradient-to-b from-slate-900/90 via-cyan-950/50 to-slate-950 border-cyan-400/60 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-400/20'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-cyan-500/40 shadow-md backdrop-blur-md'
      }`}
    >
      {/* Background active water wave glow */}
      {pump.state && (
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-ripple" />
      )}

      {/* Header: Plant Badge, Pump Number, Name, Edit Button */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          {/* Nature Icon with Animated Spinning Turbine when ON */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
              pump.state
                ? 'bg-gradient-to-tr from-cyan-500/30 via-sky-500/30 to-blue-500/30 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/25'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
            }`}
          >
            {pump.state ? (
              <div className="relative flex items-center justify-center">
                <RotateCw className="w-6 h-6 animate-spin text-cyan-300" style={{ animationDuration: '2.5s' }} />
                <Droplets className="w-3.5 h-3.5 text-white absolute animate-pulse" />
              </div>
            ) : (
              getNatureIcon()
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 uppercase font-mono border border-cyan-700/60">
                BƠM {pump.id}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                💧 {plantInfo.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                GPIO {pump.gpioPin}
              </span>
            </div>

            <h3 className="font-extrabold text-white text-sm sm:text-base leading-snug line-clamp-1 mt-0.5">
              {pump.name}
            </h3>
            <p className="text-[11px] text-slate-300/80 line-clamp-1">
              {pump.location || 'Khu vực tự nhiên'} • {plantInfo.advice}
            </p>
          </div>
        </div>

        {/* Edit Button */}
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          title="Đổi tên và thông số tưới"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editing Dropdown Inline */}
      {isEditing && (
        <div className="mb-3 p-3 bg-slate-950/95 rounded-2xl border border-cyan-600/50 space-y-2.5 animate-fadeIn">
          <div>
            <label className="text-[10px] font-semibold text-cyan-300 uppercase">Tên gợi nhớ khu vực</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-cyan-300 uppercase">Vị trí lắp đặt</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-cyan-300 uppercase">Công suất (Watt)</label>
              <input
                type="number"
                value={editPower}
                onChange={(e) => setEditPower(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-md bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveInfo}
              className="px-3 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Check className="w-3 h-3" /> Lưu
            </button>
          </div>
        </div>
      )}

      {/* Nature & Telemetry Stats Grid */}
      <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-800/80 mb-3 text-center">
        <div>
          <span className="text-[10px] text-slate-400 block">Trạng thái</span>
          <span className={`text-xs font-extrabold inline-flex items-center gap-1 mt-0.5 ${
            pump.state ? 'text-cyan-400' : 'text-slate-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pump.state ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
            {pump.state ? 'ĐANG BƠM' : 'TẠM NGHỈ'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Dòng điện</span>
          <span className="text-xs font-bold font-mono text-cyan-300 mt-0.5 block">
            {pump.state ? `${pump.currentCurrentA.toFixed(1)} A` : '0.0 A'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Lưu lượng nước</span>
          <span className="text-xs font-bold font-mono text-sky-300 mt-0.5 block">
            {pump.state ? `${pump.flowRateLpm} L/phút` : '0 L/p'}
          </span>
        </div>
      </div>

      {/* Main Switch Button & Countdown Action */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggle(pump.id, !pump.state)}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer active:scale-[0.98] ${
            pump.state
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-600/30 hover:from-rose-500 hover:to-red-500'
              : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-cyan-600/30 hover:from-cyan-400 hover:to-blue-500'
          }`}
        >
          <Power className={`w-4 h-4 ${pump.state ? 'animate-pulse' : ''}`} />
          <span>{pump.state ? 'NGỪNG MÁY BƠM' : 'BẬT MÁY BƠM'}</span>
        </button>

        {/* Countdown Timer Button */}
        <button
          type="button"
          onClick={() => setShowTimerSelector(!showTimerSelector)}
          className={`relative p-3.5 rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
            pump.timerRemainingSeconds !== null
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/20'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-500/50'
          }`}
          title="Hẹn giờ tưới cây tự động tắt"
        >
          <Timer className="w-5 h-5" />
          {pump.timerRemainingSeconds !== null && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* Active Countdown Timer Banner */}
      {pump.timerRemainingSeconds !== null && (
        <div className="mt-3 p-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 animate-spin text-amber-300" style={{ animationDuration: '8s' }} />
            <span>Tự ngắt sau:</span>
            <strong className="font-mono text-amber-100 text-sm">
              {formatCountdown(pump.timerRemainingSeconds)}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => onSetCountdownTimer(pump.id, null)}
            className="text-amber-300 hover:text-white font-semibold text-[11px] underline cursor-pointer"
          >
            Hủy hẹn giờ
          </button>
        </div>
      )}

      {/* Quick Countdown Preset Picker Popover */}
      {showTimerSelector && (
        <div className="mt-3 p-3 bg-slate-950/95 border border-slate-700 rounded-2xl animate-fadeIn space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-200 font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Chọn thời gian tưới tự ngắt:
            </span>
            <button
              type="button"
              onClick={() => setShowTimerSelector(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[5, 15, 30, 45].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  onSetCountdownTimer(pump.id, mins);
                  setShowTimerSelector(false);
                }}
                className="py-1.5 px-2 bg-slate-800 hover:bg-cyan-600 hover:text-white rounded-lg text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                {mins} phút
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <input
              type="number"
              min={1}
              max={360}
              value={customTimerMinutes}
              onChange={(e) => setCustomTimerMinutes(Math.max(1, Number(e.target.value)))}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-white"
            />
            <span className="text-xs text-slate-400">phút</span>
            <button
              type="button"
              onClick={() => {
                onSetCountdownTimer(pump.id, customTimerMinutes);
                setShowTimerSelector(false);
              }}
              className="ml-auto px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Bắt đầu
            </button>
          </div>
        </div>
      )}

      {/* Footer: Nature water volume accumulated & running time */}
      <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Droplets className="w-3 h-3 text-cyan-400" />
          <span>Tổng lượng nước đã bơm: <strong className="text-cyan-300 font-mono">{totalWaterLiters} Lít</strong></span>
        </span>
        <span className="font-mono text-slate-300">
          {formatDuration(pump.runDurationSeconds)}
        </span>
      </div>
    </div>
  );
};
