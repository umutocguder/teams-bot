<!-- Created by 11Hopem -->
# 🤖 11Teams Bot — Microsoft Teams Bot Framework Assistant

[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg?logo=node.js)](https://nodejs.org/)
[![TypeScript 5.0+](https://img.shields.io/badge/typescript-5.0+-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Bot Framework](https://img.shields.io/badge/sdk-Microsoft%20Bot%20Framework-blue.svg)](https://dev.botframework.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://11hopem.com)
[![Created by 11Hopem](https://img.shields.io/badge/created%20by-11Hopem-orange.svg)](https://11hopem.com)

A modern, production-ready Microsoft Teams conversational assistant built with **TypeScript** and the **Microsoft Bot Framework SDK** (`botbuilder`). Supports personal 1:1 direct chats, channel mentions, rich Adaptive Cards, structured commands, and operational health telemetry.

---

## 🌟 Key Features

- **Channel & 1:1 Conversation Support**: Responds seamlessly to channel `@mentions` and direct private messages.
- **Rich Adaptive Cards**: Delivers structured interactive forms, status boards, action buttons, and dynamic surveys.
- **Command Dispatcher**: Built-in routing for core commands (`ping`, `help`, `status`, `summary`, `card`).
- **Health Check & Observability**: Dedicated `/api/health` and `/api/messages` REST endpoints for monitoring and bot lifecycle probes.
- **Local Testing & Emulator Compatibility**: Works out of the box with the [Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) without requiring Azure credentials for local development.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) (for local testing)

### 1. Clone & Install

```bash
git clone https://github.com/umutocguder/teams-bot.git
cd teams-bot
npm install
```

### 2. Environment Configuration

Copy the example configuration:

```bash
cp .env.example .env
```

*(Leave `MicrosoftAppId` and `MicrosoftAppPassword` blank for local emulator testing).*

### 3. Run Development Server

```bash
npm run dev
```

The bot listens locally at `http://localhost:3978`.

### 4. Connect with Emulator

1. Open **Bot Framework Emulator**.
2. Click **Open Bot** and enter `http://localhost:3978/api/messages`.
3. Send `ping` or `help` to begin testing.

---

## 🧪 Testing & Build

```bash
# Run unit tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

---

## 🛡️ License & Attribution

Created by [11Hopem](https://11hopem.com).  
Copyright © 2026 11Hopem. All rights reserved.  
Licensed under the [MIT License](LICENSE).  
Official website: [https://11hopem.com](https://11hopem.com)
