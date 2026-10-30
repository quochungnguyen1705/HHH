/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MqttConfig } from '../types';
import { generateEsp32ArduinoCode } from '../services/esp32CodeGenerator';
import { 
  Copy, 
  Check, 
  X, 
  Wifi, 
  Lock, 
  Cpu, 
  Layers,
  Droplets
} from 'lucide-react';

interface Esp32CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MqttConfig;
}

export const Esp32CodeModal: React.FC<Esp32CodeModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [wifiSsid, setWifiSsid] = useState('WiFi_Nha_Vuon');
  const [wifiPass, setWifiPass] = useState('12345678');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const code = generateEsp32ArduinoCode(config, wifiSsid, wifiPass);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Mã Nguồn ESP32 Arduino / C++
              </h2>
              <p className="text-xs text-slate-400">Nạp vào ESP32 để điều khiển 4 máy bơm & gửi điện áp, dòng điện lên MQTT</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-xs">
          {/* Hardware Pinout Guide */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <p className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Sơ đồ đấu nối chân ESP32 Điều Khiển 4 Rơ-le Bơm
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Bơm 1 (Relay 1)</span>
                <strong className="text-cyan-300 font-mono text-xs">GPIO 26</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Bơm 2 (Relay 2)</span>
                <strong className="text-cyan-300 font-mono text-xs">GPIO 27</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Bơm 3 (Relay 3)</span>
                <strong className="text-cyan-300 font-mono text-xs">GPIO 14</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Bơm 4 (Relay 4)</span>
                <strong className="text-cyan-300 font-mono text-xs">GPIO 12</strong>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * Module đo điện áp & dòng: PZEM-004T v3 (GPIO 16 RX, GPIO 17 TX) hoặc biến dòng ACS712 + ZMPT101B.
            </p>
          </div>

          {/* WiFi Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-300 text-[11px] mb-1 font-medium flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Tên WiFi (SSID)
              </label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-[11px] mb-1 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Mật khẩu WiFi
              </label>
              <input
                type="text"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <div className="flex items-center justify-between pb-1.5 text-[11px] text-slate-400">
              <span>Code Arduino C++ (Thư viện: PubSubClient, ArduinoJson)</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold transition-all cursor-pointer shadow-md shadow-cyan-700/30"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép toàn bộ mã'}</span>
              </button>
            </div>
            <pre className="w-full max-h-[300px] overflow-auto bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[11px] font-mono text-slate-200 leading-relaxed selection:bg-cyan-500 selection:text-black">
              {code}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">
            Hỗ trợ nạp qua cổng USB: Arduino IDE, PlatformIO, ESPHome
          </span>
          <button
            type="button"
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
