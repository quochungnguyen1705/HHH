/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Pump, 
  TelemetryData, 
  TelemetryPoint, 
  ScheduleItem, 
  MqttConfig, 
  UserAccount, 
  EventLog, 
  SafetyThresholds,
  ThemeColor
} from './types';
import { THEMES } from './themeContext';
import { mqttService, DEFAULT_MQTT_CONFIG } from './services/mqttService';
import { AuthScreen } from './components/AuthScreen';
import { AndroidFrame } from './components/AndroidFrame';
import { TelemetryGauges } from './components/TelemetryGauges';
import { PumpCard } from './components/PumpCard';
import { ScheduleModal } from './components/ScheduleModal';
import { MqttSettingsModal } from './components/MqttSettingsModal';
import { Esp32CodeModal } from './components/Esp32CodeModal';
import { SafetyModal } from './components/SafetyModal';
import { EventLogModal } from './components/EventLogModal';
import { ThemeModal } from './components/ThemeModal';

import { 
  Droplets, 
  Power, 
  Calendar, 
  Radio, 
  Cpu, 
  Activity, 
  FileText, 
  LogOut, 
  AlertOctagon, 
  Clock,
  Sparkles,
  Zap,
  Waves,
  Palette,
  Sun
} from 'lucide-react';

const INITIAL_PUMPS: Pump[] = [
  {
    id: 1,
    name: 'Bơm 1: Vườn Lan & Bonsai',
    location: 'Sân Vườn Trước & Giàn Phun Sương',
    plantType: 'orchid',
    state: false,
    ratedPowerW: 750,
    currentCurrentA: 3.2,
    flowRateLpm: 45,
    lastTurnedOn: null,
    runDurationSeconds: 1240,
    autoOffTimerMinutes: null,
    timerRemainingSeconds: null,
    gpioPin: 26,
  },
  {
    id: 2,
    name: 'Bơm 2: Vườn Rau & Thảo Mộc',
    location: 'Khu Trồng Hữu Cơ & Thủy Canh',
    plantType: 'vegetable',
    state: false,
    ratedPowerW: 650,
    currentCurrentA: 2.8,
    flowRateLpm: 40,
    lastTurnedOn: null,
    runDurationSeconds: 820,
    autoOffTimerMinutes: null,
    timerRemainingSeconds: null,
    gpioPin: 27,
  },
  {
    id: 3,
    name: 'Bơm 3: Cây Ăn Trái & Cỏ Sân',
    location: 'Bãi Cỏ & Vườn Cây Bán Kính Lớn',
    plantType: 'trees',
    state: false,
    ratedPowerW: 850,
    currentCurrentA: 3.6,
    flowRateLpm: 55,
    lastTurnedOn: null,
    runDurationSeconds: 2150,
    autoOffTimerMinutes: null,
    timerRemainingSeconds: null,
    gpioPin: 14,
  },
  {
    id: 4,
    name: 'Bơm 4: Hồ Cá Koi & Thác Nước',
    location: 'Hệ Lọc Sinh Thái & Tuần Hoàn Nước',
    plantType: 'pond',
    state: false,
    ratedPowerW: 950,
    currentCurrentA: 4.1,
    flowRateLpm: 65,
    lastTurnedOn: null,
    runDurationSeconds: 3410,
    autoOffTimerMinutes: null,
    timerRemainingSeconds: null,
    gpioPin: 12,
  },
];

const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch_1',
    pumpId: 1,
    title: 'Phun sương lan sáng sớm',
    startTime: '06:00',
    endTime: '06:20',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    enabled: true,
  },
  {
    id: 'sch_2',
    pumpId: 2,
    title: 'Tưới rau buổi chiều mát',
    startTime: '17:30',
    endTime: '17:50',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    enabled: true,
  },
  {
    id: 'sch_3',
    pumpId: 3,
    title: 'Tưới béc cỏ sân vườn',
    startTime: '16:00',
    endTime: '16:30',
    daysOfWeek: [2, 4, 6],
    enabled: false,
  },
];

const INITIAL_SAFETY: SafetyThresholds = {
  overVoltage: 242,
  underVoltage: 185,
  overCurrent: 14.5,
  maxContinuousRunMinutes: 120,
  autoCutoffEnabled: true,
};

