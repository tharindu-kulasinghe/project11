#include <SoftwareSerial.h>

SoftwareSerial sim808(7, 8);  // RX, TX

const char DEVICE_ID[] = "MGJVXVSNW0W2";
const char SERVER_URL[] = "http://shopper-earn-atom-kid.trycloudflare.com";
const char API_ENDPOINT[] = "/api/locations/device";
const char APN[] = "internet";

char response[200];
float latitude = 0.0;
float longitude = 0.0;
char date[9] = "";
char time[7] = "";
int fixStatus = 0;

bool gprsConnected = false;

void setup() {
  Serial.begin(9600);
  sim808.begin(9600);

  Serial.println(F("SIM808 GPS Tracker"));
  Serial.println(F("Initializing..."));

  delay(5000);

  sendATCommand("AT", "OK", 1000);
  sendATCommand("ATE0", "OK", 1000);

  initializeGPS();

  initializeGPRS();
}

void loop() {
  Serial.println(F("\n--- GPS Fix ---"));

  if (getGPSData()) {
    displayLocation();

    // Print Google Maps link
    Serial.print(F("Maps: https://maps.google.com/?q="));
    Serial.print(latitude, 6);
    Serial.print(F(","));
    Serial.println(longitude, 6);

    if (gprsConnected) {
      sendLocationToServer();
    } else {
      Serial.println(F("GPRS reconnecting..."));
      initializeGPRS();
    }
  } else {
    Serial.println(F("No GPS fix"));
    Serial.println(F("Check antenna & outdoors"));
  }

  delay(30000);
}

void initializeGPS() {
  Serial.println(F("\n=== Init GPS ==="));
  sendATCommand("AT+CGNSPWR=0", "OK", 2000);
  delay(1000);
  if (sendATCommand("AT+CGNSPWR=1", "OK", 2000)) {
    Serial.println(F("GPS: ON"));
  }
  Serial.println(F("Warmup 1-2 min"));
}

bool getGPSData() {
  sim808.println(F("AT+CGNSINF"));
  delay(2000);

  int idx = 0;
  while (sim808.available() && idx < 199) {
    response[idx++] = sim808.read();
  }
  response[idx] = '\0';

  return parseGPSData();
}

bool parseGPSData() {
  char* start = strstr(response, "+CGNSINF:");
  if (!start) return false;

  start += 9;

  char* fields[10];
  int fieldCount = 0;
  fields[fieldCount++] = start;

  for (char* p = start; *p && fieldCount < 10; p++) {
    if (*p == ',') {
      *p = '\0';
      fields[fieldCount++] = p + 1;
    }
  }

  if (fieldCount < 5) return false;

  fixStatus = atoi(fields[1]);
  if (fixStatus != 1) return false;

  if (strlen(fields[2]) >= 14) {
    strncpy(date, fields[2], 8);
    date[8] = '\0';
    strncpy(time, fields[2] + 8, 6);
    time[6] = '\0';
  }

  latitude = atof(fields[3]);

  longitude = atof(fields[4]);

  return true;
}

bool sendATCommand(const char* command, const char* expected, int delayTime) {
  sim808.println(command);
  delay(delayTime);

  int idx = 0;
  while (sim808.available() && idx < 199) {
    response[idx++] = sim808.read();
  }
  response[idx] = '\0';

  return strstr(response, expected) != NULL;
}

void displayLocation() {
  Serial.println(F("\n=== GPS FIX ==="));
  Serial.print(F("Lat: "));
  Serial.println(latitude, 6);
  Serial.print(F("Lon: "));
  Serial.println(longitude, 6);
}

