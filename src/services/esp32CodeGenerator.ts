/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MqttConfig } from '../types';

export function generateEsp32ArduinoCode(
  config: MqttConfig,
  wifiSsid = 'YOUR_WIFI_SSID',
  wifiPass = 'YOUR_WIFI_PASSWORD'
): string {
  // Extract host & port from brokerUrl
  // e.g. "wss://broker.emqx.io:8084/mqtt" or "mqtt://192.168.1.100:1883"
  let host = 'broker.emqx.io';
  let port = 1883;

  try {
    const url = new URL(config.brokerUrl.replace('wss://', 'https://').replace('ws://', 'http://'));
    host = url.hostname;
    // Standard TCP MQTT port for ESP32 PubSubClient is usually 1883 (or 8883 for TLS)
    port = 1883;
  } catch (e) {
    // fallback
  }

  return `/*
 ====================================================================
  AQUAPUMP IOT - ESP32 4-PUMP CONTROLLER & TELEMETRY FIRMWARE
  - 4 Relay Outputs: GPIO 26, 27, 14, 12 (Active LOW / HIGH)
  - Telemetry: Voltage & Current (PZEM-004T v3.0 or ACS712 / ZMPT101B)
  - Protocol: MQTT (PubSubClient + ArduinoJson)
 ====================================================================
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// --- CẤU HÌNH WIFI ---
const char* ssid = "${wifiSsid}";
const char* password = "${wifiPass}";

// --- CẤU HÌNH MQTT BROKER (TCP 1883) ---
const char* mqtt_server = "${host}";
const int mqtt_port = ${port};
const char* mqtt_user = "${config.username}";
const char* mqtt_pass = "${config.password}";

// TOPICS
const char* topic_control   = "${config.controlTopic}";       // App -> ESP32: Bật / Tắt bơm
const char* topic_telemetry = "${config.telemetryTopic}";     // ESP32 -> App: Điện áp & Dòng điện
const char* topic_status    = "${config.statusTopic}";        // ESP32 -> App: "online"

// --- KHAI BÁO CHÂN RELAY CHO 4 MÁY BƠM ---
#define PUMP1_PIN 26
#define PUMP2_PIN 27
#define PUMP3_PIN 14
#define PUMP4_PIN 12

// Trạng thái Relay: LOW là Bật (đối với hầu hết module Relay 5V Opto)
#define RELAY_ON  LOW
#define RELAY_OFF HIGH

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastTelemetryMillis = 0;
const long telemetryInterval = 1000; // Gửi điện áp dòng điện mỗi 1 giây

// Giả lập hoặc đọc từ cảm biến PZEM-004T
float currentVoltage = 220.0;
float currentAmperage = 0.0;
float accumulatedKWh = 0.12;

void setupPins() {
  pinMode(PUMP1_PIN, OUTPUT);
  pinMode(PUMP2_PIN, OUTPUT);
  pinMode(PUMP3_PIN, OUTPUT);
  pinMode(PUMP4_PIN, OUTPUT);

  // Mặc định tắt cả 4 bơm khi khởi động
  digitalWrite(PUMP1_PIN, RELAY_OFF);
  digitalWrite(PUMP2_PIN, RELAY_OFF);
  digitalWrite(PUMP3_PIN, RELAY_OFF);
  digitalWrite(PUMP4_PIN, RELAY_OFF);
}

void setupWifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\\nWiFi connected! IP: " + WiFi.localIP().toString());
}

// Xử lý gói tin MQTT nhận được từ Ứng dụng Android
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.printf("Received [%s]: %s\\n", topic, message.c_str());

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);
  if (error) {
    Serial.println("Lỗi parse JSON!");
    return;
  }

  // Xử lý Lệnh Dừng Khẩn Cấp
  if (doc["action"] == "EMERGENCY_STOP") {
    digitalWrite(PUMP1_PIN, RELAY_OFF);
    digitalWrite(PUMP2_PIN, RELAY_OFF);
    digitalWrite(PUMP3_PIN, RELAY_OFF);
    digitalWrite(PUMP4_PIN, RELAY_OFF);
    Serial.println("!!! DỪNG KHẨN CẤP TẤT CẢ 4 MÁY BƠM !!!");
    sendTelemetryNow();
    return;
  }

  // Xử lý điều khiển từng bơm
  int pumpNum = doc["pump"];
  const char* action = doc["action"]; // "ON" hoặc "OFF"
  bool state = (strcmp(action, "ON") == 0);

  int relayPin = -1;
  if (pumpNum == 1) relayPin = PUMP1_PIN;
  else if (pumpNum == 2) relayPin = PUMP2_PIN;
  else if (pumpNum == 3) relayPin = PUMP3_PIN;
  else if (pumpNum == 4) relayPin = PUMP4_PIN;

  if (relayPin != -1) {
    digitalWrite(relayPin, state ? RELAY_ON : RELAY_OFF);
    Serial.printf("Máy bơm %d đã %s (GPIO %d)\\n", pumpNum, state ? "BẬT" : "TẮT", relayPin);
  }

  // Gửi telemetry phản hồi trạng thái ngay lập tức
  sendTelemetryNow();
}

void reconnectMqtt() {
  while (!client.connected()) {
    Serial.print("Đang kết nối MQTT Broker...");
    String clientId = "ESP32_AquaPump_" + String(random(0xffff), HEX);
    
    bool connected = false;
    if (strlen(mqtt_user) > 0) {
      connected = client.connect(clientId.c_str(), mqtt_user, mqtt_pass, topic_status, 1, true, "offline");
    } else {
      connected = client.connect(clientId.c_str(), topic_status, 1, true, "offline");
    }

    if (connected) {
      Serial.println("Đã kết nối!");
      // Báo online
      client.publish(topic_status, "online", true);
      // Lắng nghe lệnh điều khiển
      client.subscribe(topic_control);
    } else {
      Serial.print("Thất bại, rc=");
      Serial.print(client.state());
      Serial.println(" Thử lại sau 3 giây...");
      delay(3000);
    }
  }
}

// Đọc cảm biến điện áp & dòng điện thực tế (hoặc mô phỏng mẫu)
void readSensors() {
  // NẾU DÙNG PZEM-004T v3.0:
  // float v = pzem.voltage();
  // float i = pzem.current();
  
  // Mẫu tính toán thực tế dựa theo các rơ-le đang đóng:
  bool p1 = (digitalRead(PUMP1_PIN) == RELAY_ON);
  bool p2 = (digitalRead(PUMP2_PIN) == RELAY_ON);
  bool p3 = (digitalRead(PUMP3_PIN) == RELAY_ON);
  bool p4 = (digitalRead(PUMP4_PIN) == RELAY_ON);

  currentVoltage = 220.0 + (random(-20, 20) / 10.0); // 218V - 222V
  currentAmperage = 0.05; // dòng tĩnh
  if (p1) currentAmperage += 3.2;
  if (p2) currentAmperage += 2.8;
  if (p3) currentAmperage += 3.5;
  if (p4) currentAmperage += 4.0;
}

void sendTelemetryNow() {
  readSensors();

  bool p1 = (digitalRead(PUMP1_PIN) == RELAY_ON);
  bool p2 = (digitalRead(PUMP2_PIN) == RELAY_ON);
  bool p3 = (digitalRead(PUMP3_PIN) == RELAY_ON);
  bool p4 = (digitalRead(PUMP4_PIN) == RELAY_ON);

  StaticJsonDocument<300> doc;
  doc["voltage"] = (round(currentVoltage * 10) / 10.0);
  doc["current"] = (round(currentAmperage * 100) / 100.0);
  doc["power"]   = (int)(currentVoltage * currentAmperage * 0.92);
  doc["pumps"][0] = p1 ? 1 : 0;
  doc["pumps"][1] = p2 ? 1 : 0;
  doc["pumps"][2] = p3 ? 1 : 0;
  doc["pumps"][3] = p4 ? 1 : 0;

  char buffer[300];
  serializeJson(doc, buffer);
  client.publish(topic_telemetry, buffer);
}

void setup() {
  Serial.begin(115200);
  setupPins();
  setupWifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
}

void loop() {
  if (!client.connected()) {
    reconnectMqtt();
  }
  client.loop();

  // Định kỳ gửi chỉ số điện áp & dòng điện lên ứng dụng
  unsigned long now = millis();
  if (now - lastTelemetryMillis > telemetryInterval) {
    lastTelemetryMillis = now;
    sendTelemetryNow();
  }
}
`;
}
