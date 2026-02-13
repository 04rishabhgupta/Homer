

## BLE Connectivity Visualization - Option 4 (Map Lines + Status Badges)

This plan adds BLE peer connectivity visualization to the Manager Dashboard without changing any existing functionality. It extends the data pipeline to capture BLE fields already sent by the ESP32, then displays them as connection lines on the map and status badges on worker cards.

### Overview

The ESP32 firmware already sends three BLE-related parameters on every upload:
- `src` -- location source: "GPS", "PEER", or "NONE"
- `p_dist` -- estimated BLE distance to peer (in meters)
- `Pair_id` -- the numeric ID of the connected peer device (0 if using own GPS)

These fields just need to be captured in the frontend and visualized.

### Technical Changes

**1. Extend the GPS data type** (`src/types/gps.ts`)
- Add three optional fields to the `GPSLocation` interface:
  - `locationSource?: 'GPS' | 'PEER' | 'NONE'`
  - `peerDistance?: number`
  - `pairId?: number`

**2. Update data mapping** (`src/hooks/useGPSData.ts`)
- In the device mapping callback (line 46-54), extract the new fields from the API response:
  - `locationSource: loc.src || 'GPS'`
  - `peerDistance: parseFloat(loc.p_dist) || 0`
  - `pairId: parseInt(loc.Pair_id) || 0`
- This requires the PHP backend (`get_sensor_data.php`) to return these fields. If it doesn't yet, the values will gracefully default.

**3. Add BLE connection lines on the map** (`src/components/manager/ManagerMap.tsx`)
- Import `Polyline` from `@react-google-maps/api`
- After rendering worker markers, compute BLE pairs: for each device with `locationSource === 'PEER'` and `pairId > 0`, find the paired device marker on the map
- Draw a dashed `Polyline` between the two devices colored with a distinct BLE blue (#3b82f6)
- Render a midpoint label (using an invisible Marker with a custom label) showing the peer distance (e.g., "2.4m")
- Only draw lines when both devices are currently visible on the map

**4. Add BLE status badge on worker cards** (`src/components/manager/WorkerPanel.tsx`)
- In `renderWorkerCard`, read the device's `locationSource` from its latest location
- Below the existing assignment info line, conditionally render a small BLE indicator:
  - GPS source: green "GPS" badge with a satellite icon
  - PEER source: blue "BLE" badge with a Bluetooth icon + peer distance + paired device name
  - NONE source: red "No Signal" badge
- This row only appears if `locationSource` data is available (backward compatible)

**5. Update InfoWindow popup** (`src/components/manager/ManagerMap.tsx`)
- Add a "Source" row in the InfoWindow content showing the location source (GPS/BLE/None)
- If BLE, show the paired device ID and estimated distance

### What stays unchanged
- All existing map rendering (fences, markers, drawing tools)
- Worker online/offline logic (timestamp-based timeout)
- Fence management, assignments, alerts
- Worker Dashboard page
- Edge function proxy (it passes through all fields already)

### Dependency on PHP backend
The PHP API (`get_sensor_data.php`) must return `src`, `p_dist`, and `Pair_id` fields in its JSON response for the devices. If it doesn't yet, the UI will degrade gracefully (no BLE info shown, everything else works). No new npm packages are needed.

