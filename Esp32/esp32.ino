#include <ArduinoJson.h>
#include <NTPClient.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <RTClib.h>
#include <IOXhop_FirebaseESP32.h>

#define FIREBASE_HOST "yourfirebasehost"
#define FIREBASE_AUTH "yourfirebaseauth"
#define WIFI_SSID "yourwifissid"
#define WIFI_PASSWORD "yourpasswordwifi"
#define api "yourapifrompython"

#define teras 27
#define tamu 19
#define kamar 12
#define kamar2 5
#define dapur 25
#define toilet 18

RTC_DS3231 rtc;
const long utcOffsetInSeconds = 25200;
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "id.pool.ntp.org", utcOffsetInSeconds);

void setup() {
  Serial.begin(9600);

  pinMode(teras, OUTPUT);
  pinMode(tamu, OUTPUT);
  pinMode(kamar, OUTPUT);
  pinMode(kamar2, OUTPUT);
  pinMode(dapur, OUTPUT);
  pinMode(toilet, OUTPUT);

  digitalWrite(teras, HIGH);
  digitalWrite(tamu, HIGH);
  digitalWrite(kamar, HIGH);
  digitalWrite(kamar2, HIGH);
  digitalWrite(dapur, HIGH);
  digitalWrite(toilet, HIGH);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(100);
  }
  timeClient.begin();
  timeClient.update();
  rtc.begin();
  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  rtc.adjust(DateTime(2021, 7, 17, timeClient.getHours(), timeClient.getMinutes(), timeClient.getSeconds()));

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}

void StatusManual() {
  String hidup = "hidup";
  String mati = "mati";

  String Terasmanual = Firebase.getString("kontrol/teras");
  if (Terasmanual == "hidup") {
    Serial.println("request teras hidup");
    Firebase.set("kontrol/teras", hidup);
    digitalWrite(teras, LOW);
    Serial.println("request teras hidup selesai");
  } else {
    Serial.println("request teras mati");
    Firebase.set("kontrol/teras", mati);
    digitalWrite(teras, HIGH);
    Serial.println("request teras mati selesai");
  }

  String tamumanual = Firebase.getString("kontrol/ruangtamu");
  if (tamumanual == "hidup") {
    Serial.println("request ruang tamu hidup");
    Firebase.set("kontrol/ruangtamu", hidup);
    digitalWrite(tamu, LOW);
    Serial.println("request ruang tamu hidup selesai");
  } else {
    Serial.println("request ruang tamu mati");
    Firebase.set("kontrol/ruangtamu", mati);
    digitalWrite(tamu, HIGH);
    Serial.println("request ruang tamu mati selesai");
  }

  String kamarmanual = Firebase.getString("kontrol/kamar");
  if (kamarmanual == "hidup") {
    Serial.println("request kamar utama hidup");
    Firebase.set("kontrol/kamar", hidup);
    digitalWrite(kamar, LOW);
    Serial.println("request kamar utama hidup selesai");
  } else {
    Serial.println("request kamar utama mati");
    Firebase.set("kontrol/kamar", mati);
    digitalWrite(kamar, HIGH);
    Serial.println("request kamar utama mati selesai");
  }
  String kamar2manual = Firebase.getString("kontrol/kamar2");
  if (kamar2manual == "hidup") {
    Serial.println("request kamar kedua hidup");
    Firebase.set("kontrol/kamar2", hidup);
    digitalWrite(kamar2, LOW);
    Serial.println("request kamar kedua mati selesai");
  } else {
    Serial.println("request kamar kedua mati");
    Firebase.set("kontrol/kamar2", mati);
    digitalWrite(kamar2, HIGH);
    Serial.println("request kamar kedua mati selesai");
  }
  String dapurmanual = Firebase.getString("kontrol/dapur");
  if (dapurmanual == "hidup") {
    Serial.println("request dapur hidup");
    Firebase.set("kontrol/dapur", hidup);
    digitalWrite(dapur, LOW);
    Serial.println("request dapur hidup selesai");
  } else {
    Serial.println("request dapur mati");
    Firebase.set("kontrol/dapur", mati);
    digitalWrite(dapur, HIGH);
    Serial.println("request dapur mati selesai");
  }
  String toiletmanual = Firebase.getString("kontrol/toilet");
  if (toiletmanual == "hidup") {
    Serial.println("request toilet hidup");
    Firebase.set("kontrol/toilet", hidup);
    digitalWrite(toilet, LOW);
    Serial.println("request toilet hidup selesai");
  } else {
    Serial.println("request toilet mati");
    Firebase.set("kontrol/toilet", mati);
    digitalWrite(toilet, HIGH);
    Serial.println("request toilet mati selesai");
  }
}

