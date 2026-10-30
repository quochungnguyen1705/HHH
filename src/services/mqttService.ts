/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mqtt, { MqttClient } from 'mqtt';
import { MqttConfig, TelemetryData, EventLog } from '../types';

export type MessageCallback = (topic: string, message: string) => void;
export type TelemetryCallback = (data: Partial<TelemetryData>) => void;
export type PumpStateCallback = (pumpId: number, state: boolean) => void;
export type StatusCallback = (status: 'connected' | 'connecting' | 'disconnected' | 'error', errorMsg?: string) => void;
export type LogCallback = (log: EventLog) => void;

class MqttService {
  private client: MqttClient | null = null;
  private config: MqttConfig;
  private statusListeners: Set<StatusCallback> = new Set();
  private telemetryListeners: Set<TelemetryCallback> = new Set();
  private pumpStateListeners: Set<PumpStateCallback> = new Set();
  private logListeners: Set<LogCallback> = new Set();
  private simulatorTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private simulatedEnergy: number = 2.45; // Starting kWh

  constructor(initialConfig: MqttConfig) {
    this.config = initialConfig;
  }

  public updateConfig(newConfig: MqttConfig) {
    const brokerChanged = this.config.brokerUrl !== newConfig.brokerUrl ||
                          this.config.username !== newConfig.username ||
                          this.config.password !== newConfig.password;
    this.config = newConfig;

    if (brokerChanged) {
      this.disconnect();
      this.connect();
    }

    if (this.config.useSimulator) {
      this.startSimulator();
    } else {
      this.stopSimulator();
    }
  }

  public getConfig(): MqttConfig {
    return { ...this.config };
  }

  public onStatus(cb: StatusCallback) {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  public onTelemetry(cb: TelemetryCallback) {
    this.telemetryListeners.add(cb);
    return () => this.telemetryListeners.delete(cb);
  }

  public onPumpState(cb: PumpStateCallback) {
    this.pumpStateListeners.add(cb);
    return () => this.pumpStateListeners.delete(cb);
  }

  public onLog(cb: LogCallback) {
    this.logListeners.add(cb);
    return () => this.logListeners.delete(cb);
  }

  private notifyStatus(status: 'connected' | 'connecting' | 'disconnected' | 'error', msg?: string) {
    this.statusListeners.forEach((cb) => cb(status, msg));
  }

  private notifyLog(type: EventLog['type'], message: string, source = 'MQTT') {
    const log: EventLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      type,
      message,
      source,
    };
    this.logListeners.forEach((cb) => cb(log));
  }

