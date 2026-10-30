/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { TelemetryData, TelemetryPoint, SafetyThresholds, ThemeConfig } from '../types';
import { 
  Zap, 
  Activity, 
  Gauge, 
  Wifi, 
  AlertTriangle, 
  Sparkles,
  Sun,
  Droplets,
  Waves
} from 'lucide-react';

interface TelemetryGaugesProps {
  telemetry: TelemetryData;
  history: TelemetryPoint[];
  thresholds: SafetyThresholds;
  mqttStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  isSimulator: boolean;
  onOpenSafetyModal: () => void;
  theme?: ThemeConfig;
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({
  telemetry,
  history,
  thresholds,
  mqttStatus,
  isSimulator,
  onOpenSafetyModal,
  theme,
}) => {
  const { voltage, current, power, energyKWh, frequency, esp32Online, rssi = -58 } = telemetry;

  // Voltage status check
  const isOverVoltage = voltage > thresholds.overVoltage;
  const isUnderVoltage = voltage < thresholds.underVoltage;
  const isVoltageNormal = !isOverVoltage && !isUnderVoltage;

  // Current status check
  const isOverCurrent = current > thresholds.overCurrent;

  // Estimated electric cost in VND (~2,500 VND/kWh)
  const estimatedCostVnd = useMemo(() => {
    return Math.round((energyKWh || 0) * 2500);
  }, [energyKWh]);

  // Generate SVG path for voltage and current history
  const chartSvgData = useMemo(() => {
    if (history.length < 2) return { voltagePath: '', currentPath: '', areaPath: '', latestV: null, latestI: null };

    const width = 360;
    const height = 90;
    const padding = 10;

    const minV = 190;
    const maxV = 245;
    const minI = 0;
    const maxI = 12;

    const stepX = (width - padding * 2) / (history.length - 1);

    const vCoords = history.map((pt, idx) => {
      const x = padding + idx * stepX;
      const normalizedV = Math.max(0, Math.min(1, (pt.voltage - minV) / (maxV - minV)));
      const y = height - padding - normalizedV * (height - padding * 2);
      return { x, y };
    });

    const iCoords = history.map((pt, idx) => {
      const x = padding + idx * stepX;
      const normalizedI = Math.max(0, Math.min(1, (pt.current - minI) / (maxI - minI)));
      const y = height - padding - normalizedI * (height - padding * 2);
      return { x, y };
    });

    const vPath = vCoords.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
    const iPath = iCoords.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');

    const firstPt = iCoords[0];
    const lastPt = iCoords[iCoords.length - 1];
    const area = `${iPath} L ${lastPt.x},${height} L ${firstPt.x},${height} Z`;

    return { 
      voltagePath: vPath, 
      currentPath: iPath, 
      areaPath: area,
      latestV: vCoords[vCoords.length - 1], 
      latestI: iCoords[iCoords.length - 1] 
    };
  }, [history]);

  return (
    <div className="space-y-3">
      {/* Alert Banner if safety threshold breached */}
      {(isOverVoltage || isUnderVoltage || isOverCurrent) && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-3.5 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-red-200">CẢNH BÁO THÔNG SỐ ĐIỆN VƯỢT NGƯỠNG AN TOÀN!</p>
            <p className="text-red-300/90 mt-0.5">
              {isOverVoltage && `Điện áp quá cao: ${voltage}V (Ngưỡng: ${thresholds.overVoltage}V). `}
              {isUnderVoltage && `Sụt áp lưới điện: ${voltage}V (Ngưỡng: ${thresholds.underVoltage}V). `}
              {isOverCurrent && `Quá tải dòng điện: ${current}A (Ngưỡng: ${thresholds.overCurrent}A). `}
              Hệ thống tự động sẵn sàng ngắt rơ-le để bảo vệ động cơ bơm.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSafetyModal}
            className="ml-auto text-[11px] underline text-red-300 font-semibold shrink-0 cursor-pointer"
          >
            Cài đặt
          </button>
        </div>
      )}