void initializeGPRS() {
  Serial.println(F("\n=== Init GPRS ==="));

  if (!sendATCommand("AT+CPIN?", "READY", 3000)) {
    Serial.println(F("No SIM!"));
    gprsConnected = false;
    return;
  }

  bool netOk = false;
  for (int i = 0; i < 10; i++) {
    if (sendATCommand("AT+CREG?", "+CREG: 0,1", 2000) || sendATCommand("AT+CREG?", "+CREG: 0,5", 2000)) {
      netOk = true;
      break;
    }
    Serial.print(F("."));
    delay(2000);
  }

  if (!netOk) {
    Serial.println(F("\nNo network!"));
    gprsConnected = false;
    return;
  }
  Serial.println(F("\nNetwork OK"));

  sendATCommand("AT+SAPBR=0,1", "OK", 2000);
  delay(500);
  sendATCommand("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"", "OK", 2000);
  char apnCmd[60];
  sprintf(apnCmd, "AT+SAPBR=3,1,\"APN\",\"%s\"", APN);
  sendATCommand(apnCmd, "OK", 2000);

  sendATCommand("AT+SAPBR=3,1,\"DNS1\",\"8.8.8.8\"", "OK", 2000);
  sendATCommand("AT+SAPBR=3,1,\"DNS2\",\"8.8.4.4\"", "OK", 2000);

  if (sendATCommand("AT+SAPBR=1,1", "OK", 5000)) {
    Serial.println(F("GPRS: ON"));
    gprsConnected = true;
  } else {
    Serial.println(F("GPRS: FAIL"));
    gprsConnected = false;
  }
}

void sendLocationToServer() {
  Serial.println(F("\n=== Sending ==="));

  sendATCommand("AT+HTTPINIT", "OK", 2000);
  sendATCommand("AT+HTTPPARA=\"CID\",1", "OK", 1000);

  char urlCmd[150];
  sprintf(urlCmd, "AT+HTTPPARA=\"URL\",\"%s%s\"", SERVER_URL, API_ENDPOINT);
  Serial.print(F("URL: "));
  Serial.print(SERVER_URL);
  Serial.println(API_ENDPOINT);
  sendATCommand(urlCmd, "OK", 2000);

  sendATCommand("AT+HTTPPARA=\"CONTENT\",\"application/json\"", "OK", 1000);

  char jsonData[120];
  char latStr[12], lonStr[12];
  dtostrf(latitude, 1, 6, latStr);
  dtostrf(longitude, 1, 6, lonStr);
  sprintf(jsonData, "{\"deviceId\":\"%s\",\"latitude\":%s,\"longitude\":%s}",
          DEVICE_ID, latStr, lonStr);

  Serial.print(F("JSON: "));
  Serial.println(jsonData);

  char contentLenCmd[50];
  sprintf(contentLenCmd, "AT+HTTPPARA=\"CONTENT-LENGTH\",\"%d\"", strlen(jsonData));
  sendATCommand(contentLenCmd, "OK", 1000);
  char dataCmd[30];
  sprintf(dataCmd, "AT+HTTPDATA=%d,5000", strlen(jsonData));
  Serial.print(F("Data cmd: "));
  Serial.println(dataCmd);
  sim808.println(dataCmd);
  delay(1000);

  String responseStr = "";
  unsigned long startTime = millis();
  while (millis() - startTime < 3000) {
    if (sim808.available()) {
      responseStr += (char)sim808.read();
    }
  }
  Serial.print(F("Module resp: "));
  Serial.println(responseStr);

  if (responseStr.indexOf("DOWNLOAD") != -1) {
    Serial.println(F("Sending JSON data..."));
    sim808.println(jsonData);
    delay(2000);
    Serial.println(F("Executing POST..."));
    sim808.println(F("AT+HTTPACTION=1"));
    delay(5000);

    responseStr = "";
    startTime = millis();
    while (millis() - startTime < 10000) {
      while (sim808.available()) {
        char c = sim808.read();
        responseStr += c;
        if (responseStr.indexOf("+HTTPACTION:") != -1 && responseStr.indexOf("\n") != -1) {
          break;  // Got the response line
        }
      }
      if (responseStr.indexOf("+HTTPACTION:") != -1) break;
      delay(100);
    }

    Serial.print(F("POST resp: "));
    Serial.println(responseStr);

    if (responseStr.indexOf("+HTTPACTION: 1,200") != -1 || responseStr.indexOf("+HTTPACTION: 1,201") != -1) {
      Serial.println(F("SUCCESS! Data sent."));
    } else {
      Serial.println(F("FAILED! Check response."));
    }
  } else {
    Serial.println(F("No DOWNLOAD prompt received"));
  }

  sendATCommand("AT+HTTPREAD", "OK", 2000);
  sendATCommand("AT+HTTPTERM", "OK", 1000);

  Serial.println(F("Done!"));
}