export default function App() {
  // Authentication State
  const [user, setUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('aquapump_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Color Theme State (Ocean Aqua / Mint / Forest / Cyber)
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('aquapump_theme') as ThemeColor;
    return saved && THEMES[saved] ? saved : 'ocean'; // 'ocean' is the fresh new blue default!
  });
  const [showThemeModal, setShowThemeModal] = useState(false);

  // UI View Mode (Android phone frame vs Wide screen)
  const [isAndroidView, setIsAndroidView] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'telemetry' | 'esp32'>('home');

  // Pumps State
  const [pumps, setPumps] = useState<Pump[]>(() => {
    const saved = localStorage.getItem('aquapump_pumps_state');
    return saved ? JSON.parse(saved) : INITIAL_PUMPS;
  });

  // Schedules State
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('aquapump_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  // Safety Thresholds
  const [safetyThresholds, setSafetyThresholds] = useState<SafetyThresholds>(() => {
    const saved = localStorage.getItem('aquapump_safety');
    return saved ? JSON.parse(saved) : INITIAL_SAFETY;
  });

  // Telemetry State
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    voltage: 221.8,
    current: 0.08,
    power: 16,
    energyKWh: 3.42,
    frequency: 50.0,
    powerFactor: 0.92,
    timestamp: Date.now(),
    esp32Online: true,
    rssi: -58,
  });

  const [history, setHistory] = useState<TelemetryPoint[]>([]);

  // MQTT Config & Connection
  const [mqttConfig, setMqttConfig] = useState<MqttConfig>(() => {
    const saved = localStorage.getItem('aquapump_mqtt_cfg');
    return saved ? JSON.parse(saved) : DEFAULT_MQTT_CONFIG;
  });

  const [mqttStatus, setMqttStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connecting');
  const [mqttError, setMqttError] = useState<string | undefined>(undefined);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);

  // Modals Visibility
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMqttModal, setShowMqttModal] = useState(false);
  const [showEsp32CodeModal, setShowEsp32CodeModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // System Time string
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');

  // Active theme object
  const activeTheme = THEMES[currentTheme] || THEMES.ocean;

  // Keep ref for active pump states
  const pumpsRef = useRef(pumps);
  pumpsRef.current = pumps;

  // Initialize MQTT & Event listeners
  useEffect(() => {
    mqttService.updateConfig(mqttConfig);
    mqttService.connect();

    const unsubStatus = mqttService.onStatus((status, msg) => {
      setMqttStatus(status);
      setMqttError(msg);
    });

    const unsubTelemetry = mqttService.onTelemetry((newData) => {
      setTelemetry((prev) => {
        const updated = { ...prev, ...newData };

        const d = new Date();
        const timeLabel = `${d.getMinutes()}:${d.getSeconds() < 10 ? '0' : ''}${d.getSeconds()}`;
        setHistory((hist) => {
          const next = [...hist, {
            time: timeLabel,
            voltage: updated.voltage,
            current: updated.current,
            power: updated.power,
          }];
          if (next.length > 35) next.shift();
          return next;
        });

        return updated;
      });
    });

    const unsubPump = mqttService.onPumpState((pumpId, state) => {
      setPumps((prevPumps) =>
        prevPumps.map((p) => {
          if (p.id === pumpId) {
            return {
              ...p,
              state,
              lastTurnedOn: state ? Date.now() : p.lastTurnedOn,
              timerRemainingSeconds: state ? p.timerRemainingSeconds : null,
            };
          }
          return p;
        })
      );
    });

    const unsubLog = mqttService.onLog((log) => {
      setEventLogs((prev) => [log, ...prev].slice(0, 80));
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubPump();
      unsubLog();
    };
  }, []);

  // Update simulator with current pump active states
  useEffect(() => {
    const states = pumps.map((p) => p.state);
    mqttService.setSimulatorPumpsState(states);
    localStorage.setItem('aquapump_pumps_state', JSON.stringify(pumps));
  }, [pumps]);

  // Clock & Countdown & Schedule Runner
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      setCurrentTimeStr(`${hours}:${minutes}:${now.getSeconds().toString().padStart(2, '0')}`);
      const currentDay = now.getDay();

      // 1. Check countdown timers on each pump
      setPumps((prev) =>
        prev.map((pump) => {
          let newRemaining = pump.timerRemainingSeconds;
          let newState = pump.state;
          let newRunSec = pump.runDurationSeconds;

          if (pump.state) {
            newRunSec += 1;
          }

          if (pump.timerRemainingSeconds !== null && pump.timerRemainingSeconds > 0) {
            newRemaining = pump.timerRemainingSeconds - 1;
            if (newRemaining <= 0) {
              newState = false;
              newRemaining = null;
              mqttService.publishPumpControl(pump.id, false, pump.name);
            }
          }

          return {
            ...pump,
            state: newState,
            runDurationSeconds: newRunSec,
            timerRemainingSeconds: newRemaining,
          };
        })
      );

      // 2. Check scheduled times
      if (now.getSeconds() === 0) {
        schedules.forEach((sch) => {
          if (!sch.enabled) return;
          if (!sch.daysOfWeek.includes(currentDay)) return;

          const targetPump = pumpsRef.current.find((p) => p.id === sch.pumpId);
          if (!targetPump) return;

          if (sch.startTime === currentTime && !targetPump.state) {
            handleTogglePump(sch.pumpId, true);
          } else if (sch.endTime === currentTime && targetPump.state) {
            handleTogglePump(sch.pumpId, false);
          }
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [schedules]);

  // Safety Watchdog
  useEffect(() => {
    if (!safetyThresholds.autoCutoffEnabled) return;

    const anyPumpRunning = pumps.some((p) => p.state);
    if (!anyPumpRunning) return;

    if (telemetry.voltage > safetyThresholds.overVoltage) {
      mqttService.publishEmergencyStop();
      alert(`⚠️ HỆ THỐNG AN TOÀN ĐÃ NGẮT: Điện áp quá cao (${telemetry.voltage}V > ${safetyThresholds.overVoltage}V) để bảo vệ động cơ!`);
    } else if (telemetry.voltage < safetyThresholds.underVoltage) {
      mqttService.publishEmergencyStop();
      alert(`⚠️ HỆ THỐNG AN TOÀN ĐÃ NGẮT: Sụt áp nguy hiểm (${telemetry.voltage}V < ${safetyThresholds.underVoltage}V)!`);
    } else if (telemetry.current > safetyThresholds.overCurrent) {
      mqttService.publishEmergencyStop();
      alert(`⚠️ HỆ THỐNG AN TOÀN ĐÃ NGẮT: Quá tải dòng điện (${telemetry.current}A > ${safetyThresholds.overCurrent}A)!`);
    }
  }, [telemetry.voltage, telemetry.current, safetyThresholds, pumps]);

  // Handlers
  const handleTogglePump = useCallback((pumpId: number, newState: boolean) => {
    const target = pumpsRef.current.find((p) => p.id === pumpId);
    setPumps((prev) =>
      prev.map((p) => {
        if (p.id === pumpId) {
          return {
            ...p,
            state: newState,
            lastTurnedOn: newState ? Date.now() : p.lastTurnedOn,
            timerRemainingSeconds: newState ? p.timerRemainingSeconds : null,
          };
        }
        return p;
      })
    );

    mqttService.publishPumpControl(pumpId, newState, target?.name);
  }, []);

  const handleSetCountdownTimer = useCallback((pumpId: number, minutes: number | null) => {
    setPumps((prev) =>
      prev.map((p) => {
        if (p.id === pumpId) {
          const seconds = minutes !== null ? minutes * 60 : null;
          const shouldTurnOn = minutes !== null && !p.state;
          if (shouldTurnOn) {
            mqttService.publishPumpControl(pumpId, true, p.name);
          }
          return {
            ...p,
            state: shouldTurnOn ? true : p.state,
            autoOffTimerMinutes: minutes,
            timerRemainingSeconds: seconds,
          };
        }
        return p;
      })
    );
  }, []);

  const handleUpdatePumpInfo = useCallback((pumpId: number, name: string, location: string, powerW: number) => {
    setPumps((prev) =>
      prev.map((p) => (p.id === pumpId ? { ...p, name, location, ratedPowerW: powerW } : p))
    );
  }, []);

  const handleEmergencyStopAll = useCallback(() => {
    mqttService.publishEmergencyStop();
    setPumps((prev) => prev.map((p) => ({ ...p, state: false, timerRemainingSeconds: null })));
  }, []);

  const handleTurnAllOn = useCallback(() => {
    pumps.forEach((p, idx) => {
      setTimeout(() => {
        handleTogglePump(p.id, true);
      }, idx * 250);
    });
  }, [pumps, handleTogglePump]);

  const handleTurnAllOff = useCallback(() => {
    pumps.forEach((p) => {
      handleTogglePump(p.id, false);
    });
  }, [pumps, handleTogglePump]);

  // Schedule Handlers
  const handleAddSchedule = useCallback((newSch: Omit<ScheduleItem, 'id'>) => {
    const item: ScheduleItem = {
      ...newSch,
      id: 'sch_' + Math.random().toString(36).substring(2, 8),
    };
    setSchedules((prev) => {
      const updated = [...prev, item];
      localStorage.setItem('aquapump_schedules', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleDeleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem('aquapump_schedules', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleToggleSchedule = useCallback((id: string, enabled: boolean) => {
    setSchedules((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, enabled } : s));
      localStorage.setItem('aquapump_schedules', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSyncSchedulesWithEsp32 = useCallback(() => {
    const payload = JSON.stringify({
      action: 'SYNC_SCHEDULES',
      count: schedules.length,
      schedules: schedules.filter((s) => s.enabled),
    });
    mqttService.publishSchedule(payload);
    alert('Đã gửi cấu hình lịch hẹn lên ESP32 qua topic: ' + mqttConfig.scheduleTopic);
  }, [schedules, mqttConfig.scheduleTopic]);

  const handleSaveMqttConfig = useCallback((newConfig: MqttConfig) => {
    setMqttConfig(newConfig);
    localStorage.setItem('aquapump_mqtt_cfg', JSON.stringify(newConfig));
    mqttService.updateConfig(newConfig);
  }, []);

  const handleSaveSafetyThresholds = useCallback((thresholds: SafetyThresholds) => {
    setSafetyThresholds(thresholds);
    localStorage.setItem('aquapump_safety', JSON.stringify(thresholds));
  }, []);

  const handleSelectTheme = (themeId: ThemeColor) => {
    setCurrentTheme(themeId);
    localStorage.setItem('aquapump_theme', themeId);
  };

  const handleLogout = () => {
    localStorage.removeItem('aquapump_auth_user');
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onLoginSuccess={setUser} />;
  }

  const activePumpsCount = pumps.filter((p) => p.state).length;
  const totalWaterToday = pumps.reduce((acc, p) => acc + Math.round((p.runDurationSeconds / 60) * p.flowRateLpm), 0);

  return (
    <AndroidFrame
      isAndroidView={isAndroidView}
      onToggleView={() => setIsAndroidView(!isAndroidView)}
      systemTime={currentTimeStr.substring(0, 5)}
      theme={activeTheme}
      onOpenThemeModal={() => setShowThemeModal(true)}
    >
      <div className="flex flex-col min-h-full">
        {/* App Top Bar */}
        <header className="px-4 pt-3 pb-2.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/25 border border-cyan-300/40">
                <Droplets className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black tracking-tight text-white">
                    AquaPump IoT
                  </h1>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono">
                    ESP32
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Chào,</span>
                  <strong className="text-white">{user.name}</strong>
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-1.5">
              {/* Palette button to switch blue/green shades */}
              <button
                type="button"
                onClick={() => setShowThemeModal(true)}
                className="p-1.5 rounded-xl bg-slate-900 text-cyan-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-cyan-500/30"
                title="Đổi tông màu xanh"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* MQTT Status pill */}
              <button
                type="button"
                onClick={() => setShowMqttModal(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  mqttStatus === 'connected'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                    : mqttStatus === 'connecting'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
                title="Cài đặt kết nối MQTT"
              >
                <Radio className="w-3 h-3" />
                <span>{mqttStatus === 'connected' ? 'MQTT LIVE' : 'DISCONNECTED'}</span>
              </button>

              {/* Logs */}
              <button
                type="button"
                onClick={() => setShowLogsModal(true)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
                title="Nhật ký MQTT & Hệ thống"
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer border border-slate-800"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Sub-header */}
          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>Đang bật:</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md font-extrabold text-xs ${
                activePumpsCount > 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400'
              }`}>
                {activePumpsCount} / 4 Máy Bơm
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTurnAllOff}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer border border-slate-800"
              >
                Tắt tất cả
              </button>
              <button
                type="button"
                onClick={handleEmergencyStopAll}
                className="px-2.5 py-1 text-[11px] font-extrabold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white rounded-lg shadow-sm shadow-rose-600/30 flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>NGẮT KHẨN CẤP</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation Pill Bar */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 sticky top-[95px] z-20 backdrop-blur-md">
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'home'
                  ? `${activeTheme.buttonGradient} text-white shadow-md shadow-cyan-500/25`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>4 Máy Bơm</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'telemetry'
                  ? `${activeTheme.buttonGradient} text-white shadow-md shadow-cyan-500/25`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Điện Áp</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'schedule'
                  ? `${activeTheme.buttonGradient} text-white shadow-md shadow-cyan-500/25`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Hẹn Giờ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('esp32')}
              className={`py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'esp32'
                  ? `${activeTheme.buttonGradient} text-white shadow-md shadow-cyan-500/25`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>ESP32</span>
            </button>
          </div>
        </div>

        {/* Main Body per Tab */}
        <main className="p-3.5 sm:p-4 space-y-4 flex-1">
          {/* TAB 1: HOME (Pump Controls + Mini Telemetry Header) */}
          {activeTab === 'home' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Telemetry Overview Card */}
              <TelemetryGauges
                telemetry={telemetry}
                history={history}
                thresholds={safetyThresholds}
                mqttStatus={mqttStatus}
                isSimulator={mqttConfig.useSimulator}
                onOpenSafetyModal={() => setShowSafetyModal(true)}
                theme={activeTheme}
              />

              {/* 4 Pumps Section Title */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    Điều Khiển 4 Máy Bơm Nước
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Lịch hẹn ({schedules.filter((s) => s.enabled).length})</span>
                </button>
              </div>

              {/* 4 Pump Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {pumps.map((pump) => (
                  <PumpCard
                    key={pump.id}
                    pump={pump}
                    onToggle={handleTogglePump}
                    onSetCountdownTimer={handleSetCountdownTimer}
                    onUpdatePumpInfo={handleUpdatePumpInfo}
                    theme={activeTheme}
                  />
                ))}
              </div>

              {/* Quick Summary Actions */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Tổng nước đã bơm hôm nay: <strong className="text-white font-mono">{totalWaterToday} Lít</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTurnAllOn}
                    className="px-3 py-1.5 bg-cyan-600/25 text-cyan-300 hover:bg-cyan-600/35 border border-cyan-500/40 rounded-xl font-bold cursor-pointer"
                  >
                    Bật cả 4 bơm
                  </button>
                  <button
                    type="button"
                    onClick={handleTurnAllOff}
                    className="px-3 py-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 rounded-xl font-bold cursor-pointer"
                  >
                    Tắt toàn bộ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Giám Sát Điện Áp & Dòng Điện ESP32
                  </h2>
                  <p className="text-xs text-slate-400">Thông số điện lưới và cảm biến PZEM / ACS712 gửi qua MQTT</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSafetyModal(true)}
                  className="px-3 py-1.5 bg-slate-900 text-cyan-300 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Ngưỡng An Toàn
                </button>
              </div>

              <TelemetryGauges
                telemetry={telemetry}
                history={history}
                thresholds={safetyThresholds}
                mqttStatus={mqttStatus}
                isSimulator={mqttConfig.useSimulator}
                onOpenSafetyModal={() => setShowSafetyModal(true)}
                theme={activeTheme}
              />

              {/* Detailed Breakdown per pump */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 backdrop-blur-md">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  Ước tính tải & dòng điện từng máy bơm
                </h3>
                <div className="space-y-2 text-xs">
                  {pumps.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${p.state ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`} />
                        <div>
                          <p className="font-bold text-white">Bơm {p.id}: {p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">GPIO {p.gpioPin} • {p.ratedPowerW}W • {p.flowRateLpm} L/p</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold ${p.state ? 'text-cyan-400' : 'text-slate-500'}`}>
                          {p.state ? `${p.currentCurrentA} A` : '0.0 A'}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {p.state ? `${Math.round(p.ratedPowerW * 0.95)} W` : 'Tắt'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    Cài Đặt Thời Gian Bật / Tắt Tự Động
                  </h2>
                  <p className="text-xs text-slate-400">Lập lịch chu kỳ tự động và hẹn giờ đếm ngược cho 4 máy bơm</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className={`px-3 py-1.5 ${activeTheme.buttonGradient} text-white rounded-xl text-xs font-bold shadow-md cursor-pointer`}
                >
                  + Thêm lịch mới
                </button>
              </div>

              {/* List of active schedules */}
              <div className="space-y-2.5">
                {schedules.map((sch) => {
                  return (
                    <div
                      key={sch.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        sch.enabled ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-950/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
                              Bơm {sch.pumpId}
                            </span>
                            <span className="text-xs font-bold text-white">{sch.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 font-mono text-sm">
                            <span className="text-emerald-400 font-bold">{sch.startTime}</span>
                            <span className="text-slate-500">→</span>
                            <span className="text-rose-400 font-bold">{sch.endTime}</span>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sch.enabled}
                            onChange={(e) => handleToggleSchedule(sch.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 border border-slate-700"></div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sync Button */}
              <button
                type="button"
                onClick={handleSyncSchedulesWithEsp32}
                className="w-full py-3 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Đồng bộ danh sách lịch này xuống vi điều khiển ESP32</span>
              </button>
            </div>
          )}

          {/* TAB 4: ESP32 & MQTT SETTINGS */}
          {activeTab === 'esp32' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  Liên Kết MQTT & Mã Nguồn ESP32
                </h2>
                <p className="text-xs text-slate-400">Kết nối máy chủ Broker và nạp code cho bo mạch</p>
              </div>

              {/* MQTT Configuration Card */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Máy chủ MQTT Broker hiện tại</p>
                    <p className="text-[11px] font-mono text-cyan-400 truncate mt-0.5">{mqttConfig.brokerUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMqttModal(true)}
                    className={`px-3 py-1.5 ${activeTheme.buttonGradient} text-white rounded-xl text-xs font-bold cursor-pointer`}
                  >
                    Cấu hình
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Topic Lệnh tưới:</span>
                    <span className="font-mono text-slate-200 font-semibold">{mqttConfig.controlTopic}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Topic Điện áp & Dòng:</span>
                    <span className="font-mono text-slate-200 font-semibold">{mqttConfig.telemetryTopic}</span>
                  </div>
                </div>

                {/* Simulator switch reminder */}
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between">
                  <span className="text-xs text-cyan-200 font-medium">Bộ mô phỏng ESP32 ảo đang:</span>
                  <span className={`text-xs font-bold ${mqttConfig.useSimulator ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {mqttConfig.useSimulator ? 'BẬT (Đang test mượt mà)' : 'TẮT (Chỉ nhận ESP32 thật)'}
                  </span>
                </div>
              </div>

              {/* Theme Customizer Card Banner */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    Đổi Tông Màu Xanh Giao Diện
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Đang chọn: <strong className="text-cyan-300">{activeTheme.name}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowThemeModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Đổi màu &gt;
                </button>
              </div>

              {/* Code Generator & Wiring Button */}
              <button
                type="button"
                onClick={() => setShowEsp32CodeModal(true)}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-between cursor-pointer group text-left shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      Mã Nguồn ESP32 Arduino C++
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Sao chép code hoàn chỉnh 4 Relay + Cảm biến PZEM nạp bằng Arduino IDE
                    </p>
                  </div>
                </div>
                <span className="text-cyan-400 font-bold text-xs">Xem code &gt;</span>
              </button>

              {/* Terminal Logs button */}
              <button
                type="button"
                onClick={() => setShowLogsModal(true)}
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs text-slate-300 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Xem gói tin MQTT IN/OUT thời gian thực ({eventLogs.length})</span>
                </span>
                <span className="text-slate-500">Mở &gt;</span>
              </button>
            </div>
          )}
        </main>

        {/* Modals */}
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          pumps={pumps}
          schedules={schedules}
          onAddSchedule={handleAddSchedule}
          onDeleteSchedule={handleDeleteSchedule}
          onToggleSchedule={handleToggleSchedule}
          onSyncWithEsp32={handleSyncSchedulesWithEsp32}
        />

        <MqttSettingsModal
          isOpen={showMqttModal}
          onClose={() => setShowMqttModal(false)}
          config={mqttConfig}
          status={mqttStatus}
          errorMessage={mqttError}
          onSaveConfig={handleSaveMqttConfig}
          onReconnect={() => {
            mqttService.disconnect();
            mqttService.connect();
          }}
        />

        <Esp32CodeModal
          isOpen={showEsp32CodeModal}
          onClose={() => setShowEsp32CodeModal(false)}
          config={mqttConfig}
        />

        <SafetyModal
          isOpen={showSafetyModal}
          onClose={() => setShowSafetyModal(false)}
          thresholds={safetyThresholds}
          onSave={handleSaveSafetyThresholds}
        />

        <EventLogModal
          isOpen={showLogsModal}
          onClose={() => setShowLogsModal(false)}
          logs={eventLogs}
          onClearLogs={() => setEventLogs([])}
        />

        <ThemeModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
        />
      </div>
    </AndroidFrame>
  );
}