      {/* Garden Micro-Climate & Water Status Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-sky-950/60 to-slate-900/80 border border-cyan-500/30 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span>Khí hậu khu vườn: 28°C • Trời trong xanh</span>
            </div>
            <p className="text-[10px] text-cyan-300/80">
              Độ ẩm đất 72% • Lưu lượng nước duy trì áp suất ổn định
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          Tiết kiệm 35% nước
        </span>
      </div>

      {/* Primary Telemetry Grid: Voltage & Current Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Voltage Card */}
        <div className={`relative overflow-hidden rounded-2xl p-3.5 border transition-all ${
          isOverVoltage || isUnderVoltage
            ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-500/10'
            : 'bg-gradient-to-b from-slate-900/95 to-slate-900/70 border-slate-800/80 shadow-md backdrop-blur-md'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Điện áp lưới (Voltage)
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              isVoltageNormal ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-red-500/20 text-red-300'
            }`}>
              {isVoltageNormal ? 'Ổn định' : (isOverVoltage ? 'Quá áp' : 'Sụt áp')}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
              isVoltageNormal ? 'text-amber-400' : 'text-red-400'
            }`}>
              {voltage.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">V AC</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Chuẩn: 220V ±10%</span>
            <span className="font-mono text-slate-200">{frequency ? `${frequency.toFixed(1)}Hz` : '50Hz'}</span>
          </div>

          {/* Mini progress bar representing 180V - 250V */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isVoltageNormal ? 'bg-gradient-to-r from-amber-400 to-cyan-400' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, ((voltage - 180) / 70) * 100))}%` }}
            />
          </div>
        </div>

        {/* Current Card */}
        <div className={`relative overflow-hidden rounded-2xl p-3.5 border transition-all ${
          isOverCurrent
            ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-500/10'
            : 'bg-gradient-to-b from-slate-900/95 to-slate-900/70 border-slate-800/80 shadow-md backdrop-blur-md'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Dòng tải (Current)
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              isOverCurrent ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {isOverCurrent ? 'Quá tải' : (current > 0.5 ? 'Có tải' : 'Nghỉ')}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
              isOverCurrent ? 'text-red-400' : 'text-cyan-400'
            }`}>
              {current.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400">Ampe (A)</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Giới hạn an toàn</span>
            <span className="font-mono text-slate-200">&lt; {thresholds.overCurrent}A</span>
          </div>

          {/* Mini progress bar representing 0A - 15A */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverCurrent ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, (current / thresholds.overCurrent) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Active Power & Energy */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Power Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between backdrop-blur-md">
          <div>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" /> Công suất tức thời
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-white font-mono">
                {power >= 1000 ? (power / 1000).toFixed(2) : power}
              </span>
              <span className="text-[11px] text-cyan-400 font-semibold">
                {power >= 1000 ? 'kW' : 'Watt'}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Waves className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Energy Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between backdrop-blur-md">
          <div>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" /> Điện năng tiêu thụ
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-white font-mono">
                {(energyKWh || 0).toFixed(2)}
              </span>
              <span className="text-[11px] text-sky-400 font-semibold">kWh</span>
            </div>
            <p className="text-[10px] text-sky-300 font-medium">
              ≈ {estimatedCostVnd.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Real-time Oscilloscope Waveform Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              Dòng dữ liệu tức thời ESP32 MQTT
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="inline-flex items-center gap-1 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> {voltage.toFixed(0)}V
            </span>
            <span className="inline-flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> {current.toFixed(2)}A
            </span>
          </div>
        </div>

        {/* SVG Line Chart */}
        <div className="relative w-full h-[88px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 p-1 flex items-center justify-center">
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 pointer-events-none opacity-20">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="border-b border-r border-cyan-500/30" />
            ))}
          </div>

          {history.length > 1 ? (
            <svg className="w-full h-full overflow-visible" viewBox="0 0 360 90" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waterFlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area gradient for water current */}
              <path
                d={chartSvgData.areaPath}
                fill="url(#waterFlowGrad)"
              />

              {/* Voltage Path (Amber) */}
              <path
                d={chartSvgData.voltagePath}
                fill="none"
                stroke="#fcd34d"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80"
              />

              {/* Current Path (Cyan / Sky) */}
              <path
                d={chartSvgData.currentPath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Latest dots */}
              {chartSvgData.latestV && (
                <circle cx={chartSvgData.latestV.x} cy={chartSvgData.latestV.y} r="3.5" fill="#fcd34d" className="animate-ping opacity-75" />
              )}
              {chartSvgData.latestI && (
                <circle cx={chartSvgData.latestI.x} cy={chartSvgData.latestI.y} r="3.5" fill="#22d3ee" />
              )}
            </svg>
          ) : (
            <div className="text-xs text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-spin" /> Đang nhận luồng dữ liệu từ ESP32...
            </div>
          )}
        </div>

        {/* Footer info: Hardware connection status */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${esp32Online ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span>ESP32: <strong className={esp32Online ? 'text-emerald-400' : 'text-red-400'}>{esp32Online ? 'Trực tuyến' : 'Ngoại tuyến'}</strong></span>
            {isSimulator && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Mô phỏng ảo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-cyan-400" />
              {rssi} dBm
            </span>
            <button
              type="button"
              onClick={onOpenSafetyModal}
              className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              Ngưỡng an toàn &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
