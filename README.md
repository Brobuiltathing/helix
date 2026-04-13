# HELIX

**An open-source robotics engineering IDE with AI assistance.**

HELIX is a desktop-style IDE for designing robots end to end. Place real components on a schematic, wire them with click-to-click connections, generate Arduino/PlatformIO code, validate the design with built-in DRC, and let an AI assistant build entire robots for you. Supports local Ollama models so it runs fully offline if you want.

Built by [Amay Labs](https://github.com/amaylabs).

![HELIX banner](https://via.placeholder.com/1200x400/07070b/00e5cc?text=HELIX+v4)

---

## Features

### 117+ component library
Real parts with accurate pinouts, voltage ratings, and footprints across 17 categories:

**Robotics**
- **Microcontrollers**: ESP32, RPi Pico, Teensy 4.1, Arduino Mega, Pixhawk 6C
- **Motors**: BLDC, DC gear, NEMA steppers
- **Servos**: SG90, MG996R, DS3218, Dynamixel
- **Motor Drivers**: L298N, TB6612, A4988, DRV8825, ESC, ODrive, PCA9685
- **IMU/Nav**: MPU6050/9250, BNO055, ICM20948, GPS, RTK
- **LiDAR/Distance**: HC-SR04, VL53L0X, TFMini, RPLiDAR
- **Vision**: ESP32-CAM, OpenMV, Pixy2, OAK-D
- **Communication**: nRF24, LoRa, CAN, RS485, RC receivers
- **Power**: LiPo 3S/4S, BECs, buck converters, PDBs

**Prototyping & general electronics**
- **Prototyping**: full + mini breadboards, perfboard, jumper kits, terminal blocks, headers (M/F), JST-XH, Dupont
- **Passives**: resistors (THT + SMD), capacitors (ceramic + electrolytic), inductors, diodes (signal/power/zener), LEDs, RGB LEDs, potentiometers, push buttons, switches
- **ICs**: NE555 timer, LM358 op-amp, 74HC595 shift register, MOSFETs, optocouplers
- **Audio**: passive/active buzzers, DFPlayer Mini MP3, MAX9814 mic
- **Modules**: SD card, DS3231 RTC, EEPROM, 1ch/4ch relays, level shifters
- **Sensors**: DHT22/DHT11, BME280, LDR, soil moisture, flame, MQ-2 gas, water level
- **Displays**: I2C/SPI OLED, LCD1602, ST7735 TFT, WS2812 NeoPixel

# HELIX v4.7

The open-source AI-powered robotics IDE. Build complete projects with a Cmd+K prompt — schematic, breadboard, code, and now **live simulation**.

## What's new in v4.7

- **Breadboard view** — photorealistic SVG rendering of your circuit on a real breadboard with colored jumper wires, power rails, hole pattern, and category-coded component blocks. Switch between Schematic and Breadboard views with one click.
- **Live simulation** — press Run Sim and watch your Arduino code come alive. The parser extracts `digitalWrite`, `analogWrite`, `Serial.println`, and `delay` calls from your `loop()`, then animates LEDs lighting up in real time. Fake sensor values drift over time so reactive code can be tested.
- **252 components** in 17 categories
- **⌘K AI Build** — Cursor-style inline AI prompt
- **Error boundary, persistence, undo/redo, DRC, smart placement, modal dialogs**

### AI assistant with full IDE control

Press **Ctrl+K** anywhere in HELIX to open an inline AI prompt. Type what you want to build and the AI executes it directly: places components, wires them, generates code, opens the right view.

The AI controls every part of the IDE through 18 action types:

**Schematic actions**
- `add_component`, `wire`, `delete_component`, `delete_wire`
- `move_component`, `rotate_component`, `clear_schematic`, `clear_wires`

**File & code actions**
- `set_code`, `append_code` (with optional `file` parameter)
- `create_file`, `delete_file`, `set_active_file`

**Project actions**
- `set_board`, `open_view`, `compile`, `serial_print`

**Communication**
- `message`, `note`

This means the AI can build a project end-to-end: place components, wire them, create multiple source files (config.h + main.ino + drivers.h), open the right view, and explain what it built — all in one response.

### Auto-fix and JSON repair
HELIX validates every AI response before executing it:
- **JSON repair**: fixes trailing commas, stray quotes after numbers, smart quotes
- **Pin validation**: drops wires referencing pins that don't exist on a component
- **Motor driver enforcement**: if the AI wires DC motors directly to MCU pins, HELIX automatically inserts an L298N driver and reroutes all the bad wires through it
- **Common ground auto-wiring**: ensures battery and MCU grounds are tied together

You see all auto-fixes in the chat as a green "exec" message — no silent rewrites.

Three AI providers supported:
- **Ollama** (local, free, private)
- **Anthropic Claude**
- **OpenAI GPT-4o**

### Schematic editor
- Click-to-click pin wiring with color-coded nets
- Pan and zoom (mouse wheel + drag empty area)
- Drag components to reposition
- Rotate components (R key)
- Delete with Del key
- Undo/redo with 50-state history
- Auto-saves to localStorage

### PCB view
Auto-generated PCB layout from your schematic, with copper traces and pad rendering. Export to SVG, PNG, PDF, or Gerber JSON.

### Design Rule Check (DRC)
Validates your circuit and flags problems as warnings:
- Unconnected pins
- Voltage mismatches between 3.3V/5V components
- Missing GND connections
- Missing microcontroller
- Motors driven without a motor driver

### Code editor (VS Code-like)
- Syntax highlighting for Arduino/C++
- Tab/Shift+Tab indent and unindent
- Auto-indent on Enter (matches previous line, adds level after `{`)
- Auto-close brackets and quotes
- Smart backspace inside empty pairs
- `Ctrl+/` toggle line comments
- `Ctrl+D` duplicate line
- Smart `Home` key (first non-whitespace, then column 0)
- Multiple file tabs with new/rename/delete

### Project templates
Start fast with preset projects:
- Line Following Robot
- Quadcopter Drone
- 6-DOF Robotic Arm
- Blank

### Export everything
- Schematic: SVG, PNG, PDF, JSON
- PCB: SVG, PNG, PDF, Gerber JSON
- BOM: CSV
- Full project: `.helix` file

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org) 18 or newer
- npm (comes with Node)

### Setup

```bash
git clone https://github.com/amaylabs/helix.git
cd helix
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

The built app goes into `dist/` and can be hosted on any static web server (Vercel, Netlify, GitHub Pages, your own server).

---

## Using AI assistance

### Option 1: Ollama (recommended, free, local)

1. Install [Ollama](https://ollama.com)
2. Pull a model:
   ```bash
   ollama pull llama3
   ```
3. Make sure Ollama is running (it usually starts automatically)
4. In HELIX, open Settings and select "Ollama (Local)"
5. Set the model name to whatever you pulled (e.g. `llama3`, `qwen2.5-coder`, `deepseek-coder`)

**Recommended models for robotics:**
- `qwen2.5-coder:14b` (best for code generation)
- `deepseek-coder:6.7b` (lightweight, fast)
- `llama3.1:8b` (good general purpose)

### Option 2: Anthropic Claude

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. In HELIX, open Settings, select "Anthropic Claude", paste your key

### Option 3: OpenAI

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. In HELIX, open Settings, select "OpenAI GPT-4o", paste your key

---

## Keyboard shortcuts

### Project
| Action | Shortcut |
|--------|----------|
| Save Project | `Ctrl+S` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Toggle Sidebar | `Ctrl+B` |
| Toggle AI Chat | `Ctrl+J` |
| Show Help | `Ctrl+/` |

### Code editor
| Action | Shortcut |
|--------|----------|
| Indent / Tab | `Tab` |
| Unindent | `Shift+Tab` |
| Toggle line comment | `Ctrl+/` |
| Duplicate line | `Ctrl+D` |
| Smart home | `Home` |
| Auto-close brackets/quotes | Type `(`, `[`, `{`, `"`, `'` |
| Auto-indent | `Enter` after `{`, `[`, `(` |

### Schematic
| Action | Shortcut |
|--------|----------|
| Delete Component | `Del` |
| Rotate Component | `R` |
| Cancel Wiring | `Esc` |
| Wire Pins | Click pin, then click target pin |
| Pan Schematic | Drag empty area |
| Zoom Schematic | Mouse wheel |

---

## How AI tool calling works

When you ask HELIX AI to do something, it can respond with a JSON action block:

````
```helix-actions
{
  "actions": [
    { "type": "add_component", "component_id": "mcu_esp32", "x": 100, "y": 100 },
    { "type": "add_component", "component_id": "imu_mpu6050", "x": 300, "y": 100 },
    { "type": "wire", "from": "mcu_esp32:D21", "to": "imu_mpu6050:SDA" },
    { "type": "wire", "from": "mcu_esp32:D22", "to": "imu_mpu6050:SCL" },
    { "type": "set_code", "code": "// Generated firmware here" },
    { "type": "message", "text": "MPU6050 wired and code ready" }
  ]
}
```
````

HELIX parses these blocks and executes them automatically. The AI knows your active board, the components already placed, and your current code, so it can make context-aware decisions.

Action types:
- `add_component`: places a part by ID at coordinates
- `wire`: connects two pins by `componentID:pinLabel`
- `set_code`: replaces the active file's contents
- `append_code`: adds to the active file
- `clear_schematic`: wipes the canvas
- `message`: sends a chat message

---

## Project file format

HELIX projects save as `.helix` files (JSON):

```json
{
  "version": 4,
  "board": "ESP32",
  "tree": { ... file tree structure ... },
  "files": { "main.ino": "...", "config.h": "..." },
  "placed": [ ... components ... ],
  "wires": [ ... connections ... ]
}
```

These are plain JSON, so you can edit them by hand, version-control them with git, or generate them programmatically.

---

## Architecture

HELIX is a single-page React application with no backend. Everything runs in your browser:

- **State**: React hooks, persisted to localStorage
- **Schematic**: SVG with HTML overlay for components, transform-based pan/zoom
- **Code editor**: textarea with syntax-highlighted overlay
- **AI calls**: direct fetch to Ollama/Anthropic/OpenAI APIs from the browser
- **Persistence**: localStorage for auto-save, File API for manual project export

This means HELIX:
- Has no server costs
- Works fully offline (with Ollama)
- Keeps your designs private
- Can be hosted anywhere as a static site

---

## Roadmap

Planned for future versions:
- Real Arduino CLI integration via Electron wrapper
- ROS 2 node generation
- Hardware-in-the-loop debugging
- Multi-board projects
- Component library marketplace
- Collaboration via shared `.helix` files
- More templates (hexapod, FPV drone, mecanum drive, SCARA arm)
- Wokwi-style simulation

---

## Contributing

Contributions welcome. The whole app is one file (`src/Helix.jsx`) to keep things hackable.

To add a new component:
1. Open `src/Helix.jsx`
2. Find `ROBOTICS_LIB` near the top
3. Add an entry following the existing format:
   ```js
   { id:"unique_id", name:"Display Name", category:"Sensors", domain:"all",
     w:80, h:70, desc:"Short description", voltage:3.3,
     pins:[{l:"VCC",s:"L",o:12,t:"pwr"}, ...] }
   ```
4. Pin sides: `"L"` (left) or `"R"` (right). `o` is vertical offset in pixels.
5. Pin types: `pwr`, `gnd`, `gpio`, `pwm`, `i2c`, `spi`, `uart`, `adc`, `dac`, `phase`, `enc`, `can`

To add a project template:
1. Find `TEMPLATES` constant
2. Add an entry with `name`, `desc`, `components`, and `code`

---

## License

MIT. See [LICENSE](LICENSE).

---

## Credits

Built by [Amay Labs](https://github.com/amaylabs). If HELIX helps you build something cool, I'd love to see it. Open an issue or tag @amaylabs.