  public connect() {
    if (this.client && this.client.connected) {
      this.notifyStatus('connected');
      return;
    }

    this.isConnecting = true;
    this.notifyStatus('connecting');
    this.notifyLog('info', `Đang kết nối tới MQTT Broker: ${this.config.brokerUrl}...`, 'Hệ thống');

    try {
      const options: mqtt.IClientOptions = {
        clientId: this.config.clientId || `aquapump_${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: this.config.autoReconnect ? 4000 : 0,
      };

      if (this.config.username) options.username = this.config.username;
      if (this.config.password) options.password = this.config.password;

      this.client = mqtt.connect(this.config.brokerUrl, options);

      this.client.on('connect', () => {
        this.isConnecting = false;
        this.notifyStatus('connected');
        this.notifyLog('info', `Đã kết nối thành công tới ${this.config.brokerUrl}`, 'MQTT Broker');

        // Subscribe topics
        const topics = [
          this.config.telemetryTopic,
          this.config.statusTopic,
          this.config.controlTopic,
          `${this.config.controlTopic}/response`,
        ];

        topics.forEach((topic) => {
          this.client?.subscribe(topic, (err) => {
            if (!err) {
              this.notifyLog('mqtt_in', `Subscribed topic: ${topic}`, 'MQTT');
            }
          });
        });
      });

      this.client.on('message', (topic, payload) => {
        const msgStr = payload.toString();
        this.notifyLog('mqtt_in', `[${topic}] ${msgStr}`, 'ESP32 MQTT');
        this.handleIncomingMessage(topic, msgStr);
      });

      this.client.on('error', (err) => {
        this.isConnecting = false;
        this.notifyStatus('error', err.message);
        this.notifyLog('alert', `Lỗi MQTT: ${err.message}`, 'MQTT');
      });

      this.client.on('close', () => {
        this.notifyStatus('disconnected');
      });

      this.client.on('offline', () => {
        this.notifyStatus('disconnected', 'Mất kết nối MQTT Broker');
      });
    } catch (e: any) {
      this.isConnecting = false;
      this.notifyStatus('error', e.message);
      this.notifyLog('alert', `Không thể khởi tạo MQTT: ${e.message}`, 'Hệ thống');
    }

    if (this.config.useSimulator) {
      this.startSimulator();
    }
  }

  public disconnect() {
    this.stopSimulator();
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {
        // ignore
      }
      this.client = null;
    }
    this.notifyStatus('disconnected');
    this.notifyLog('info', 'Đã ngắt kết nối MQTT Broker', 'Hệ thống');
  }

  public publishPumpControl(pumpId: number, state: boolean, pumpName?: string) {
    const payload = JSON.stringify({
      pump: pumpId,
      action: state ? 'ON' : 'OFF',
      timestamp: Date.now(),
      sender: 'AquaPump_Android_App',
    });

    this.notifyLog(
      'mqtt_out',
      `Gửi lệnh ${state ? 'BẬT' : 'TẮT'} Máy Bơm ${pumpId} (${pumpName || ''}) -> Topic: ${this.config.controlTopic}`,
      'Điều khiển'
    );

    if (this.client && this.client.connected) {
      this.client.publish(this.config.controlTopic, payload, { qos: 1 });
    }

    // In simulator mode, also immediately mirror state
    if (this.config.useSimulator) {
      setTimeout(() => {
        this.pumpStateListeners.forEach((cb) => cb(pumpId, state));
      }, 150);
    }
  }

  public publishEmergencyStop() {
    const payload = JSON.stringify({
      action: 'EMERGENCY_STOP',
      allPumps: 'OFF',
      timestamp: Date.now(),
    });

    this.notifyLog('alert', `GỬI LỆNH DỪNG KHẨN CẤP TẤT CẢ MÁY BƠM!`, 'Bảo vệ an toàn');

    if (this.client && this.client.connected) {
      this.client.publish(this.config.controlTopic, payload, { qos: 1 });
    }

    for (let i = 1; i <= 4; i++) {
      this.pumpStateListeners.forEach((cb) => cb(i, false));
    }
  }

  public publishSchedule(scheduleJson: string) {
    if (this.client && this.client.connected) {
      this.client.publish(this.config.scheduleTopic, scheduleJson, { qos: 1, retain: true });
      this.notifyLog('mqtt_out', `Đã đồng bộ lịch hẹn lên ESP32 (${this.config.scheduleTopic})`, 'Lập lịch');
    }
  }

  private handleIncomingMessage(topic: string, message: string) {
    try {
      if (topic === this.config.statusTopic) {
        const isOnline = message.toLowerCase().includes('online') || message.includes('1');
        this.telemetryListeners.forEach((cb) => cb({ esp32Online: isOnline }));
        return;
      }

      if (topic === this.config.telemetryTopic) {
        const data = JSON.parse(message);
        // Supports formats:
        // { "voltage": 223.4, "current": 3.4, "power": 750, "energy": 2.5, "pumps": [1, 0, 1, 0] }
        // or { "v": 223.4, "i": 3.4, "p": 750, ... }
        const voltage = typeof data.voltage === 'number' ? data.voltage : (typeof data.v === 'number' ? data.v : 220);
        const current = typeof data.current === 'number' ? data.current : (typeof data.i === 'number' ? data.i : 0);
        const power = typeof data.power === 'number' ? data.power : (typeof data.p === 'number' ? data.p : Math.round(voltage * current * 0.9));
        const energyKWh = typeof data.energy === 'number' ? data.energy : (typeof data.kwh === 'number' ? data.kwh : undefined);

        this.telemetryListeners.forEach((cb) =>
          cb({
            voltage,
            current,
            power,
            energyKWh,
            timestamp: Date.now(),
            esp32Online: true,
          })
        );

        if (Array.isArray(data.pumps)) {
          data.pumps.forEach((state: number | boolean, index: number) => {
            const pumpId = index + 1;
            const isOn = Boolean(state);
            this.pumpStateListeners.forEach((cb) => cb(pumpId, isOn));
          });
        }
      } else if (topic === this.config.controlTopic || topic === `${this.config.controlTopic}/response`) {
        const data = JSON.parse(message);
        if (data.pump && data.action) {
          const isOn = data.action === 'ON';
          this.pumpStateListeners.forEach((cb) => cb(Number(data.pump), isOn));
        }
      }
    } catch (err) {
      // Plain text or unparseable format
      console.warn('Could not parse MQTT message payload as JSON:', message);
    }
  }

  // Built-in ESP32 Simulator for testing without physical board
  private activePumpsRef: boolean[] = [false, false, false, false];

  public setSimulatorPumpsState(states: boolean[]) {
    this.activePumpsRef = states;
  }

  private startSimulator() {
    if (this.simulatorTimer) return;

    this.notifyLog('info', 'Khởi chạy bộ mô phỏng ESP32 ảo (Virtual ESP32 Simulator)', 'Mô phỏng');

    this.simulatorTimer = setInterval(() => {
      // Calculate realistic grid voltage fluctuation: 218V - 224V
      const baseVoltage = 221.5;
      const noise = (Math.random() - 0.5) * 2.2;
      const voltage = Math.round((baseVoltage + noise) * 10) / 10;

      // Base standby current (ESP32 + Relays board): ~0.06A
      let totalCurrent = 0.06;

      // Pump 1: ~3.2A (700W)
      // Pump 2: ~2.8A (600W)
      // Pump 3: ~3.6A (800W)
      // Pump 4: ~4.1A (900W)
      const pumpCurrents = [3.2, 2.8, 3.6, 4.1];
      this.activePumpsRef.forEach((isOn, idx) => {
        if (isOn) {
          const pumpNoise = (Math.random() - 0.5) * 0.15;
          totalCurrent += pumpCurrents[idx] + pumpNoise;
        }
      });

      totalCurrent = Math.round(totalCurrent * 100) / 100;
      const power = Math.round(voltage * totalCurrent * 0.92);

      // Energy accumulation: kWh = power (W) * (1 sec / 3600s) / 1000
      this.simulatedEnergy += (power * 1) / (3600 * 1000);
      const roundedEnergy = Math.round(this.simulatedEnergy * 1000) / 1000;

      this.telemetryListeners.forEach((cb) =>
        cb({
          voltage,
          current: totalCurrent,
          power,
          energyKWh: roundedEnergy,
          frequency: 50.0 + (Math.random() - 0.5) * 0.1,
          powerFactor: 0.92,
          timestamp: Date.now(),
          esp32Online: true,
          rssi: -58 - Math.floor(Math.random() * 8),
        })
      );
    }, 1200);
  }

  private stopSimulator() {
    if (this.simulatorTimer) {
      clearInterval(this.simulatorTimer);
      this.simulatorTimer = null;
    }
  }
}

export const DEFAULT_MQTT_CONFIG: MqttConfig = {
  // Free public WebSocket broker with SSL support
  brokerUrl: 'wss://broker.emqx.io:8084/mqtt',
  clientId: `aquapump_user_${Math.random().toString(36).substring(2, 7)}`,
  username: '',
  password: '',
  controlTopic: 'esp32/pump/control',
  telemetryTopic: 'esp32/telemetry',
  statusTopic: 'esp32/status',
  scheduleTopic: 'esp32/pump/schedule',
  autoReconnect: true,
  useSimulator: true, // Enabled by default so user immediately gets live data
};

export const mqttService = new MqttService(DEFAULT_MQTT_CONFIG);
