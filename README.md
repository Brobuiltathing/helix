# HELIX

**An open-source robotics IDE with a built-in AI that builds projects for you.**

HELIX is a full desktop-style engineering environment that runs in your browser. Place real components on a schematic canvas, wire them together with click-to-click connections, and let the AI handle the rest. Press `Ctrl+K`, describe what you want to build in plain English, and HELIX generates the schematic, routes the wires, and writes the firmware in one shot.

It works fully offline with a local Ollama model. No accounts, no subscriptions, no cloud dependency.

Built by [Amay Labs](https://github.com/amaylabs).

---

## What it does

Most robotics tools make you do everything manually. HELIX is built around the idea that you should be able to say "build a line-following robot with PID control" and get a complete, wired schematic with working firmware in under ten seconds.

That's the `Ctrl+K` flow. It's like Cursor, but for hardware.

Beyond the AI, HELIX is a complete engineering workbench:

- A schematic editor with 117+ real components and accurate pinouts
- A PCB layout view that generates automatically from your schematic
- A VS Code-style code editor with multi-file support
- A Design Rule Check that validates your circuit and flags real problems
- Export to SVG, PNG, PDF, Gerber JSON, and BOM CSV

Everything runs in the browser. There is no backend.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or newer
- npm (ships with Node)

### Install and run

```bash
git clone https://github.com/amaylabs/helix.git
cd helix
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

The output goes into `dist/` as a fully static site. Deploy it anywhere: Vercel, Netlify, GitHub Pages, your own server.

---

## AI assistant

The AI is the fastest way to use HELIX. It has full control over every part of the IDE and can build an entire project from a single sentence.

### Ctrl+K (inline builder)

Press `Ctrl+K` or `Cmd+K` from anywhere in HELIX to open an inline prompt. Type what you want. The AI places components, wires them, creates firmware files, opens the right view, and reports back what it built.

The Ctrl+K mode is purpose-built for this. It enforces strict action-block output from the model and auto-retries if the response comes back as prose instead of executable actions.

### Chat panel

For back-and-forth conversation, questions, or iterating on a design, use the chat panel on the right side of the screen.

### What the AI can control

The AI executes 18 action types that cover every part of the IDE:

**Schematic**
- `add_component` -- place a component by ID at given coordinates
- `wire` -- connect two pins by `componentID:pinLabel`
- `delete_component`, `delete_wire`
- `move_component`, `rotate_component`
- `clear_schematic`, `clear_wires`

**Code**
- `set_code` -- replace the active file's contents
- `append_code` -- add to the active file
- `create_file`, `delete_file`, `set_active_file`

**Project**
- `set_board` -- switch the active microcontroller board
- `open_view` -- navigate to schematic, PCB, or code view
- `compile`, `serial_print`

**Communication**
- `message` -- send a chat message
- `note` -- add an inline annotation

A complete AI response can place components, wire them, create `config.h` and `main.ino` and `drivers.h`, switch to the code view, and write a summary explaining the build. All in one response.

### How the action format works

When the AI responds, it wraps its instructions in a `helix-actions` block:

````
```helix-actions
{
  "actions": [
    { "type": "add_component", "component_id": "mcu_esp32", "x": 100, "y": 100 },
    { "type": "add_component", "component_id": "imu_mpu6050", "x": 300, "y": 100 },
    { "type": "wire", "from": "mcu_esp32:D21", "to": "imu_mpu6050:SDA" },
    { "type": "wire", "from": "mcu_esp32:D22", "to": "imu_mpu6050:SCL" },
    { "type": "set_code", "code": "// Generated firmware here" },
    { "type": "message", "text": "MPU6050 wired and firmware ready." }
  ]
}
```
````

HELIX parses the block and executes every action in sequence. The AI knows your active board, placed components, and current code, so it can make context-aware decisions without you repeating yourself.

### Auto-fix and validation

HELIX validates every AI response before running it. Problems are corrected automatically and reported in the chat as a green "exec" message. Nothing is silently rewritten.

Auto-fixes include:

- **JSON repair** -- trailing commas, stray quotes after numbers, smart quotes
- **Pin validation** -- drops wires referencing pins that don't exist on a placed component
- **Motor driver enforcement** -- if DC motors are wired directly to MCU GPIO pins, HELIX inserts an L298N driver automatically and reroutes the connections
- **Common ground wiring** -- ensures battery and MCU grounds are tied together

### AI providers

| Provider | Cost | Privacy | Best for |
|---|---|---|---|
| Ollama (local) | Free | 100% local | Offline use, privacy, tinkering |
| Anthropic Claude | ~$0.01-0.05 per build | Sent to Anthropic API | Best output quality |
| OpenAI GPT-4o | ~$0.02-0.08 per build | Sent to OpenAI API | Already have a key |

---

## Setting up AI

### Ollama (recommended for most people)

Ollama runs models locally. No API key, no internet after the initial download.

1. Install [Ollama](https://ollama.com)
2. Pull a model:
   ```bash
   ollama pull qwen2.5-coder:14b
   ```
3. Start Ollama (it usually starts automatically after install)
4. In HELIX, open Settings, select "Ollama (Local)", and set the model name

Recommended models for robotics projects:

| Model | Why |
|---|---|
| `qwen2.5-coder:14b` | Best code generation, top pick for HELIX |
| `deepseek-coder:6.7b` | Lighter, faster on low-VRAM machines |
| `llama3.1:8b` | Good general purpose fallback |

### Anthropic Claude

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. In HELIX, open Settings, select "Anthropic Claude", and paste your key

### OpenAI GPT-4o

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. In HELIX, open Settings, select "OpenAI GPT-4o", and paste your key

---

## Component library

117+ real parts with accurate pinouts, voltage ratings, and footprints across 17 categories.

### Microcontrollers and compute
ESP32, Raspberry Pi Pico, Teensy 4.1, Arduino Mega, Pixhawk 6C

### Motion
- **Motors**: BLDC, DC gear, NEMA steppers
- **Servos**: SG90, MG996R, DS3218, Dynamixel XL430
- **Motor drivers**: L298N, TB6612, A4988, DRV8825, ESC, ODrive, PCA9685

### Navigation and sensing
- **IMU / Nav**: MPU6050, MPU9250, BNO055, ICM20948, GPS modules, RTK
- **LiDAR / Distance**: HC-SR04 ultrasonic, VL53L0X ToF, TFMini, RPLiDAR A1
- **Sensors**: DHT22/DHT11, BME280, LDR, soil moisture, flame, MQ-2 gas, water level

### Vision
ESP32-CAM, OpenMV, Pixy2, OAK-D Lite

### Communication
nRF24L01, LoRa SX1276, CAN transceiver, RS485, RC receivers

### Power
LiPo 3S/4S packs, BECs, buck converters, power distribution boards

### Displays and outputs
I2C OLED, SPI OLED, LCD1602, ST7735 TFT, WS2812 NeoPixel strips

### Prototyping and passives
Full and mini breadboards, perfboard, jumper kits, terminal blocks, headers (M/F), JST-XH, Dupont connectors, resistors (THT + SMD), capacitors (ceramic + electrolytic), inductors, diodes, LEDs, RGB LEDs, potentiometers, push buttons, switches

### ICs and modules
NE555, LM358, 74HC595, MOSFETs, optocouplers, SD card modules, DS3231 RTC, EEPROM, relay modules (1ch/4ch), level shifters

### Audio
Passive buzzer, active buzzer, DFPlayer Mini MP3, MAX9814 microphone

---

## Schematic editor

The canvas is where you design circuits. Everything is click-based with no manual coordinate entry.

- Click-to-click pin wiring with color-coded nets per signal type
- Pan with click-drag on empty canvas area
- Zoom with mouse wheel
- Drag components to reposition
- Rotate with `R`
- Delete with `Del`
- 50-state undo/redo history
- Auto-saves to localStorage

---

## Design Rule Check

The DRC runs against your schematic and surfaces real circuit problems as warnings. It checks for:

- Unconnected pins
- Voltage mismatches between 3.3V and 5V components
- Missing GND connections
- No microcontroller placed in the project
- DC motors wired without a motor driver

Fix the flagged issues before you export or hand off to manufacturing.

---

## Code editor

The built-in editor handles Arduino and C++ without needing a separate IDE for writing firmware.

- Syntax highlighting for Arduino/C++
- Multiple file tabs with create, rename, and delete
- Tab / Shift+Tab indent and unindent
- Auto-indent on Enter that matches the previous line and adds a level after `{`
- Auto-close for brackets and quotes
- Smart backspace inside empty pairs
- `Ctrl+/` to toggle line comments
- `Ctrl+D` to duplicate the current line
- Smart `Home` key (jumps to first non-whitespace, then column 0 on second press)

---

## PCB view

Your schematic generates a PCB layout automatically. Copper traces, pads, and footprints are all rendered without any additional work on your end.

Export options:
- Schematic: SVG, PNG, PDF, JSON
- PCB: SVG, PNG, PDF, Gerber JSON
- BOM: CSV
- Full project: `.helix` file

---

## Project templates

Four starting points to skip the blank canvas:

| Template | What it includes |
|---|---|
| Line Following Robot | IR sensors, motor driver, ESP32, PID loop firmware |
| Quadcopter Drone | IMU, ESCs, flight controller firmware scaffold |
| 6-DOF Robotic Arm | Six servos, PCA9685, IK firmware scaffold |
| Blank | Empty canvas, your active board pre-selected |

---

## Keyboard shortcuts

### Global

| Action | Shortcut |
|---|---|
| Save project | `Ctrl+S` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Toggle sidebar | `Ctrl+B` |
| Toggle AI chat | `Ctrl+J` |
| Open AI builder | `Ctrl+K` / `Cmd+K` |
| Show help | `Ctrl+/` |

### Schematic

| Action | Shortcut |
|---|---|
| Wire pins | Click pin, then click target pin |
| Cancel wiring | `Esc` |
| Rotate component | `R` |
| Delete component | `Del` |
| Pan | Drag empty area |
| Zoom | Mouse wheel |

### Code editor

| Action | Shortcut |
|---|---|
| Indent | `Tab` |
| Unindent | `Shift+Tab` |
| Toggle comment | `Ctrl+/` |
| Duplicate line | `Ctrl+D` |
| Smart home | `Home` |
| Auto-close | Type `(`, `[`, `{`, `"`, `'` |

---

## Project file format

Projects save as `.helix` files, which are plain JSON:

```json
{
  "version": 4,
  "board": "ESP32",
  "tree": { "...file tree structure..." },
  "files": {
    "main.ino": "...",
    "config.h": "..."
  },
  "placed": [ "...placed components..." ],
  "wires": [ "...connections..." ]
}
```

They're readable, version-controllable with git, and editable by hand. You can also generate them programmatically.

---

## Architecture

HELIX is a single-page React application with no backend. Everything runs in the browser.

- **State**: React hooks, persisted to localStorage
- **Schematic**: SVG canvas with HTML overlay, transform-based pan and zoom
- **Code editor**: textarea with syntax-highlighted overlay
- **AI calls**: direct fetch from the browser to Ollama / Anthropic / OpenAI
- **Persistence**: localStorage for auto-save, File API for manual project export

Because there's no backend, HELIX has no server costs, works fully offline with Ollama, keeps your designs private, and can be hosted as a plain static site.

---

## Contributing

Contributions are welcome. The entire app lives in `src/Helix.jsx` intentionally, to keep it easy to read, fork, and hack on.

### Adding a component

1. Open `src/Helix.jsx`
2. Find the `ROBOTICS_LIB` array near the top
3. Add a new entry:

```js
{
  id: "unique_id",
  name: "Display Name",
  category: "Sensors",
  domain: "all",
  w: 80,
  h: 70,
  desc: "Short description",
  voltage: 3.3,
  pins: [
    { l: "VCC", s: "L", o: 12, t: "pwr" },
    { l: "GND", s: "L", o: 28, t: "gnd" },
    { l: "OUT", s: "R", o: 20, t: "gpio" }
  ]
}
```

Pin sides: `"L"` (left) or `"R"` (right). `o` is vertical offset in pixels. Pin types: `pwr`, `gnd`, `gpio`, `pwm`, `i2c`, `spi`, `uart`, `adc`, `dac`, `phase`, `enc`, `can`.

### Adding a template

1. Find the `TEMPLATES` constant in `src/Helix.jsx`
2. Add an entry with `name`, `desc`, `components`, and `code`

---

## Roadmap

Things coming in future versions:

- Arduino CLI integration via an Electron wrapper for direct flashing
- ROS 2 node generation
- Hardware-in-the-loop debugging
- Multi-board projects
- Community component library
- Collaboration via shared `.helix` files
- More templates: hexapod, FPV drone, mecanum drive, SCARA arm
- Wokwi-style simulation

---

## License

MIT. See [LICENSE](LICENSE).

---

## Credits

Built by [Amay Labs](https://github.com/amaylabs). If HELIX helps you build something, open an issue or tag @amaylabs. Always happy to see what people make with it.