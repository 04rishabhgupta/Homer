# ESP32 Configuration Instructions

To send data from your ESP32 devices to the new backend, you need to update the `url` variable in your C++ code. The backend has been updated to support your existing GET request structure.

## 1. API Endpoint

Your ESP32 devices need to send HTTP requests to the following URL:

```
https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/functions/v1/ingest-data
```

Replace `<YOUR_SUPABASE_PROJECT_REF>` with your actual Supabase project reference ID.

## 2. Required Code Changes

### A. Update the `url` variable

Find this line in your code:

```cpp
String url       = "http://ggenvsolutions.com/get_sensor_log.php";
```

And replace it with:

```cpp
String url       = "https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/functions/v1/ingest-data";
```

### B. HTTPS Considerations

Supabase uses HTTPS. The standard `HTTPClient` library on ESP32 can handle HTTPS, but you might need to handle SSL verification. For simplicity, you can often ignore certificate verification if strict security isn't paramount for this prototype, or provide the root CA.

If you encounter connection issues, you may need to use `WiFiClientSecure`.

**Simple Fix (if using `HTTPClient`):**

Most `HTTPClient` implementations for ESP32 handle `https://` URLs automatically. However, if it fails, you might need to add `client.setInsecure();` if you are using `WiFiClientSecure` directly, or just rely on the library's default behavior which often works for basic cases.

**If you are using `HTTPClient` as shown in your code:**

```cpp
bool sendWiFi(String params) {
  HTTPClient http;
  String fullURL = url + params;

  // Note: for HTTPS, sometimes you need to begin with a client that ignores SSL
  // or simply try:
  http.begin(fullURL);

  int httpCode = http.GET();
  // ... rest of your code
}
```

If the above doesn't work for HTTPS, try this modified `sendWiFi` function:

```cpp
#include <WiFiClientSecure.h> // Add this include at the top

// ...

bool sendWiFi(String params) {
  WiFiClientSecure client;
  client.setInsecure(); // Ignore SSL certificate verification

  HTTPClient http;
  String fullURL = url + params;

  http.begin(client, fullURL);
  int httpCode = http.GET();

  if (httpCode > 0) {
    Serial.printf("[WiFi] Upload Success | Code: %d\n", httpCode);
    http.end();
    return (httpCode == 200);
  } else {
    Serial.printf("[WiFi] Error: %s\n", http.errorToString(httpCode).c_str());
    http.end();
    return false;
  }
}
```

### C. GSM Considerations (SIM800)

The SIM800 module has limited HTTPS support. It is often easier to use HTTP. However, Supabase Edge Functions serve over HTTPS.

If your SIM800 module supports SSL (commands like `AT+HTTPSSL=1`), you can enable it.

```cpp
void setupGSM() {
  // ... existing setup ...
  gsmCmd("AT+HTTPSSL=1", 100); // Enable SSL for HTTPS
}
```

If your SIM800 firmware is old and doesn't support modern SSL/TLS, you might need a proxy or an intermediate HTTP server, but try enabling SSL first.

## 3. Data Format

The backend now accepts your existing GET parameter format:

```
?device_id=...&lat=...&lon=...&src=...&p_dist=...&Pair_id=...&ax=...&ay=...&az=...
```

No changes are needed to how you construct the `params` string.

## 4. Authorization

Supabase usually requires an `Authorization` header (`Bearer <ANON_KEY>`). However, for public Edge Functions or if you've configured it to be open, it might work without it.

If you get 401 Unauthorized errors, you need to add the header.

**For WiFi:**

```cpp
http.addHeader("Authorization", "Bearer <YOUR_SUPABASE_ANON_KEY>");
```

**For GSM:**

```cpp
// Add header command before URL
sim800.println("AT+HTTPPARA=\"USERDATA\",\"Authorization: Bearer <YOUR_SUPABASE_ANON_KEY>\"");
```

(Note: SIM800 HTTP headers can be tricky. Check your module's AT command manual if `USERDATA` is supported or if there's another way to add custom headers).

## Summary of actions

1.  Replace the `url` variable in your code.
2.  If WiFi upload fails, update `sendWiFi` to use `WiFiClientSecure` with `setInsecure()`.
3.  If GSM upload fails, try enabling SSL with `AT+HTTPSSL=1`.
4.  If you get 401 errors, add the Authorization header.
