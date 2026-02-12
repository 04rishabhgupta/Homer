

## Revert to Timestamp-Based Online/Offline Detection

Revert the worker online/offline logic to use the timestamp-based timeout approach, with the timeout set to 60 seconds (2 missed reporting cycles at 30-second intervals).

### Changes

**File: `src/components/manager/WorkerPanel.tsx`**

Restore the `isDeviceOnline` function to compare the device's last reported timestamp against the current time using the `deviceTimeoutSeconds` setting:

```typescript
const isDeviceOnline = (location: GPSLocation | undefined): boolean => {
  if (!location) return false;
  const lastReading = new Date(location.timestamp).getTime();
  const now = Date.now();
  const timeoutMs = deviceTimeoutSeconds * 1000;
  return (now - lastReading) < timeoutMs;
};
```

**File: `src/types/settings.ts`**

Update the default `deviceTimeoutSeconds` from 30 to 60 (2 x 30-second reporting interval), so devices are marked offline only after missing 2 consecutive reports.

