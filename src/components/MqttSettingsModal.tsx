/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MqttConfig } from '../types';
import { 
  Radio, 
  Server, 
  Cpu, 
  Check, 
  X, 
  RefreshCw, 
  Droplets,
  Waves
} from 'lucide-react';

interface MqttSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MqttConfig;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  errorMessage?: string;
  onSaveConfig: (newConfig: MqttConfig) => void;
  onReconnect: () => void;
}

const BROKER_PRESETS = [
  {
    name: 'EMQX Public Broker (Khuyên dùng)',
    url: 'wss://broker.emqx.io:8084/mqtt',
    desc: 'Máy chủ WebSocket MQTT tốc độ cao, hỗ trợ SSL mã hóa an toàn',
  },
  {
    name: 'HiveMQ Public Broker',
    url: 'wss://broker.hivemq.com:8884/mqtt',
    desc: 'Public broker phổ biến của HiveMQ, hỗ trợ WebSocket',
  },
  {
    name: 'Mosquitto Test Broker',
    url: 'wss://test.mosquitto.org:8081/mqtt',
    desc: 'Máy chủ thử nghiệm chính thức của Eclipse Mosquitto',
  },
  {
    name: 'Máy chủ Riêng / Local Broker',
    url: 'ws://192.168.1.100:9001',
    desc: 'Kết nối Mosquitto trên Raspberry Pi hoặc Home Assistant trong mạng LAN',
  },
];

export const MqttSettingsModal: React.FC<MqttSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  status,
  errorMessage,
  onSaveConfig,
  onReconnect,
}) => {
  const [brokerUrl, setBrokerUrl] = useState(config.brokerUrl);
  const [clientId, setClientId] = useState(config.clientId);
  const [username, setUsername] = useState(config.username);
  const [password, setPassword] = useState(config.password);
  const [controlTopic, setControlTopic] = useState(config.controlTopic);
  const [telemetryTopic, setTelemetryTopic] = useState(config.telemetryTopic);
  const [statusTopic, setStatusTopic] = useState(config.statusTopic);
  const [useSimulator, setUseSimulator] = useState(config.useSimulator);
  const [autoReconnect, setAutoReconnect] = useState(config.autoReconnect);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      brokerUrl,
      clientId,
      username,
      password,
      controlTopic,
      telemetryTopic,
      statusTopic,
      scheduleTopic: config.scheduleTopic || 'esp32/pump/schedule',
      autoReconnect,
      useSimulator,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const applyPreset = (url: string) => {
    setBrokerUrl(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400" /> Cấu Hình Kết Nối MQTT
              </h2>
              <p className="text-xs text-slate-400">Liên kết ứng dụng với ESP32 qua giao thức MQTT</p>
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

        {/* Status Indicator */}
        <div className="mt-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Trạng thái Broker:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold ${
              status === 'connected'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : status === 'connecting'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'connected' ? 'bg-emerald-400' : (status === 'connecting' ? 'bg-amber-400 animate-ping' : 'bg-rose-400')
              }`} />
              {status === 'connected' && 'ĐÃ KẾT NỐI'}
              {status === 'connecting' && 'ĐANG KẾT NỐI...'}
              {status === 'disconnected' && 'NGẮT KẾT NỐI'}
              {status === 'error' && 'LỖI KẾT NỐI'}
            </span>
          </div>

          <button
            type="button"
            onClick={onReconnect}
            className="text-xs font-semibold text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>

        {errorMessage && (
          <p className="mt-2 text-xs text-rose-300 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
            {errorMessage}
          </p>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs">
          {/* Virtual ESP32 Simulator Switch */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-600/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">Mô phỏng ESP32 Ảo (Simulator)</p>
                <p className="text-[11px] text-slate-400">
                  Tự động sinh điện áp 220V và dòng điện theo số máy bơm bật để bạn kiểm tra ứng dụng
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useSimulator}
                onChange={(e) => setUseSimulator(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 border border-slate-700"></div>
            </label>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-cyan-400" /> Chọn nhanh máy chủ MQTT Broker mẫu
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BROKER_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(preset.url)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    brokerUrl === preset.url
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <p className="font-semibold text-[11px] text-white">{preset.name}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{preset.url}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Broker URL */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Địa chỉ Broker WebSocket URL (wss:// hoặc ws://)
            </label>
            <input
              type="text"
              value={brokerUrl}
              onChange={(e) => setBrokerUrl(e.target.value)}
              placeholder="wss://broker.emqx.io:8084/mqtt"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Auth Credentials */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tài khoản (Username)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Để trống nếu không cần"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mật khẩu (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Topics Configuration */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <span className="font-semibold text-slate-200 block text-xs">Cấu hình chủ đề (MQTT Topics)</span>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Topic Điều Khiển Bơm (Publish lệnh)</label>
              <input
                type="text"
                value={controlTopic}
                onChange={(e) => setControlTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Topic Nhận Điện Áp & Dòng Điện (Subscribe)</label>
              <input
                type="text"
                value={telemetryTopic}
                onChange={(e) => setTelemetryTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Topic Trạng Thái ESP32 Online (Subscribe)</label>
              <input
                type="text"
                value={statusTopic}
                onChange={(e) => setStatusTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-sky-300 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
              <input
                type="checkbox"
                checked={autoReconnect}
                onChange={(e) => setAutoReconnect(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500"
              />
              <span>Tự động kết nối lại khi mất mạng (Auto Reconnect)</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <span>Lưu & Kết Nối Ngay</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