void StatusOtomatis() {
  String hidup = "hidup";
  String mati = "mati";

  HTTPClient http;
  http.begin(api);
  int httpResponseCode = http.GET();

  if (httpResponseCode == 200) {
    String payload = http.getString();
    const int capacity = JSON_OBJECT_SIZE(6) + 160;
    StaticJsonBuffer<capacity> jsonBuffer;
    JsonObject &jsonObject = jsonBuffer.parseObject(payload);

    if (jsonObject.success()) {
      String terasStatus = jsonObject["teras"].asString();
      String ruangtamuStatus = jsonObject["ruangtamu"].asString();
      String kamarStatus = jsonObject["kamar"].asString();
      String kamar2Status = jsonObject["kamar2"].asString();
      String dapurStatus = jsonObject["dapur"].asString();
      String toiletStatus = jsonObject["toilet"].asString();

      if (terasStatus == "hidup") {
        Firebase.set("kontrol/teras", hidup);
        digitalWrite(teras, LOW);
        Serial.println("teras hidup");
      } else {
        Firebase.set("kontrol/teras", mati);
        digitalWrite(teras, HIGH);
        Serial.println("teras mati");
      }
      if (ruangtamuStatus == "hidup") {
        Firebase.set("kontrol/ruangtamu", hidup);
        digitalWrite(tamu, LOW);
        Serial.println("ruangtamu hidup");
      } else {
        Firebase.set("kontrol/ruangtamu", mati);
        digitalWrite(tamu, HIGH);
        Serial.println("ruangtamu mati");
      }
      if (kamarStatus == "hidup") {
        Firebase.set("kontrol/kamar", hidup);
        digitalWrite(kamar, LOW);
        Serial.println("kamar hidup");
      } else {
        Firebase.set("kontrol/kamar", mati);
        digitalWrite(kamar, HIGH);
        Serial.println("kamar mati");
      }
      if (kamar2Status == "hidup") {
        Firebase.set("kontrol/kamar2", hidup);
        digitalWrite(kamar2, LOW);
        Serial.println("kamar2 hidup");
      } else {
        Firebase.set("kontrol/kamar2", mati);
        digitalWrite(kamar2, HIGH);
        Serial.println("kamar2 mati");
      }
      if (dapurStatus == "hidup") {
        Firebase.set("kontrol/dapur", hidup);
        digitalWrite(dapur, LOW);
        Serial.println("dapur hidup");
      } else {
        Firebase.set("kontrol/dapur", mati);
        digitalWrite(dapur, HIGH);
        Serial.println("dapur mati");
      }
      if (toiletStatus == "hidup") {
        Firebase.set("kontrol/toilet", hidup);
        digitalWrite(toilet, LOW);
        Serial.println("toilet hidup");
      } else {
        Firebase.set("kontrol/toilet", mati);
        digitalWrite(toilet, HIGH);
        Serial.println("toilet mati");
      }
    } else {
      Serial.print("Gagal mengambil data API. Kode respons: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
}

void kirimDataOtomatis() {
  HTTPClient http;
  http.begin(api);
  int httpResponseCode = http.GET();
  if (httpResponseCode == 200) {
    String payload = http.getString();
    const int capacity = JSON_OBJECT_SIZE(6) + 160;
    StaticJsonBuffer<capacity> jsonBufferCapacity;
    JsonObject &jsonObject = jsonBufferCapacity.parseObject(payload);

    String terasStatus = jsonObject["teras"].asString();
    String ruangtamuStatus = jsonObject["ruangtamu"].asString();
    String kamarStatus = jsonObject["kamar"].asString();
    String kamar2Status = jsonObject["kamar2"].asString();
    String dapurStatus = jsonObject["dapur"].asString();
    String toiletStatus = jsonObject["toilet"].asString();

    unsigned long epochTime = timeClient.getEpochTime();

    String formatjam = timeClient.getFormattedTime();

    struct tm *ptm = gmtime((time_t *)&epochTime);

    int Hari = ptm->tm_mday;

    int Bulan = ptm->tm_mon + 1;

    int Tahun = ptm->tm_year + 1900;

    String FormatWaktu = String(Hari) + "-" + String(Bulan) + "-" + String(Tahun);

    StaticJsonBuffer<1000> jsonBuffer;
    JsonObject &parsing = jsonBuffer.createObject();
    parsing["teras"] = terasStatus;
    parsing["ruangtamu"] = ruangtamuStatus;
    parsing["kamar"] = kamarStatus;
    parsing["kamar2"] = kamar2Status;
    parsing["dapur"] = dapurStatus;
    parsing["toilet"] = toiletStatus;
    parsing["Tanggal"] = FormatWaktu;
    parsing["Waktu"] = formatjam;
    String name = Firebase.push("Pengujian", parsing);
    http.end();
  }
}

void loop(){
  String pilihMode = Firebase.getString("kontrol/mode");
  if (pilihMode == "automation") {
    Serial.println("request status otomatis");
    StatusOtomatis();
    Serial.println("request status otomatis selesai");
  } else {
    Serial.println("request status manual");
    StatusManual();
    Serial.println("request status manual selesai");
  }
  delay(6000);

  const unsigned long pushtime = 1 * 60 * 1000UL;
  static unsigned long lastSampleTime = 0 - pushtime;

  unsigned long now = millis();
  if (now - lastSampleTime >= pushtime) {
    lastSampleTime += pushtime;
    kirimDataOtomatis();
  }
}
