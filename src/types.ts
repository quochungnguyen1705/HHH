/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pump {
  id: number; // 1, 2, 3, 4
  name: string;
  location: string;
  plantType?: 'orchid' | 'vegetable' | 'trees' | 'pond';
  state: boolean; // true = ON, false = OFF
  ratedPowerW: number; // e.g. 750W (1HP)
  currentCurrentA: number; // live current draw
  flowRateLpm: number; // liters per minute estimate
  waterLitersAccumulated?: number; // total liters pumped
  lastTurnedOn: number | null; // timestamp
  runDurationSeconds: number; // accumulated running duration
  autoOffTimerMinutes: number | null; // Countdown timer
  timerRemainingSeconds: number | null;
  gpioPin: number; // Default ESP32 GPIO (e.g., 26, 27, 14, 12)
}

export interface TelemetryData {
  voltage: number; // V (e.g. 220.5)
  current: number; // Total A (e.g. 3.42)
  power: number; // W
  energyKWh: number; // kWh accumulated
  frequency: number; // Hz (50.0)
  powerFactor: number; // cos phi (e.g. 0.92)
  timestamp: number;
  esp32Online: boolean;
  rssi?: number; // WiFi signal dBm
}

export interface TelemetryPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
}

export interface ScheduleItem {
  id: string;
  pumpId: number;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  daysOfWeek: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  enabled: boolean;
}

export interface MqttConfig {
  brokerUrl: string; // e.g. "wss://broker.emqx.io:8084/mqtt"
  clientId: string;
  username: string;
  password: string;
  controlTopic: string; // e.g. "esp32/pump/control"
  telemetryTopic: string; // e.g. "esp32/telemetry"
  statusTopic: string; // e.g. "esp32/status"
  scheduleTopic: string; // e.g. "esp32/pump/schedule"
  autoReconnect: boolean;
  useSimulator: boolean; // When true, virtual ESP32 emits simulated live telemetry
}

export interface UserAccount {
  email: string;
  name: string;
  role: string;
  avatarSeed: string;
  token?: string;
}

export interface EventLog {
  id: string;
  timestamp: number;
  type: 'info' | 'warn' | 'alert' | 'mqtt_in' | 'mqtt_out' | 'pump_change';
  message: string;
  source: string;
}

export interface SafetyThresholds {
  overVoltage: number; // e.g. 245V
  underVoltage: number; // e.g. 185V
  overCurrent: number; // e.g. 15A
  maxContinuousRunMinutes: number; // e.g. 120 mins
  autoCutoffEnabled: boolean;
}

export type ThemeColor = 'ocean' | 'mint' | 'forest' | 'cyber';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  badge: string;
  desc: string;
  primaryClass: string;
  gradientBg: string;
  cardBg: string;
  borderClass: string;
  accentText: string;
  buttonGradient: string;
}

