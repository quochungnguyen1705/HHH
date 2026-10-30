/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScheduleItem, Pump } from '../types';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Send, 
  Sparkles,
  Droplets
} from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  pumps: Pump[];
  schedules: ScheduleItem[];
  onAddSchedule: (schedule: Omit<ScheduleItem, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleSchedule: (id: string, enabled: boolean) => void;
  onSyncWithEsp32: () => void;
}

const DAYS_OF_WEEK = [
  { day: 1, label: 'T2' },
  { day: 2, label: 'T3' },
  { day: 3, label: 'T4' },
  { day: 4, label: 'T5' },
  { day: 5, label: 'T6' },
  { day: 6, label: 'T7' },
  { day: 0, label: 'CN' },
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  pumps,
  schedules,
  onAddSchedule,
  onDeleteSchedule,
  onToggleSchedule,
  onSyncWithEsp32,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [targetPumpId, setTargetPumpId] = useState<number>(1);
  const [scheduleTitle, setScheduleTitle] = useState('Tưới vườn sáng sớm');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('06:30');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return;
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const selectAllDays = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) return;

    onAddSchedule({
      pumpId: targetPumpId,
      title: scheduleTitle || `Lịch hẹn Bơm ${targetPumpId}`,
      startTime,
      endTime,
      daysOfWeek: selectedDays,
      enabled: true,
    });

    setShowAddForm(false);
    setScheduleTitle('Tưới tự động');
  };

  const getPumpName = (id: number) => {
    const p = pumps.find((item) => item.id === id);
    return p ? p.name : `Bơm ${id}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Lập Lịch Bật / Tắt Máy Bơm Tự Động
              </h2>
              <p className="text-xs text-slate-400">Cài đặt giờ bật tắt chu kỳ lặp lại cho 4 máy bơm</p>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm lịch hẹn mới</span>
            </button>

            <button
              type="button"
              onClick={onSyncWithEsp32}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all cursor-pointer"
              title="Đồng bộ lịch xuống bộ nhớ flash của ESP32 qua MQTT"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Đồng bộ ESP32 MQTT</span>
            </button>
          </div>

          {/* New Schedule Form */}
          {showAddForm && (
            <form onSubmit={handleSave} className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-500/50 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Thiết lập lịch hẹn mới
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mô tả lịch hẹn</label>
                <input
                  type="text"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder="Ví dụ: Bơm tưới vườn sáng sớm"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Chọn máy bơm</label>
                  <select
                    value={targetPumpId}
                    onChange={(e) => setTargetPumpId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {pumps.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900">
                        Bơm {p.id}: {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Giờ Bắt Đầu</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Giờ Kết Thúc</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Ngày lặp lại trong tuần</label>
                  <button
                    type="button"
                    onClick={selectAllDays}
                    className="text-[11px] text-cyan-400 hover:text-white"
                  >
                    Chọn cả tuần
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = selectedDays.includes(d.day);
                    return (
                      <button
                        type="button"
                        key={d.day}
                        onClick={() => toggleDay(d.day)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-md cursor-pointer"
                >
                  Lưu Lịch Hẹn
                </button>
              </div>
            </form>
          )}

          {/* Schedule List */}
          <div className="space-y-2.5">
            {schedules.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Chưa có lịch hẹn bật tắt nào</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Nhấn "Thêm lịch hẹn mới" để tự động hóa hoạt động của 4 máy bơm.
                </p>
              </div>
            ) : (
              schedules.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    item.enabled
                      ? 'bg-slate-950/80 border-slate-800 shadow-sm'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleSchedule(item.id, !item.enabled)}
                      className="cursor-pointer text-cyan-400 hover:text-cyan-300"
                    >
                      {item.enabled ? (
                        <ToggleRight className="w-8 h-8 text-cyan-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-600" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Bơm {item.pumpId}
                        </span>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 font-mono">
                        <span className="text-emerald-400 font-bold">{item.startTime}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-rose-400 font-bold">{item.endTime}</span>
                        <span className="text-slate-400 font-sans text-[11px]">
                          ({getPumpName(item.pumpId)})
                        </span>
                      </div>

                      {/* Days tags */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {DAYS_OF_WEEK.map((d) => {
                          const active = item.daysOfWeek.includes(d.day);
                          return (
                            <span
                              key={d.day}
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                active
                                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                                  : 'text-slate-600'
                              }`}
                            >
                              {d.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onDeleteSchedule(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Xóa lịch này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Tổng số: <strong className="text-white">{schedules.length}</strong> lịch hẹn</span>
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
