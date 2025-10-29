# Uto Bloom 🌱

**A cross-platform Progressive Web App (PWA) for smart indoor plant care**

Uto Bloom helps you keep your indoor plants healthy by monitoring soil moisture and environmental conditions through small sensor nodes, providing clear, actionable insights through an intuitive interface.

## 🎯 Project Overview

Uto Bloom is designed as a trustworthy plant care companion that bridges the gap between hardware sensors and user-friendly plant care guidance. The system uses small sensor nodes placed near plants to measure soil moisture and environmental conditions, then presents this data through a clean, responsive PWA that works across all your devices.

### Key Features
- **Real-time monitoring** with soil moisture and environmental sensors
- **Smart status notifications** ("Need water", "I'm hot", "I'm doing great!")
- **Cross-platform PWA** installable on iOS, Android, and Desktop
- **Android TV support** with TV-optimized layouts readable from 2-3 meters
- **Offline-first design** with data buffering and sync
- **No accounts required** - privacy-focused approach

## 🏗️ Architecture

### Data Flow
```
Sensor Node → POST /ingest → Express Server (HTTPS) → MongoDB → PWA (REST + WebSocket)
```

### Tech Stack
- **Frontend**: Progressive Web App (PWA)
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Real-time**: WebSocket connections
- **Hardware**: ESP32-based sensor nodes
- **Security**: HTTPS everywhere, device key authentication

## 📱 Platform Support

| Platform | Support | Notes |
|----------|---------|--------|
| iOS | ✅ PWA Install | Full PWA experience |
| Android | ✅ PWA Install | Full PWA experience |
| Desktop | ✅ PWA Install | Windows, macOS, Linux |
| Android TV | ✅ Browser/WebView | Optimized TV layout for Hisense 55U88G |

## 🔧 Hardware Components

### Sensor Node (MVP → V1 Evolution)
- **Sensor**: SparkFun Soil Moisture Sensor (resistive → capacitive)
- **Controller**: ESP32-class Wi-Fi microcontroller
- **Power**: USB or battery-powered
- **Form Factor**: Compact, vertical "pen-like" enclosure
- **Power Management**: Sensor powered only during readings (anti-corrosion)

### Data Collection
- **Frequency**: ~10 minutes intervals
- **Offline Buffering**: Stores readings when disconnected
- **Duplicate Handling**: Server-side deduplication

## 📊 Data Model

### Sensor Payload
```json
{
  "device_id": "pot-01",
  "ts": 1739846400,
  "soil": { "raw": 612, "norm": 0.42 },
  "env": { "temp_c": 23.6, "rh": 47.2, "lux": 12000 }
}
```

### MongoDB Collections
- **devices**: Device settings and calibration data
- **plants**: Plant information and nicknames
- **plant_catalog**: Plant care specifications and images
- **readings**: Time-series sensor data (indexed by device_id + timestamp)
- **statuses**: Computed plant status history (optional)

## 🚀 API Surface

### Core Endpoints

#### POST /ingest
Accept sensor readings with device authentication
- **Headers**: `Authorization: Bearer <DEVICE_KEY>`
- **Body**: JSON payload with sensor data
- **Behavior**: Deduplicated acceptance, timestamp validation

#### GET /history
Retrieve historical data for charts and analysis
- **Query**: `?device_id=ID&range=24h|7d`
- **Response**: Ordered readings with computed status context

#### WebSocket /live
Real-time data streaming to connected clients
- **Latency**: ~2 seconds from sensor to app
- **Use Case**: Live status updates and immediate notifications

## 🧠 Smart Plant Care Logic

### Status Intelligence
- **Stability**: No status bouncing - requires 2 consecutive readings to change
- **Freshness**: Warns if readings are >30 minutes old
- **Context-Aware**: Considers multiple environmental factors

### Plant Statuses
| Status | Trigger | Clear Condition |
|--------|---------|-----------------|
| **Need water** | 2 consecutive dry readings | 2 readings out of dry band |
| **I'm doing great** | Optimal moisture + comfortable temp | Conditions change |
| **I'm cold/hot** | Temperature outside comfort for ~1 hour | Temperature normalizes |
| **In need of care!** | Multiple issues for 30+ minutes | Issues resolve |

### Calibration System
- **Optional User Calibration**: Capture "Dry" and "Wet" reference points
- **Personalized Bands**: Custom moisture thresholds per plant
- **Fallback**: Safe default ranges when uncalibrated

## 📱 App Features (MVP)

### Core Screens
- **Home**: Plant status overview with 24h mini-charts
- **Details**: Current readings with plain-text explanations
- **History**: 24h and 7d charts optimized for all screen sizes
- **Onboarding**: Plant selection with type-ahead search

### Plant Catalog
- **Local JSON**: Offline-capable plant database
- **Smart Search**: Common names, Latin names, and aliases
- **Rich Data**: Care requirements, images, and growing tips

## 🔒 Security & Privacy

### Privacy-First Design
- **No user accounts** or personal information required
- **Device-only identification** with secure keys
- **Local-first** plant data and preferences

### Security Measures
- **HTTPS everywhere** for all communications
- **Device authentication** with private keys
- **Input validation** and timestamp sanity checks
- **Deduplication** to prevent data pollution

## 💾 Data Management

### Retention Policy
- **Raw readings**: Few months for detailed analysis
- **Hourly summaries**: ~1 year for long-term trends
- **Automatic cleanup** to manage storage costs

### Offline Support
- **Device buffering** when network unavailable
- **Sync on reconnect** with conflict resolution
- **PWA caching** for app availability

## 🎯 MVP Deliverables

### Phase 1 - Core System
- [ ] **PWA Frontend**: Responsive home, details, and history views
- [ ] **Express Backend**: /ingest, /history, and WebSocket /live endpoints
- [ ] **Sensor Firmware**: Scheduled readings with power management
- [ ] **Plant Catalog**: Local JSON with type-ahead search
- [ ] **TV Layout**: Large-format display for Android TV

### Technical Assumptions
- **Single user** deployment (solo developer focus)
- **Stable home Wi-Fi** connectivity
- **Modern PWA support** in target browsers
- **Free-tier hosting** sufficient for initial deployment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- ESP32 development environment (for production)
- Arduino Uno (for prototype testing)
- HTTPS-capable hosting

### Quick Start
```bash
# Clone the repository
git clone https://github.com/hanray/uto-bloom.git
cd uto-bloom

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection and device keys

# Start all services (server + serial + client)
.\start.bat
# Or: npm.cmd start
```

### Hardware Setup (Prototype)
1. Upload `firmware/prototype-serial-test.ino` to Arduino Uno
2. Connect SparkFun soil moisture sensor (A0=signal, Pin7=power)
3. Connect Arduino via USB (COM5)
4. Start services with `.\start.bat`

### Android TV Setup
See **[apk/tv-app/README.md](./apk/tv-app/README.md)** for:
- Building Android TV APK
- Installing via ADB
- Network configuration (same WiFi or external URL)
- TV-optimized UI with DPAD navigation

## 📈 Future Roadmap

### Hardware Evolution
- Migration from resistive to capacitive soil sensors
- Extended battery life optimizations
- Multi-sensor node support

### Software Enhancements
- Multi-user support with plant sharing
- Advanced analytics and care recommendations
- Integration with weather APIs
- Plant care scheduling and reminders

## 🤝 Contributing

This project is currently in MVP development phase. Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with 🌱 for plant lovers who believe technology should nurture, not complicate.**