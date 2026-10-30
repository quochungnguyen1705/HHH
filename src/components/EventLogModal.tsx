/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EventLog } from '../types';
import { Terminal, X, Trash2, ArrowDownLeft, ArrowUpRight, AlertCircle, Info, Waves } from 'lucide-react';

interface EventLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: EventLog[];
  onClearLogs: () => void;
}

export const EventLogModal: React.FC<EventLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => {
    if (filterType === 'all') return true;
    if (filterType === 'mqtt') return l.type === 'mqtt_in' || l.type === 'mqtt_out';
    if (filterType === 'alert') return l.type === 'alert' || l.type === 'warn';
    return l.type === filterType;
  });

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${Math.floor(d.getMilliseconds() / 100)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400" />
                Nhật Ký MQTT & Hoạt Động Bơm Nước
              </h2>
              <p className="text-xs text-slate-400">Xem luồng gói tin MQTT gửi nhận thời gian thực giữa App và ESP32</p>
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

        {/* Filter bar */}
        <div className="py-2.5 flex items-center justify-between gap-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterType === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('mqtt')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterType === 'mqtt' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Gói tin MQTT
            </button>
            <button
              type="button"
              onClick={() => setFilterType('alert')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterType === 'alert' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Cảnh báo / Lỗi
            </button>
          </div>

          <button
            type="button"
            onClick={onClearLogs}
            className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa nhật ký
          </button>
        </div>

        {/* Log Viewer */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1.5 font-mono text-[11px] pr-1">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-slate-500 py-10 font-sans text-xs">
              Chưa có dữ liệu nhật ký phù hợp bộ lọc
            </p>
          ) : (
            filteredLogs.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2 leading-relaxed"
              >
                <span className="text-slate-500 shrink-0 font-sans">{formatTime(item.timestamp)}</span>

                {item.type === 'mqtt_in' && (
                  <span className="text-cyan-400 shrink-0 inline-flex items-center gap-0.5">
                    <ArrowDownLeft className="w-3 h-3" /> [IN]
                  </span>
                )}
                {item.type === 'mqtt_out' && (
                  <span className="text-emerald-400 shrink-0 inline-flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> [OUT]
                  </span>
                )}
                {item.type === 'alert' && (
                  <span className="text-rose-400 shrink-0 inline-flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> [LỖI]
                  </span>
                )}
                {item.type === 'warn' && (
                  <span className="text-amber-400 shrink-0 inline-flex items-center gap-0.5">
                    [CẢNH BÁO]
                  </span>
                )}
                {item.type === 'info' && (
                  <span className="text-sky-300 shrink-0 inline-flex items-center gap-0.5">
                    <Info className="w-3 h-3" /> [INFO]
                  </span>
                )}

                <span className="text-slate-300 shrink-0 font-sans text-[10px] bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                  {item.source}
                </span>

                <span className="text-slate-200 break-all">{item.message}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">Đang ghi nhật ký MQTT WebSocket</span>
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
