import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   HELIX v4.0 — Production Robotics Engineering IDE
   Persistence, undo/redo, zoom/pan, DRC, syntax highlight, templates
   ═══════════════════════════════════════════════════════════════ */

// ─── ROBOTICS COMPONENT LIBRARY ─────────────────────────────
const ROBOTICS_LIB = [
  // ═══ MICROCONTROLLERS ═══
  { id:"mcu_esp32",name:"ESP32 DevKit",category:"Microcontrollers",domain:"all",w:80,h:140,desc:"WiFi+BT MCU, 34 GPIO, 3.3V logic",voltage:3.3,
    pins:[{l:"3V3",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"D21",s:"L",o:40,t:"i2c"},{l:"D22",s:"L",o:55,t:"i2c"},{l:"D5",s:"L",o:70,t:"gpio"},{l:"D18",s:"L",o:85,t:"spi"},{l:"D19",s:"L",o:100,t:"spi"},{l:"D23",s:"L",o:115,t:"spi"},
          {l:"EN",s:"R",o:10,t:"gpio"},{l:"VIN",s:"R",o:25,t:"pwr"},{l:"D13",s:"R",o:40,t:"pwm"},{l:"D12",s:"R",o:55,t:"pwm"},{l:"D14",s:"R",o:70,t:"pwm"},{l:"D27",s:"R",o:85,t:"pwm"},{l:"D26",s:"R",o:100,t:"dac"},{l:"D25",s:"R",o:115,t:"dac"}] },
  { id:"mcu_pico",name:"RPi Pico",category:"Microcontrollers",domain:"all",w:80,h:130,desc:"RP2040 dual-core ARM, 26 GPIO",voltage:3.3,
    pins:[{l:"GP0",s:"L",o:10,t:"uart"},{l:"GP1",s:"L",o:25,t:"uart"},{l:"GND",s:"L",o:40,t:"gnd"},{l:"GP2",s:"L",o:55,t:"gpio"},{l:"GP3",s:"L",o:70,t:"gpio"},{l:"GP4",s:"L",o:85,t:"i2c"},{l:"GP5",s:"L",o:100,t:"i2c"},
          {l:"VSYS",s:"R",o:10,t:"pwr"},{l:"3V3",s:"R",o:25,t:"pwr"},{l:"GP28",s:"R",o:40,t:"adc"},{l:"GP27",s:"R",o:55,t:"adc"},{l:"GP26",s:"R",o:70,t:"adc"},{l:"GP22",s:"R",o:85,t:"gpio"},{l:"GP21",s:"R",o:100,t:"gpio"}] },
  { id:"mcu_teensy41",name:"Teensy 4.1",category:"Microcontrollers",domain:"all",w:80,h:130,desc:"600MHz ARM Cortex-M7, high-perf",voltage:3.3,
    pins:[{l:"0",s:"L",o:10,t:"uart"},{l:"1",s:"L",o:25,t:"uart"},{l:"GND",s:"L",o:40,t:"gnd"},{l:"2",s:"L",o:55,t:"pwm"},{l:"3",s:"L",o:70,t:"pwm"},{l:"4",s:"L",o:85,t:"pwm"},{l:"5",s:"L",o:100,t:"pwm"},
          {l:"VIN",s:"R",o:10,t:"pwr"},{l:"3V3",s:"R",o:25,t:"pwr"},{l:"23",s:"R",o:40,t:"gpio"},{l:"22",s:"R",o:55,t:"gpio"},{l:"21",s:"R",o:70,t:"gpio"},{l:"20",s:"R",o:85,t:"gpio"}] },
  { id:"mcu_arduino_mega",name:"Arduino Mega",category:"Microcontrollers",domain:"all",w:80,h:140,desc:"ATmega2560, 54 GPIO, 5V logic",voltage:5,
    pins:[{l:"5V",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"D20",s:"L",o:40,t:"i2c"},{l:"D21",s:"L",o:55,t:"i2c"},{l:"D2",s:"L",o:70,t:"pwm"},{l:"D3",s:"L",o:85,t:"pwm"},{l:"D50",s:"L",o:100,t:"spi"},{l:"D51",s:"L",o:115,t:"spi"},
          {l:"VIN",s:"R",o:10,t:"pwr"},{l:"3V3",s:"R",o:25,t:"pwr"},{l:"D9",s:"R",o:40,t:"pwm"},{l:"D10",s:"R",o:55,t:"pwm"},{l:"D11",s:"R",o:70,t:"pwm"},{l:"A0",s:"R",o:85,t:"adc"},{l:"A1",s:"R",o:100,t:"adc"},{l:"A2",s:"R",o:115,t:"adc"}] },
  { id:"mcu_fc_pixhawk",name:"Pixhawk 6C FC",category:"Microcontrollers",domain:"drone",w:90,h:130,desc:"Professional drone flight controller",voltage:5,
    pins:[{l:"PWR1",s:"L",o:15,t:"pwr"},{l:"GPS1",s:"L",o:35,t:"uart"},{l:"TELEM",s:"L",o:55,t:"uart"},{l:"CAN",s:"L",o:75,t:"can"},{l:"I2C",s:"L",o:95,t:"i2c"},
          {l:"M1",s:"R",o:15,t:"pwm"},{l:"M2",s:"R",o:35,t:"pwm"},{l:"M3",s:"R",o:55,t:"pwm"},{l:"M4",s:"R",o:75,t:"pwm"},{l:"SAFETY",s:"R",o:95,t:"gpio"}] },

  // ═══ MOTORS ═══
  { id:"mot_bldc_2212",name:"BLDC 2212 1000KV",category:"Motors",domain:"drone",w:80,h:60,desc:"Brushless outrunner for quadcopters",
    pins:[{l:"A",s:"L",o:15,t:"phase"},{l:"B",s:"L",o:30,t:"phase"},{l:"C",s:"L",o:45,t:"phase"}] },
  { id:"mot_bldc_5010",name:"BLDC 5010 360KV",category:"Motors",domain:"drone",w:80,h:60,desc:"High-torque heavy lift motor",
    pins:[{l:"A",s:"L",o:15,t:"phase"},{l:"B",s:"L",o:30,t:"phase"},{l:"C",s:"L",o:45,t:"phase"}] },
  { id:"mot_dc_gear",name:"DC Gear Motor 12V",category:"Motors",domain:"mobile",w:80,h:60,desc:"Geared DC for wheeled robots",
    pins:[{l:"M+",s:"L",o:18,t:"pwr"},{l:"M-",s:"L",o:38,t:"gnd"}] },
  { id:"mot_dc_encoder",name:"DC Motor w/Encoder",category:"Motors",domain:"mobile",w:80,h:90,desc:"Geared DC with quadrature encoder",
    pins:[{l:"M+",s:"L",o:12,t:"pwr"},{l:"M-",s:"L",o:26,t:"gnd"},{l:"VCC",s:"L",o:40,t:"pwr"},{l:"GND",s:"L",o:54,t:"gnd"},{l:"A",s:"L",o:68,t:"enc"}] },
  { id:"mot_stepper_nema17",name:"NEMA 17 Stepper",category:"Motors",domain:"arm",w:80,h:80,desc:"1.8° bipolar for CNC/3DP/arms",
    pins:[{l:"A+",s:"L",o:12,t:"phase"},{l:"A-",s:"L",o:26,t:"phase"},{l:"B+",s:"L",o:40,t:"phase"},{l:"B-",s:"L",o:54,t:"phase"}] },
  { id:"mot_stepper_nema23",name:"NEMA 23 Stepper",category:"Motors",domain:"arm",w:90,h:90,desc:"High-torque bipolar stepper",
    pins:[{l:"A+",s:"L",o:15,t:"phase"},{l:"A-",s:"L",o:30,t:"phase"},{l:"B+",s:"L",o:45,t:"phase"},{l:"B-",s:"L",o:60,t:"phase"}] },

  // ═══ SERVOS ═══
  { id:"srv_sg90",name:"SG90 Micro Servo",category:"Servos",domain:"all",w:80,h:60,desc:"180°, 1.8kg/cm torque, 5V",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"SIG",s:"L",o:45,t:"pwm"}] },
  { id:"srv_mg996r",name:"MG996R Servo",category:"Servos",domain:"arm",w:80,h:60,desc:"11kg/cm metal gear, 180°",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"SIG",s:"L",o:45,t:"pwm"}] },
  { id:"srv_ds3218",name:"DS3218 20kg Servo",category:"Servos",domain:"arm",w:80,h:60,desc:"High torque digital servo, 270°",voltage:6,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"SIG",s:"L",o:45,t:"pwm"}] },
  { id:"srv_dynamixel",name:"Dynamixel AX-12A",category:"Servos",domain:"arm",w:90,h:70,desc:"Smart servo with daisy-chain TTL",voltage:12,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"DATA",s:"L",o:45,t:"uart"}] },
  { id:"srv_continuous",name:"Continuous Servo",category:"Servos",domain:"mobile",w:80,h:60,desc:"360° rotation, speed control",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"SIG",s:"L",o:45,t:"pwm"}] },

  // ═══ MOTOR DRIVERS ═══
  { id:"drv_l298n",name:"L298N H-Bridge",category:"Motor Drivers",domain:"mobile",w:100,h:100,desc:"Dual 2A H-bridge for DC motors",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"IN1",s:"L",o:40,t:"gpio"},{l:"IN2",s:"L",o:55,t:"gpio"},{l:"IN3",s:"L",o:70,t:"gpio"},{l:"IN4",s:"L",o:85,t:"gpio"},
          {l:"OUT1",s:"R",o:10,t:"pwr"},{l:"OUT2",s:"R",o:25,t:"pwr"},{l:"OUT3",s:"R",o:40,t:"pwr"},{l:"OUT4",s:"R",o:55,t:"pwr"},{l:"ENA",s:"R",o:70,t:"pwm"},{l:"ENB",s:"R",o:85,t:"pwm"}] },
  { id:"drv_tb6612",name:"TB6612FNG Driver",category:"Motor Drivers",domain:"mobile",w:100,h:100,desc:"Efficient dual motor driver 1.2A",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"VM",s:"L",o:25,t:"pwr"},{l:"GND",s:"L",o:40,t:"gnd"},{l:"AIN1",s:"L",o:55,t:"gpio"},{l:"AIN2",s:"L",o:70,t:"gpio"},{l:"PWMA",s:"L",o:85,t:"pwm"},
          {l:"AO1",s:"R",o:10,t:"pwr"},{l:"AO2",s:"R",o:25,t:"pwr"},{l:"BO1",s:"R",o:40,t:"pwr"},{l:"BO2",s:"R",o:55,t:"pwr"},{l:"STBY",s:"R",o:70,t:"gpio"}] },
  { id:"drv_a4988",name:"A4988 Stepper",category:"Motor Drivers",domain:"arm",w:90,h:100,desc:"Bipolar stepper 2A, 1/16 microstep",
    pins:[{l:"VMOT",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"DIR",s:"L",o:40,t:"gpio"},{l:"STEP",s:"L",o:55,t:"gpio"},{l:"EN",s:"L",o:70,t:"gpio"},
          {l:"1A",s:"R",o:10,t:"phase"},{l:"1B",s:"R",o:25,t:"phase"},{l:"2A",s:"R",o:40,t:"phase"},{l:"2B",s:"R",o:55,t:"phase"}] },
  { id:"drv_drv8825",name:"DRV8825 Stepper",category:"Motor Drivers",domain:"arm",w:90,h:100,desc:"2.5A driver 1/32 microstep",
    pins:[{l:"VMOT",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"DIR",s:"L",o:40,t:"gpio"},{l:"STEP",s:"L",o:55,t:"gpio"},{l:"EN",s:"L",o:70,t:"gpio"},
          {l:"B2",s:"R",o:10,t:"phase"},{l:"B1",s:"R",o:25,t:"phase"},{l:"A1",s:"R",o:40,t:"phase"},{l:"A2",s:"R",o:55,t:"phase"}] },
  { id:"drv_esc_30a",name:"ESC 30A BLHeli",category:"Motor Drivers",domain:"drone",w:90,h:80,desc:"Brushless ESC for quads, DShot",
    pins:[{l:"BAT+",s:"L",o:15,t:"pwr"},{l:"BAT-",s:"L",o:30,t:"gnd"},{l:"SIG",s:"L",o:45,t:"pwm"},{l:"GND",s:"L",o:60,t:"gnd"},
          {l:"A",s:"R",o:15,t:"phase"},{l:"B",s:"R",o:30,t:"phase"},{l:"C",s:"R",o:45,t:"phase"}] },
  { id:"drv_odrive",name:"ODrive v3.6",category:"Motor Drivers",domain:"arm",w:110,h:120,desc:"Dual BLDC servo controller",
    pins:[{l:"DC+",s:"L",o:15,t:"pwr"},{l:"DC-",s:"L",o:30,t:"gnd"},{l:"UART",s:"L",o:45,t:"uart"},{l:"CAN",s:"L",o:60,t:"can"},{l:"USB",s:"L",o:75,t:"uart"},
          {l:"M0A",s:"R",o:15,t:"phase"},{l:"M0B",s:"R",o:30,t:"phase"},{l:"M0C",s:"R",o:45,t:"phase"},{l:"ENC0",s:"R",o:60,t:"enc"},{l:"M1ABC",s:"R",o:75,t:"phase"}] },
  { id:"drv_pca9685",name:"PCA9685 16ch PWM",category:"Motor Drivers",domain:"arm",w:110,h:100,desc:"16 servos over I2C",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"SDA",s:"L",o:40,t:"i2c"},{l:"SCL",s:"L",o:55,t:"i2c"},{l:"V+",s:"L",o:70,t:"pwr"},
          {l:"CH0-15",s:"R",o:10,t:"pwm"},{l:"GND",s:"R",o:25,t:"gnd"},{l:"V+",s:"R",o:40,t:"pwr"}] },

  // ═══ IMU / NAVIGATION ═══
  { id:"imu_mpu6050",name:"MPU6050 6-DOF",category:"IMU & Nav",domain:"all",w:80,h:80,desc:"3-axis accel+gyro, I2C",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:55,t:"i2c"},{l:"INT",s:"L",o:70,t:"gpio"}] },
  { id:"imu_mpu9250",name:"MPU9250 9-DOF",category:"IMU & Nav",domain:"all",w:80,h:80,desc:"Accel+gyro+mag fusion sensor",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:55,t:"i2c"},{l:"INT",s:"L",o:70,t:"gpio"}] },
  { id:"imu_bno055",name:"BNO055 Fusion IMU",category:"IMU & Nav",domain:"all",w:80,h:80,desc:"9-DOF onboard fusion algorithm",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:55,t:"i2c"}] },
  { id:"imu_icm20948",name:"ICM-20948 9-DOF",category:"IMU & Nav",domain:"drone",w:80,h:80,desc:"High-precision 9-axis IMU",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:55,t:"i2c"}] },
  { id:"gps_neo8m",name:"NEO-M8N GPS",category:"IMU & Nav",domain:"all",w:90,h:80,desc:"GPS with integrated compass",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:55,t:"uart"}] },
  { id:"gps_rtk",name:"RTK GPS ZED-F9P",category:"IMU & Nav",domain:"all",w:100,h:80,desc:"Centimeter-accurate RTK GPS",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"UART",s:"L",o:40,t:"uart"},{l:"I2C",s:"L",o:55,t:"i2c"}] },

  // ═══ DISTANCE / LIDAR ═══
  { id:"dist_hcsr04",name:"HC-SR04",category:"Distance & LiDAR",domain:"mobile",w:90,h:60,desc:"2-400cm ultrasonic ranger",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"TRIG",s:"L",o:25,t:"gpio"},{l:"ECHO",s:"L",o:38,t:"gpio"},{l:"GND",s:"L",o:51,t:"gnd"}] },
  { id:"dist_vl53l0x",name:"VL53L0X ToF",category:"Distance & LiDAR",domain:"all",w:80,h:70,desc:"Time-of-flight 2m laser ranger",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:54,t:"i2c"}] },
  { id:"dist_tfmini",name:"TFMini Plus",category:"Distance & LiDAR",domain:"drone",w:90,h:70,desc:"12m range LiDAR module",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"}] },
  { id:"dist_rplidar",name:"RPLiDAR A1",category:"Distance & LiDAR",domain:"mobile",w:110,h:90,desc:"360° 2D scanning LiDAR 12m",voltage:5,
    pins:[{l:"5V",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"TX",s:"L",o:45,t:"uart"},{l:"RX",s:"L",o:60,t:"uart"},{l:"MCTL",s:"L",o:75,t:"pwm"}] },

  // ═══ ENCODERS ═══
  { id:"enc_rotary",name:"Rotary KY-040",category:"Encoders",domain:"all",w:80,h:80,desc:"Incremental encoder w/ button",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"CLK",s:"L",o:40,t:"gpio"},{l:"DT",s:"L",o:55,t:"gpio"},{l:"SW",s:"L",o:70,t:"gpio"}] },
  { id:"enc_optical",name:"Optical Wheel Enc",category:"Encoders",domain:"mobile",w:80,h:70,desc:"High-res wheel encoder",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"A",s:"L",o:44,t:"enc"},{l:"B",s:"L",o:60,t:"enc"}] },
  { id:"enc_as5600",name:"AS5600 Magnetic",category:"Encoders",domain:"arm",w:80,h:70,desc:"12-bit magnetic rotary encoder",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },

  // ═══ VISION ═══
  { id:"cam_esp32cam",name:"ESP32-CAM",category:"Vision",domain:"all",w:90,h:100,desc:"ESP32 with OV2640 camera",voltage:5,
    pins:[{l:"5V",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"UOT",s:"L",o:45,t:"uart"},{l:"UOR",s:"L",o:60,t:"uart"},{l:"IO0",s:"L",o:75,t:"gpio"}] },
  { id:"cam_openmv",name:"OpenMV H7",category:"Vision",domain:"all",w:90,h:90,desc:"Python ML vision board",voltage:3.3,
    pins:[{l:"VIN",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"I2C",s:"L",o:45,t:"i2c"},{l:"UART",s:"L",o:60,t:"uart"}] },
  { id:"cam_pixy2",name:"Pixy2 Smart Cam",category:"Vision",domain:"mobile",w:100,h:80,desc:"Object tracking camera",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SPI",s:"L",o:40,t:"spi"},{l:"I2C",s:"L",o:54,t:"i2c"}] },
  { id:"cam_oak_d",name:"OAK-D Lite",category:"Vision",domain:"all",w:110,h:80,desc:"Stereo depth AI camera",voltage:5,
    pins:[{l:"USB",s:"L",o:20,t:"uart"},{l:"PWR",s:"L",o:45,t:"pwr"}] },

  // ═══ SENSORS ═══
  { id:"sen_bmp280",name:"BMP280 Barometer",category:"Sensors",domain:"drone",w:80,h:70,desc:"Pressure+altitude for drones",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"sen_ir_array",name:"IR Line Array",category:"Sensors",domain:"mobile",w:100,h:60,desc:"5-channel line follower",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:22,t:"gnd"},{l:"S1",s:"L",o:34,t:"adc"},{l:"S2",s:"L",o:46,t:"adc"}] },
  { id:"sen_pir",name:"PIR Motion",category:"Sensors",domain:"mobile",w:80,h:60,desc:"Passive infrared motion sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"OUT",s:"L",o:45,t:"gpio"}] },
  { id:"sen_touch",name:"Capacitive Touch",category:"Sensors",domain:"all",w:80,h:60,desc:"Capacitive touch button",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"OUT",s:"L",o:45,t:"gpio"}] },
  { id:"sen_bumper",name:"Bumper Switch",category:"Sensors",domain:"mobile",w:70,h:50,desc:"Mechanical collision switch",
    pins:[{l:"NC",s:"L",o:15,t:"gpio"},{l:"GND",s:"L",o:30,t:"gnd"}] },
  { id:"sen_force",name:"Force FSR 402",category:"Sensors",domain:"arm",w:70,h:50,desc:"Force resistor for grippers",
    pins:[{l:"S1",s:"L",o:15,t:"adc"},{l:"S2",s:"L",o:30,t:"gnd"}] },
  { id:"sen_current",name:"ACS712 Current",category:"Sensors",domain:"all",w:80,h:70,desc:"Hall-effect current sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"adc"}] },

  // ═══ COMMUNICATION ═══
  { id:"com_nrf24",name:"nRF24L01+",category:"Communication",domain:"all",w:80,h:100,desc:"2.4GHz wireless telemetry",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"CE",s:"L",o:40,t:"gpio"},{l:"CSN",s:"L",o:55,t:"spi"},{l:"SCK",s:"L",o:70,t:"spi"},{l:"MOSI",s:"L",o:85,t:"spi"}] },
  { id:"com_hc12",name:"HC-12 LoRa UART",category:"Communication",domain:"all",w:80,h:80,desc:"Long range UART radio 1km",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"}] },
  { id:"com_lora",name:"SX1276 LoRa",category:"Communication",domain:"all",w:80,h:90,desc:"915MHz LoRa long-range",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"MISO",s:"L",o:40,t:"spi"},{l:"MOSI",s:"L",o:55,t:"spi"},{l:"SCK",s:"L",o:70,t:"spi"}] },
  { id:"com_can_mcp2515",name:"MCP2515 CAN",category:"Communication",domain:"all",w:90,h:90,desc:"CAN bus controller",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"CS",s:"L",o:40,t:"spi"},{l:"SO",s:"L",o:54,t:"spi"},{l:"SI",s:"L",o:68,t:"spi"},{l:"SCK",s:"L",o:82,t:"spi"}] },
  { id:"com_rs485",name:"RS485 Transceiver",category:"Communication",domain:"all",w:80,h:80,desc:"Industrial RS485 long cables",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"DI",s:"L",o:40,t:"uart"},{l:"RO",s:"L",o:54,t:"uart"}] },
  { id:"com_fs_ia6b",name:"FS-iA6B Receiver",category:"Communication",domain:"drone",w:100,h:80,desc:"6ch PPM/iBUS RC receiver",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"CH1-6",s:"L",o:45,t:"pwm"},{l:"iBUS",s:"L",o:60,t:"uart"}] },

  // ═══ POWER ═══
  { id:"pwr_lipo_3s",name:"LiPo 3S 2200mAh",category:"Power",domain:"drone",w:100,h:60,desc:"11.1V 3-cell flight battery",
    pins:[{l:"+",s:"R",o:18,t:"pwr"},{l:"-",s:"R",o:38,t:"gnd"}] },
  { id:"pwr_lipo_4s",name:"LiPo 4S 5000mAh",category:"Power",domain:"drone",w:100,h:60,desc:"14.8V 4-cell high capacity",
    pins:[{l:"+",s:"R",o:18,t:"pwr"},{l:"-",s:"R",o:38,t:"gnd"}] },
  { id:"pwr_li_ion",name:"18650 Li-Ion",category:"Power",domain:"mobile",w:80,h:60,desc:"3.7V cylindrical cell",
    pins:[{l:"+",s:"R",o:18,t:"pwr"},{l:"-",s:"R",o:38,t:"gnd"}] },
  { id:"pwr_bec",name:"UBEC 5V 3A",category:"Power",domain:"drone",w:90,h:70,desc:"Switching BEC for logic power",
    pins:[{l:"IN+",s:"L",o:12,t:"pwr"},{l:"IN-",s:"L",o:28,t:"gnd"},{l:"OUT+",s:"R",o:12,t:"pwr"},{l:"OUT-",s:"R",o:28,t:"gnd"}] },
  { id:"pwr_buck",name:"LM2596 Buck",category:"Power",domain:"all",w:90,h:70,desc:"Adjustable step-down converter",
    pins:[{l:"IN+",s:"L",o:12,t:"pwr"},{l:"IN-",s:"L",o:28,t:"gnd"},{l:"OUT+",s:"R",o:12,t:"pwr"},{l:"OUT-",s:"R",o:28,t:"gnd"}] },
  { id:"pwr_pdb",name:"PDB Matek",category:"Power",domain:"drone",w:100,h:100,desc:"Power distribution for quads",
    pins:[{l:"BAT+",s:"L",o:12,t:"pwr"},{l:"BAT-",s:"L",o:28,t:"gnd"},{l:"5V",s:"L",o:44,t:"pwr"},{l:"12V",s:"L",o:60,t:"pwr"},
          {l:"M1",s:"R",o:12,t:"pwr"},{l:"M2",s:"R",o:28,t:"pwr"},{l:"M3",s:"R",o:44,t:"pwr"},{l:"M4",s:"R",o:60,t:"pwr"}] },

  // ═══ DISPLAYS ═══
  { id:"disp_oled",name:"OLED 128x64 I2C",category:"Displays",domain:"all",w:90,h:70,desc:"0.96\" monochrome display",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"disp_oled_spi",name:"OLED 128x64 SPI",category:"Displays",domain:"all",w:90,h:100,desc:"SPI mono display, faster",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"SCK",s:"L",o:40,t:"spi"},{l:"MOSI",s:"L",o:55,t:"spi"},{l:"DC",s:"L",o:70,t:"gpio"},{l:"CS",s:"L",o:85,t:"spi"}] },
  { id:"disp_lcd1602",name:"LCD 16x2 I2C",category:"Displays",domain:"all",w:100,h:70,desc:"Character LCD with I2C backpack",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SDA",s:"L",o:44,t:"i2c"},{l:"SCL",s:"L",o:60,t:"i2c"}] },
  { id:"disp_tft_st7735",name:"TFT 1.8\" ST7735",category:"Displays",domain:"all",w:100,h:110,desc:"160x128 color TFT, SPI",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"CS",s:"L",o:40,t:"spi"},{l:"RST",s:"L",o:55,t:"gpio"},{l:"DC",s:"L",o:70,t:"gpio"},{l:"SDA",s:"L",o:85,t:"spi"},{l:"SCK",s:"L",o:100,t:"spi"}] },
  { id:"disp_neopixel",name:"WS2812 NeoPixel",category:"Displays",domain:"all",w:80,h:70,desc:"Addressable RGB LED strip",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"DIN",s:"L",o:44,t:"gpio"},{l:"DOUT",s:"R",o:44,t:"gpio"}] },

  // ═══ AUDIO ═══
  { id:"aud_buzzer_passive",name:"Passive Buzzer",category:"Audio",domain:"all",w:70,h:50,desc:"PWM-driven piezo buzzer",
    pins:[{l:"+",s:"L",o:15,t:"pwm"},{l:"-",s:"L",o:30,t:"gnd"}] },
  { id:"aud_buzzer_active",name:"Active Buzzer",category:"Audio",domain:"all",w:70,h:50,desc:"Self-oscillating beeper",voltage:5,
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"}] },
  { id:"aud_dfplayer",name:"DFPlayer Mini MP3",category:"Audio",domain:"all",w:90,h:90,desc:"MP3 module with SD slot",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"RX",s:"L",o:40,t:"uart"},{l:"TX",s:"L",o:54,t:"uart"},{l:"SPK1",s:"R",o:20,t:"pwr"},{l:"SPK2",s:"R",o:40,t:"pwr"}] },
  { id:"aud_mic_max9814",name:"MAX9814 Mic Amp",category:"Audio",domain:"all",w:80,h:80,desc:"Electret mic + auto-gain amp",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"adc"},{l:"GAIN",s:"L",o:60,t:"gpio"}] },

  // ═══ ENVIRONMENTAL SENSORS ═══
  { id:"sen_dht22",name:"DHT22 Temp/Humidity",category:"Sensors",domain:"all",w:80,h:80,desc:"Digital temp + humidity sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"DATA",s:"L",o:28,t:"gpio"},{l:"GND",s:"L",o:44,t:"gnd"}] },
  { id:"sen_dht11",name:"DHT11 Temp/Humidity",category:"Sensors",domain:"all",w:80,h:70,desc:"Basic temp+humidity (low cost)",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"DATA",s:"L",o:28,t:"gpio"},{l:"GND",s:"L",o:44,t:"gnd"}] },
  { id:"sen_bme280",name:"BME280 T/H/P",category:"Sensors",domain:"drone",w:80,h:80,desc:"Temp+humidity+pressure I2C",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"sen_ldr",name:"LDR Photoresistor",category:"Sensors",domain:"all",w:60,h:50,desc:"Light-dependent resistor",
    pins:[{l:"A",s:"L",o:15,t:"adc"},{l:"B",s:"L",o:30,t:"gnd"}] },
  { id:"sen_soil",name:"Soil Moisture",category:"Sensors",domain:"all",w:80,h:70,desc:"Capacitive soil moisture",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"AOUT",s:"L",o:44,t:"adc"}] },
  { id:"sen_flame",name:"Flame Sensor",category:"Sensors",domain:"all",w:80,h:70,desc:"IR flame detector",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"DOUT",s:"L",o:44,t:"gpio"},{l:"AOUT",s:"L",o:60,t:"adc"}] },
  { id:"sen_mq2",name:"MQ-2 Gas Sensor",category:"Sensors",domain:"all",w:80,h:80,desc:"Smoke/LPG/CO gas sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"DOUT",s:"L",o:44,t:"gpio"},{l:"AOUT",s:"L",o:60,t:"adc"}] },
  { id:"sen_water_lvl",name:"Water Level",category:"Sensors",domain:"all",w:80,h:70,desc:"Analog water level sensor",voltage:5,
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"},{l:"S",s:"L",o:45,t:"adc"}] },

  // ═══ STORAGE / TIME ═══
  { id:"mod_sd",name:"SD Card Module",category:"Modules",domain:"all",w:90,h:100,desc:"MicroSD SPI breakout",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"MISO",s:"L",o:40,t:"spi"},{l:"MOSI",s:"L",o:55,t:"spi"},{l:"SCK",s:"L",o:70,t:"spi"},{l:"CS",s:"L",o:85,t:"spi"}] },
  { id:"mod_rtc_ds3231",name:"DS3231 RTC",category:"Modules",domain:"all",w:90,h:80,desc:"Precision real-time clock I2C",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SDA",s:"L",o:40,t:"i2c"},{l:"SCL",s:"L",o:54,t:"i2c"},{l:"SQW",s:"L",o:68,t:"gpio"}] },
  { id:"mod_eeprom",name:"24LC256 EEPROM",category:"Modules",domain:"all",w:80,h:80,desc:"32KB I2C EEPROM",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SDA",s:"L",o:44,t:"i2c"},{l:"SCL",s:"L",o:60,t:"i2c"}] },
  { id:"mod_relay_1ch",name:"Relay 1-Channel",category:"Modules",domain:"all",w:90,h:80,desc:"5V relay module 10A switching",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"IN",s:"L",o:40,t:"gpio"},{l:"COM",s:"R",o:15,t:"pwr"},{l:"NO",s:"R",o:30,t:"pwr"},{l:"NC",s:"R",o:45,t:"pwr"}] },
  { id:"mod_relay_4ch",name:"Relay 4-Channel",category:"Modules",domain:"all",w:100,h:120,desc:"4-channel relay board",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"IN1",s:"L",o:40,t:"gpio"},{l:"IN2",s:"L",o:54,t:"gpio"},{l:"IN3",s:"L",o:68,t:"gpio"},{l:"IN4",s:"L",o:82,t:"gpio"}] },
  { id:"mod_logic_lvl",name:"Logic Lvl Shifter",category:"Modules",domain:"all",w:90,h:80,desc:"Bidirectional 3.3V/5V level shifter",
    pins:[{l:"HV",s:"L",o:12,t:"pwr"},{l:"LV",s:"L",o:26,t:"pwr"},{l:"GND",s:"L",o:40,t:"gnd"},{l:"HV1",s:"R",o:12,t:"gpio"},{l:"LV1",s:"R",o:26,t:"gpio"},{l:"HV2",s:"R",o:40,t:"gpio"},{l:"LV2",s:"R",o:54,t:"gpio"}] },

  // ═══ PROTOTYPING ═══
  { id:"proto_breadboard",name:"Breadboard 830pt",category:"Prototyping",domain:"all",w:280,h:120,desc:"Full-size solderless breadboard",
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"},{l:"+",s:"L",o:90,t:"pwr"},{l:"-",s:"L",o:105,t:"gnd"},
          {l:"+",s:"R",o:15,t:"pwr"},{l:"-",s:"R",o:30,t:"gnd"},{l:"+",s:"R",o:90,t:"pwr"},{l:"-",s:"R",o:105,t:"gnd"}] },
  { id:"proto_breadboard_mini",name:"Breadboard Mini",category:"Prototyping",domain:"all",w:160,h:80,desc:"Half-size breadboard 400pt",
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"},{l:"+",s:"R",o:15,t:"pwr"},{l:"-",s:"R",o:30,t:"gnd"}] },
  { id:"proto_perfboard",name:"Perfboard",category:"Prototyping",domain:"all",w:120,h:120,desc:"Solder prototype board 5x7cm",
    pins:[{l:"P1",s:"L",o:15,t:"gpio"},{l:"P2",s:"L",o:30,t:"gpio"},{l:"P3",s:"L",o:45,t:"gpio"},{l:"P4",s:"L",o:60,t:"gpio"},
          {l:"P5",s:"R",o:15,t:"gpio"},{l:"P6",s:"R",o:30,t:"gpio"},{l:"P7",s:"R",o:45,t:"gpio"},{l:"P8",s:"R",o:60,t:"gpio"}] },
  { id:"proto_jumper_set",name:"Jumper Wire Kit",category:"Prototyping",domain:"all",w:80,h:60,desc:"M-M, M-F, F-F jumper wires",
    pins:[{l:"END",s:"L",o:15,t:"gpio"},{l:"END",s:"R",o:15,t:"gpio"}] },
  { id:"proto_terminal_2p",name:"Terminal Block 2P",category:"Prototyping",domain:"all",w:70,h:50,desc:"Screw terminal 2-position",
    pins:[{l:"1",s:"L",o:15,t:"pwr"},{l:"2",s:"L",o:30,t:"pwr"}] },
  { id:"proto_terminal_4p",name:"Terminal Block 4P",category:"Prototyping",domain:"all",w:80,h:80,desc:"Screw terminal 4-position",
    pins:[{l:"1",s:"L",o:15,t:"pwr"},{l:"2",s:"L",o:30,t:"pwr"},{l:"3",s:"L",o:45,t:"pwr"},{l:"4",s:"L",o:60,t:"pwr"}] },
  { id:"proto_header_male",name:"Pin Header M",category:"Prototyping",domain:"all",w:60,h:80,desc:"Male pin header strip",
    pins:[{l:"1",s:"L",o:12,t:"gpio"},{l:"2",s:"L",o:24,t:"gpio"},{l:"3",s:"L",o:36,t:"gpio"},{l:"4",s:"L",o:48,t:"gpio"},{l:"5",s:"L",o:60,t:"gpio"}] },
  { id:"proto_header_female",name:"Pin Header F",category:"Prototyping",domain:"all",w:60,h:80,desc:"Female socket strip",
    pins:[{l:"1",s:"L",o:12,t:"gpio"},{l:"2",s:"L",o:24,t:"gpio"},{l:"3",s:"L",o:36,t:"gpio"},{l:"4",s:"L",o:48,t:"gpio"},{l:"5",s:"L",o:60,t:"gpio"}] },
  { id:"proto_jst_xh",name:"JST-XH Connector",category:"Prototyping",domain:"all",w:70,h:60,desc:"JST 2-pin connector pair",
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"}] },
  { id:"proto_dupont",name:"Dupont Connector",category:"Prototyping",domain:"all",w:60,h:50,desc:"Dupont housing 2.54mm",
    pins:[{l:"P",s:"L",o:15,t:"gpio"}] },

  // ═══ PASSIVES ═══
  { id:"pas_resistor",name:"Resistor",category:"Passives",domain:"all",w:80,h:40,desc:"1/4W through-hole resistor",
    pins:[{l:"1",s:"L",o:15,t:"gpio"},{l:"2",s:"R",o:15,t:"gpio"}] },
  { id:"pas_resistor_smd",name:"SMD Resistor 0805",category:"Passives",domain:"all",w:60,h:35,desc:"Surface-mount resistor",
    pins:[{l:"1",s:"L",o:12,t:"gpio"},{l:"2",s:"R",o:12,t:"gpio"}] },
  { id:"pas_cap_ceramic",name:"Ceramic Cap",category:"Passives",domain:"all",w:60,h:50,desc:"Ceramic decoupling cap",
    pins:[{l:"1",s:"L",o:15,t:"gpio"},{l:"2",s:"R",o:15,t:"gpio"}] },
  { id:"pas_cap_elec",name:"Electrolytic Cap",category:"Passives",domain:"all",w:70,h:60,desc:"Polarized bulk capacitor",
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"R",o:15,t:"gnd"}] },
  { id:"pas_inductor",name:"Inductor",category:"Passives",domain:"all",w:70,h:50,desc:"Power inductor",
    pins:[{l:"1",s:"L",o:15,t:"gpio"},{l:"2",s:"R",o:15,t:"gpio"}] },
  { id:"pas_diode",name:"1N4148 Diode",category:"Passives",domain:"all",w:70,h:40,desc:"Signal diode",
    pins:[{l:"A",s:"L",o:15,t:"pwr"},{l:"K",s:"R",o:15,t:"gnd"}] },
  { id:"pas_diode_power",name:"1N4007 Power Diode",category:"Passives",domain:"all",w:70,h:50,desc:"1A power rectifier diode",
    pins:[{l:"A",s:"L",o:15,t:"pwr"},{l:"K",s:"R",o:15,t:"gnd"}] },
  { id:"pas_zener",name:"Zener Diode",category:"Passives",domain:"all",w:70,h:40,desc:"Voltage clamp diode",
    pins:[{l:"A",s:"L",o:15,t:"pwr"},{l:"K",s:"R",o:15,t:"gnd"}] },
  { id:"pas_led",name:"LED",category:"Passives",domain:"all",w:60,h:50,desc:"Standard 5mm LED",
    pins:[{l:"+",s:"L",o:15,t:"gpio"},{l:"-",s:"R",o:15,t:"gnd"}] },
  { id:"pas_led_rgb",name:"RGB LED",category:"Passives",domain:"all",w:80,h:80,desc:"Common cathode RGB LED",
    pins:[{l:"R",s:"L",o:15,t:"gpio"},{l:"G",s:"L",o:30,t:"gpio"},{l:"B",s:"L",o:45,t:"gpio"},{l:"GND",s:"L",o:60,t:"gnd"}] },
  { id:"pas_pot",name:"Potentiometer",category:"Passives",domain:"all",w:80,h:80,desc:"10k rotary potentiometer",
    pins:[{l:"1",s:"L",o:15,t:"pwr"},{l:"W",s:"L",o:30,t:"adc"},{l:"3",s:"L",o:45,t:"gnd"}] },
  { id:"pas_trimpot",name:"Trimpot",category:"Passives",domain:"all",w:70,h:60,desc:"Multi-turn trim potentiometer",
    pins:[{l:"1",s:"L",o:15,t:"pwr"},{l:"W",s:"L",o:30,t:"adc"},{l:"3",s:"L",o:45,t:"gnd"}] },
  { id:"pas_button",name:"Push Button",category:"Passives",domain:"all",w:70,h:60,desc:"Tactile pushbutton switch",
    pins:[{l:"1",s:"L",o:15,t:"gpio"},{l:"2",s:"L",o:30,t:"gnd"}] },
  { id:"pas_switch_slide",name:"Slide Switch",category:"Passives",domain:"all",w:70,h:60,desc:"SPDT slide switch",
    pins:[{l:"1",s:"L",o:15,t:"pwr"},{l:"C",s:"L",o:30,t:"gpio"},{l:"3",s:"L",o:45,t:"gnd"}] },
  { id:"pas_switch_toggle",name:"Toggle Switch",category:"Passives",domain:"all",w:70,h:60,desc:"On/off toggle switch",
    pins:[{l:"1",s:"L",o:15,t:"pwr"},{l:"2",s:"L",o:30,t:"gpio"}] },

  // ═══ ICs ═══
  { id:"ic_555",name:"NE555 Timer",category:"ICs",domain:"all",w:90,h:100,desc:"Classic 555 timer IC",voltage:5,
    pins:[{l:"GND",s:"L",o:12,t:"gnd"},{l:"TRIG",s:"L",o:26,t:"gpio"},{l:"OUT",s:"L",o:40,t:"gpio"},{l:"RST",s:"L",o:54,t:"gpio"},
          {l:"VCC",s:"R",o:12,t:"pwr"},{l:"DIS",s:"R",o:26,t:"gpio"},{l:"THR",s:"R",o:40,t:"gpio"},{l:"CV",s:"R",o:54,t:"adc"}] },
  { id:"ic_lm358",name:"LM358 Op-Amp",category:"ICs",domain:"all",w:90,h:100,desc:"Dual op-amp IC",voltage:5,
    pins:[{l:"OUT1",s:"L",o:12,t:"gpio"},{l:"IN1-",s:"L",o:26,t:"adc"},{l:"IN1+",s:"L",o:40,t:"adc"},{l:"GND",s:"L",o:54,t:"gnd"},
          {l:"VCC",s:"R",o:12,t:"pwr"},{l:"OUT2",s:"R",o:26,t:"gpio"},{l:"IN2-",s:"R",o:40,t:"adc"},{l:"IN2+",s:"R",o:54,t:"adc"}] },
  { id:"ic_74hc595",name:"74HC595 Shift Reg",category:"ICs",domain:"all",w:100,h:130,desc:"8-bit serial-to-parallel shift register",voltage:5,
    pins:[{l:"Q1",s:"L",o:12,t:"gpio"},{l:"Q2",s:"L",o:26,t:"gpio"},{l:"Q3",s:"L",o:40,t:"gpio"},{l:"Q4",s:"L",o:54,t:"gpio"},{l:"GND",s:"L",o:68,t:"gnd"},{l:"Q5",s:"L",o:82,t:"gpio"},{l:"Q6",s:"L",o:96,t:"gpio"},
          {l:"VCC",s:"R",o:12,t:"pwr"},{l:"Q7",s:"R",o:26,t:"gpio"},{l:"DS",s:"R",o:40,t:"gpio"},{l:"OE",s:"R",o:54,t:"gpio"},{l:"STCP",s:"R",o:68,t:"gpio"},{l:"SHCP",s:"R",o:82,t:"gpio"},{l:"MR",s:"R",o:96,t:"gpio"}] },
  { id:"ic_mosfet_n",name:"IRLZ44N MOSFET",category:"ICs",domain:"all",w:80,h:90,desc:"N-channel logic-level MOSFET",
    pins:[{l:"G",s:"L",o:15,t:"gpio"},{l:"D",s:"L",o:35,t:"pwr"},{l:"S",s:"L",o:55,t:"gnd"}] },
  { id:"ic_optocoupler",name:"PC817 Opto",category:"ICs",domain:"all",w:90,h:80,desc:"Optoisolator",voltage:5,
    pins:[{l:"A",s:"L",o:15,t:"pwr"},{l:"K",s:"L",o:30,t:"gnd"},{l:"C",s:"R",o:15,t:"gpio"},{l:"E",s:"R",o:30,t:"gnd"}] },

  // ═══ COOLING / MISC ═══
  { id:"misc_fan_5v",name:"Fan 5V 30mm",category:"Modules",domain:"all",w:90,h:90,desc:"DC cooling fan 5V",voltage:5,
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"}] },
  { id:"misc_fan_12v",name:"Fan 12V 60mm",category:"Modules",domain:"all",w:100,h:100,desc:"DC cooling fan 12V",voltage:12,
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"},{l:"PWM",s:"L",o:45,t:"pwm"},{l:"TACH",s:"L",o:60,t:"gpio"}] },
  { id:"misc_solenoid",name:"Solenoid 12V",category:"Modules",domain:"all",w:90,h:80,desc:"Linear pull solenoid",voltage:12,
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"}] },
  { id:"misc_pump",name:"Water Pump 5V",category:"Modules",domain:"mobile",w:90,h:80,desc:"Submersible water pump",voltage:5,
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"}] },
  { id:"misc_vibrator",name:"Vibration Motor",category:"Modules",domain:"all",w:80,h:60,desc:"Coin vibration motor",voltage:3.3,
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"}] },

  // ═══ ENVIRONMENTAL & WEATHER SENSORS ═══
  { id:"sen_bmp180",name:"BMP180 Pressure",category:"Sensors",domain:"all",w:80,h:80,desc:"Barometric pressure + temp",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"sen_bmp388",name:"BMP388 Precision",category:"Sensors",domain:"drone",w:80,h:80,desc:"High-precision pressure sensor",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"sen_bme680",name:"BME680 Air Quality",category:"Sensors",domain:"all",w:90,h:90,desc:"Temp+humidity+pressure+VOC gas",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:54,t:"i2c"},{l:"INT",s:"L",o:68,t:"gpio"}] },
  { id:"sen_sht31",name:"SHT31 T/H",category:"Sensors",domain:"all",w:80,h:80,desc:"High-accuracy temp/humidity",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"sen_aht20",name:"AHT20 T/H",category:"Sensors",domain:"all",w:80,h:80,desc:"Compact I2C temp/humidity",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"sen_ds18b20",name:"DS18B20 Temp",category:"Sensors",domain:"all",w:80,h:60,desc:"OneWire digital temperature",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"DATA",s:"L",o:30,t:"gpio"},{l:"GND",s:"L",o:45,t:"gnd"}] },
  { id:"sen_thermistor",name:"NTC Thermistor",category:"Sensors",domain:"all",w:60,h:50,desc:"10k NTC analog thermistor",
    pins:[{l:"1",s:"L",o:15,t:"adc"},{l:"2",s:"L",o:30,t:"gnd"}] },
  { id:"sen_thermocouple",name:"MAX6675 Thermocouple",category:"Sensors",domain:"all",w:90,h:90,desc:"K-type thermocouple amp SPI",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SCK",s:"L",o:40,t:"spi"},{l:"CS",s:"L",o:54,t:"spi"},{l:"SO",s:"L",o:68,t:"spi"}] },
  { id:"sen_uv_ml8511",name:"ML8511 UV Sensor",category:"Sensors",domain:"all",w:80,h:70,desc:"UV light intensity sensor",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"adc"},{l:"EN",s:"L",o:60,t:"gpio"}] },
  { id:"sen_lux_bh1750",name:"BH1750 Lux Meter",category:"Sensors",domain:"all",w:80,h:70,desc:"Digital ambient light sensor I2C",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:54,t:"i2c"},{l:"ADDR",s:"L",o:68,t:"gpio"}] },
  { id:"sen_lux_tsl2561",name:"TSL2561 Lux",category:"Sensors",domain:"all",w:80,h:70,desc:"Wide-range luminosity sensor",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"sen_color_tcs34725",name:"TCS34725 Color",category:"Sensors",domain:"all",w:90,h:80,desc:"RGB color sensor with IR filter",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:54,t:"i2c"},{l:"LED",s:"L",o:68,t:"gpio"},{l:"INT",s:"L",o:82,t:"gpio"}] },
  { id:"sen_co2_mhz19",name:"MH-Z19B CO2",category:"Sensors",domain:"all",w:100,h:90,desc:"NDIR CO2 sensor 0-5000ppm",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"PWM",s:"L",o:68,t:"pwm"}] },
  { id:"sen_co2_scd30",name:"SCD30 CO2 + T/H",category:"Sensors",domain:"all",w:100,h:90,desc:"NDIR CO2 with temp/humidity",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:54,t:"i2c"},{l:"RDY",s:"L",o:68,t:"gpio"}] },
  { id:"sen_pm25_pms5003",name:"PMS5003 PM2.5",category:"Sensors",domain:"all",w:120,h:100,desc:"Laser particulate matter PM1/2.5/10",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"SET",s:"L",o:68,t:"gpio"},{l:"RST",s:"L",o:82,t:"gpio"}] },
  { id:"sen_mq3",name:"MQ-3 Alcohol",category:"Sensors",domain:"all",w:80,h:80,desc:"Alcohol/ethanol gas sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"DOUT",s:"L",o:40,t:"gpio"},{l:"AOUT",s:"L",o:54,t:"adc"}] },
  { id:"sen_mq4",name:"MQ-4 Methane",category:"Sensors",domain:"all",w:80,h:80,desc:"Methane/CNG gas sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"DOUT",s:"L",o:40,t:"gpio"},{l:"AOUT",s:"L",o:54,t:"adc"}] },
  { id:"sen_mq7",name:"MQ-7 CO",category:"Sensors",domain:"all",w:80,h:80,desc:"Carbon monoxide sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"DOUT",s:"L",o:40,t:"gpio"},{l:"AOUT",s:"L",o:54,t:"adc"}] },
  { id:"sen_mq135",name:"MQ-135 Air Quality",category:"Sensors",domain:"all",w:80,h:80,desc:"NH3/NOx/alcohol/benzene sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"DOUT",s:"L",o:40,t:"gpio"},{l:"AOUT",s:"L",o:54,t:"adc"}] },
  { id:"sen_rain",name:"Rain Sensor",category:"Sensors",domain:"all",w:80,h:70,desc:"Rain detection module",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"DOUT",s:"L",o:44,t:"gpio"},{l:"AOUT",s:"L",o:60,t:"adc"}] },
  { id:"sen_anemometer",name:"Anemometer",category:"Sensors",domain:"all",w:90,h:80,desc:"Cup wind speed sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"PULSE",s:"L",o:45,t:"gpio"}] },
  { id:"sen_wind_vane",name:"Wind Vane",category:"Sensors",domain:"all",w:90,h:80,desc:"Wind direction sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"OUT",s:"L",o:45,t:"adc"}] },
  { id:"sen_rain_gauge",name:"Tipping Rain Gauge",category:"Sensors",domain:"all",w:90,h:70,desc:"Tipping bucket rainfall sensor",
    pins:[{l:"S1",s:"L",o:15,t:"gpio"},{l:"S2",s:"L",o:30,t:"gnd"}] },
  { id:"sen_hall",name:"Hall Effect A3144",category:"Sensors",domain:"all",w:70,h:60,desc:"Digital hall switch",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"OUT",s:"L",o:28,t:"gpio"},{l:"GND",s:"L",o:44,t:"gnd"}] },
  { id:"sen_hall_linear",name:"Linear Hall A1302",category:"Sensors",domain:"all",w:70,h:60,desc:"Analog hall sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"OUT",s:"L",o:28,t:"adc"},{l:"GND",s:"L",o:44,t:"gnd"}] },
  { id:"sen_reed",name:"Reed Switch",category:"Sensors",domain:"all",w:70,h:50,desc:"Magnetic reed switch",
    pins:[{l:"1",s:"L",o:15,t:"gpio"},{l:"2",s:"L",o:30,t:"gnd"}] },
  { id:"sen_tilt",name:"SW-520D Tilt",category:"Sensors",domain:"all",w:70,h:60,desc:"Ball tilt switch",
    pins:[{l:"S1",s:"L",o:15,t:"gpio"},{l:"S2",s:"L",o:30,t:"gnd"}] },
  { id:"sen_vibration",name:"SW-420 Vibration",category:"Sensors",domain:"all",w:80,h:70,desc:"Vibration sensor module",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"DOUT",s:"L",o:44,t:"gpio"}] },
  { id:"sen_knock",name:"Knock Sensor",category:"Sensors",domain:"all",w:80,h:70,desc:"Knock/impact sensor module",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"gpio"}] },
  { id:"sen_microphone",name:"Sound Sensor",category:"Sensors",domain:"all",w:80,h:70,desc:"Sound detection module",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"DOUT",s:"L",o:44,t:"gpio"},{l:"AOUT",s:"L",o:60,t:"adc"}] },
  { id:"sen_load_cell",name:"HX711 Load Cell",category:"Sensors",domain:"all",w:90,h:90,desc:"24-bit ADC for load cells",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"DT",s:"L",o:40,t:"gpio"},{l:"SCK",s:"L",o:54,t:"gpio"},{l:"E+",s:"R",o:12,t:"pwr"},{l:"E-",s:"R",o:26,t:"gnd"},{l:"A+",s:"R",o:40,t:"adc"},{l:"A-",s:"R",o:54,t:"adc"}] },
  { id:"sen_pressure_mpx",name:"MPX5700 Pressure",category:"Sensors",domain:"all",w:90,h:80,desc:"Analog pressure transducer",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"adc"}] },
  { id:"sen_flow",name:"YF-S201 Flow",category:"Sensors",domain:"all",w:90,h:70,desc:"Water flow sensor with hall pulse",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"PULSE",s:"L",o:45,t:"gpio"}] },
  { id:"sen_ph",name:"pH Sensor",category:"Sensors",domain:"all",w:100,h:80,desc:"Analog pH probe interface",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"PO",s:"L",o:44,t:"adc"},{l:"DO",s:"L",o:60,t:"gpio"}] },
  { id:"sen_tds",name:"TDS Sensor",category:"Sensors",domain:"all",w:90,h:80,desc:"Total dissolved solids sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"adc"}] },
  { id:"sen_turbidity",name:"Turbidity Sensor",category:"Sensors",domain:"all",w:90,h:80,desc:"Water turbidity/cloudiness",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"adc"}] },
  { id:"sen_ec",name:"EC Conductivity",category:"Sensors",domain:"all",w:90,h:80,desc:"Electrical conductivity sensor",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"adc"}] },
  { id:"sen_dissolved_o2",name:"Dissolved O2",category:"Sensors",domain:"all",w:90,h:80,desc:"Dissolved oxygen probe",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"adc"}] },
  { id:"sen_uvi_si1145",name:"SI1145 UV Index",category:"Sensors",domain:"all",w:80,h:80,desc:"UV index + IR + visible I2C",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"sen_lightning",name:"AS3935 Lightning",category:"Sensors",domain:"all",w:90,h:80,desc:"Lightning strike detector",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:54,t:"i2c"},{l:"IRQ",s:"L",o:68,t:"gpio"}] },
  { id:"sen_radar_24ghz",name:"RCWL-0516 Radar",category:"Sensors",domain:"all",w:90,h:80,desc:"Microwave motion radar",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"OUT",s:"L",o:44,t:"gpio"},{l:"3V3",s:"L",o:60,t:"pwr"}] },
  { id:"sen_radar_60ghz",name:"LD2410 mmWave",category:"Sensors",domain:"all",w:100,h:90,desc:"24GHz human presence radar",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"OUT",s:"L",o:68,t:"gpio"}] },

  // ═══ BIOMETRIC / SECURITY SENSORS ═══
  { id:"sen_fingerprint",name:"R307 Fingerprint",category:"Sensors",domain:"all",w:100,h:90,desc:"Optical fingerprint reader UART",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"WAK",s:"L",o:68,t:"gpio"}] },
  { id:"sen_fingerprint_as608",name:"AS608 Fingerprint",category:"Sensors",domain:"all",w:100,h:90,desc:"Capacitive fingerprint scanner",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"}] },
  { id:"sen_rfid_rc522",name:"RC522 RFID",category:"Sensors",domain:"all",w:100,h:110,desc:"13.56MHz RFID/NFC reader SPI",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"RST",s:"L",o:38,t:"gpio"},{l:"MISO",s:"L",o:52,t:"spi"},{l:"MOSI",s:"L",o:66,t:"spi"},{l:"SCK",s:"L",o:80,t:"spi"},{l:"SDA",s:"L",o:94,t:"spi"}] },
  { id:"sen_pn532",name:"PN532 NFC",category:"Sensors",domain:"all",w:110,h:100,desc:"NFC/RFID reader I2C/SPI/UART",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SDA",s:"L",o:40,t:"i2c"},{l:"SCL",s:"L",o:54,t:"i2c"},{l:"IRQ",s:"L",o:68,t:"gpio"},{l:"RST",s:"L",o:82,t:"gpio"}] },
  { id:"sen_keypad_4x4",name:"Keypad 4x4",category:"Sensors",domain:"all",w:100,h:120,desc:"Membrane matrix keypad",
    pins:[{l:"R1",s:"L",o:12,t:"gpio"},{l:"R2",s:"L",o:26,t:"gpio"},{l:"R3",s:"L",o:40,t:"gpio"},{l:"R4",s:"L",o:54,t:"gpio"},{l:"C1",s:"L",o:68,t:"gpio"},{l:"C2",s:"L",o:82,t:"gpio"},{l:"C3",s:"L",o:96,t:"gpio"},{l:"C4",s:"L",o:110,t:"gpio"}] },
  { id:"sen_keypad_3x4",name:"Keypad 3x4",category:"Sensors",domain:"all",w:100,h:100,desc:"Phone-style 12-key keypad",
    pins:[{l:"R1",s:"L",o:12,t:"gpio"},{l:"R2",s:"L",o:26,t:"gpio"},{l:"R3",s:"L",o:40,t:"gpio"},{l:"R4",s:"L",o:54,t:"gpio"},{l:"C1",s:"L",o:68,t:"gpio"},{l:"C2",s:"L",o:82,t:"gpio"},{l:"C3",s:"L",o:96,t:"gpio"}] },

  // ═══ ADVANCED VISION ═══
  { id:"cam_mlx90640",name:"MLX90640 Thermal",category:"Vision",domain:"all",w:100,h:90,desc:"32x24 IR thermal camera",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"cam_amg8833",name:"AMG8833 Thermal",category:"Vision",domain:"all",w:100,h:80,desc:"8x8 thermal grid sensor",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },
  { id:"cam_arducam",name:"ArduCAM OV5642",category:"Vision",domain:"all",w:110,h:100,desc:"5MP camera SPI module",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"CS",s:"L",o:38,t:"spi"},{l:"MOSI",s:"L",o:52,t:"spi"},{l:"MISO",s:"L",o:66,t:"spi"},{l:"SCK",s:"L",o:80,t:"spi"},{l:"SDA",s:"L",o:94,t:"i2c"}] },
  { id:"cam_husky_lens",name:"HuskyLens AI",category:"Vision",domain:"all",w:120,h:90,desc:"AI vision: face/object recognition",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"SCL",s:"L",o:68,t:"i2c"},{l:"SDA",s:"L",o:82,t:"i2c"}] },
  { id:"cam_ov7670",name:"OV7670 Camera",category:"Vision",domain:"all",w:120,h:140,desc:"VGA parallel camera 18-pin",voltage:3.3,
    pins:[{l:"3V3",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"SCL",s:"L",o:38,t:"i2c"},{l:"SDA",s:"L",o:52,t:"i2c"},{l:"VS",s:"L",o:66,t:"gpio"},{l:"HS",s:"L",o:80,t:"gpio"},{l:"PCLK",s:"L",o:94,t:"gpio"},{l:"XCLK",s:"L",o:108,t:"gpio"},{l:"D0",s:"R",o:10,t:"gpio"},{l:"D1",s:"R",o:24,t:"gpio"},{l:"D2",s:"R",o:38,t:"gpio"},{l:"D3",s:"R",o:52,t:"gpio"},{l:"D4",s:"R",o:66,t:"gpio"},{l:"D5",s:"R",o:80,t:"gpio"},{l:"D6",s:"R",o:94,t:"gpio"},{l:"D7",s:"R",o:108,t:"gpio"}] },
  { id:"cam_pir_grideye",name:"GridEye Sensor",category:"Vision",domain:"all",w:90,h:90,desc:"8x8 thermopile array",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SCL",s:"L",o:44,t:"i2c"},{l:"SDA",s:"L",o:60,t:"i2c"}] },

  // ═══ DISPLAYS — MORE TYPES ═══
  { id:"disp_oled_096_color",name:"OLED 0.96\" Color",category:"Displays",domain:"all",w:100,h:100,desc:"96x64 color SSD1331 SPI",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"SCK",s:"L",o:38,t:"spi"},{l:"MOSI",s:"L",o:52,t:"spi"},{l:"DC",s:"L",o:66,t:"gpio"},{l:"RST",s:"L",o:80,t:"gpio"},{l:"CS",s:"L",o:94,t:"spi"}] },
  { id:"disp_tft_ili9341",name:"TFT 2.4\" ILI9341",category:"Displays",domain:"all",w:110,h:120,desc:"320x240 color TFT touch SPI",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"CS",s:"L",o:38,t:"spi"},{l:"RST",s:"L",o:52,t:"gpio"},{l:"DC",s:"L",o:66,t:"gpio"},{l:"MOSI",s:"L",o:80,t:"spi"},{l:"SCK",s:"L",o:94,t:"spi"},{l:"MISO",s:"L",o:108,t:"spi"}] },
  { id:"disp_eink_15",name:"E-Ink 1.54\"",category:"Displays",domain:"all",w:110,h:120,desc:"200x200 e-paper display SPI",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"DIN",s:"L",o:38,t:"spi"},{l:"CLK",s:"L",o:52,t:"spi"},{l:"CS",s:"L",o:66,t:"spi"},{l:"DC",s:"L",o:80,t:"gpio"},{l:"RST",s:"L",o:94,t:"gpio"},{l:"BUSY",s:"L",o:108,t:"gpio"}] },
  { id:"disp_eink_29",name:"E-Ink 2.9\"",category:"Displays",domain:"all",w:120,h:120,desc:"296x128 e-paper display",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"DIN",s:"L",o:38,t:"spi"},{l:"CLK",s:"L",o:52,t:"spi"},{l:"CS",s:"L",o:66,t:"spi"},{l:"DC",s:"L",o:80,t:"gpio"},{l:"RST",s:"L",o:94,t:"gpio"},{l:"BUSY",s:"L",o:108,t:"gpio"}] },
  { id:"disp_lcd2004",name:"LCD 20x4 I2C",category:"Displays",domain:"all",w:110,h:80,desc:"20x4 character LCD I2C",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"SDA",s:"L",o:44,t:"i2c"},{l:"SCL",s:"L",o:60,t:"i2c"}] },
  { id:"disp_max7219",name:"MAX7219 8x8 LED",category:"Displays",domain:"all",w:100,h:100,desc:"8x8 LED matrix SPI driver",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"DIN",s:"L",o:40,t:"spi"},{l:"CS",s:"L",o:54,t:"spi"},{l:"CLK",s:"L",o:68,t:"spi"}] },
  { id:"disp_7seg_tm1637",name:"TM1637 4-digit",category:"Displays",domain:"all",w:100,h:80,desc:"4-digit 7-segment LED",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"DIO",s:"L",o:44,t:"gpio"},{l:"CLK",s:"L",o:60,t:"gpio"}] },
  { id:"disp_7seg_max7219",name:"MAX7219 7-seg",category:"Displays",domain:"all",w:100,h:90,desc:"8-digit 7-segment driver",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"DIN",s:"L",o:40,t:"spi"},{l:"CS",s:"L",o:54,t:"spi"},{l:"CLK",s:"L",o:68,t:"spi"}] },
  { id:"disp_ws2812_ring",name:"WS2812 LED Ring",category:"Displays",domain:"all",w:100,h:100,desc:"24-LED addressable ring",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"DIN",s:"L",o:44,t:"gpio"}] },
  { id:"disp_ws2812_panel",name:"WS2812 8x8 Panel",category:"Displays",domain:"all",w:110,h:110,desc:"64-LED RGB matrix",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:28,t:"gnd"},{l:"DIN",s:"L",o:44,t:"gpio"},{l:"DOUT",s:"R",o:44,t:"gpio"}] },
  { id:"disp_nextion",name:"Nextion 2.4\"",category:"Displays",domain:"all",w:120,h:90,desc:"HMI smart touchscreen UART",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"}] },

  // ═══ COMMUNICATION — MORE ═══
  { id:"com_esp01",name:"ESP-01 WiFi",category:"Communication",domain:"all",w:90,h:80,desc:"ESP8266 WiFi UART module",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"CH_PD",s:"L",o:68,t:"gpio"}] },
  { id:"com_hc05",name:"HC-05 Bluetooth",category:"Communication",domain:"all",w:90,h:80,desc:"Bluetooth 2.0 SPP module",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"EN",s:"L",o:68,t:"gpio"}] },
  { id:"com_hc06",name:"HC-06 Bluetooth",category:"Communication",domain:"all",w:90,h:80,desc:"Bluetooth slave-only",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"}] },
  { id:"com_ble_hm10",name:"HM-10 BLE",category:"Communication",domain:"all",w:90,h:80,desc:"Bluetooth Low Energy module",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"}] },
  { id:"com_sim800l",name:"SIM800L GSM",category:"Communication",domain:"all",w:100,h:100,desc:"2G GSM/GPRS module SMS+calls",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"TX",s:"L",o:38,t:"uart"},{l:"RX",s:"L",o:52,t:"uart"},{l:"RST",s:"L",o:66,t:"gpio"},{l:"DTR",s:"L",o:80,t:"gpio"}] },
  { id:"com_sim7600",name:"SIM7600 4G LTE",category:"Communication",domain:"all",w:120,h:110,desc:"4G LTE cellular modem",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"PWR",s:"L",o:68,t:"gpio"},{l:"USB",s:"L",o:82,t:"uart"}] },
  { id:"com_xbee",name:"XBee Pro",category:"Communication",domain:"all",w:100,h:120,desc:"ZigBee mesh radio",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"RST",s:"L",o:68,t:"gpio"},{l:"SLP",s:"L",o:82,t:"gpio"}] },
  { id:"com_w5500",name:"W5500 Ethernet",category:"Communication",domain:"all",w:110,h:110,desc:"Hardware Ethernet SPI",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"MISO",s:"L",o:38,t:"spi"},{l:"MOSI",s:"L",o:52,t:"spi"},{l:"SCK",s:"L",o:66,t:"spi"},{l:"CS",s:"L",o:80,t:"spi"},{l:"INT",s:"L",o:94,t:"gpio"}] },
  { id:"com_enc28j60",name:"ENC28J60 Eth",category:"Communication",domain:"all",w:110,h:110,desc:"Ethernet controller SPI",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"MISO",s:"L",o:38,t:"spi"},{l:"MOSI",s:"L",o:52,t:"spi"},{l:"SCK",s:"L",o:66,t:"spi"},{l:"CS",s:"L",o:80,t:"spi"}] },
  { id:"com_lora_e32",name:"E32-433T LoRa",category:"Communication",domain:"all",w:100,h:90,desc:"433MHz LoRa UART module",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"TX",s:"L",o:40,t:"uart"},{l:"RX",s:"L",o:54,t:"uart"},{l:"M0",s:"L",o:68,t:"gpio"},{l:"M1",s:"L",o:82,t:"gpio"}] },
  { id:"com_433_tx",name:"433MHz TX",category:"Communication",domain:"all",w:80,h:60,desc:"Simple 433MHz transmitter",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"DATA",s:"L",o:30,t:"gpio"},{l:"GND",s:"L",o:45,t:"gnd"}] },
  { id:"com_433_rx",name:"433MHz RX",category:"Communication",domain:"all",w:80,h:60,desc:"Simple 433MHz receiver",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"DATA",s:"L",o:30,t:"gpio"},{l:"GND",s:"L",o:45,t:"gnd"}] },
  { id:"com_ir_tx",name:"IR Transmitter",category:"Communication",domain:"all",w:70,h:60,desc:"38kHz IR LED",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"DATA",s:"L",o:45,t:"gpio"}] },
  { id:"com_ir_rx",name:"IR Receiver",category:"Communication",domain:"all",w:70,h:60,desc:"VS1838B IR demodulator",voltage:5,
    pins:[{l:"OUT",s:"L",o:15,t:"gpio"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"VCC",s:"L",o:45,t:"pwr"}] },

  // ═══ MORE MICROCONTROLLERS ═══
  { id:"mcu_arduino_uno",name:"Arduino Uno",category:"Microcontrollers",domain:"all",w:80,h:140,desc:"ATmega328P, 14 GPIO, 5V",voltage:5,
    pins:[{l:"5V",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"A4",s:"L",o:40,t:"i2c"},{l:"A5",s:"L",o:55,t:"i2c"},{l:"D0",s:"L",o:70,t:"uart"},{l:"D1",s:"L",o:85,t:"uart"},{l:"D2",s:"L",o:100,t:"gpio"},{l:"D3",s:"L",o:115,t:"pwm"},
          {l:"VIN",s:"R",o:10,t:"pwr"},{l:"3V3",s:"R",o:25,t:"pwr"},{l:"D9",s:"R",o:40,t:"pwm"},{l:"D10",s:"R",o:55,t:"pwm"},{l:"D11",s:"R",o:70,t:"pwm"},{l:"D12",s:"R",o:85,t:"spi"},{l:"D13",s:"R",o:100,t:"spi"},{l:"A0",s:"R",o:115,t:"adc"}] },
  { id:"mcu_arduino_nano",name:"Arduino Nano",category:"Microcontrollers",domain:"all",w:80,h:130,desc:"ATmega328P compact",voltage:5,
    pins:[{l:"5V",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"A4",s:"L",o:40,t:"i2c"},{l:"A5",s:"L",o:55,t:"i2c"},{l:"D0",s:"L",o:70,t:"uart"},{l:"D1",s:"L",o:85,t:"uart"},{l:"D2",s:"L",o:100,t:"gpio"},
          {l:"VIN",s:"R",o:10,t:"pwr"},{l:"3V3",s:"R",o:25,t:"pwr"},{l:"D9",s:"R",o:40,t:"pwm"},{l:"D10",s:"R",o:55,t:"pwm"},{l:"D11",s:"R",o:70,t:"pwm"},{l:"D13",s:"R",o:85,t:"spi"},{l:"A0",s:"R",o:100,t:"adc"}] },
  { id:"mcu_esp8266",name:"ESP8266 NodeMCU",category:"Microcontrollers",domain:"all",w:80,h:140,desc:"WiFi MCU, 11 GPIO, 3.3V",voltage:3.3,
    pins:[{l:"3V3",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"D1",s:"L",o:40,t:"i2c"},{l:"D2",s:"L",o:55,t:"i2c"},{l:"D5",s:"L",o:70,t:"spi"},{l:"D6",s:"L",o:85,t:"spi"},{l:"D7",s:"L",o:100,t:"spi"},{l:"D8",s:"L",o:115,t:"spi"},
          {l:"VIN",s:"R",o:10,t:"pwr"},{l:"EN",s:"R",o:25,t:"gpio"},{l:"D0",s:"R",o:40,t:"gpio"},{l:"D3",s:"R",o:55,t:"gpio"},{l:"D4",s:"R",o:70,t:"gpio"},{l:"A0",s:"R",o:85,t:"adc"},{l:"RX",s:"R",o:100,t:"uart"},{l:"TX",s:"R",o:115,t:"uart"}] },
  { id:"mcu_esp32_s3",name:"ESP32-S3",category:"Microcontrollers",domain:"all",w:80,h:140,desc:"Dual-core, AI accel, USB-OTG",voltage:3.3,
    pins:[{l:"3V3",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"D8",s:"L",o:40,t:"i2c"},{l:"D9",s:"L",o:55,t:"i2c"},{l:"D10",s:"L",o:70,t:"spi"},{l:"D11",s:"L",o:85,t:"spi"},{l:"D12",s:"L",o:100,t:"spi"},{l:"D13",s:"L",o:115,t:"spi"},
          {l:"VIN",s:"R",o:10,t:"pwr"},{l:"EN",s:"R",o:25,t:"gpio"},{l:"D1",s:"R",o:40,t:"adc"},{l:"D2",s:"R",o:55,t:"adc"},{l:"D3",s:"R",o:70,t:"pwm"},{l:"D4",s:"R",o:85,t:"pwm"},{l:"D5",s:"R",o:100,t:"pwm"},{l:"D6",s:"R",o:115,t:"pwm"}] },
  { id:"mcu_esp32_c3",name:"ESP32-C3",category:"Microcontrollers",domain:"all",w:80,h:120,desc:"RISC-V WiFi/BLE 5.0",voltage:3.3,
    pins:[{l:"3V3",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"D2",s:"L",o:40,t:"adc"},{l:"D3",s:"L",o:55,t:"adc"},{l:"D4",s:"L",o:70,t:"i2c"},{l:"D5",s:"L",o:85,t:"i2c"},{l:"D6",s:"L",o:100,t:"spi"},
          {l:"VIN",s:"R",o:10,t:"pwr"},{l:"D8",s:"R",o:25,t:"gpio"},{l:"D9",s:"R",o:40,t:"gpio"},{l:"D10",s:"R",o:55,t:"gpio"},{l:"D20",s:"R",o:70,t:"uart"},{l:"D21",s:"R",o:85,t:"uart"}] },
  { id:"mcu_pico_w",name:"RPi Pico W",category:"Microcontrollers",domain:"all",w:80,h:130,desc:"RP2040 with WiFi",voltage:3.3,
    pins:[{l:"GP0",s:"L",o:10,t:"uart"},{l:"GP1",s:"L",o:25,t:"uart"},{l:"GND",s:"L",o:40,t:"gnd"},{l:"GP2",s:"L",o:55,t:"gpio"},{l:"GP4",s:"L",o:70,t:"i2c"},{l:"GP5",s:"L",o:85,t:"i2c"},{l:"GP10",s:"L",o:100,t:"spi"},
          {l:"VSYS",s:"R",o:10,t:"pwr"},{l:"3V3",s:"R",o:25,t:"pwr"},{l:"GP28",s:"R",o:40,t:"adc"},{l:"GP27",s:"R",o:55,t:"adc"},{l:"GP26",s:"R",o:70,t:"adc"},{l:"GP22",s:"R",o:85,t:"gpio"},{l:"GP21",s:"R",o:100,t:"gpio"}] },
  { id:"mcu_stm32_bp",name:"STM32 Blue Pill",category:"Microcontrollers",domain:"all",w:80,h:130,desc:"STM32F103C8T6 ARM Cortex-M3",voltage:3.3,
    pins:[{l:"3V3",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:25,t:"gnd"},{l:"PB6",s:"L",o:40,t:"i2c"},{l:"PB7",s:"L",o:55,t:"i2c"},{l:"PA9",s:"L",o:70,t:"uart"},{l:"PA10",s:"L",o:85,t:"uart"},{l:"PA4",s:"L",o:100,t:"spi"},
          {l:"VIN",s:"R",o:10,t:"pwr"},{l:"PA0",s:"R",o:25,t:"adc"},{l:"PA1",s:"R",o:40,t:"adc"},{l:"PA2",s:"R",o:55,t:"adc"},{l:"PA5",s:"R",o:70,t:"spi"},{l:"PA6",s:"R",o:85,t:"spi"},{l:"PA7",s:"R",o:100,t:"spi"}] },
  { id:"mcu_xiao_esp32",name:"XIAO ESP32-C3",category:"Microcontrollers",domain:"all",w:70,h:110,desc:"Tiny ESP32 dev board",voltage:3.3,
    pins:[{l:"3V3",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"D0",s:"L",o:38,t:"adc"},{l:"D1",s:"L",o:52,t:"adc"},{l:"D2",s:"L",o:66,t:"gpio"},{l:"D3",s:"L",o:80,t:"gpio"},
          {l:"5V",s:"R",o:10,t:"pwr"},{l:"D6",s:"R",o:24,t:"uart"},{l:"D7",s:"R",o:38,t:"uart"},{l:"D8",s:"R",o:52,t:"spi"},{l:"D9",s:"R",o:66,t:"spi"},{l:"D10",s:"R",o:80,t:"spi"}] },
  { id:"mcu_seeeduino_xiao",name:"Seeeduino XIAO",category:"Microcontrollers",domain:"all",w:70,h:100,desc:"SAMD21 ARM Cortex-M0+",voltage:3.3,
    pins:[{l:"3V3",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"D0",s:"L",o:38,t:"adc"},{l:"D1",s:"L",o:52,t:"adc"},{l:"D2",s:"L",o:66,t:"adc"},
          {l:"5V",s:"R",o:10,t:"pwr"},{l:"D6",s:"R",o:24,t:"uart"},{l:"D7",s:"R",o:38,t:"uart"},{l:"D8",s:"R",o:52,t:"spi"},{l:"D9",s:"R",o:66,t:"spi"}] },

  // ═══ MORE MOTORS ═══
  { id:"mot_servo_360",name:"360° Servo MG995",category:"Servos",domain:"mobile",w:80,h:60,desc:"Continuous rotation servo high torque",voltage:5,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"SIG",s:"L",o:45,t:"pwm"}] },
  { id:"mot_servo_linear",name:"Linear Servo",category:"Servos",domain:"arm",w:90,h:60,desc:"Linear actuator servo",voltage:6,
    pins:[{l:"VCC",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"SIG",s:"L",o:45,t:"pwm"}] },
  { id:"mot_n20",name:"N20 Micro Gear",category:"Motors",domain:"mobile",w:80,h:60,desc:"Tiny gear motor 6V",
    pins:[{l:"M+",s:"L",o:18,t:"pwr"},{l:"M-",s:"L",o:38,t:"gnd"}] },
  { id:"mot_28byj48",name:"28BYJ-48 Stepper",category:"Motors",domain:"all",w:90,h:90,desc:"5V unipolar stepper with ULN2003",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"IN1",s:"L",o:40,t:"gpio"},{l:"IN2",s:"L",o:54,t:"gpio"},{l:"IN3",s:"L",o:68,t:"gpio"},{l:"IN4",s:"L",o:82,t:"gpio"}] },
  { id:"mot_dc_brushless_24v",name:"BLDC 24V Industrial",category:"Motors",domain:"arm",w:100,h:80,desc:"24V brushless industrial motor",
    pins:[{l:"A",s:"L",o:15,t:"phase"},{l:"B",s:"L",o:30,t:"phase"},{l:"C",s:"L",o:45,t:"phase"},{l:"HA",s:"L",o:60,t:"enc"},{l:"HB",s:"L",o:75,t:"enc"}] },

  // ═══ MORE DRIVERS ═══
  { id:"drv_uln2003",name:"ULN2003 Darlington",category:"Motor Drivers",domain:"all",w:90,h:100,desc:"7-channel relay/stepper driver",voltage:5,
    pins:[{l:"COM",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"IN1",s:"L",o:38,t:"gpio"},{l:"IN2",s:"L",o:52,t:"gpio"},{l:"IN3",s:"L",o:66,t:"gpio"},{l:"IN4",s:"L",o:80,t:"gpio"},
          {l:"OUT1",s:"R",o:10,t:"pwr"},{l:"OUT2",s:"R",o:24,t:"pwr"},{l:"OUT3",s:"R",o:38,t:"pwr"},{l:"OUT4",s:"R",o:52,t:"pwr"}] },
  { id:"drv_bts7960",name:"BTS7960 43A H-Bridge",category:"Motor Drivers",domain:"mobile",w:110,h:110,desc:"High-current motor driver 43A",voltage:24,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"R_EN",s:"L",o:38,t:"gpio"},{l:"L_EN",s:"L",o:52,t:"gpio"},{l:"RPWM",s:"L",o:66,t:"pwm"},{l:"LPWM",s:"L",o:80,t:"pwm"},
          {l:"M+",s:"R",o:24,t:"pwr"},{l:"M-",s:"R",o:38,t:"pwr"},{l:"B+",s:"R",o:52,t:"pwr"},{l:"B-",s:"R",o:66,t:"gnd"}] },
  { id:"drv_tmc2208",name:"TMC2208 Stepper",category:"Motor Drivers",domain:"arm",w:90,h:100,desc:"Silent stepper driver UART",
    pins:[{l:"VMOT",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"DIR",s:"L",o:38,t:"gpio"},{l:"STEP",s:"L",o:52,t:"gpio"},{l:"EN",s:"L",o:66,t:"gpio"},{l:"PDN",s:"L",o:80,t:"uart"},
          {l:"M1A",s:"R",o:10,t:"phase"},{l:"M1B",s:"R",o:24,t:"phase"},{l:"M2A",s:"R",o:38,t:"phase"},{l:"M2B",s:"R",o:52,t:"phase"}] },
  { id:"drv_tmc5160",name:"TMC5160 Stepper",category:"Motor Drivers",domain:"arm",w:100,h:120,desc:"High-power stepper SPI",
    pins:[{l:"VMOT",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"DIR",s:"L",o:38,t:"gpio"},{l:"STEP",s:"L",o:52,t:"gpio"},{l:"EN",s:"L",o:66,t:"gpio"},{l:"CS",s:"L",o:80,t:"spi"},{l:"SCK",s:"L",o:94,t:"spi"},{l:"SDI",s:"L",o:108,t:"spi"},
          {l:"M1A",s:"R",o:10,t:"phase"},{l:"M1B",s:"R",o:24,t:"phase"},{l:"M2A",s:"R",o:38,t:"phase"},{l:"M2B",s:"R",o:52,t:"phase"}] },
  { id:"drv_mosfet_module",name:"MOSFET Module",category:"Motor Drivers",domain:"all",w:90,h:80,desc:"High-current MOSFET switching module",
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SIG",s:"L",o:40,t:"gpio"},{l:"V+",s:"R",o:15,t:"pwr"},{l:"V-",s:"R",o:30,t:"gnd"},{l:"OUT+",s:"R",o:45,t:"pwr"},{l:"OUT-",s:"R",o:60,t:"gnd"}] },

  // ═══ AUDIO — MORE ═══
  { id:"aud_max98357",name:"MAX98357 I2S Amp",category:"Audio",domain:"all",w:90,h:80,desc:"I2S 3W class-D amplifier",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"DIN",s:"L",o:38,t:"gpio"},{l:"BCLK",s:"L",o:52,t:"gpio"},{l:"LRC",s:"L",o:66,t:"gpio"},{l:"SD",s:"L",o:80,t:"gpio"}] },
  { id:"aud_pam8403",name:"PAM8403 Stereo Amp",category:"Audio",domain:"all",w:90,h:80,desc:"3W stereo class-D amp",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"L_IN",s:"L",o:40,t:"adc"},{l:"R_IN",s:"L",o:54,t:"adc"},
          {l:"L+",s:"R",o:12,t:"pwr"},{l:"L-",s:"R",o:26,t:"gnd"},{l:"R+",s:"R",o:40,t:"pwr"},{l:"R-",s:"R",o:54,t:"gnd"}] },
  { id:"aud_inmp441",name:"INMP441 I2S Mic",category:"Audio",domain:"all",w:80,h:80,desc:"I2S MEMS microphone",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"WS",s:"L",o:38,t:"gpio"},{l:"SD",s:"L",o:52,t:"gpio"},{l:"SCK",s:"L",o:66,t:"gpio"},{l:"L/R",s:"L",o:80,t:"gpio"}] },
  { id:"aud_speaker_8ohm",name:"Speaker 8Ω",category:"Audio",domain:"all",w:80,h:60,desc:"Small 8Ω speaker",
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"}] },
  { id:"aud_isd1820",name:"ISD1820 Voice Rec",category:"Audio",domain:"all",w:100,h:90,desc:"Voice record/playback module",voltage:5,
    pins:[{l:"VCC",s:"L",o:10,t:"pwr"},{l:"GND",s:"L",o:24,t:"gnd"},{l:"REC",s:"L",o:38,t:"gpio"},{l:"PLAY",s:"L",o:52,t:"gpio"},{l:"FT",s:"L",o:66,t:"gpio"},{l:"P-E",s:"L",o:80,t:"gpio"}] },

  // ═══ POWER — MORE ═══
  { id:"pwr_lipo_2s",name:"LiPo 2S 1500mAh",category:"Power",domain:"all",w:100,h:60,desc:"7.4V 2-cell battery",
    pins:[{l:"+",s:"R",o:18,t:"pwr"},{l:"-",s:"R",o:38,t:"gnd"}] },
  { id:"pwr_lifepo4",name:"LiFePO4 12V",category:"Power",domain:"mobile",w:110,h:70,desc:"12.8V LiFePO4 pack",
    pins:[{l:"+",s:"R",o:18,t:"pwr"},{l:"-",s:"R",o:38,t:"gnd"}] },
  { id:"pwr_solar",name:"Solar Panel 6V",category:"Power",domain:"all",w:120,h:80,desc:"6V 2W solar panel",
    pins:[{l:"+",s:"R",o:18,t:"pwr"},{l:"-",s:"R",o:38,t:"gnd"}] },
  { id:"pwr_tp4056",name:"TP4056 Charger",category:"Power",domain:"all",w:90,h:80,desc:"Li-Ion 1A charger module",voltage:5,
    pins:[{l:"IN+",s:"L",o:12,t:"pwr"},{l:"IN-",s:"L",o:26,t:"gnd"},{l:"BAT+",s:"R",o:12,t:"pwr"},{l:"BAT-",s:"R",o:26,t:"gnd"},{l:"OUT+",s:"R",o:40,t:"pwr"},{l:"OUT-",s:"R",o:54,t:"gnd"}] },
  { id:"pwr_mt3608",name:"MT3608 Boost",category:"Power",domain:"all",w:80,h:60,desc:"DC-DC step-up converter",
    pins:[{l:"IN+",s:"L",o:15,t:"pwr"},{l:"IN-",s:"L",o:30,t:"gnd"},{l:"OUT+",s:"R",o:15,t:"pwr"},{l:"OUT-",s:"R",o:30,t:"gnd"}] },
  { id:"pwr_xl4015",name:"XL4015 Buck",category:"Power",domain:"all",w:90,h:70,desc:"5A adjustable buck converter",
    pins:[{l:"IN+",s:"L",o:12,t:"pwr"},{l:"IN-",s:"L",o:28,t:"gnd"},{l:"OUT+",s:"R",o:12,t:"pwr"},{l:"OUT-",s:"R",o:28,t:"gnd"}] },
  { id:"pwr_voltage_div",name:"Voltage Divider",category:"Power",domain:"all",w:80,h:60,desc:"Resistive voltage scaling",
    pins:[{l:"IN",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"OUT",s:"R",o:22,t:"adc"}] },
  { id:"pwr_ina219",name:"INA219 Current",category:"Power",domain:"all",w:90,h:80,desc:"Current/voltage I2C sensor",voltage:3.3,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:54,t:"i2c"},{l:"V+",s:"R",o:15,t:"pwr"},{l:"V-",s:"R",o:30,t:"gnd"}] },

  // ═══ MORE PROTOTYPING ═══
  { id:"proto_screw_shield",name:"Screw Shield",category:"Prototyping",domain:"all",w:120,h:120,desc:"Arduino screw terminal shield",
    pins:[{l:"D2",s:"L",o:12,t:"gpio"},{l:"D3",s:"L",o:26,t:"gpio"},{l:"D4",s:"L",o:40,t:"gpio"},{l:"D5",s:"L",o:54,t:"gpio"},{l:"D6",s:"L",o:68,t:"gpio"},{l:"D7",s:"L",o:82,t:"gpio"},
          {l:"5V",s:"R",o:12,t:"pwr"},{l:"GND",s:"R",o:26,t:"gnd"},{l:"3V3",s:"R",o:40,t:"pwr"},{l:"VIN",s:"R",o:54,t:"pwr"}] },
  { id:"proto_protoshield",name:"Proto Shield",category:"Prototyping",domain:"all",w:120,h:120,desc:"Arduino prototyping shield",
    pins:[{l:"P1",s:"L",o:12,t:"gpio"},{l:"P2",s:"L",o:26,t:"gpio"},{l:"P3",s:"L",o:40,t:"gpio"},{l:"P4",s:"L",o:54,t:"gpio"}] },
  { id:"proto_xt60",name:"XT60 Connector",category:"Prototyping",domain:"drone",w:80,h:60,desc:"60A power connector",
    pins:[{l:"+",s:"L",o:18,t:"pwr"},{l:"-",s:"L",o:38,t:"gnd"}] },
  { id:"proto_xt30",name:"XT30 Connector",category:"Prototyping",domain:"drone",w:70,h:60,desc:"30A power connector",
    pins:[{l:"+",s:"L",o:18,t:"pwr"},{l:"-",s:"L",o:38,t:"gnd"}] },
  { id:"proto_banana",name:"Banana Jack",category:"Prototyping",domain:"all",w:60,h:50,desc:"4mm banana socket",
    pins:[{l:"P",s:"L",o:18,t:"pwr"}] },

  // ═══ MORE PASSIVES ═══
  { id:"pas_fuse",name:"Fuse 5A",category:"Passives",domain:"all",w:80,h:50,desc:"Glass tube fuse",
    pins:[{l:"1",s:"L",o:15,t:"pwr"},{l:"2",s:"R",o:15,t:"pwr"}] },
  { id:"pas_ptc",name:"PTC Resettable",category:"Passives",domain:"all",w:70,h:50,desc:"Polyfuse self-resetting",
    pins:[{l:"1",s:"L",o:15,t:"pwr"},{l:"2",s:"R",o:15,t:"pwr"}] },
  { id:"pas_varistor",name:"Varistor",category:"Passives",domain:"all",w:70,h:50,desc:"MOV surge protector",
    pins:[{l:"1",s:"L",o:15,t:"pwr"},{l:"2",s:"R",o:15,t:"gnd"}] },
  { id:"pas_crystal",name:"Crystal Oscillator",category:"Passives",domain:"all",w:80,h:50,desc:"Quartz crystal",
    pins:[{l:"1",s:"L",o:15,t:"gpio"},{l:"2",s:"R",o:15,t:"gpio"}] },
  { id:"pas_transformer",name:"Transformer",category:"Passives",domain:"all",w:100,h:80,desc:"Small AC transformer",
    pins:[{l:"P1",s:"L",o:15,t:"pwr"},{l:"P2",s:"L",o:30,t:"pwr"},{l:"S1",s:"R",o:15,t:"pwr"},{l:"S2",s:"R",o:30,t:"pwr"}] },
  { id:"pas_relay_5v",name:"5V Relay",category:"Passives",domain:"all",w:90,h:80,desc:"5V SPDT relay",voltage:5,
    pins:[{l:"+",s:"L",o:15,t:"pwr"},{l:"-",s:"L",o:30,t:"gnd"},{l:"COM",s:"R",o:15,t:"pwr"},{l:"NO",s:"R",o:30,t:"pwr"},{l:"NC",s:"R",o:45,t:"pwr"}] },
  { id:"pas_speaker_buzzer",name:"Piezo Element",category:"Passives",domain:"all",w:70,h:60,desc:"Piezoelectric disc",
    pins:[{l:"+",s:"L",o:15,t:"pwm"},{l:"-",s:"L",o:30,t:"gnd"}] },
  { id:"pas_dpdt_switch",name:"DPDT Switch",category:"Passives",domain:"all",w:80,h:80,desc:"Double pole double throw",
    pins:[{l:"1A",s:"L",o:15,t:"pwr"},{l:"1B",s:"L",o:30,t:"pwr"},{l:"2A",s:"L",o:45,t:"pwr"},{l:"2B",s:"L",o:60,t:"pwr"}] },
  { id:"pas_rotary_switch",name:"Rotary Switch",category:"Passives",domain:"all",w:90,h:90,desc:"6-position rotary selector",
    pins:[{l:"COM",s:"L",o:12,t:"gpio"},{l:"1",s:"L",o:26,t:"gpio"},{l:"2",s:"L",o:40,t:"gpio"},{l:"3",s:"L",o:54,t:"gpio"},{l:"4",s:"L",o:68,t:"gpio"},{l:"5",s:"L",o:82,t:"gpio"}] },
  { id:"pas_joystick",name:"Joystick Module",category:"Passives",domain:"all",w:90,h:100,desc:"2-axis analog joystick + button",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"VRX",s:"L",o:40,t:"adc"},{l:"VRY",s:"L",o:54,t:"adc"},{l:"SW",s:"L",o:68,t:"gpio"}] },

  // ═══ ICs — MORE ═══
  { id:"ic_atmega328",name:"ATmega328P",category:"ICs",domain:"all",w:100,h:140,desc:"DIP-28 microcontroller chip",voltage:5,
    pins:[{l:"RST",s:"L",o:12,t:"gpio"},{l:"D0",s:"L",o:26,t:"uart"},{l:"D1",s:"L",o:40,t:"uart"},{l:"D2",s:"L",o:54,t:"gpio"},{l:"D3",s:"L",o:68,t:"pwm"},{l:"D4",s:"L",o:82,t:"gpio"},{l:"VCC",s:"L",o:96,t:"pwr"},{l:"GND",s:"L",o:110,t:"gnd"},
          {l:"D13",s:"R",o:12,t:"spi"},{l:"D12",s:"R",o:26,t:"spi"},{l:"D11",s:"R",o:40,t:"spi"},{l:"D10",s:"R",o:54,t:"spi"},{l:"D9",s:"R",o:68,t:"pwm"},{l:"A5",s:"R",o:82,t:"i2c"},{l:"A4",s:"R",o:96,t:"i2c"},{l:"AREF",s:"R",o:110,t:"adc"}] },
  { id:"ic_lm393",name:"LM393 Comparator",category:"ICs",domain:"all",w:90,h:90,desc:"Dual differential comparator",voltage:5,
    pins:[{l:"OUT1",s:"L",o:12,t:"gpio"},{l:"IN1-",s:"L",o:26,t:"adc"},{l:"IN1+",s:"L",o:40,t:"adc"},{l:"GND",s:"L",o:54,t:"gnd"},
          {l:"VCC",s:"R",o:12,t:"pwr"},{l:"OUT2",s:"R",o:26,t:"gpio"},{l:"IN2-",s:"R",o:40,t:"adc"},{l:"IN2+",s:"R",o:54,t:"adc"}] },
  { id:"ic_lm317",name:"LM317 Regulator",category:"ICs",domain:"all",w:80,h:80,desc:"Adjustable linear regulator",
    pins:[{l:"ADJ",s:"L",o:15,t:"adc"},{l:"OUT",s:"L",o:30,t:"pwr"},{l:"IN",s:"L",o:45,t:"pwr"}] },
  { id:"ic_7805",name:"7805 5V Reg",category:"ICs",domain:"all",w:80,h:80,desc:"5V linear regulator",
    pins:[{l:"IN",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"OUT",s:"L",o:45,t:"pwr"}] },
  { id:"ic_ams1117",name:"AMS1117 3.3V",category:"ICs",domain:"all",w:80,h:60,desc:"3.3V LDO regulator",
    pins:[{l:"IN",s:"L",o:15,t:"pwr"},{l:"GND",s:"L",o:30,t:"gnd"},{l:"OUT",s:"R",o:22,t:"pwr"}] },
  { id:"ic_4051",name:"CD4051 8-Mux",category:"ICs",domain:"all",w:100,h:130,desc:"8-channel analog mux",voltage:5,
    pins:[{l:"X",s:"L",o:12,t:"adc"},{l:"X0",s:"L",o:26,t:"adc"},{l:"X1",s:"L",o:40,t:"adc"},{l:"X2",s:"L",o:54,t:"adc"},{l:"X3",s:"L",o:68,t:"adc"},{l:"GND",s:"L",o:82,t:"gnd"},{l:"VEE",s:"L",o:96,t:"gnd"},{l:"X7",s:"L",o:110,t:"adc"},
          {l:"VCC",s:"R",o:12,t:"pwr"},{l:"X6",s:"R",o:26,t:"adc"},{l:"X5",s:"R",o:40,t:"adc"},{l:"X4",s:"R",o:54,t:"adc"},{l:"INH",s:"R",o:68,t:"gpio"},{l:"A",s:"R",o:82,t:"gpio"},{l:"B",s:"R",o:96,t:"gpio"},{l:"C",s:"R",o:110,t:"gpio"}] },
  { id:"ic_max485",name:"MAX485 RS485",category:"ICs",domain:"all",w:90,h:90,desc:"RS-485 transceiver chip",voltage:5,
    pins:[{l:"RO",s:"L",o:12,t:"uart"},{l:"RE",s:"L",o:26,t:"gpio"},{l:"DE",s:"L",o:40,t:"gpio"},{l:"DI",s:"L",o:54,t:"uart"},
          {l:"VCC",s:"R",o:12,t:"pwr"},{l:"B",s:"R",o:26,t:"uart"},{l:"A",s:"R",o:40,t:"uart"},{l:"GND",s:"R",o:54,t:"gnd"}] },
  { id:"ic_mcp3008",name:"MCP3008 ADC",category:"ICs",domain:"all",w:100,h:140,desc:"8-ch 10-bit SPI ADC",voltage:5,
    pins:[{l:"CH0",s:"L",o:12,t:"adc"},{l:"CH1",s:"L",o:26,t:"adc"},{l:"CH2",s:"L",o:40,t:"adc"},{l:"CH3",s:"L",o:54,t:"adc"},{l:"CH4",s:"L",o:68,t:"adc"},{l:"CH5",s:"L",o:82,t:"adc"},{l:"CH6",s:"L",o:96,t:"adc"},{l:"CH7",s:"L",o:110,t:"adc"},
          {l:"VDD",s:"R",o:12,t:"pwr"},{l:"VREF",s:"R",o:26,t:"pwr"},{l:"AGND",s:"R",o:40,t:"gnd"},{l:"CLK",s:"R",o:54,t:"spi"},{l:"DOUT",s:"R",o:68,t:"spi"},{l:"DIN",s:"R",o:82,t:"spi"},{l:"CS",s:"R",o:96,t:"spi"},{l:"DGND",s:"R",o:110,t:"gnd"}] },
  { id:"ic_dac_mcp4725",name:"MCP4725 DAC",category:"ICs",domain:"all",w:90,h:80,desc:"12-bit I2C DAC",voltage:5,
    pins:[{l:"VCC",s:"L",o:12,t:"pwr"},{l:"GND",s:"L",o:26,t:"gnd"},{l:"SCL",s:"L",o:40,t:"i2c"},{l:"SDA",s:"L",o:54,t:"i2c"},{l:"OUT",s:"L",o:68,t:"adc"}] },
];

const CATEGORIES = [...new Set(ROBOTICS_LIB.map(c => c.category))];
const DOMAINS = { all: "All", mobile: "Mobile", arm: "Arms", drone: "Drones" };
const PIN_COLORS = { pwr:"#ff6b6b", gnd:"#4a4a6a", gpio:"#6cb6ff", pwm:"#9580ff", i2c:"#ffb86c", spi:"#f1fa8c", uart:"#2de8a0", adc:"#00e5cc", dac:"#00e5cc", phase:"#ff6b6b", enc:"#9580ff", can:"#ffb86c" };

const BOARDS = {
  "ESP32": { proc:"Xtensa LX6", clock:"240MHz", v:3.3, ram:"520KB", flash:"4MB" },
  "Teensy 4.1": { proc:"Cortex-M7", clock:"600MHz", v:3.3, ram:"1MB", flash:"8MB" },
  "RPi Pico": { proc:"RP2040", clock:"133MHz", v:3.3, ram:"264KB", flash:"2MB" },
  "Arduino Mega": { proc:"ATmega2560", clock:"16MHz", v:5, ram:"8KB", flash:"256KB" },
  "Pixhawk 6C": { proc:"STM32H7", clock:"480MHz", v:5, ram:"1MB", flash:"2MB" },
};

// ─── PROJECT TEMPLATES ──────────────────────────────────────
const TEMPLATES = {
  blank: { name: "Blank Project", desc: "Empty project to start fresh", components: [], wires: [], code: "// HELIX Robotics Project\n\nvoid setup() {\n  Serial.begin(115200);\n  Serial.println(\"HELIX Robot Ready\");\n}\n\nvoid loop() {\n  // Your robotics logic here\n}" },
  line_follower: {
    name: "Line Following Robot", desc: "ESP32 + L298N + IR array + DC motors",
    components: [
      { id: "mcu_esp32", x: 100, y: 100 },
      { id: "drv_l298n", x: 320, y: 100 },
      { id: "sen_ir_array", x: 100, y: 320 },
      { id: "mot_dc_gear", x: 540, y: 80 },
      { id: "mot_dc_gear", x: 540, y: 200 },
    ],
    code: `// HELIX Line Follower
#define IN1 5\n#define IN2 18\n#define IN3 19\n#define IN4 23\n#define ENA 13\n#define ENB 12\n#define IR_LEFT 34\n#define IR_RIGHT 35\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENA, OUTPUT); pinMode(ENB, OUTPUT);\n}\n\nvoid forward() {\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(ENA, 180); analogWrite(ENB, 180);\n}\n\nvoid loop() {\n  int l = analogRead(IR_LEFT);\n  int r = analogRead(IR_RIGHT);\n  if (l < 500 && r < 500) forward();\n  // Add turn logic here\n}`,
  },
  quadcopter: {
    name: "Quadcopter Drone", desc: "Pixhawk + 4 ESCs + BLDC motors + IMU",
    components: [
      { id: "mcu_fc_pixhawk", x: 250, y: 150 },
      { id: "drv_esc_30a", x: 50, y: 50 },
      { id: "drv_esc_30a", x: 480, y: 50 },
      { id: "drv_esc_30a", x: 50, y: 280 },
      { id: "drv_esc_30a", x: 480, y: 280 },
      { id: "imu_icm20948", x: 250, y: 380 },
      { id: "pwr_lipo_4s", x: 250, y: 30 },
    ],
    code: `// HELIX Quadcopter Stub\n// Pixhawk runs PX4/ArduPilot firmware natively\n// Use MAVLink for telemetry & commands\n\n#include <mavlink.h>\n\nvoid setup() {\n  Serial.begin(57600); // MAVLink baud\n}\n\nvoid loop() {\n  // Send heartbeat\n  // Read RC input\n  // Send motor commands via PWM\n}`,
  },
  robot_arm: {
    name: "6-DOF Robotic Arm", desc: "ESP32 + PCA9685 + 6 servos",
    components: [
      { id: "mcu_esp32", x: 100, y: 150 },
      { id: "drv_pca9685", x: 320, y: 150 },
      { id: "srv_mg996r", x: 540, y: 30 },
      { id: "srv_mg996r", x: 540, y: 110 },
      { id: "srv_mg996r", x: 540, y: 190 },
      { id: "srv_mg996r", x: 540, y: 270 },
      { id: "srv_mg996r", x: 540, y: 350 },
      { id: "srv_sg90", x: 540, y: 430 },
    ],
    code: `// HELIX 6-DOF Robotic Arm\n#include <Wire.h>\n#include <Adafruit_PWMServoDriver.h>\n\nAdafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();\n\n#define SERVOMIN 150\n#define SERVOMAX 600\n\nvoid setup() {\n  Serial.begin(115200);\n  pwm.begin();\n  pwm.setPWMFreq(50);\n}\n\nvoid moveJoint(uint8_t joint, int angle) {\n  int pulse = map(angle, 0, 180, SERVOMIN, SERVOMAX);\n  pwm.setPWM(joint, 0, pulse);\n}\n\nvoid loop() {\n  for (int j = 0; j < 6; j++) {\n    moveJoint(j, 90);\n  }\n  delay(1000);\n}`,
  },
};

// ─── Build a compact pinout reference for the AI ────
const buildPinoutRef = () => {
  // Group by category for compactness and AI clarity
  const byCategory = {};
  ROBOTICS_LIB.forEach(c => {
    if (!byCategory[c.category]) byCategory[c.category] = [];
    byCategory[c.category].push(c);
  });
  return Object.entries(byCategory).map(([cat, parts]) => {
    return `\n[${cat}]\n` + parts.map(c => {
      const pins = c.pins.map(p => p.l).join(",");
      return `  ${c.id}: [${pins}]`;
    }).join("\n");
  }).join("\n");
};
const PINOUT_REF = buildPinoutRef();

// ─── HELIX AI SYSTEM PROMPT ──────────────────────────
const buildRoboticsPrompt = (board, components, wires, code, fileList) => {
  const placedDetail = components.length > 0
    ? components.map(c => `  - ${c.id} (uid: ${c.uid}, name: ${c.name}, pins: [${c.pins.map(p => p.l).join(",")}])`).join("\n")
    : "  (none yet)";

  return `You are HELIX AI, an expert engineer embedded in the HELIX IDE. You build complete electronics + robotics projects: schematics, wiring, code, files, all of it. You handle robotics (mobile robots, arms, drones, humanoids) AND general prototyping (breadboards, sensors, displays, audio, IoT).

You have FULL CONTROL over the IDE through tool calls. You can place components, wire them, write code, create files, switch boards, open views, compile, even rotate or move parts. Use this to build complete working projects.

═══ CURRENT PROJECT STATE ═══
BOARD: ${board}
PLACED COMPONENTS:
${placedDetail}
EXISTING WIRES: ${wires.length}
PROJECT FILES: ${fileList.join(", ")}
CURRENT CODE PREVIEW:
\`\`\`
${code.slice(0, 600)}
\`\`\`

═══ HOW TO RESPOND — READ THIS CAREFULLY ═══

You have TWO response modes. Pick exactly one per message.

**MODE A — ACTION BLOCK (default for almost everything)**
If the user wants you to DO anything in the IDE — build, add, wire, generate, connect, make, fix, create, set up, design — you MUST respond with ONLY a helix-actions JSON block. Wrap it in \`\`\`helix-actions ... \`\`\` fences. NO prose before. NO prose after. NO tutorial. NO bullet points. NO "here is what we will build". JUST the action block. The "message" action inside the block is where you can put a one-line summary for the user.

WRONG (do not do this):
"Here's a comprehensive project for a self-guided line follower! Components: 1. ESP32... 2. VL53L0X... Wiring: Connect SCL to GPIO 18..."

RIGHT:
\`\`\`helix-actions
{ "actions": [ ... full action list ... ] }
\`\`\`

**MODE B — PLAIN TEXT (rare, only for pure questions)**
If the user asks a CONCEPTUAL question with no action ("how does PWM work?", "what is I2C?", "explain inverse kinematics"), respond with plain text. Keep it short.

If you are unsure which mode, default to MODE A. Building is always preferable to explaining.

═══ DEEP REASONING — THINK BEFORE YOU BUILD ═══

Before emitting any actions, walk through this checklist mentally. Do not output the checklist — only its conclusions, encoded as actions.

1. **Decompose the request.** What is the end goal? What sub-systems does it need? A "weather station" decomposes into: sensing (which sensors?), display (LCD? OLED? web?), power (battery? USB?), connectivity (WiFi? LoRa?), enclosure considerations (don't model these but be aware).

2. **Pick the right MCU.** Not every project needs an ESP32. Use Arduino Uno for simple analog projects, ESP32 when WiFi/BT is needed, Raspberry Pi Pico for cheap GPIO-heavy work, Teensy 4.1 for high-speed signal processing, RPi 5 only when you need an OS / cameras / heavy compute. Justify implicitly through your choice.

3. **Add EVERY component the project actually needs.** Beginners forget: pull-up resistors for buttons, level shifters for 3.3V↔5V mixing, decoupling capacitors near ICs, motor drivers for any motor (NEVER wire a motor straight to an MCU pin), flyback diodes for relays/inductive loads, current-limiting resistors for LEDs, voltage dividers for over-spec analog inputs, fuses or PTCs for battery projects, common ground between separately-powered subsystems.

4. **Wire EVERY required connection.** A typical project has 3 wire categories you must cover:
   - **Power**: VCC/5V/3.3V from source to every chip and module. Never assume "the user knows."
   - **Ground**: GND from source to every component, AND between any separately-powered subsystems (motor supply ground must connect to logic supply ground).
   - **Signal**: I2C (SDA+SCL pair to every I2C device), SPI (MOSI/MISO/SCK + unique CS per device), UART (TX↔RX crossed), GPIO (pin-to-pin for digital, pin-to-ADC for analog).

5. **Match voltages.** A 5V sensor on a 3.3V ESP32 needs a level shifter or a 3.3V variant. A 12V motor needs a separate supply, not the MCU's 5V rail. Check the voltage field of every component you place against its power source. If they mismatch and there's no level shifter or buck/boost in between, you have a bug.

6. **Generate firmware that matches the wiring.** The code you write must reference the EXACT pins you wired. If you wired a sensor's SDA to GPIO21 on ESP32, your \`Wire.begin(21, 22)\` must use 21 not the default. Use \`#define\` constants at the top of the file for every pin so the user can read the pin map at a glance. Add comments explaining what each pin does.

7. **Write code that compiles.** Include all required \`#include\` directives. Initialize every library in \`setup()\`. Handle errors (sensor not found, WiFi connect failure). Use \`Serial.println\` for status output during \`setup()\` and key events during \`loop()\` so the user can debug via serial monitor.

8. **Open the right view at the end.** After building, end your action block with an \`open_view\` action pointing at the schematic so the user immediately sees their built project. If you also wrote significant code, follow that with a \`set_active_file\` action targeting the main code file.

9. **Be ambitious.** If the user asks for "a robot arm," don't build a single-servo demo — build a 4-DOF arm with PCA9685 driver, joystick or web control, and a position-tracking loop. If they ask for "a weather station," include temp+humidity+pressure+air-quality+display+WiFi upload+battery monitor. The point of HELIX is that the user gets MORE than they asked for, not less. Aim for impressive, not minimal.

10. **Self-check before emitting.** Before you write your final action block, mentally re-read it: does every component have power? Does every component have ground? Does the code reference the same pins you wired? Are there any motors without drivers, any I2C devices without pull-ups (note: most modules include them, you don't need to add them — but ICs in DIP form do)? If any answer is "no," fix the action list before emitting.

═══ COMMON PROJECT RECIPES (use as scaffolds, expand from these) ═══

**Mobile robot (line follower, obstacle avoider, sumo bot)**: ESP32 or Arduino Uno + L298N or TB6612 driver + 2× geared DC motors + 2× IR or VL53L0X sensors + LiPo 2S + buck converter to 5V + common ground between motor and logic supplies. Code: PID-style steering loop based on sensor delta.

**Robotic arm**: ESP32 + PCA9685 16-channel servo driver + 4-6× MG996R servos + 6V 5A power supply for servos (NOT from MCU) + common ground. Code: inverse kinematics or joint-angle setpoints, smooth interpolation between poses.

**Drone**: Pixhawk or Teensy 4.1 + MPU9250 IMU + BMP388 barometer + 4× ESCs + 4× brushless motors + GPS + telemetry radio + LiPo 4S. Code: PID stabilization loop, RC input parsing.

**Weather station**: ESP32 + BME680 (temp/humidity/pressure/VOC) + BH1750 lux + optional anemometer/wind vane/rain gauge + OLED or e-ink display + 18650 + TP4056 charger + solar panel. Code: sensor read loop, OLED render, WiFi MQTT upload, deep sleep between reads.

**Smart lock / access control**: ESP32 + R307 fingerprint OR PN532 NFC + servo or solenoid lock + power supply + buzzer + status LEDs. Code: enrollment mode, verification mode, log to flash, optional WiFi notification.

**Audio project**: ESP32 + INMP441 I2S mic OR DFPlayer mini + MAX98357 I2S amp + speaker + battery. Code: I2S setup, audio sample buffer, processing.

**Air quality monitor**: ESP32 + PMS5003 (PM2.5/PM10) + SCD30 (CO2) + BME680 (VOC) + OLED + WiFi + battery. Code: sensor polling, AQI calculation, MQTT upload.

═══ ACTION BLOCK FORMAT ═══
\`\`\`helix-actions
{
  "actions": [
    { "type": "set_board", "board": "ESP32" },
    { "type": "add_component", "component_id": "mcu_esp32", "x": 100, "y": 100 },
    { "type": "wire", "from": "mcu_esp32:GND", "to": "imu_mpu6050:GND" },
    { "type": "create_file", "name": "imu.h", "code": "// IMU helper" },
    { "type": "set_code", "file": "main.ino", "code": "// full firmware" },
    { "type": "open_view", "view": "schematic" },
    { "type": "message", "text": "Built the IMU subsystem" }
  ]
}
\`\`\`

═══ FULL ACTION API ═══

# Schematic actions
- add_component { component_id, x, y } — places a part. x range 50-700, y range 50-500. Space them 150px+ apart.
- wire { from: "compID:pinLabel", to: "compID:pinLabel" } — use #1, #2 for multiple instances of same part.
- delete_component { ref: "compID" or "compID#N" } — removes a placed component
- delete_wire { from, to } — removes a specific wire
- move_component { ref, x, y }
- rotate_component { ref } — flips pins to opposite side
- clear_schematic — wipes all components and wires
- clear_wires — wipes wires only

# Code/file actions
- set_code { code, file? } — replaces a file's content (defaults to active file)
- append_code { code, file? } — appends to a file
- create_file { name, code? } — creates a new file in the src/ folder
- delete_file { name } — removes a file
- set_active_file { name } — switches the editor to that file

# Project actions
- set_board { board: "ESP32" | "Teensy 4.1" | "RPi Pico" | "Arduino Mega" | "Pixhawk 6C" }
- open_view { view: "schematic" | "pcb" | "bom" | "drc" | "serial" | "export" }
- compile — runs the simulated compile
- serial_print { text } — adds a line to the serial monitor (for demos)

# Communication
- message { text } — chat message to user
- note { text } — system note in chat (use for tips/warnings)

═══ CRITICAL RULES FOR BUILDING ═══

1. **WIRE EVERYTHING.** Every component must be fully wired:
   - Every VCC/3V3/5V pin to a power source
   - Every GND pin to ground (common ground across all components)
   - Every signal pin to where it functions
   - Motors connect to driver outputs, NEVER directly to MCU pins
   - I2C devices share SDA and SCL on the same bus
   - SPI devices share MISO/MOSI/SCK with unique CS lines

2. **USE EXACT PIN LABELS.** Pin labels are case-sensitive. Refer to the pinout dictionary. Do not invent pin names.

3. **ALWAYS WRITE CODE.** When building hardware, generate matching firmware. The code must reference the same pin numbers you wired.

4. **SPACE COMPONENTS.** MCU on the left (x: 100), peripherals to the right (x: 300, 500, 700). 150px+ y-spacing.

5. **POWER RAILS.** When using motors, add a battery and connect to motor driver power inputs. Keep MCU power separate.

6. **MULTI-FILE PROJECTS.** For complex projects, create separate files: main.ino for the entry point, drivers.h for hardware abstraction, config.h for pin definitions. Use create_file to organize.

═══ MANDATORY PRE-FLIGHT CHECKLIST ═══
Before outputting your action block, walk through this:

☐ Does my project use motors? If YES, I MUST add a motor driver (drv_l298n/drv_tb6612 for DC, drv_a4988/drv_drv8825 for steppers, drv_esc_30a/drv_odrive for BLDC).
☐ I MUST NEVER wire mot_dc_gear:M+ directly to mcu_esp32:D5. Motors go to driver OUTPUTs (drv_l298n:OUT1).
☐ mot_dc_gear has ONLY M+ and M-. No VCC, no GND on the motor itself.
☐ pwr_li_ion has ONLY + and -.
☐ sen_ir_array has ONLY S1 and S2 (not S3-S5).
☐ Did I check the pinout dictionary for EXACT pin labels?
☐ Did I add a battery for motor projects?
☐ Common ground tied across all components?
☐ Code references the same pin numbers I wired?
☐ For complex projects with displays/sensors, did I structure code into multiple files?

═══ COMPONENT PINOUT DICTIONARY ═══
${PINOUT_REF}

═══ COMPLETE WORKED EXAMPLE ═══
User says: "Build a basic line follower"

Your response:
\`\`\`helix-actions
{
  "actions": [
    { "type": "add_component", "component_id": "mcu_esp32", "x": 100, "y": 100 },
    { "type": "add_component", "component_id": "drv_l298n", "x": 320, "y": 100 },
    { "type": "add_component", "component_id": "sen_ir_array", "x": 100, "y": 320 },
    { "type": "add_component", "component_id": "mot_dc_gear", "x": 540, "y": 80 },
    { "type": "add_component", "component_id": "mot_dc_gear", "x": 540, "y": 200 },
    { "type": "add_component", "component_id": "pwr_li_ion", "x": 320, "y": 320 },

    { "type": "wire", "from": "mcu_esp32:D5",  "to": "drv_l298n:IN1" },
    { "type": "wire", "from": "mcu_esp32:D18", "to": "drv_l298n:IN2" },
    { "type": "wire", "from": "mcu_esp32:D19", "to": "drv_l298n:IN3" },
    { "type": "wire", "from": "mcu_esp32:D23", "to": "drv_l298n:IN4" },
    { "type": "wire", "from": "mcu_esp32:D13", "to": "drv_l298n:ENA" },
    { "type": "wire", "from": "mcu_esp32:D12", "to": "drv_l298n:ENB" },

    { "type": "wire", "from": "drv_l298n:OUT1", "to": "mot_dc_gear#1:M+" },
    { "type": "wire", "from": "drv_l298n:OUT2", "to": "mot_dc_gear#1:M-" },
    { "type": "wire", "from": "drv_l298n:OUT3", "to": "mot_dc_gear#2:M+" },
    { "type": "wire", "from": "drv_l298n:OUT4", "to": "mot_dc_gear#2:M-" },

    { "type": "wire", "from": "mcu_esp32:3V3", "to": "sen_ir_array:VCC" },
    { "type": "wire", "from": "mcu_esp32:GND", "to": "sen_ir_array:GND" },
    { "type": "wire", "from": "mcu_esp32:D26", "to": "sen_ir_array:S1" },
    { "type": "wire", "from": "mcu_esp32:D25", "to": "sen_ir_array:S2" },

    { "type": "wire", "from": "pwr_li_ion:+", "to": "drv_l298n:VCC" },
    { "type": "wire", "from": "pwr_li_ion:-", "to": "drv_l298n:GND" },
    { "type": "wire", "from": "mcu_esp32:GND", "to": "drv_l298n:GND" },

    { "type": "create_file", "name": "config.h", "code": "// Pin config\\n#define IN1 5\\n#define IN2 18\\n#define IN3 19\\n#define IN4 23\\n#define ENA 13\\n#define ENB 12\\n#define IR_LEFT 26\\n#define IR_RIGHT 25\\n" },
    { "type": "set_code", "file": "main.ino", "code": "#include \\"config.h\\"\\n\\nvoid setup() {\\n  Serial.begin(115200);\\n  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\\n  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\\n  pinMode(ENA, OUTPUT); pinMode(ENB, OUTPUT);\\n}\\n\\nvoid drive(int l, int r) {\\n  digitalWrite(IN1, l > 0); digitalWrite(IN2, l < 0);\\n  digitalWrite(IN3, r > 0); digitalWrite(IN4, r < 0);\\n  analogWrite(ENA, abs(l));\\n  analogWrite(ENB, abs(r));\\n}\\n\\nvoid loop() {\\n  int left = analogRead(IR_LEFT);\\n  int right = analogRead(IR_RIGHT);\\n  if (left < 500 && right < 500) drive(180, 180);\\n  else if (left < 500) drive(80, 180);\\n  else if (right < 500) drive(180, 80);\\n  else drive(0, 0);\\n  delay(10);\\n}" },
    { "type": "open_view", "view": "schematic" },
    { "type": "message", "text": "Built a line follower: ESP32 + L298N driving 2 DC motors with IR array sensing. Pin assignments in config.h match the wiring exactly. Open the schematic to see it." }
  ]
}
\`\`\`

This response: 6 components, 20 wires, 2 files (config.h + main.ino), opens the schematic view, and explains what was built. This is a COMPLETE project. Match this level of completeness.

═══ DOMAIN KNOWLEDGE ═══
- MOBILE robots: differential drive (2 motors + driver), PID for speed control, IMU for heading, encoders for odometry, IR/ultrasonic/lidar for obstacle avoidance
- ROBOTIC ARMS: PCA9685 over I2C controls up to 16 servos, inverse kinematics for positioning, force sensors for grippers
- DRONES: Pixhawk runs PX4/ArduPilot natively, 4 ESCs drive 4 BLDC motors in X-config, IMU for stabilization
- HUMANOIDS: many servos coordinated via CAN bus or Dynamixel TTL daisy chain
- IoT/PROTOTYPING: ESP32 + sensors (DHT22, BME280) + display (OLED) + WiFi/MQTT
- DATA LOGGING: SD card module + RTC + sensors

═══ SAFETY ═══
- Always common ground
- Motor power separate from logic power
- Level shifters (mod_logic_lvl) for 5V sensors on 3.3V MCUs
- Flyback diodes on relays/solenoids/motors
- Decoupling caps on IC power pins

REMEMBER: When asked to build, ALWAYS output a complete helix-actions block with FULL wiring AND code AND file structure. Use multiple action types together. Do not just describe.`;
};

// ─── SYNTAX HIGHLIGHTING ────────────────────────────────
const KEYWORDS = ["void","int","float","double","char","bool","boolean","byte","String","const","static","if","else","for","while","do","return","break","continue","switch","case","default","true","false","HIGH","LOW","INPUT","OUTPUT","INPUT_PULLUP","#include","#define","setup","loop","pinMode","digitalWrite","digitalRead","analogWrite","analogRead","delay","delayMicroseconds","Serial","begin","print","println","println","Wire","SPI","attach","write","read","class","public","private","struct","new","unsigned","long","short"];
const KEYWORD_RE = new RegExp(`\\b(${KEYWORDS.join("|")})\\b`, "g");

const highlightCode = (code) => {
  // Escape HTML
  let html = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Comments first (so they consume their content)
  html = html.replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>');
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="cm">$1</span>');
  // Strings
  html = html.replace(/("[^"\n]*")/g, '<span class="str">$1</span>');
  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
  // Keywords (skip if inside an existing span)
  html = html.replace(/(<span[^>]*>[^<]*<\/span>)|(\b(?:void|int|float|double|char|bool|boolean|byte|String|const|static|if|else|for|while|do|return|break|continue|switch|case|default|true|false|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|setup|loop|pinMode|digitalWrite|digitalRead|analogWrite|analogRead|delay|delayMicroseconds|Serial|begin|print|println|Wire|SPI|attach|write|read|class|public|private|struct|new|unsigned|long|short)\b)/g,
    (m, span, kw) => span ? span : `<span class="kw">${kw}</span>`);
  // Preprocessor
  html = html.replace(/(^|\n)(\s*#[a-z]+)/g, '$1<span class="pp">$2</span>');
  return html;
};

// ─── STYLES ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
:root {
  --bg:#07070b;--bg2:#0c0c14;--bg3:#11111c;--surf:#161622;--surf2:#1e1e2e;--surf3:#27273a;
  --border:#232336;--border2:#303048;--text:#dcdce8;--text2:#8e8ea8;--text3:#5c5c78;
  --cyan:#00e5cc;--purple:#9580ff;--green:#2de8a0;--red:#ff6b6b;--orange:#ffb86c;--blue:#6cb6ff;--yellow:#f1fa8c;
  --grad:linear-gradient(135deg,#00e5cc 0%,#9580ff 60%,#2de8a0 100%);
  --mono:'JetBrains Mono',monospace;--ui:'Inter',sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
button{font-family:var(--ui)}
.H{font-family:var(--ui);background:var(--bg);color:var(--text);height:100vh;display:flex;flex-direction:column;overflow:hidden;font-size:13px;-webkit-font-smoothing:antialiased}

/* Menu */
.mb{height:32px;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 8px;flex-shrink:0;user-select:none}
.mb-logo{font-weight:700;font-size:12px;letter-spacing:3px;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;padding:0 10px 0 4px;display:flex;align-items:center;gap:6px}
.mb-item{background:none;border:none;color:var(--text2);padding:4px 10px;font-size:12px;cursor:pointer;border-radius:4px;transition:all .1s;position:relative}
.mb-item:hover{background:var(--surf);color:var(--text)}
.mb-r{margin-left:auto;display:flex;align-items:center;gap:6px}
.mb-sel{background:var(--surf);border:1px solid var(--border);color:var(--cyan);padding:3px 8px;border-radius:4px;font-size:11px;font-family:var(--mono);cursor:pointer;outline:none}
.mb-sel option{background:var(--bg2)}
.mb-btn{background:var(--surf);border:1px solid var(--border);color:var(--text2);padding:4px 10px;border-radius:4px;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .1s}
.mb-btn:hover{background:var(--surf2);color:var(--text)}
.mb-btn.pri{background:var(--cyan);color:var(--bg);border-color:var(--cyan)}
.mb-btn.pri:hover{filter:brightness(1.1)}

/* Dropdown */
.dd{position:absolute;top:100%;left:0;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:4px;min-width:180px;box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:150;display:none}
.dd.show{display:block}
.dd-i{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:4px;font-size:12px;color:var(--text2);cursor:pointer;border:none;background:none;width:100%;text-align:left;font-family:var(--ui)}
.dd-i:hover{background:var(--surf);color:var(--text)}
.dd-i .k{margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--text3)}
.dd-sep{height:1px;background:var(--border);margin:4px 0}

.body{flex:1;display:flex;overflow:hidden}

/* Activity Bar */
.act{width:44px;background:var(--bg);border-right:1px solid var(--border);display:flex;flex-direction:column;align-items:center;padding:6px 0;gap:2px;flex-shrink:0}
.act-btn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:none;background:none;color:var(--text3);cursor:pointer;transition:all .12s;position:relative}
.act-btn:hover{color:var(--text);background:var(--surf)}
.act-btn.on{color:var(--cyan)}
.act-btn.on::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:2px;height:18px;background:var(--cyan);border-radius:0 2px 2px 0}
.act-sep{flex:1}
.act-tip{position:absolute;left:46px;top:50%;transform:translateY(-50%);background:var(--surf2);color:var(--text);padding:3px 8px;border-radius:4px;font-size:11px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s;z-index:99;border:1px solid var(--border2)}
.act-btn:hover .act-tip{opacity:1}
.act-bdg{position:absolute;top:2px;right:2px;background:var(--red);color:white;font-size:8px;padding:1px 4px;border-radius:6px;font-weight:700;font-family:var(--mono);pointer-events:none}

/* Sidebar */
.sb{width:260px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden}
.sb-head{height:34px;padding:0 12px;display:flex;align-items:center;font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid var(--border);flex-shrink:0;justify-content:space-between;gap:4px}
.sb-head-btns{display:flex;gap:2px}
.sb-h-btn{background:none;border:none;color:var(--text3);cursor:pointer;padding:3px;border-radius:3px;display:flex;align-items:center}
.sb-h-btn:hover{color:var(--text);background:var(--surf)}
.sb-scroll{flex:1;overflow-y:auto;padding:4px 0}
.sb-scroll::-webkit-scrollbar{width:4px}.sb-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}

/* File tree */
.ft{display:flex;align-items:center;padding:3px 8px 3px calc(8px + var(--d,0) * 14px);cursor:pointer;gap:5px;font-size:12px;color:var(--text2);border:none;background:none;width:100%;text-align:left;font-family:var(--ui);transition:background .08s}
.ft:hover{background:var(--surf);color:var(--text)}
.ft.on{background:rgba(0,229,204,.06);color:var(--cyan)}
.ft-icon{width:16px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ft-icon svg{width:14px;height:14px}
.ft-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ft-name input{background:var(--surf);border:1px solid var(--cyan);color:var(--text);font-size:11px;font-family:var(--ui);padding:1px 4px;border-radius:3px;outline:none;width:100%}
.ft-c{width:14px;flex-shrink:0;color:var(--text3);font-size:10px;transition:transform .12s}
.ft-c.o{transform:rotate(90deg)}
.ft-actions{display:none;gap:2px}
.ft:hover .ft-actions{display:flex}
.ft-act{background:none;border:none;color:var(--text3);cursor:pointer;padding:1px;border-radius:2px}
.ft-act:hover{color:var(--text)}

/* Components */
.cs{margin:8px;background:var(--surf);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text);font-size:12px;font-family:var(--ui);outline:none;transition:border-color .12s}
.cs:focus{border-color:var(--cyan)}
.cs::placeholder{color:var(--text3)}
.cfs{display:flex;flex-wrap:wrap;gap:3px;padding:0 8px 6px}
.cf{padding:2px 7px;border-radius:4px;border:1px solid var(--border);background:none;color:var(--text3);font-size:10px;cursor:pointer;font-family:var(--ui);transition:all .1s}
.cf:hover{background:var(--surf);color:var(--text)}
.cf.on{background:rgba(0,229,204,.1);color:var(--cyan);border-color:rgba(0,229,204,.25)}
.cl{flex:1;overflow-y:auto;padding:0 4px}
.cl::-webkit-scrollbar{width:4px}.cl::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.cat-hdr{display:flex;align-items:center;gap:5px;padding:6px 8px;width:100%;background:none;border:none;color:var(--text2);font-family:var(--ui);font-size:10px;text-transform:uppercase;letter-spacing:.5px;cursor:pointer;border-bottom:1px solid var(--border);margin-top:4px}
.cat-hdr:hover{background:var(--surf)}
.cat-hdr .ft-c{color:var(--text3);transition:transform .12s}
.cat-hdr .ft-c.o{transform:rotate(90deg)}
.ci{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:5px;cursor:pointer;border:1px solid transparent;width:100%;background:none;text-align:left;font-family:var(--ui);color:var(--text);transition:all .1s}
.ci:hover{background:var(--surf);border-color:var(--border)}
.ci-sym{width:32px;height:28px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;font-family:var(--mono);flex-shrink:0}
.ci-info{flex:1;min-width:0}
.ci-name{font-size:11.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ci-desc{font-size:10px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* Editor */
.ed{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.tabs{height:34px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;overflow-x:auto;flex-shrink:0}
.tabs::-webkit-scrollbar{display:none}
.tab{display:flex;align-items:center;gap:5px;padding:0 12px;font-size:12px;color:var(--text3);border-right:1px solid var(--border);cursor:pointer;white-space:nowrap;border:none;background:none;font-family:var(--ui);transition:all .1s}
.tab:hover{color:var(--text2);background:var(--bg3)}
.tab.on{color:var(--text);background:var(--bg3);box-shadow:inset 0 -2px 0 var(--cyan)}
.tab.dirty::after{content:'●';color:var(--cyan);font-size:12px;margin-left:2px}
.tab-x{display:flex;opacity:0;background:none;border:none;color:inherit;cursor:pointer;padding:2px;border-radius:3px;transition:opacity .1s}
.tab:hover .tab-x{opacity:.5}
.tab.on .tab-x{opacity:.5}
.tab-x:hover{opacity:1!important;background:var(--surf2)}
@media (hover: none) {
  .tab-x{opacity:.5}
}
.ed-body{flex:1;overflow:hidden;position:relative;display:flex;flex-direction:column}

/* Code editor with syntax highlight */
.code{height:100%;display:flex;flex:1;background:var(--bg3);position:relative}
.lines{padding:12px 0;min-width:48px;text-align:right;font-family:var(--mono);font-size:12px;line-height:1.65;color:var(--text3);user-select:none;padding-right:10px;border-right:1px solid var(--border);overflow:hidden;flex-shrink:0}
.code-wrap{flex:1;position:relative;overflow:auto}
.code-wrap::-webkit-scrollbar{width:6px;height:6px}.code-wrap::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
.hl,.ta{position:absolute;top:0;left:0;width:100%;height:100%;padding:12px 14px;font-family:var(--mono);font-size:12px;line-height:1.65;tab-size:2;white-space:pre;word-wrap:normal;overflow-wrap:normal;margin:0;border:0}
.hl{color:var(--text);pointer-events:none;overflow:visible}
.ta{color:transparent;background:transparent;outline:none;resize:none;caret-color:var(--cyan);overflow:auto}
.hl .kw{color:var(--purple);font-weight:600}
.hl .str{color:var(--green)}
.hl .cm{color:var(--text3);font-style:italic}
.hl .num{color:var(--orange)}
.hl .pp{color:var(--cyan);font-weight:600}

/* Schematic */
.sch{width:100%;height:100%;background:var(--bg3);position:relative;overflow:hidden}
.sch-vp{position:absolute;top:0;left:0;width:100%;height:100%;transform-origin:0 0;will-change:transform}
.sch-grid{position:absolute;top:-5000px;left:-5000px;width:10000px;height:10000px;background-image:radial-gradient(circle,rgba(37,37,56,.8) 1px,transparent 1px);background-size:20px 20px;pointer-events:none}
.sch-svg{position:absolute;top:0;left:0;width:10000px;height:10000px;pointer-events:none;overflow:visible}
.sch-svg>*{pointer-events:auto}
.sch-tb{position:absolute;top:10px;left:10px;display:flex;gap:3px;background:var(--surf);border:1px solid var(--border);border-radius:8px;padding:3px;z-index:10}
.sch-btn{padding:5px 9px;border-radius:5px;border:none;background:none;color:var(--text2);font-size:11px;cursor:pointer;font-family:var(--ui);transition:all .1s;display:flex;align-items:center;gap:4px}
.sch-btn:hover{background:var(--surf2);color:var(--text)}
.sch-btn.on{background:rgba(0,229,204,.12);color:var(--cyan)}
.sch-info{position:absolute;bottom:10px;right:10px;font-size:10px;color:var(--text3);font-family:var(--mono);background:var(--surf);padding:4px 8px;border-radius:5px;border:1px solid var(--border);z-index:10}
.zoom-info{position:absolute;bottom:10px;left:10px;font-size:10px;color:var(--text3);font-family:var(--mono);background:var(--surf);padding:4px 8px;border-radius:5px;border:1px solid var(--border);z-index:10;display:flex;gap:6px;align-items:center}
.zb{background:none;border:none;color:var(--text2);cursor:pointer;padding:2px 5px;font-family:var(--mono);font-size:10px}
.zb:hover{color:var(--cyan)}

/* Placed component */
.pc{position:absolute;background:var(--surf);border:1.5px solid var(--border2);border-radius:5px;color:var(--text);user-select:none;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.pc.sel{border-color:var(--cyan);box-shadow:0 0 18px rgba(0,229,204,.4)}
.pc.err{border-color:var(--red)}
.pc-head{padding:4px 6px;font-size:9px;font-weight:600;font-family:var(--mono);border-bottom:1px solid var(--border);background:var(--bg2);cursor:grab;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-radius:5px 5px 0 0}
.pc-body{position:relative;height:calc(100% - 22px)}
.pc-pin{position:absolute;width:11px;height:11px;border-radius:50%;border:1.5px solid var(--bg);cursor:crosshair;transition:all .12s;z-index:5}
.pc-pin:hover{transform:scale(1.4);box-shadow:0 0 8px currentColor}
.pc-pin.act{transform:scale(1.6);box-shadow:0 0 14px currentColor}
.pc-pin.unc{box-shadow:0 0 0 2px var(--red)}
.pc-pin-l{position:absolute;font-size:8px;font-family:var(--mono);color:var(--text2);pointer-events:none;white-space:nowrap;line-height:1}

/* Chat */
.chat{width:360px;border-left:1px solid var(--border);display:flex;flex-direction:column;background:var(--bg2);flex-shrink:0}
.chat-h{height:34px;padding:0 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);flex-shrink:0}
.chat-hl{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--text2)}
.chat-badge{font-size:10px;padding:1px 7px;border-radius:8px;background:rgba(0,229,204,.08);color:var(--cyan);font-family:var(--mono);border:1px solid rgba(0,229,204,.15)}
.chat-m{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:6px}
.chat-m::-webkit-scrollbar{width:4px}.chat-m::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.msg{padding:9px 11px;border-radius:8px;font-size:12px;line-height:1.55;max-width:94%;word-wrap:break-word;white-space:pre-wrap;animation:ms .15s ease}
@keyframes ms{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.msg.u{background:rgba(0,229,204,.08);border:1px solid rgba(0,229,204,.12);align-self:flex-end}
.msg.a{background:var(--surf);border:1px solid var(--border);align-self:flex-start}
.msg.s{background:rgba(149,128,255,.06);border:1px solid rgba(149,128,255,.1);color:var(--purple);font-size:11px;text-align:center;align-self:center}
.msg.exec{background:rgba(45,232,160,.08);border:1px solid rgba(45,232,160,.2);color:var(--green);font-size:11px;align-self:center;font-family:var(--mono)}
.chat-i{padding:8px;border-top:1px solid var(--border);flex-shrink:0}
.chat-r{display:flex;gap:5px;align-items:flex-end}
.chat-in{flex:1;background:var(--surf);border:1px solid var(--border);border-radius:8px;padding:9px 10px;color:var(--text);font-size:12px;font-family:var(--ui);outline:none;resize:none;min-height:38px;max-height:100px;line-height:1.4;transition:border-color .12s}
.chat-in:focus{border-color:var(--cyan)}
.chat-in::placeholder{color:var(--text3)}
.send{width:36px;height:36px;border-radius:8px;border:none;background:var(--cyan);color:var(--bg);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .12s}
.send:hover{filter:brightness(1.15)}
.send:disabled{opacity:.35;cursor:not-allowed}
.chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.chip{background:var(--surf);border:1px solid var(--border);color:var(--text2);padding:4px 9px;border-radius:6px;font-size:10px;cursor:pointer;font-family:var(--ui);transition:all .12s}
.chip:hover{background:var(--surf2);color:var(--text);border-color:var(--cyan)}

/* Dashboard */
.dash{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;overflow-y:auto}
.dash-logo{font-size:48px;font-weight:700;letter-spacing:6px;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px}
.dash-sub{color:var(--text3);font-size:12px;margin-bottom:32px;letter-spacing:.5px}
.dash-g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:680px;width:100%;margin-bottom:24px}
.dc{background:var(--surf);border:1px solid var(--border);border-radius:10px;padding:16px;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;gap:6px}
.dc:hover{border-color:var(--cyan);background:var(--surf2);transform:translateY(-1px)}
.dc-i{color:var(--cyan)}
.dc-t{font-size:13px;font-weight:600}
.dc-d{font-size:11px;color:var(--text3);line-height:1.4}
.dash-sec-t{font-size:11px;color:var(--text3);margin-bottom:10px;letter-spacing:1px;text-transform:uppercase;width:100%;max-width:680px;text-align:left}
.dash-tg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:680px;width:100%}

/* Status */
.st{height:22px;background:var(--bg);border-top:1px solid var(--border);display:flex;align-items:center;padding:0 10px;font-size:10px;color:var(--text3);gap:14px;flex-shrink:0;font-family:var(--mono)}
.dot{width:5px;height:5px;border-radius:50%;display:inline-block;margin-right:3px}
.dot.g{background:var(--green)}.dot.y{background:var(--orange)}.dot.r{background:var(--red)}
.st-btn{background:none;border:none;color:var(--text3);cursor:pointer;font-family:var(--mono);font-size:10px;padding:0}
.st-btn:hover{color:var(--cyan)}

/* Modal */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fi .12s}
@keyframes fi{from{opacity:0}to{opacity:1}}
.mod{background:var(--bg2);border:1px solid var(--border);border-radius:12px;width:580px;max-height:80vh;overflow-y:auto;padding:22px;animation:mu .15s ease}
.mod.lg{width:720px}
@keyframes mu{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
.mod::-webkit-scrollbar{width:4px}.mod::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.mod-t{font-size:16px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:8px;justify-content:space-between}
.mod-x{background:none;border:none;color:var(--text3);cursor:pointer;padding:4px;border-radius:4px}
.mod-x:hover{color:var(--text);background:var(--surf)}
.fld{margin-bottom:16px}
.lbl{font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;font-weight:600}
.inp{width:100%;background:var(--surf);border:1px solid var(--border);border-radius:6px;padding:9px 10px;color:var(--text);font-size:12px;font-family:var(--mono);outline:none;transition:border-color .12s}
.inp:focus{border-color:var(--cyan)}
.sel{width:100%;background:var(--surf);border:1px solid var(--border);border-radius:6px;padding:9px 10px;color:var(--text);font-size:12px;font-family:var(--ui);outline:none;cursor:pointer}
.sel option{background:var(--bg2)}
.row{display:flex;gap:10px}
.row>*{flex:1}
.btn{background:var(--cyan);color:var(--bg);border:none;padding:9px 22px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--ui);transition:all .12s}
.btn:hover{filter:brightness(1.1)}
.btn.sec{background:var(--surf);color:var(--text);border:1px solid var(--border)}
.btn.sec:hover{background:var(--surf2)}
.btn.dng{background:var(--red);color:white}
.divider{height:1px;background:var(--border);margin:16px 0}
.dots{display:inline-flex;gap:3px;align-items:center}
.dots span{width:4px;height:4px;border-radius:50%;background:var(--cyan);animation:dp 1.2s infinite}
.dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}
@keyframes dp{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1.1)}}

.sec-t{font-size:13px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px;padding:14px 14px 0}

/* PCB */
.pcb{width:100%;height:100%;background:#0a2818;position:relative;overflow:hidden}
.pcb-tb{position:absolute;top:10px;left:10px;display:flex;gap:3px;background:var(--surf);border:1px solid var(--border);border-radius:8px;padding:3px;z-index:10}
.pcb-info{position:absolute;bottom:10px;right:10px;font-size:10px;color:var(--text3);font-family:var(--mono);background:var(--surf);padding:4px 8px;border-radius:5px;border:1px solid var(--border);z-index:10}

/* Breadboard view */
.bb{width:100%;height:100%;background:#1a1a24;position:relative;overflow:auto;display:flex;align-items:center;justify-content:center;padding:20px}
.bb svg{max-width:100%;max-height:100%}
.bb-tb{position:absolute;top:10px;left:10px;display:flex;gap:3px;background:var(--surf);border:1px solid var(--border);border-radius:8px;padding:3px;z-index:10}
.bb-serial{position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,.85);border:1px solid var(--green);border-radius:6px;padding:8px 12px;max-width:380px;z-index:10;font-family:var(--mono)}

/* BOM */
.bom{padding:14px;overflow-y:auto;height:100%}
.bom::-webkit-scrollbar{width:4px}.bom::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.bom-t{width:100%;border-collapse:collapse;font-size:12px}
.bom-t th{text-align:left;padding:7px 8px;color:var(--text3);font-size:10px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--border);font-weight:600}
.bom-t td{padding:7px 8px;border-bottom:1px solid var(--border);color:var(--text2)}
.bom-t tr:hover td{background:var(--surf);color:var(--text)}

/* Export */
.exp{padding:14px;overflow-y:auto;height:100%}
.exp::-webkit-scrollbar{width:4px}.exp::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.exp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px}
.exp-btn{background:var(--surf);border:1px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;transition:all .15s;color:var(--text)}
.exp-btn:hover{border-color:var(--cyan);background:var(--surf2)}
.exp-btn-i{color:var(--cyan)}
.exp-btn-t{font-size:12px;font-weight:600}
.exp-btn-d{font-size:10px;color:var(--text3)}

/* Serial */
.ser{height:100%;display:flex;flex-direction:column;background:var(--bg)}
.ser-tb{height:32px;display:flex;align-items:center;padding:0 8px;gap:6px;border-bottom:1px solid var(--border);flex-shrink:0}
.ser-out{flex:1;padding:10px;font-family:var(--mono);font-size:11px;line-height:1.5;overflow-y:auto;color:var(--green)}
.ser-out::-webkit-scrollbar{width:4px}.ser-out::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.ser-line .ts{color:var(--text3);margin-right:6px}

/* DRC panel */
.drc{padding:14px;overflow-y:auto;height:100%}
.drc::-webkit-scrollbar{width:4px}.drc::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.drc-item{display:flex;gap:10px;padding:10px;border-radius:6px;margin-bottom:6px;border:1px solid var(--border);background:var(--surf)}
.drc-item.warn{border-color:rgba(255,184,108,.3);background:rgba(255,184,108,.06)}
.drc-item.err{border-color:rgba(255,107,107,.3);background:rgba(255,107,107,.06)}
.drc-item.ok{border-color:rgba(45,232,160,.3);background:rgba(45,232,160,.06)}
.drc-icon{flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:var(--mono);font-size:11px;border-radius:50%}
.drc-icon.warn{background:var(--orange);color:var(--bg)}
.drc-icon.err{background:var(--red);color:white}
.drc-icon.ok{background:var(--green);color:var(--bg)}
.drc-text{flex:1;font-size:12px}
.drc-msg{color:var(--text);font-weight:500}
.drc-detail{color:var(--text3);font-size:10px;margin-top:2px}

/* Help */
.help{padding:14px}
.help h3{font-size:12px;color:var(--cyan);margin:14px 0 8px;text-transform:uppercase;letter-spacing:1px}
.help-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px}
.help-key{font-family:var(--mono);background:var(--surf);padding:2px 8px;border-radius:4px;font-size:10px;color:var(--cyan);border:1px solid var(--border)}

/* Toast */
.toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:var(--surf2);border:1px solid var(--border2);color:var(--text);padding:10px 18px;border-radius:8px;font-size:12px;z-index:300;box-shadow:0 8px 24px rgba(0,0,0,.5);animation:tin .2s ease;display:flex;align-items:center;gap:8px}
.toast.ok{border-color:var(--green);color:var(--green)}
.toast.err{border-color:var(--red);color:var(--red)}
@keyframes tin{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}

/* Cmd+K modal */
.cmdk{background:var(--bg2);border:1px solid var(--border2);border-radius:12px;width:640px;max-width:90vw;box-shadow:0 24px 64px rgba(0,0,0,.6),0 0 0 1px rgba(0,229,204,.15);animation:mu .15s ease;overflow:hidden;max-height:80vh;display:flex;flex-direction:column}
.cmdk-h{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--border);flex-shrink:0}
.cmdk-body{padding:18px;flex-shrink:0}
.cmdk-in{width:100%;background:var(--surf);border:1.5px solid var(--border2);border-radius:8px;padding:14px 16px;color:var(--text);font-size:15px;font-family:var(--ui);outline:none;transition:border-color .12s}
.cmdk-in:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,229,204,.1)}
.cmdk-in::placeholder{color:var(--text3)}
.cmdk-load{margin-top:10px;color:var(--cyan);font-size:11px;font-family:var(--mono);display:flex;align-items:center;gap:8px}
.cmdk-suggestions{padding:0 18px 14px;display:flex;flex-direction:column;gap:4px;overflow-y:auto;flex:1;min-height:0}
.cmdk-suggestions::-webkit-scrollbar{width:4px}.cmdk-suggestions::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.cmdk-sg{background:var(--surf);border:1px solid var(--border);color:var(--text2);padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;text-align:left;font-family:var(--ui);transition:all .1s;flex-shrink:0}
.cmdk-sg:hover{background:var(--surf2);color:var(--text);border-color:var(--cyan)}
.cmdk-foot{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-top:1px solid var(--border);background:var(--bg);flex-shrink:0}
.cmdk-foot .btn{padding:7px 18px;font-size:12px}

/* Schematic empty state */
.sch-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;z-index:5;padding:20px;text-align:center}
.sch-empty>*{pointer-events:auto}

/* Breadboard view */
.bb{width:100%;height:100%;background:#f4ead5;position:relative;overflow:hidden}
.bb-tb{position:absolute;top:10px;left:10px;display:flex;gap:3px;background:var(--surf);border:1px solid var(--border);border-radius:8px;padding:3px;z-index:10}
.bb-info{position:absolute;bottom:10px;right:10px;font-size:10px;color:var(--text);font-family:var(--mono);background:var(--surf);padding:4px 8px;border-radius:5px;border:1px solid var(--border);z-index:10}
.sch-empty-icon{color:var(--text3);opacity:.4;margin-bottom:14px;transform:scale(2.5)}
.sch-empty-title{font-size:18px;font-weight:600;color:var(--text);margin-bottom:4px}
.sch-empty-sub{font-size:12px;color:var(--text3);margin-bottom:24px}
.sch-empty-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:20px}
.sch-empty-actions .btn{padding:9px 16px;font-size:12px;display:flex;align-items:center;gap:6px}
.sch-empty-hint{font-size:11px;color:var(--text3)}
.sch-empty-hint kbd{background:var(--surf);border:1px solid var(--border);padding:1px 6px;border-radius:3px;font-family:var(--mono);font-size:10px;color:var(--cyan);margin:0 2px}

.empty{color:var(--text3);font-size:12px;text-align:center;padding:30px}
`;

// ─── ICONS ──────────────────────────────────────────────
const I = {
  helix: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4c4 0 6 4 8 8s4 8 8 8" stroke="var(--cyan)"/><path d="M20 4c-4 0-6 4-8 8s-4 8-8 8" stroke="var(--purple)"/><circle cx="12" cy="12" r="2" fill="var(--cyan)"/></svg>,
  file: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  folder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  code: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  pcb: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="8" r="1.5"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/></svg>,
  wire: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12h6l2-3h4l2 3h6"/><circle cx="4" cy="12" r="2"/><circle cx="20" cy="12" r="2"/></svg>,
  comp: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  bom: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>,
  chat: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  send: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  x: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chev: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  export: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3h7v7M10 14L21 3M21 14v7h-7M3 10V3h7M3 14l11 7"/></svg>,
  serial: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M6 12l4-4v8l4-4"/></svg>,
  drc: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  help: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  play: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  undo: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>,
  redo: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6M3 17a9 9 0 0 1 15-6.7l3 2.7"/></svg>,
  plus: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  rotate: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

const catColor = (cat) => ({
  "Microcontrollers":{bg:"rgba(0,229,204,.14)",fg:"var(--cyan)"},
  "Motors":{bg:"rgba(255,107,107,.14)",fg:"var(--red)"},
  "Servos":{bg:"rgba(149,128,255,.14)",fg:"var(--purple)"},
  "Motor Drivers":{bg:"rgba(255,184,108,.14)",fg:"var(--orange)"},
  "IMU & Nav":{bg:"rgba(108,182,255,.14)",fg:"var(--blue)"},
  "Distance & LiDAR":{bg:"rgba(45,232,160,.14)",fg:"var(--green)"},
  "Encoders":{bg:"rgba(241,250,140,.14)",fg:"var(--yellow)"},
  "Vision":{bg:"rgba(0,229,204,.14)",fg:"var(--cyan)"},
  "Sensors":{bg:"rgba(108,182,255,.14)",fg:"var(--blue)"},
  "Communication":{bg:"rgba(45,232,160,.14)",fg:"var(--green)"},
  "Power":{bg:"rgba(255,107,107,.14)",fg:"var(--red)"},
  "Displays":{bg:"rgba(149,128,255,.14)",fg:"var(--purple)"},
  "Audio":{bg:"rgba(255,184,108,.14)",fg:"var(--orange)"},
  "Modules":{bg:"rgba(0,229,204,.14)",fg:"var(--cyan)"},
  "Prototyping":{bg:"rgba(241,250,140,.14)",fg:"var(--yellow)"},
  "Passives":{bg:"rgba(108,182,255,.14)",fg:"var(--blue)"},
  "ICs":{bg:"rgba(149,128,255,.14)",fg:"var(--purple)"},
}[cat] || {bg:"rgba(255,255,255,.06)",fg:"var(--text2)"});

// ─── PERSISTENCE ────────────────────────────────────────
const STORAGE_KEY = "helix_v4_state";
const SETTINGS_KEY = "helix_v4_settings";

const loadState = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
  catch { return null; }
};
const saveState = (s) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
};
const loadSettings = () => {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null"); }
  catch { return null; }
};
const saveSettings = (s) => {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
};

const DEFAULT_TREE = {
  name: "robot-project", type: "folder", expanded: true,
  children: [
    { name: "src", type: "folder", expanded: true, children: [
      { name: "main.ino", type: "file" },
      { name: "config.h", type: "file" },
    ]},
    { name: "schematics", type: "folder", expanded: false, children: [
      { name: "main.sch", type: "file" },
    ]},
    { name: "README.md", type: "file" },
  ],
};

const DEFAULT_FILES = {
  "main.ino": TEMPLATES.blank.code,
  "config.h": "// Pin & parameter config\n#define BAUD 115200\n",
  "README.md": "# HELIX Robot Project\n\nBuild robotics with AI assistance.\n",
};

// ─── Error Boundary ─────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("HELIX crashed:", error, errorInfo);
    this.setState({ errorInfo });
  }
  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };
  hardReset = () => {
    try {
      localStorage.removeItem("helix_v4_state");
      localStorage.removeItem("helix_v4_settings");
    } catch {}
    location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background:"#07070b",color:"#dcdce8",fontFamily:"system-ui,-apple-system,sans-serif",
          minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px"
        }}>
          <div style={{maxWidth:560,background:"#161622",border:"1px solid #303048",borderRadius:12,padding:28}}>
            <div style={{fontSize:20,fontWeight:700,color:"#ff6b6b",marginBottom:8}}>Something went wrong</div>
            <div style={{fontSize:13,color:"#8e8ea8",marginBottom:18,lineHeight:1.5}}>
              HELIX hit an unexpected error. Your work is auto-saved, so most of the time you can recover by reloading. If the error keeps happening, you can reset everything (this will delete your projects).
            </div>
            <div style={{
              background:"#0c0c14",border:"1px solid #232336",borderRadius:6,padding:12,fontSize:11,
              fontFamily:"monospace",color:"#ff6b6b",marginBottom:18,maxHeight:200,overflow:"auto",whiteSpace:"pre-wrap"
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack && "\n\n" + this.state.errorInfo.componentStack.split("\n").slice(0, 6).join("\n")}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={() => location.reload()} style={{
                background:"#00e5cc",color:"#07070b",border:"none",padding:"10px 20px",
                borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer"
              }}>Reload</button>
              <button onClick={this.reset} style={{
                background:"#1e1e2e",color:"#dcdce8",border:"1px solid #303048",padding:"10px 20px",
                borderRadius:6,fontSize:13,cursor:"pointer"
              }}>Try to Continue</button>
              <button onClick={this.hardReset} style={{
                background:"#ff6b6b",color:"white",border:"none",padding:"10px 20px",
                borderRadius:6,fontSize:13,cursor:"pointer",marginLeft:"auto"
              }}>Reset Everything</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════
function HelixApp() {
  // Lazy initial state — only loads localStorage once on mount
  const [persisted] = useState(() => loadState());
  const [persistedSettings] = useState(() => loadSettings());

  const [view, setView] = useState(persisted?.view || "dashboard");
  const [sidePanel, setSidePanel] = useState("files");
  const [showSide, setShowSide] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(persisted?.board || "ESP32");
  const [openMenu, setOpenMenu] = useState(null);
  const [projectName, setProjectName] = useState(persisted?.projectName || "untitled-robot");

  // AI settings (persisted)
  const [aiProvider, setAiProvider] = useState(persistedSettings?.aiProvider || "ollama");
  const [ollamaModel, setOllamaModel] = useState(persistedSettings?.ollamaModel || "llama3");
  const [ollamaUrl, setOllamaUrl] = useState(persistedSettings?.ollamaUrl || "http://localhost:11434");
  const [anthropicKey, setAnthropicKey] = useState(persistedSettings?.anthropicKey || "");
  const [openaiKey, setOpenaiKey] = useState(persistedSettings?.openaiKey || "");
  const [aiTemp, setAiTemp] = useState(persistedSettings?.aiTemp ?? 0.7);
  const [autoSave, setAutoSave] = useState(persistedSettings?.autoSave ?? true);

  // AI connection status — null = not tested, true = ok, false = error
  const [aiConnected, setAiConnected] = useState(null);
  const [testingConn, setTestingConn] = useState(false);

  // Files
  const [tree, setTree] = useState(persisted?.tree || JSON.parse(JSON.stringify(DEFAULT_TREE)));
  const [files, setFiles] = useState(persisted?.files || DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState(persisted?.activeFile || "main.ino");
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // File operation modals (replace browser prompt/confirm)
  const [newFileModal, setNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }

  // Tabs
  const [tabs, setTabs] = useState(persisted?.tabs || [{ id: "main.ino", label: "main.ino", type: "code" }]);
  const [activeTab, setActiveTab] = useState(persisted?.activeTab || "main.ino");

  // Schematic state
  const [placed, setPlaced] = useState(persisted?.placed || []);
  const [wires, setWires] = useState(persisted?.wires || []);
  const [selectedComp, setSelectedComp] = useState(null);
  const [pendingPin, setPendingPin] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const schRef = useRef(null);
  const placedRef = useRef(placed);
  useEffect(() => { placedRef.current = placed; }, [placed]);

  // Zoom & pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Components panel
  const [compSearch, setCompSearch] = useState("");
  const [compFilter, setCompFilter] = useState("All");
  const [domainFilter, setDomainFilter] = useState("all");
  const [collapsedCats, setCollapsedCats] = useState(new Set());

  // Chat — messages now persisted
  const [messages, setMessages] = useState(persisted?.messages || [
    { role: "s", text: "HELIX AI ready. Press Ctrl+K anywhere to build something with AI, or chat here." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEnd = useRef(null);
  const chatInputRef = useRef(null);

  // Serial monitor
  const [serialLines, setSerialLines] = useState([
    { ts: "00:00:01", text: "HELIX Serial Monitor v4.5" },
    { ts: "00:00:01", text: "Waiting for device... (this is a simulated monitor)" },
  ]);
  const [serialInput, setSerialInput] = useState("");
  const [serialBaud, setSerialBaud] = useState("115200");

  // ─── Live Simulation ────────────────────────────────
  const [simRunning, setSimRunning] = useState(false);
  const [simPinStates, setSimPinStates] = useState({}); // { "5": 1, "13": 0 }
  const [simSensorValues, setSimSensorValues] = useState({}); // { "ir_left": 450 }
  const [simTime, setSimTime] = useState(0);
  const simIntervalRef = useRef(null);

  // Compile state
  const [compiling, setCompiling] = useState(false);
  const [toast, setToast] = useState(null);

  // Cmd+K inline AI prompt
  const [showCmdK, setShowCmdK] = useState(false);
  const [cmdKInput, setCmdKInput] = useState("");
  const [cmdKLoading, setCmdKLoading] = useState(false);
  const cmdKRef = useRef(null);

  // Undo/redo history — initialize from current placed/wires so first edit doesn't wipe persisted state
  const [history, setHistory] = useState(() => [{
    placed: persisted?.placed ? JSON.parse(JSON.stringify(persisted.placed)) : [],
    wires: persisted?.wires ? JSON.parse(JSON.stringify(persisted.wires)) : [],
  }]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const skipNextHistory = useRef(0);

  const boardData = BOARDS[selectedBoard];

  // ─── Auto-save ───────────────────────────────────────
  useEffect(() => {
    if (!autoSave) return;
    const timer = setTimeout(() => {
      // Cap messages to last 50 to keep localStorage small
      const trimmedMessages = messages.slice(-50);
      saveState({ view, board: selectedBoard, projectName, tree, files, activeFile, tabs, activeTab, placed, wires, messages: trimmedMessages });
    }, 500);
    return () => clearTimeout(timer);
  }, [view, selectedBoard, projectName, tree, files, activeFile, tabs, activeTab, placed, wires, messages, autoSave]);

  // Settings save
  useEffect(() => {
    saveSettings({ aiProvider, ollamaModel, ollamaUrl, anthropicKey, openaiKey, aiTemp, autoSave });
  }, [aiProvider, ollamaModel, ollamaUrl, anthropicKey, openaiKey, aiTemp, autoSave]);

  // ─── History tracking ────────────────────────────────
  // skipNextHistory is a counter so multiple state updates from undo/redo
  // can be skipped properly even if React fires the effect multiple times
  useEffect(() => {
    if (skipNextHistory.current > 0) {
      skipNextHistory.current--;
      return;
    }
    const snap = { placed: JSON.parse(JSON.stringify(placed)), wires: JSON.parse(JSON.stringify(wires)) };
    setHistory(h => {
      const newH = h.slice(0, historyIdx + 1);
      newH.push(snap);
      // Cap at 50 entries; if we shift, also adjust historyIdx
      if (newH.length > 50) {
        newH.shift();
        setHistoryIdx(i => Math.max(0, i)); // stays at same position after shift
        return newH;
      }
      setHistoryIdx(i => i + 1);
      return newH;
    });
  }, [placed, wires]); // eslint-disable-line

  const undo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      skipNextHistory.current = 1; // one effect run will be skipped (batched updates)
      setPlaced(prev.placed);
      setWires(prev.wires);
      setHistoryIdx(i => i - 1);
      showToast("Undo", "ok");
    }
  };
  const redo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      skipNextHistory.current = 1;
      setPlaced(next.placed);
      setWires(next.wires);
      setHistoryIdx(i => i + 1);
      showToast("Redo", "ok");
    }
  };

  // ─── Toast ───────────────────────────────────────────
  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  // ─── Filtered components ─────────────────────────────
  const filteredComps = useMemo(() => {
    let list = ROBOTICS_LIB;
    if (domainFilter !== "all") list = list.filter(c => c.domain === domainFilter || c.domain === "all");
    if (compFilter !== "All") list = list.filter(c => c.category === compFilter);
    if (compSearch) {
      const q = compSearch.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
    }
    return list;
  }, [compFilter, compSearch, domainFilter]);

  const bomItems = useMemo(() => {
    const m = {};
    placed.forEach(c => {
      if (!m[c.id]) m[c.id] = { ...c, qty: 0 };
      m[c.id].qty++;
    });
    return Object.values(m);
  }, [placed]);

  // ─── DRC Check ───────────────────────────────────────
  const drcResults = useMemo(() => {
    const issues = [];
    if (placed.length === 0) {
      return [{ type: "ok", msg: "No components placed yet", detail: "Add components to begin DRC validation" }];
    }

    // Check 1: Unconnected pins
    placed.forEach(comp => {
      const connectedPins = new Set();
      wires.forEach(w => {
        if (w.from.startsWith(comp.uid + ":")) connectedPins.add(w.from.split(":")[1]);
        if (w.to.startsWith(comp.uid + ":")) connectedPins.add(w.to.split(":")[1]);
      });
      const unconnected = comp.pins.filter(p => !connectedPins.has(p.l));
      if (unconnected.length > 0 && comp.category !== "Power") {
        issues.push({
          type: "warn",
          msg: `${comp.name}: ${unconnected.length} unconnected pin(s)`,
          detail: unconnected.map(p => p.l).join(", "),
          uid: comp.uid,
        });
      }
    });

    // Check 2: Voltage mismatches (3.3V MCU connected to 5V sensor without level shifter)
    const mcus = placed.filter(c => c.category === "Microcontrollers");
    mcus.forEach(mcu => {
      if (!mcu.voltage) return;
      wires.forEach(w => {
        const fromComp = placed.find(c => w.from.startsWith(c.uid + ":"));
        const toComp = placed.find(c => w.to.startsWith(c.uid + ":"));
        const otherComp = fromComp?.uid === mcu.uid ? toComp : (toComp?.uid === mcu.uid ? fromComp : null);
        if (otherComp && otherComp.voltage && Math.abs(otherComp.voltage - mcu.voltage) > 0.5) {
          const fromPin = w.from.split(":")[1];
          const toPin = w.to.split(":")[1];
          const isDataPin = (p) => /^(D|GP|TX|RX|SCL|SDA|MISO|MOSI|SCK|INT|OUT|SIG|SW|CLK|DT|EN|DIR|STEP|IN[0-9])/i.test(p);
          if (isDataPin(fromPin) || isDataPin(toPin)) {
            issues.push({
              type: "warn",
              msg: `Voltage mismatch: ${mcu.name} (${mcu.voltage}V) ↔ ${otherComp.name} (${otherComp.voltage}V)`,
              detail: "Consider a level shifter for safe operation",
            });
          }
        }
      });
    });

    // Check 3: Missing GND connections
    placed.forEach(comp => {
      const hasGndPin = comp.pins.some(p => p.t === "gnd");
      if (hasGndPin) {
        const gndConnected = wires.some(w =>
          (w.from.startsWith(comp.uid + ":") && comp.pins.find(p => p.l === w.from.split(":")[1])?.t === "gnd") ||
          (w.to.startsWith(comp.uid + ":") && comp.pins.find(p => p.l === w.to.split(":")[1])?.t === "gnd")
        );
        if (!gndConnected) {
          issues.push({
            type: "err",
            msg: `${comp.name}: GND not connected`,
            detail: "All powered components must have a common ground",
            uid: comp.uid,
          });
        }
      }
    });

    // Check 4: Missing MCU
    if (placed.length > 0 && !placed.some(c => c.category === "Microcontrollers")) {
      issues.push({
        type: "warn",
        msg: "No microcontroller in design",
        detail: "Add an MCU to control your components",
      });
    }

    // Check 5: Motors without drivers
    const hasMotors = placed.some(c => c.category === "Motors");
    const hasDrivers = placed.some(c => c.category === "Motor Drivers");
    if (hasMotors && !hasDrivers) {
      issues.push({
        type: "warn",
        msg: "Motors detected but no motor driver",
        detail: "Motors should not be driven directly from MCU pins",
      });
    }

    if (issues.length === 0) {
      issues.push({ type: "ok", msg: "All checks passed", detail: `${placed.length} components, ${wires.length} connections validated` });
    }
    return issues;
  }, [placed, wires]);

  const drcWarningCount = drcResults.filter(d => d.type !== "ok").length;

  // ─── Effects ─────────────────────────────────────────
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!pendingPin) return;
    const handler = (e) => {
      const rect = schRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setMousePos({ x, y });
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [pendingPin, pan, zoom]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      const inInput = ["INPUT", "TEXTAREA"].includes(e.target.tagName);
      if (e.key === "Escape") {
        setPendingPin(null);
        setSelectedComp(null);
        setShowSettings(false);
        setShowHelp(false);
        setShowTemplates(false);
        setOpenMenu(null);
        setNewFileModal(false);
        setConfirmModal(null);
        if (showCmdK && !cmdKLoading) setShowCmdK(false);
      }
      if (e.key === "Delete" && selectedComp && !inInput) {
        deleteComponent(selectedComp);
      }
      if (e.key === "r" && selectedComp && !inInput) {
        rotateComponent(selectedComp);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && !inInput) { e.preventDefault(); manualSave(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "b" && !inInput) { e.preventDefault(); setShowSide(s => !s); }
      if ((e.metaKey || e.ctrlKey) && e.key === "j" && !inInput) { e.preventDefault(); setChatOpen(s => !s); }
      if ((e.metaKey || e.ctrlKey) && e.key === "l" && !inInput) {
        e.preventDefault();
        setChatOpen(true);
        setTimeout(() => chatInputRef.current?.focus(), 50);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/" && !inInput) { e.preventDefault(); setShowHelp(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCmdK(true);
        setTimeout(() => cmdKRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selectedComp, history, historyIdx, showCmdK, cmdKLoading]);

  // ─── Pin position helper ────────────────────────────
  const getPinPos = (comp, pin) => {
    const isL = pin.s === "L";
    return {
      x: comp.x + (isL ? 0 : comp.w),
      y: comp.y + 22 + pin.o,
    };
  };

  const findPin = (id) => {
    const [uid, label] = id.split(":");
    const comp = placedRef.current.find(c => c.uid === uid) || placed.find(c => c.uid === uid);
    if (!comp) return null;
    const pin = comp.pins.find(p => p.l === label);
    if (!pin) return null;
    return { comp, pin, pos: getPinPos(comp, pin) };
  };

  // ─── Component operations ───────────────────────────
  // Find a non-overlapping spot for a new component using simple grid scan
  const findFreeSpot = (w, h, existing) => {
    const STEP = 30;
    const PAD = 20;
    const GRID_W = 800;
    const GRID_H = 600;
    const overlaps = (x, y) => existing.some(c => {
      return !(x + w + PAD < c.x || x > c.x + c.w + PAD || y + h + 22 + PAD < c.y || y > c.y + c.h + 22 + PAD);
    });
    for (let y = 60; y < GRID_H; y += STEP) {
      for (let x = 60; x < GRID_W; x += STEP) {
        if (!overlaps(x, y)) return { x, y };
      }
    }
    // Fall back to random if grid is full
    return { x: 60 + Math.random() * 200, y: 60 + Math.random() * 200 };
  };

  const addComponent = (compDef, x, y) => {
    const pos = (x !== undefined && y !== undefined)
      ? { x, y }
      : findFreeSpot(compDef.w, compDef.h, placedRef.current);
    const newComp = {
      ...compDef,
      uid: `${compDef.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      x: pos.x,
      y: pos.y,
    };
    setPlaced(p => [...p, newComp]);
    if (!tabs.find(t => t.id === "schematic")) {
      setTabs(t => [...t, { id: "schematic", label: "Schematic", type: "schematic" }]);
    }
    setActiveTab("schematic");
    setView("editor");
    return newComp;
  };

  const deleteComponent = (uid) => {
    setPlaced(p => p.filter(c => c.uid !== uid));
    setWires(w => w.filter(wr => !wr.from.startsWith(uid + ":") && !wr.to.startsWith(uid + ":")));
    setSelectedComp(null);
    showToast("Component deleted", "ok");
  };

  const rotateComponent = (uid) => {
    setPlaced(p => p.map(c => c.uid === uid ? {
      ...c,
      pins: c.pins.map(pin => ({ ...pin, s: pin.s === "L" ? "R" : "L" })),
    } : c));
    showToast("Component rotated", "ok");
  };

  // ─── Pin click ──────────────────────────────────────
  const handlePinClick = (comp, pin, e) => {
    e.stopPropagation();
    const id = `${comp.uid}:${pin.l}`;
    const pos = getPinPos(comp, pin);
    if (!pendingPin) {
      setPendingPin({ id, pos });
    } else {
      if (pendingPin.id !== id) {
        // Don't allow duplicate wires
        const exists = wires.some(w =>
          (w.from === pendingPin.id && w.to === id) ||
          (w.to === pendingPin.id && w.from === id));
        if (!exists) {
          setWires(w => [...w, { from: pendingPin.id, to: id, id: `w_${Date.now()}_${Math.random()}` }]);
        }
      }
      setPendingPin(null);
    }
  };

  // ─── File operations ────────────────────────────────
  const toggleFolder = (path) => {
    const t = JSON.parse(JSON.stringify(tree));
    const nav = (n, p) => {
      if (p.length === 0) { n.expanded = !n.expanded; return; }
      const c = n.children?.find(x => x.name === p[0]);
      if (c) nav(c, p.slice(1));
    };
    nav(t, path);
    setTree(t);
  };

  const openFile = (name) => {
    setActiveFile(name);
    if (!tabs.find(t => t.id === name)) {
      setTabs(p => [...p, { id: name, label: name, type: "code" }]);
    }
    setActiveTab(name);
    setView("editor");
  };

  const openSpecial = (id, label, type) => {
    if (!tabs.find(t => t.id === id)) {
      setTabs(p => [...p, { id, label, type }]);
    }
    setActiveTab(id);
    setView("editor");
  };

  const closeTab = (id) => {
    const nt = tabs.filter(t => t.id !== id);
    setTabs(nt);
    if (activeTab === id && nt.length > 0) setActiveTab(nt[nt.length - 1].id);
    if (nt.length === 0) setView("dashboard");
  };

  // Open the new-file modal
  const createNewFile = () => {
    setNewFileName("");
    setNewFileModal(true);
  };

  // Actually create the file (called from modal submit)
  const doCreateFile = (name) => {
    if (!name || !name.trim()) { showToast("Name required", "err"); return; }
    name = name.trim();
    if (files[name]) { showToast("File already exists", "err"); return; }
    if (!/^[\w.\-]+$/.test(name)) { showToast("Invalid filename", "err"); return; }
    setFiles(f => ({ ...f, [name]: "// " + name + "\n" }));
    const t = JSON.parse(JSON.stringify(tree));
    const src = t.children?.find(c => c.name === "src");
    if (src) {
      src.children = src.children || [];
      src.children.push({ name, type: "file" });
      src.expanded = true;
    } else {
      t.children = t.children || [];
      t.children.push({ name, type: "file" });
    }
    setTree(t);
    openFile(name);
    setNewFileModal(false);
    showToast(`Created ${name}`, "ok");
  };

  const startRename = (oldName) => {
    setRenamingFile(oldName);
    setRenameValue(oldName);
  };

  const finishRename = () => {
    if (!renamingFile || !renameValue || renameValue === renamingFile) {
      setRenamingFile(null); return;
    }
    if (files[renameValue]) { showToast("Name taken", "err"); setRenamingFile(null); return; }
    if (!/^[\w.\-]+$/.test(renameValue)) { showToast("Invalid filename", "err"); setRenamingFile(null); return; }
    const newFiles = { ...files };
    newFiles[renameValue] = newFiles[renamingFile];
    delete newFiles[renamingFile];
    setFiles(newFiles);
    const t = JSON.parse(JSON.stringify(tree));
    const updateTree = (node) => {
      if (node.children) {
        node.children = node.children.map(c => {
          if (c.name === renamingFile && c.type === "file") return { ...c, name: renameValue };
          updateTree(c);
          return c;
        });
      }
    };
    updateTree(t);
    setTree(t);
    setTabs(tb => tb.map(t => t.id === renamingFile ? { ...t, id: renameValue, label: renameValue } : t));
    if (activeTab === renamingFile) setActiveTab(renameValue);
    if (activeFile === renamingFile) setActiveFile(renameValue);
    setRenamingFile(null);
    showToast("Renamed", "ok");
  };

  // Show confirmation modal then delete
  const deleteFile = (name) => {
    setConfirmModal({
      title: "Delete file?",
      message: `Permanently delete "${name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => doDeleteFile(name),
    });
  };

  const doDeleteFile = (name) => {
    const nf = { ...files };
    delete nf[name];
    setFiles(nf);
    const t = JSON.parse(JSON.stringify(tree));
    const removeFromTree = (node) => {
      if (node.children) node.children = node.children.filter(c => !(c.name === name && c.type === "file")).map(c => { removeFromTree(c); return c; });
    };
    removeFromTree(t);
    setTree(t);
    setTabs(tb => tb.filter(t => t.id !== name));
    if (activeTab === name) {
      const remaining = tabs.filter(t => t.id !== name);
      if (remaining.length > 0) setActiveTab(remaining[0].id);
      else setView("dashboard");
    }
    setConfirmModal(null);
    showToast("Deleted", "ok");
  };

  // ─── Project save/load ──────────────────────────────
  const manualSave = () => {
    const project = { version: 4, board: selectedBoard, tree, files, placed, wires };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "helix-project.helix";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Project saved", "ok");
  };

  const loadProject = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".helix,.json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.board) setSelectedBoard(data.board);
          if (data.tree) setTree(data.tree);
          if (data.files) setFiles(data.files);
          if (data.placed) setPlaced(data.placed);
          if (data.wires) setWires(data.wires);
          showToast("Project loaded", "ok");
        } catch (err) {
          showToast("Invalid project file", "err");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ─── Templates ──────────────────────────────────────
  const loadTemplate = (key) => {
    const tpl = TEMPLATES[key];
    if (!tpl) return;
    const newPlaced = tpl.components.map((c, i) => {
      const def = ROBOTICS_LIB.find(d => d.id === c.id);
      if (!def) return null;
      return { ...def, uid: `${c.id}_${Date.now()}_${i}`, x: c.x, y: c.y };
    }).filter(Boolean);
    setPlaced(newPlaced);
    setWires([]);
    setFiles(f => ({ ...f, "main.ino": tpl.code }));
    setShowTemplates(false);
    openFile("main.ino");
    openSpecial("schematic", "Schematic", "schematic");
    showToast(`Loaded: ${tpl.name}`, "ok");
  };

  // ─── Test AI connection ──────────────────────────────
  const testConnection = useCallback(async () => {
    setTestingConn(true);
    setAiConnected(null);
    try {
      if (aiProvider === "ollama") {
        const r = await fetch(`${ollamaUrl}/api/tags`, { method: "GET" });
        if (!r.ok) throw new Error("Ollama not reachable");
        const d = await r.json();
        const models = d.models?.map(m => m.name) || [];
        if (models.length === 0) {
          setAiConnected(false);
          showToast("Ollama running but no models installed", "err");
        } else if (!models.some(m => m.startsWith(ollamaModel))) {
          setAiConnected(false);
          showToast(`Model "${ollamaModel}" not found. Available: ${models.slice(0,3).join(", ")}`, "err");
        } else {
          setAiConnected(true);
          showToast(`Connected to Ollama (${models.length} models)`, "ok");
        }
      } else if (aiProvider === "anthropic") {
        if (!anthropicKey || !anthropicKey.startsWith("sk-ant-")) {
          setAiConnected(false);
          showToast("Invalid Anthropic API key format", "err");
          setTestingConn(false);
          return;
        }
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 10, messages: [{ role: "user", content: "hi" }] }),
        });
        if (r.ok) {
          setAiConnected(true);
          showToast("Connected to Claude", "ok");
        } else {
          setAiConnected(false);
          const d = await r.json().catch(() => ({}));
          showToast(`Claude error: ${d.error?.message || r.status}`, "err");
        }
      } else if (aiProvider === "openai") {
        if (!openaiKey || !openaiKey.startsWith("sk-")) {
          setAiConnected(false);
          showToast("Invalid OpenAI API key format", "err");
          setTestingConn(false);
          return;
        }
        const r = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${openaiKey}` },
        });
        if (r.ok) {
          setAiConnected(true);
          showToast("Connected to OpenAI", "ok");
        } else {
          setAiConnected(false);
          showToast(`OpenAI error: ${r.status}`, "err");
        }
      }
    } catch (err) {
      setAiConnected(false);
      showToast(`Connection failed: ${err.message}`, "err");
    }
    setTestingConn(false);
  }, [aiProvider, ollamaUrl, ollamaModel, anthropicKey, openaiKey]);

  // ─── Compile sim ────────────────────────────────────
  const compile = useCallback(() => {
    setCompiling(true);
    setSerialLines(s => [...s, { ts: new Date().toISOString().slice(11, 19), text: "▶ Compiling main.ino..." }]);
    setTimeout(() => {
      setSerialLines(s => [...s, { ts: new Date().toISOString().slice(11, 19), text: "✓ Sketch compiled successfully" }]);
      setSerialLines(s => [...s, { ts: new Date().toISOString().slice(11, 19), text: `  Used ${Math.floor(Math.random() * 30 + 20)}KB / ${boardData.flash}` }]);
      setCompiling(false);
      showToast("Compiled successfully", "ok");
    }, 1500);
  }, [boardData.flash]);

  // ─── SIMULATION ENGINE ────────────────────────────────
  // Parses Arduino-like code and tracks pin states over time.
  // Stylized: doesn't actually run C++, but recognizes common patterns
  // (pinMode, digitalWrite, analogWrite, delay, Serial.println, simple loops)
  // and updates pin states on a virtual clock.
  const parseSimProgram = (code) => {
    // Extract #define PIN N statements
    const defines = {};
    [...code.matchAll(/#define\s+(\w+)\s+(\d+)/g)].forEach(m => { defines[m[1]] = parseInt(m[2]); });
    // Parse loop body (best-effort: lines of digitalWrite/analogWrite/delay/Serial)
    const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
    const loopBody = loopMatch ? loopMatch[1] : "";
    const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
    const setupBody = setupMatch ? setupMatch[1] : "";
    // Extract instructions: digitalWrite(pin, val), analogWrite(pin, val), delay(ms), Serial.println("x")
    const parseInstructions = (body) => {
      const instructions = [];
      const stmts = body.split(/[;\n]/).map(s => s.trim()).filter(Boolean);
      stmts.forEach(s => {
        let m;
        if ((m = s.match(/digitalWrite\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/))) {
          const pin = defines[m[1]] ?? parseInt(m[1]);
          const val = m[2] === "HIGH" || m[2] === "1" || m[2] === "true";
          if (!isNaN(pin)) instructions.push({ type: "digitalWrite", pin, val });
        } else if ((m = s.match(/analogWrite\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/))) {
          const pin = defines[m[1]] ?? parseInt(m[1]);
          if (!isNaN(pin)) instructions.push({ type: "analogWrite", pin, val: parseInt(m[2]) });
        } else if ((m = s.match(/delay\s*\(\s*(\d+)\s*\)/))) {
          instructions.push({ type: "delay", ms: parseInt(m[1]) });
        } else if ((m = s.match(/delayMicroseconds\s*\(\s*(\d+)\s*\)/))) {
          instructions.push({ type: "delay", ms: parseInt(m[1]) / 1000 });
        } else if ((m = s.match(/Serial\.print(?:ln)?\s*\(\s*"([^"]*)"\s*\)/))) {
          instructions.push({ type: "serial", text: m[1] });
        } else if ((m = s.match(/pinMode\s*\(\s*(\w+)\s*,\s*OUTPUT\s*\)/))) {
          const pin = defines[m[1]] ?? parseInt(m[1]);
          if (!isNaN(pin)) instructions.push({ type: "pinMode", pin, mode: "OUTPUT" });
        }
      });
      return instructions;
    };
    return {
      setup: parseInstructions(setupBody),
      loop: parseInstructions(loopBody),
      defines,
    };
  };

  const startSimulation = () => {
    if (simRunning) return;
    const code = files["main.ino"] || files[activeFile] || "";
    const program = parseSimProgram(code);
    if (program.loop.length === 0) {
      showToast("No simulatable code found in loop()", "err");
      return;
    }
    // Find first MCU
    const mcu = placedRef.current.find(c => c.category === "Microcontrollers");
    if (!mcu) {
      showToast("Add a microcontroller to simulate", "err");
      return;
    }

    setSimRunning(true);
    setSerialOut([]);
    setPinStates({});

    let instructionIdx = 0;
    let totalMs = 0;
    let waitUntil = 0;

    // Run setup once
    program.setup.forEach(inst => {
      if (inst.type === "digitalWrite") {
        // Map MCU pin number to a pin label like "D5" or "GP5"
        const pinLabel = `D${inst.pin}`;
        setPinStates(s => ({ ...s, [`${mcu.uid}:${pinLabel}`]: { value: inst.val ? 255 : 0, mode: "OUTPUT" } }));
      }
    });

    simIntervalRef.current = setInterval(() => {
      if (totalMs < waitUntil) { totalMs += 50; setSimTime(totalMs / 1000); return; }
      // Execute next instruction
      const inst = program.loop[instructionIdx % program.loop.length];
      instructionIdx++;
      if (inst.type === "digitalWrite") {
        const pinLabel = `D${inst.pin}`;
        setPinStates(s => ({ ...s, [`${mcu.uid}:${pinLabel}`]: { value: inst.val ? 255 : 0, mode: "OUTPUT" } }));
      } else if (inst.type === "analogWrite") {
        const pinLabel = `D${inst.pin}`;
        setPinStates(s => ({ ...s, [`${mcu.uid}:${pinLabel}`]: { value: inst.val, mode: "OUTPUT" } }));
      } else if (inst.type === "delay") {
        waitUntil = totalMs + inst.ms;
      } else if (inst.type === "serial") {
        const ts = new Date().toISOString().slice(11, 19);
        setSerialOut(s => [...s.slice(-100), { ts, text: inst.text }]);
      }
      totalMs += 10;
      setSimTime(totalMs / 1000);
    }, 50);
  };

  const stopSimulation = () => {
    if (simIntervalRef.current) { clearInterval(simIntervalRef.current); simIntervalRef.current = null; }
    setSimRunning(false);
    setPinStates({});
    setSimTime(0);
  };

  useEffect(() => () => { if (simIntervalRef.current) clearInterval(simIntervalRef.current); }, []);

  // Compute the visual state of a connected component based on pin states
  // Returns { glow: 0-1, label: string } for LEDs, motors, displays, etc.
  const getComponentSimState = (comp) => {
    if (!simRunning) return null;
    // Find a wire from any MCU output pin to this component
    for (const w of wires) {
      const fromMatch = w.from.match(/^(.+):(.+)$/);
      const toMatch = w.to.match(/^(.+):(.+)$/);
      if (!fromMatch || !toMatch) continue;
      let mcuKey = null, otherEnd = null;
      if (fromMatch[1] !== comp.uid && toMatch[1] === comp.uid) {
        mcuKey = w.from; otherEnd = toMatch[2];
      } else if (toMatch[1] !== comp.uid && fromMatch[1] === comp.uid) {
        mcuKey = w.to; otherEnd = fromMatch[2];
      }
      if (mcuKey && pinStates[mcuKey]) {
        const v = pinStates[mcuKey].value;
        if (comp.id === "pas_led" || comp.id.startsWith("pas_led_")) {
          return { glow: v / 255, label: v > 0 ? "ON" : "OFF" };
        }
        if (comp.id.startsWith("srv_")) {
          const angle = Math.round((v / 255) * 180);
          return { glow: 0.3, label: `${angle}°` };
        }
        if (comp.id.startsWith("mot_")) {
          return { glow: v / 255, label: `PWM ${v}` };
        }
        if (comp.id === "aud_buzzer_passive" || comp.id === "aud_buzzer_active") {
          return { glow: v > 0 ? 1 : 0, label: v > 0 ? "♪" : "" };
        }
      }
    }
    return null;
  };

  // ─── AI execute actions (FIXED CLOSURE) ──────────────
  const executeActions = useCallback((actionBlock) => {
    let executed = [];
    // uidMap supports both bare id and indexed id (e.g., "mot_dc_gear" and "mot_dc_gear#1")
    const uidMap = {};
    // Track instance count per base id so AI can use #1, #2 syntax
    const instanceCount = {};
    const newComponents = [];

    actionBlock.actions.forEach(a => {
      if (a.type === "add_component") {
        const compDef = ROBOTICS_LIB.find(c => c.id === a.component_id);
        if (compDef) {
          // If AI provided coords, validate and use; else find free spot considering existing + already-placed-in-this-batch
          let x = a.x, y = a.y;
          if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
            const allKnown = [...placedRef.current, ...newComponents];
            const spot = findFreeSpot(compDef.w, compDef.h, allKnown);
            x = spot.x; y = spot.y;
          }
          const newComp = {
            ...compDef,
            uid: `${compDef.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${newComponents.length}`,
            x, y,
          };
          newComponents.push(newComp);
          instanceCount[a.component_id] = (instanceCount[a.component_id] || 0) + 1;
          const idx = instanceCount[a.component_id];
          uidMap[`${a.component_id}#${idx}`] = newComp.uid;
          if (idx === 1) uidMap[a.component_id] = newComp.uid;
          executed.push(`+ Added ${compDef.name}${idx > 1 ? ` (#${idx})` : ""}`);
        } else {
          executed.push(`✗ Unknown component: ${a.component_id}`);
        }
      }
    });

    // Apply all new components first
    if (newComponents.length > 0) {
      setPlaced(p => [...p, ...newComponents]);
    }

    // Helper to resolve a component reference (bare id, indexed id, or uid) to a uid
    const resolveRef = (ref) => {
      if (uidMap[ref]) return uidMap[ref];
      // Try matching against existing placed components by id
      const existing = placedRef.current.find(p => p.id === ref);
      if (existing) return existing.uid;
      // Maybe it's already a uid
      if (placedRef.current.find(p => p.uid === ref)) return ref;
      // Maybe it's an indexed reference to existing components
      const m = ref.match(/^(.+)#(\d+)$/);
      if (m) {
        const matches = placedRef.current.filter(p => p.id === m[1]);
        if (matches[parseInt(m[2]) - 1]) return matches[parseInt(m[2]) - 1].uid;
      }
      return null;
    };

    // Then process wires
    const newWires = [];
    actionBlock.actions.forEach(a => {
      if (a.type === "wire") {
        const [fromRef, fromPin] = a.from.split(":");
        const [toRef, toPin] = a.to.split(":");
        const fUid = resolveRef(fromRef);
        const tUid = resolveRef(toRef);
        if (fUid && tUid) {
          newWires.push({ from: `${fUid}:${fromPin}`, to: `${tUid}:${toPin}`, id: `w_${Date.now()}_${Math.random()}` });
          executed.push(`~ Wired ${fromRef}:${fromPin} → ${toRef}:${toPin}`);
        } else {
          executed.push(`✗ Failed to wire ${a.from} → ${a.to}`);
        }
      }
    });
    if (newWires.length > 0) {
      setWires(w => [...w, ...newWires]);
    }

    // Process other actions
    actionBlock.actions.forEach(a => {
      if (a.type === "set_code") {
        // Optional file param; defaults to active file
        const targetFile = a.file || activeFile;
        setFiles(f => ({ ...f, [targetFile]: a.code }));
        executed.push(`✎ Updated ${targetFile}`);
      } else if (a.type === "append_code") {
        const targetFile = a.file || activeFile;
        setFiles(f => ({ ...f, [targetFile]: (f[targetFile] || "") + "\n" + a.code }));
        executed.push(`✎ Appended to ${targetFile}`);
      } else if (a.type === "create_file") {
        // a.name, a.code (optional)
        if (a.name && !files[a.name]) {
          setFiles(f => ({ ...f, [a.name]: a.code || "// " + a.name + "\n" }));
          // Add to tree under src/
          setTree(t => {
            const nt = JSON.parse(JSON.stringify(t));
            const src = nt.children?.find(c => c.name === "src");
            if (src) {
              src.children = src.children || [];
              if (!src.children.find(c => c.name === a.name)) {
                src.children.push({ name: a.name, type: "file" });
                src.expanded = true;
              }
            } else {
              nt.children.push({ name: a.name, type: "file" });
            }
            return nt;
          });
          executed.push(`📄 Created ${a.name}`);
        }
      } else if (a.type === "delete_file") {
        if (a.name && files[a.name]) {
          setFiles(f => { const nf = { ...f }; delete nf[a.name]; return nf; });
          setTree(t => {
            const nt = JSON.parse(JSON.stringify(t));
            const remove = (node) => { if (node.children) node.children = node.children.filter(c => !(c.name === a.name && c.type === "file")).map(c => { remove(c); return c; }); };
            remove(nt);
            return nt;
          });
          setTabs(tb => tb.filter(t => t.id !== a.name));
          executed.push(`🗑 Deleted ${a.name}`);
        }
      } else if (a.type === "set_active_file") {
        if (a.name && files[a.name]) {
          setActiveFile(a.name);
          if (!tabs.find(t => t.id === a.name)) {
            setTabs(p => [...p, { id: a.name, label: a.name, type: "code" }]);
          }
          setActiveTab(a.name);
          executed.push(`📂 Opened ${a.name}`);
        }
      } else if (a.type === "set_board") {
        if (a.board && BOARDS[a.board]) {
          setSelectedBoard(a.board);
          executed.push(`🔧 Board → ${a.board}`);
        }
      } else if (a.type === "delete_component") {
        const uid = resolveRef(a.ref);
        if (uid) {
          setPlaced(p => p.filter(c => c.uid !== uid));
          setWires(w => w.filter(wr => !wr.from.startsWith(uid + ":") && !wr.to.startsWith(uid + ":")));
          executed.push(`✕ Deleted ${a.ref}`);
        }
      } else if (a.type === "delete_wire") {
        // a.from + a.to specifies which wire
        const fUid = resolveRef(a.from.split(":")[0]);
        const tUid = resolveRef(a.to.split(":")[0]);
        if (fUid && tUid) {
          const fromKey = `${fUid}:${a.from.split(":")[1]}`;
          const toKey = `${tUid}:${a.to.split(":")[1]}`;
          setWires(w => w.filter(wr => !((wr.from === fromKey && wr.to === toKey) || (wr.from === toKey && wr.to === fromKey))));
          executed.push(`✕ Removed wire ${a.from} → ${a.to}`);
        }
      } else if (a.type === "move_component") {
        const uid = resolveRef(a.ref);
        if (uid) {
          setPlaced(p => p.map(c => c.uid === uid ? { ...c, x: a.x ?? c.x, y: a.y ?? c.y } : c));
          executed.push(`↔ Moved ${a.ref}`);
        }
      } else if (a.type === "rotate_component") {
        const uid = resolveRef(a.ref);
        if (uid) {
          setPlaced(p => p.map(c => c.uid === uid ? { ...c, pins: c.pins.map(pin => ({ ...pin, s: pin.s === "L" ? "R" : "L" })) } : c));
          executed.push(`↻ Rotated ${a.ref}`);
        }
      } else if (a.type === "clear_schematic") {
        setPlaced([]);
        setWires([]);
        executed.push("✕ Cleared schematic");
      } else if (a.type === "clear_wires") {
        setWires([]);
        executed.push("✕ Cleared all wires");
      } else if (a.type === "open_view") {
        // a.view = "schematic" | "pcb" | "bom" | "drc" | "serial" | "export" | "code"
        const map = {
          schematic: { id: "schematic", label: "Schematic", type: "schematic" },
          pcb: { id: "pcb", label: "PCB", type: "pcb" },
          bom: { id: "bom", label: "BOM", type: "bom" },
          drc: { id: "drc", label: "DRC", type: "drc" },
          serial: { id: "serial", label: "Serial", type: "serial" },
          export: { id: "export", label: "Export", type: "export" },
        };
        const view = map[a.view];
        if (view) {
          if (!tabs.find(t => t.id === view.id)) setTabs(t => [...t, view]);
          setActiveTab(view.id);
          setView("editor");
          executed.push(`👁 Opened ${a.view}`);
        }
      } else if (a.type === "compile") {
        compile();
        executed.push("▶ Compiling");
      } else if (a.type === "serial_print") {
        // Inject a fake serial line for demos
        setSerialLines(s => [...s, { ts: new Date().toISOString().slice(11, 19), text: a.text || "" }]);
      } else if (a.type === "message") {
        setMessages(m => [...m, { role: "a", text: a.text }]);
      } else if (a.type === "note") {
        // Just a system note in the chat
        setMessages(m => [...m, { role: "s", text: a.text }]);
      }
    });

    if (newComponents.length > 0 || newWires.length > 0) {
      if (!tabs.find(t => t.id === "schematic")) {
        setTabs(t => [...t, { id: "schematic", label: "Schematic", type: "schematic" }]);
      }
      setActiveTab("schematic");
      setView("editor");
    }

    if (executed.length > 0) {
      setMessages(m => [...m, { role: "exec", text: executed.join("\n") }]);
    }
  }, [activeFile, tabs, files, compile]);

  // ─── Repair common AI JSON mistakes ─────────────────
  const repairJSON = (raw) => {
    let s = raw.trim();
    // Strip BOM
    if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
    // Remove stray characters before/after the JSON object
    const firstBrace = s.indexOf("{");
    const lastBrace = s.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) return s;
    s = s.slice(firstBrace, lastBrace + 1);
    // Fix stray quote after a numeric VALUE (i.e., : 320 " })
    // Must be preceded by colon-space-digits, not by a string-ending digit
    s = s.replace(/(:\s*-?\d+(?:\.\d+)?)\s*"(\s*[,}\]])/g, "$1$2");
    // Remove trailing commas before } or ]
    s = s.replace(/,(\s*[}\]])/g, "$1");
    // Fix smart quotes
    s = s.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
    return s;
  };

  // ─── Validate and auto-fix actions ──────────────────
  const validateAndFix = (actionBlock) => {
    const fixes = [];
    const actions = [...actionBlock.actions];

    // Build a map of what the AI is adding (component_id -> count)
    const addedCounts = {};
    const addedComponents = []; // ordered list of {id, idx}
    actions.forEach(a => {
      if (a.type === "add_component") {
        addedCounts[a.component_id] = (addedCounts[a.component_id] || 0) + 1;
        addedComponents.push({ id: a.component_id, idx: addedCounts[a.component_id] });
      }
    });

    // Build pin lookup for added + existing components
    const pinLookup = {}; // key: "component_id" or "component_id#N" -> Set of pin labels
    addedComponents.forEach(({ id, idx }) => {
      const def = ROBOTICS_LIB.find(c => c.id === id);
      if (def) {
        const pins = new Set(def.pins.map(p => p.l));
        pinLookup[`${id}#${idx}`] = pins;
        if (idx === 1) pinLookup[id] = pins;
      }
    });
    // Also add existing placed components
    placedRef.current.forEach(c => {
      if (!pinLookup[c.id]) pinLookup[c.id] = new Set(c.pins.map(p => p.l));
    });

    // Check 1: Motors directly wired to MCU? Need to insert a driver.
    const MOTOR_TYPES = ["mot_dc_gear", "mot_dc_encoder"];
    const MCU_TYPES = ["mcu_esp32", "mcu_pico", "mcu_teensy41", "mcu_arduino_mega"];
    const hasDriver = addedComponents.some(c => c.id === "drv_l298n" || c.id === "drv_tb6612") ||
                      placedRef.current.some(c => ["drv_l298n", "drv_tb6612"].includes(c.id));

    const directMotorWires = actions.filter(a => {
      if (a.type !== "wire") return false;
      const fromBase = a.from.split(":")[0].split("#")[0];
      const toBase = a.to.split(":")[0].split("#")[0];
      return (MCU_TYPES.includes(fromBase) && MOTOR_TYPES.includes(toBase)) ||
             (MCU_TYPES.includes(toBase) && MOTOR_TYPES.includes(fromBase));
    });

    if (directMotorWires.length > 0 && !hasDriver) {
      // Insert L298N after the MCU add
      const mcuAddIdx = actions.findIndex(a => a.type === "add_component" && MCU_TYPES.includes(a.component_id));
      if (mcuAddIdx !== -1) {
        actions.splice(mcuAddIdx + 1, 0, { type: "add_component", component_id: "drv_l298n", x: 320, y: 100 });
        addedCounts["drv_l298n"] = 1;
        const def = ROBOTICS_LIB.find(c => c.id === "drv_l298n");
        pinLookup["drv_l298n"] = new Set(def.pins.map(p => p.l));
        pinLookup["drv_l298n#1"] = pinLookup["drv_l298n"];
        fixes.push("Added L298N motor driver (motors cannot be driven directly from MCU pins)");
      }
    }

    // Check 2: Reroute MCU→motor wires to go MCU→driver→motor
    if (directMotorWires.length > 0) {
      // Get count of motor instances
      const motorInstances = addedComponents.filter(c => MOTOR_TYPES.includes(c.id));
      // Map of L298N output pins per motor instance
      const driverOutputs = [
        { mPlus: "OUT1", mMinus: "OUT2" }, // motor 1
        { mPlus: "OUT3", mMinus: "OUT4" }, // motor 2
      ];
      // L298N input pins for control (in order: IN1,IN2 for motor1; IN3,IN4 for motor2)
      const driverInputs = [
        { in1: "IN1", in2: "IN2", en: "ENA" },
        { in1: "IN3", in2: "IN4", en: "ENB" },
      ];

      // Remove the bad direct wires and remember which MCU pins were intended
      const badWireIndices = [];
      const motorAssignments = {}; // "mot_dc_gear#1" -> { mcuPin1, mcuPin2 }
      actions.forEach((a, i) => {
        if (a.type !== "wire") return;
        const fromBase = a.from.split(":")[0].split("#")[0];
        const toBase = a.to.split(":")[0].split("#")[0];
        if ((MCU_TYPES.includes(fromBase) && MOTOR_TYPES.includes(toBase)) ||
            (MCU_TYPES.includes(toBase) && MOTOR_TYPES.includes(fromBase))) {
          badWireIndices.push(i);
          // Capture: MCU pin that was intended for the motor
          const mcuRef = MCU_TYPES.includes(fromBase) ? a.from : a.to;
          const motorRef = MOTOR_TYPES.includes(fromBase) ? a.from : a.to;
          const motorKey = motorRef.split(":")[0]; // e.g. "mot_dc_gear#1"
          const motorPin = motorRef.split(":")[1]; // M+ or M-
          if (!motorAssignments[motorKey]) motorAssignments[motorKey] = {};
          if (motorPin === "M+") motorAssignments[motorKey].mPlus = mcuRef;
          if (motorPin === "M-") motorAssignments[motorKey].mMinus = mcuRef;
        }
      });
      // Remove bad wires (in reverse order to preserve indices)
      badWireIndices.reverse().forEach(i => actions.splice(i, 1));

      // Insert proper wires
      const newWires = [];
      Object.keys(motorAssignments).forEach((motorKey, idx) => {
        if (idx >= driverOutputs.length) return; // L298N only has 2 channels
        const out = driverOutputs[idx];
        const ins = driverInputs[idx];
        const assignment = motorAssignments[motorKey];
        // Driver outputs to motor
        newWires.push({ type: "wire", from: `drv_l298n:${out.mPlus}`, to: `${motorKey}:M+` });
        newWires.push({ type: "wire", from: `drv_l298n:${out.mMinus}`, to: `${motorKey}:M-` });
        // MCU control pins to driver inputs (use original MCU pins if captured)
        if (assignment.mPlus) newWires.push({ type: "wire", from: assignment.mPlus, to: `drv_l298n:${ins.in1}` });
        if (assignment.mMinus) newWires.push({ type: "wire", from: assignment.mMinus, to: `drv_l298n:${ins.in2}` });
      });
      // Add power wires from battery to driver (if battery exists)
      const hasBattery = addedComponents.some(c => c.id.startsWith("pwr_li") || c.id.startsWith("pwr_lipo")) ||
                         placedRef.current.some(c => c.id.startsWith("pwr_li") || c.id.startsWith("pwr_lipo"));
      if (hasBattery) {
        const battery = addedComponents.find(c => c.id.startsWith("pwr_li") || c.id.startsWith("pwr_lipo"));
        const batRef = battery ? `${battery.id}${battery.idx > 1 ? "#" + battery.idx : ""}` : "pwr_li_ion";
        newWires.push({ type: "wire", from: `${batRef}:+`, to: "drv_l298n:VCC" });
        newWires.push({ type: "wire", from: `${batRef}:-`, to: "drv_l298n:GND" });
      }
      // Add MCU GND to driver GND for common ground
      const mcuAdded = addedComponents.find(c => MCU_TYPES.includes(c.id));
      if (mcuAdded) {
        newWires.push({ type: "wire", from: `${mcuAdded.id}:GND`, to: "drv_l298n:GND" });
      }

      // Find where to insert: after add_components, before set_code/message
      const lastAddIdx = actions.map((a, i) => a.type === "add_component" ? i : -1).filter(i => i >= 0).pop() ?? 0;
      actions.splice(lastAddIdx + 1, 0, ...newWires);
      fixes.push(`Rerouted ${badWireIndices.length} direct motor wires through the L298N driver`);
    }

    // Check 3: Drop wires that reference pins which don't exist on their components
    const droppedWires = [];
    const validActions = actions.filter(a => {
      if (a.type !== "wire") return true;
      const [fromRef, fromPin] = a.from.split(":");
      const [toRef, toPin] = a.to.split(":");
      const fromBase = fromRef.includes("#") ? fromRef : fromRef;
      const toBase = toRef.includes("#") ? toRef : toRef;
      const fromPins = pinLookup[fromBase] || pinLookup[fromBase.split("#")[0]];
      const toPins = pinLookup[toBase] || pinLookup[toBase.split("#")[0]];
      const fromValid = fromPins && fromPins.has(fromPin);
      const toValid = toPins && toPins.has(toPin);
      if (!fromValid || !toValid) {
        droppedWires.push(`${a.from} → ${a.to}`);
        return false;
      }
      return true;
    });
    if (droppedWires.length > 0) {
      fixes.push(`Dropped ${droppedWires.length} wires with invalid pins: ${droppedWires.slice(0, 3).join(", ")}${droppedWires.length > 3 ? "..." : ""}`);
    }

    return { actions: validActions, fixes };
  };

  const parseAndExecute = (response) => {
    const match = response.match(/```helix-actions\n?([\s\S]*?)```/);
    if (match) {
      const repaired = repairJSON(match[1]);
      let json;
      try {
        json = JSON.parse(repaired);
      } catch (err) {
        setMessages(m => [...m, { role: "a", text: `JSON parse error: ${err.message}\n\nRaw response:\n\`\`\`\n${match[1].slice(0, 500)}\n\`\`\`` }]);
        return true;
      }
      if (json.actions) {
        const cleanText = response.replace(/```helix-actions[\s\S]*?```/, "").trim();
        if (cleanText) setMessages(m => [...m, { role: "a", text: cleanText }]);

        // Validate and auto-fix
        const { actions: fixedActions, fixes } = validateAndFix(json);
        if (fixes.length > 0) {
          setMessages(m => [...m, { role: "exec", text: "🔧 Auto-fixes applied:\n" + fixes.map(f => "  • " + f).join("\n") }]);
        }

        setTimeout(() => executeActions({ actions: fixedActions }), 100);
        return true;
      }
    }
    return false;
  };

  // ─── Send chat ──────────────────────────────────────
  // ─── Shared AI call ──────────────────────────────────
  const callAI = useCallback(async (userMsg, sysPromptOverride) => {
    const sysPrompt = sysPromptOverride || buildRoboticsPrompt(selectedBoard, placed, wires, files[activeFile] || "", Object.keys(files));
    let response = "";
    if (aiProvider === "ollama") {
      const r = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: ollamaModel, prompt: userMsg, system: sysPrompt, stream: false, options: { temperature: aiTemp, num_predict: 4096 } }),
      });
      const d = await r.json();
      response = d.response || "No response from Ollama. Make sure Ollama is running and the model is pulled.";
    } else if (aiProvider === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, temperature: aiTemp, system: sysPrompt, messages: [{ role: "user", content: userMsg }] }),
      });
      const d = await r.json();
      response = d.content?.[0]?.text || d.error?.message || "No response from Claude.";
    } else if (aiProvider === "openai") {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({ model: "gpt-4o", temperature: aiTemp, max_tokens: 4096, messages: [{ role: "system", content: sysPrompt }, { role: "user", content: userMsg }] }),
      });
      const d = await r.json();
      response = d.choices?.[0]?.message?.content || d.error?.message || "No response from OpenAI.";
    }
    return response;
  }, [aiProvider, ollamaModel, ollamaUrl, anthropicKey, openaiKey, selectedBoard, placed, wires, files, activeFile, aiTemp]);

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setMessages(m => [...m, { role: "u", text: userMsg }]);
    setChatLoading(true);
    try {
      const response = await callAI(userMsg);
      const hadActions = parseAndExecute(response);
      if (!hadActions) {
        setMessages(m => [...m, { role: "a", text: response }]);
      }
    } catch (err) {
      setMessages(m => [...m, { role: "a", text: `Error: ${err.message}` }]);
    }
    setChatLoading(false);
  }, [chatInput, chatLoading, callAI, executeActions]);

  // ─── Cmd+K inline runner ────────────────────────────
  const runCmdK = useCallback(async () => {
    if (!cmdKInput.trim() || cmdKLoading) return;
    const userMsg = cmdKInput.trim();
    setCmdKLoading(true);
    // Aggressive directive prefix to force action-block output
    const directive = `IMPORTANT: Respond ONLY with a complete helix-actions JSON block. No prose before or after the block. No explanations. Just the action block. The user's request is: "${userMsg}"

You MUST output a complete project: add_component for every part, wire for EVERY connection (power, ground, signal), set_code or create_file for the firmware, and an open_view at the end. Use the worked example in your system prompt as a template for completeness.`;
    try {
      let response = await callAI(directive);
      let hadActions = parseAndExecute(response);

      // Retry once if the AI didn't produce an action block
      if (!hadActions) {
        const retry = `Your previous response did not contain a helix-actions block. You MUST respond with ONLY a JSON action block in \`\`\`helix-actions ... \`\`\` fences. Build: ${userMsg}`;
        response = await callAI(retry);
        hadActions = parseAndExecute(response);
        if (!hadActions) {
          // Final fallback: surface the raw response in chat
          setMessages(m => [...m, { role: "u", text: `[Cmd+K] ${userMsg}` }, { role: "a", text: response }]);
          showToast("AI did not produce actions — see chat", "err");
        } else {
          setMessages(m => [...m, { role: "u", text: `[Cmd+K] ${userMsg}` }]);
          showToast("Built via Cmd+K", "ok");
        }
      } else {
        setMessages(m => [...m, { role: "u", text: `[Cmd+K] ${userMsg}` }]);
        showToast("Built via Cmd+K", "ok");
      }
    } catch (err) {
      showToast("Error: " + err.message, "err");
    }
    setCmdKLoading(false);
    setCmdKInput("");
    setShowCmdK(false);
  }, [cmdKInput, cmdKLoading, callAI]);

  // ─── SVG Export Generation ──────────────────────────
  const generateSVG = (forPCB = false) => {
    if (placed.length === 0) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200"><rect width="400" height="200" fill="${forPCB ? "#0a2818" : "#11111c"}"/><text x="200" y="100" fill="#666" font-size="14" text-anchor="middle" font-family="monospace">No components placed</text></svg>`;
    }
    const minX = Math.min(...placed.map(c => c.x)) - 30;
    const minY = Math.min(...placed.map(c => c.y)) - 30;
    const maxX = Math.max(...placed.map(c => c.x + c.w)) + 30;
    const maxY = Math.max(...placed.map(c => c.y + c.h + 22)) + 30;
    const w = maxX - minX, h = maxY - minY;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${w} ${h}" width="${w}" height="${h}">`;
    svg += `<rect x="${minX}" y="${minY}" width="${w}" height="${h}" fill="${forPCB ? "#0a2818" : "#11111c"}"/>`;
    svg += `<defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${forPCB ? "#1a4828" : "#232336"}"/></pattern></defs>`;
    svg += `<rect x="${minX}" y="${minY}" width="${w}" height="${h}" fill="url(#g)"/>`;

    wires.forEach(wr => {
      const f = findPin(wr.from), t = findPin(wr.to);
      if (f && t) {
        const color = forPCB ? "#c9a227" : (PIN_COLORS[f.pin.t] || "#6cb6ff");
        const sw = forPCB ? 3 : 2;
        const mx = (f.pos.x + t.pos.x) / 2;
        svg += `<path d="M ${f.pos.x} ${f.pos.y} L ${mx} ${f.pos.y} L ${mx} ${t.pos.y} L ${t.pos.x} ${t.pos.y}" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
      }
    });

    placed.forEach(comp => {
      if (forPCB) {
        svg += `<rect x="${comp.x}" y="${comp.y + 22}" width="${comp.w}" height="${comp.h}" fill="#0d5030" stroke="#c9a227" stroke-width="1"/>`;
        svg += `<text x="${comp.x + comp.w / 2}" y="${comp.y + 22 + comp.h / 2}" fill="#ffd700" font-size="9" text-anchor="middle" font-family="monospace" font-weight="600">${comp.name}</text>`;
        comp.pins.forEach(pin => {
          const pos = getPinPos(comp, pin);
          svg += `<circle cx="${pos.x}" cy="${pos.y}" r="5" fill="#c9a227" stroke="#ffd700" stroke-width="0.5"/>`;
          svg += `<circle cx="${pos.x}" cy="${pos.y}" r="2" fill="#0a2818"/>`;
        });
      } else {
        svg += `<rect x="${comp.x}" y="${comp.y}" width="${comp.w}" height="22" fill="#0c0c14" stroke="#303048" stroke-width="1"/>`;
        svg += `<rect x="${comp.x}" y="${comp.y + 22}" width="${comp.w}" height="${comp.h}" fill="#161622" stroke="#303048" stroke-width="1"/>`;
        svg += `<text x="${comp.x + comp.w / 2}" y="${comp.y + 15}" fill="#dcdce8" font-size="9" text-anchor="middle" font-family="monospace" font-weight="600">${comp.name}</text>`;
        comp.pins.forEach(pin => {
          const pos = getPinPos(comp, pin);
          const color = PIN_COLORS[pin.t] || "#6cb6ff";
          svg += `<circle cx="${pos.x}" cy="${pos.y}" r="4" fill="${color}" stroke="#07070b" stroke-width="1"/>`;
          const lx = pin.s === "L" ? pos.x + 8 : pos.x - 8;
          const anchor = pin.s === "L" ? "start" : "end";
          svg += `<text x="${lx}" y="${pos.y + 3}" fill="#8e8ea8" font-size="7" text-anchor="${anchor}" font-family="monospace">${pin.l}</text>`;
        });
      }
    });

    svg += `</svg>`;
    return svg;
  };

  // ─── Export ─────────────────────────────────────────
  const dl = (content, name, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${name}`, "ok");
  };

  const exportSVG = (pcb = false) => dl(generateSVG(pcb), pcb ? "helix-pcb.svg" : "helix-schematic.svg", "image/svg+xml");

  const exportPNG = (pcb = false) => {
    const svg = generateSVG(pcb);
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2 || 800;
      canvas.height = img.height * 2 || 400;
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(b => {
        if (b) {
          const u = URL.createObjectURL(b);
          const a = document.createElement("a");
          a.href = u; a.download = pcb ? "helix-pcb.png" : "helix-schematic.png"; a.click();
          URL.revokeObjectURL(u);
          showToast("PNG exported", "ok");
        }
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const exportPDF = (pcb = false) => {
    const svg = generateSVG(pcb);
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><title>HELIX ${pcb ? "PCB" : "Schematic"}</title><style>body{margin:0;padding:20px;background:#fff}@media print{body{padding:0}}</style></head><body>${svg}<script>setTimeout(()=>window.print(),300)</script></body></html>`);
    }
  };

  const exportGerberJSON = () => {
    const gerber = {
      format: "HELIX-Gerber-v1", board: selectedBoard,
      layers: {
        copper_top: placed.map(c => ({
          name: c.name, position: { x: c.x, y: c.y + 22 }, footprint: { w: c.w, h: c.h },
          pads: c.pins.map(p => ({ label: p.l, position: getPinPos(c, p), type: p.t, shape: "circle", size: 8 })),
        })),
        traces: wires.map(wr => {
          const f = findPin(wr.from), t = findPin(wr.to);
          return f && t ? { from: f.pos, to: t.pos, net: f.pin.t, width: 0.3 } : null;
        }).filter(Boolean),
      },
      bom: bomItems.map(b => ({ name: b.name, qty: b.qty, id: b.id })),
    };
    dl(JSON.stringify(gerber, null, 2), "helix-board.gerber.json", "application/json");
  };

  const exportBOMcsv = () => {
    let csv = "Qty,Component,Category,Domain,Description\n";
    bomItems.forEach(b => { csv += `${b.qty},"${b.name}","${b.category}","${b.domain}","${b.desc}"\n`; });
    dl(csv, "helix-bom.csv", "text/csv");
  };

  // ─── Render file tree ──────────────────────────────
  const renderTree = (node, path = [], depth = 0) => {
    if (node.type === "folder") {
      return (
        <div key={path.join("/") || "root"}>
          <button className="ft" style={{ "--d": depth }} onClick={() => toggleFolder(path)}>
            <span className={`ft-c ${node.expanded ? "o" : ""}`}>{I.chev}</span>
            <span className="ft-icon" style={{ color: "var(--orange)" }}>{I.folder}</span>
            <span className="ft-name">{node.name}</span>
          </button>
          {node.expanded && node.children?.map(c => renderTree(c, [...path, c.name], depth + 1))}
        </div>
      );
    }
    return (
      <button key={node.name} className={`ft ${activeFile === node.name ? "on" : ""}`} style={{ "--d": depth }}
        onClick={() => renamingFile !== node.name && openFile(node.name)}
        onContextMenu={(e) => { e.preventDefault(); startRename(node.name); }}>
        <span className="ft-c" style={{ visibility: "hidden" }}>{I.chev}</span>
        <span className="ft-icon" style={{ color: "var(--cyan)" }}>{I.file}</span>
        <span className="ft-name">
          {renamingFile === node.name ? (
            <input value={renameValue} onChange={e => setRenameValue(e.target.value)} autoFocus
              onBlur={finishRename} onKeyDown={e => { if (e.key === "Enter") finishRename(); if (e.key === "Escape") setRenamingFile(null); }} />
          ) : node.name}
        </span>
        <span className="ft-actions">
          <button className="ft-act" onClick={(e) => { e.stopPropagation(); startRename(node.name); }} title="Rename">{I.edit}</button>
          <button className="ft-act" onClick={(e) => { e.stopPropagation(); deleteFile(node.name); }} title="Delete">{I.trash}</button>
        </span>
      </button>
    );
  };

  // ─── Render schematic ──────────────────────────────
  const handleSchWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.3), 3);
    const rect = schRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setPan(p => ({
      x: mx - (mx - p.x) * (newZoom / zoom),
      y: my - (my - p.y) * (newZoom / zoom),
    }));
    setZoom(newZoom);
  };

  const handleSchMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.target.classList.contains("sch-grid"))) {
      e.preventDefault();
      setIsPanning(true);
      const sx = e.clientX - pan.x;
      const sy = e.clientY - pan.y;
      const mv = (ev) => setPan({ x: ev.clientX - sx, y: ev.clientY - sy });
      const up = () => { setIsPanning(false); document.removeEventListener("mousemove", mv); document.removeEventListener("mouseup", up); };
      document.addEventListener("mousemove", mv);
      document.addEventListener("mouseup", up);
    }
    if (e.target === e.currentTarget || e.target.classList.contains("sch-grid")) {
      setSelectedComp(null);
      setPendingPin(null);
    }
  };

  const renderSchematic = () => (
    <div className="sch" ref={schRef} onWheel={handleSchWheel} onMouseDown={handleSchMouseDown}
      style={{ cursor: isPanning ? "grabbing" : "default" }}>
      {placed.length === 0 && (
        <div className="sch-empty">
          <div className="sch-empty-icon">{I.pcb}</div>
          <div className="sch-empty-title">Empty schematic</div>
          <div className="sch-empty-sub">Add components to start building</div>
          <div className="sch-empty-actions">
            <button className="btn" onClick={() => { setSidePanel("components"); setShowSide(true); }}>{I.comp} Browse Components</button>
            <button className="btn sec" onClick={() => { setShowCmdK(true); setTimeout(() => cmdKRef.current?.focus(), 50); }}>⌘K Build with AI</button>
            <button className="btn sec" onClick={() => setShowTemplates(true)}>{I.plus} Use Template</button>
          </div>
          <div className="sch-empty-hint">Tip: Press <kbd>Ctrl+K</kbd> anywhere to ask AI to build something</div>
        </div>
      )}
      <div className="sch-vp" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        <div className="sch-grid"/>
        <svg className="sch-svg">
          {wires.map(w => {
            const f = findPin(w.from);
            const t = findPin(w.to);
            if (!f || !t) return null;
            const color = PIN_COLORS[f.pin.t] || "#6cb6ff";
            const midX = (f.pos.x + t.pos.x) / 2;
            return (
              <g key={w.id}>
                <path d={`M ${f.pos.x} ${f.pos.y} L ${midX} ${f.pos.y} L ${midX} ${t.pos.y} L ${t.pos.x} ${t.pos.y}`}
                  stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"
                  style={{ pointerEvents: "stroke", cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); setWires(ws => ws.filter(x => x.id !== w.id)); }}/>
              </g>
            );
          })}
          {pendingPin && (
            <path d={`M ${pendingPin.pos.x} ${pendingPin.pos.y} L ${mousePos.x} ${mousePos.y}`}
              stroke="var(--cyan)" strokeWidth="2" strokeDasharray="4" fill="none" opacity="0.7"/>
          )}
        </svg>
        {placed.map(comp => {
          const hasError = drcResults.some(d => d.uid === comp.uid && d.type === "err");
          return (
            <div key={comp.uid} className={`pc ${selectedComp === comp.uid ? "sel" : ""} ${hasError ? "err" : ""}`}
              style={{ left: comp.x, top: comp.y, width: comp.w, height: comp.h + 22 }}
              onClick={(e) => { e.stopPropagation(); setSelectedComp(comp.uid); }}>
              <div className="pc-head" onMouseDown={(e) => {
                e.stopPropagation();
                const rect = schRef.current.getBoundingClientRect();
                const sx = (e.clientX - rect.left - pan.x) / zoom - comp.x;
                const sy = (e.clientY - rect.top - pan.y) / zoom - comp.y;
                const mv = ev => setPlaced(p => p.map(c => c.uid === comp.uid ? {
                  ...c,
                  x: (ev.clientX - rect.left - pan.x) / zoom - sx,
                  y: (ev.clientY - rect.top - pan.y) / zoom - sy
                } : c));
                const up = () => { document.removeEventListener("mousemove", mv); document.removeEventListener("mouseup", up); };
                document.addEventListener("mousemove", mv);
                document.addEventListener("mouseup", up);
              }}>{comp.name}</div>
              <div className="pc-body">
                {comp.pins.map((pin, pi) => {
                  const isL = pin.s === "L";
                  const left = isL ? -5.5 : comp.w - 5.5;
                  const top = pin.o - 5.5;
                  const color = PIN_COLORS[pin.t] || "#6cb6ff";
                  const isPending = pendingPin?.id === `${comp.uid}:${pin.l}`;
                  return (
                    <div key={pi}>
                      <div className={`pc-pin ${isPending ? "act" : ""}`} style={{ left, top, background: color, color }}
                        onClick={(e) => handlePinClick(comp, pin, e)} title={`${pin.l} (${pin.t})`}/>
                      <div className="pc-pin-l" style={{
                        left: isL ? 8 : "auto",
                        right: isL ? "auto" : 8,
                        top: pin.o - 4,
                        textAlign: isL ? "left" : "right",
                      }}>{pin.l}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="sch-tb">
        <button className="sch-btn on">{I.comp} Select</button>
        <button className="sch-btn" onClick={undo} disabled={historyIdx === 0}>{I.undo}</button>
        <button className="sch-btn" onClick={redo} disabled={historyIdx >= history.length - 1}>{I.redo}</button>
        <button className="sch-btn" onClick={() => selectedComp && rotateComponent(selectedComp)} disabled={!selectedComp}>{I.rotate}</button>
        <button className="sch-btn" onClick={() => { setPlaced([]); setWires([]); setSelectedComp(null); }}>{I.trash} Clear</button>
        <button className="sch-btn" onClick={() => openSpecial("pcb", "PCB", "pcb")}>{I.pcb} PCB</button>
        <button className="sch-btn" onClick={() => openSpecial("export", "Export", "export")}>{I.export} Export</button>
      </div>
      <div className="zoom-info">
        <button className="zb" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button className="zb" onClick={() => setZoom(z => Math.max(z * 0.9, 0.3))}>−</button>
        <button className="zb" onClick={() => setZoom(z => Math.min(z * 1.1, 3))}>+</button>
      </div>
      <div className="sch-info">
        {placed.length} comp | {wires.length} wires | {pendingPin ? "Click target pin..." : "Wheel: zoom · Drag empty: pan"}
      </div>
    </div>
  );


  // ─── Render PCB ─────────────────────────────────────
  // ─── Arduino code parser (extracts pin operations) ────
  // This is a lightweight regex-based parser. It walks the loop() body
  // and pulls out digitalWrite/analogWrite calls + pin values from #defines.
  const parseArduinoCode = (code) => {
    const result = { defines: {}, writes: [], delays: [], serialPrints: [] };
    if (!code) return result;
    // #define PIN VALUE
    const defineRe = /#define\s+(\w+)\s+(\d+)/g;
    let m;
    while ((m = defineRe.exec(code)) !== null) {
      result.defines[m[1]] = parseInt(m[2]);
    }
    // Find loop() body
    const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
    const body = loopMatch ? loopMatch[1] : code;
    // digitalWrite(pin, HIGH/LOW)
    const dwRe = /digitalWrite\s*\(\s*([A-Za-z_]\w*|\d+)\s*,\s*(HIGH|LOW|true|false|1|0)\s*\)/g;
    while ((m = dwRe.exec(body)) !== null) {
      const pinRef = m[1];
      const pin = isNaN(pinRef) ? result.defines[pinRef] : parseInt(pinRef);
      if (pin !== undefined) {
        const val = (m[2] === "HIGH" || m[2] === "true" || m[2] === "1") ? 1 : 0;
        result.writes.push({ pin, val, type: "digital" });
      }
    }
    // analogWrite(pin, 0-255)
    const awRe = /analogWrite\s*\(\s*([A-Za-z_]\w*|\d+)\s*,\s*(\d+)\s*\)/g;
    while ((m = awRe.exec(body)) !== null) {
      const pinRef = m[1];
      const pin = isNaN(pinRef) ? result.defines[pinRef] : parseInt(pinRef);
      if (pin !== undefined) {
        result.writes.push({ pin, val: parseInt(m[2]), type: "analog" });
      }
    }
    // Serial.println("text") or Serial.print
    const spRe = /Serial\.println?\s*\(\s*"([^"]*)"\s*\)/g;
    while ((m = spRe.exec(body)) !== null) {
      result.serialPrints.push(m[1]);
    }
    // delay(ms)
    const dlRe = /delay\s*\(\s*(\d+)\s*\)/g;
    while ((m = dlRe.exec(body)) !== null) {
      result.delays.push(parseInt(m[1]));
    }
    return result;
  };

  // Run/stop simulation
  const startSim = useCallback(() => {
    if (simRunning) return;
    setSimRunning(true);
    const code = files[activeFile] || files["main.ino"] || "";
    const parsed = parseArduinoCode(code);
    setSerialLines(s => [...s, { ts: new Date().toISOString().slice(11, 19), text: "▶ Simulation started" }]);
    if (parsed.serialPrints.length > 0) {
      parsed.serialPrints.forEach(p => {
        setSerialLines(s => [...s, { ts: new Date().toISOString().slice(11, 19), text: p }]);
      });
    }
    let t = 0;
    simIntervalRef.current = setInterval(() => {
      t += 1;
      setSimTime(t);
      // Apply pin writes - for demo we cycle through them so animations are visible
      const newPins = {};
      parsed.writes.forEach((w, i) => {
        if (w.type === "digital") {
          // For digital, alternate every second to show blinking
          newPins[w.pin] = (Math.floor(t / 2) % 2 === 0) ? w.val : (w.val ? 0 : 1);
        } else {
          newPins[w.pin] = w.val;
        }
      });
      setSimPinStates(newPins);
      // Fake sensor values that drift over time
      setSimSensorValues({
        ir_left: 300 + Math.sin(t * 0.3) * 200 + 200,
        ir_right: 300 + Math.cos(t * 0.3) * 200 + 200,
        ultrasonic: 50 + Math.sin(t * 0.2) * 40 + 40,
        temp: 22 + Math.sin(t * 0.1) * 3,
        light: 500 + Math.cos(t * 0.15) * 300,
      });
    }, 500);
  }, [simRunning, files, activeFile]);

  const stopSim = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setSimRunning(false);
    setSimPinStates({});
    setSerialLines(s => [...s, { ts: new Date().toISOString().slice(11, 19), text: "■ Simulation stopped" }]);
  }, []);

  useEffect(() => {
    return () => { if (simIntervalRef.current) clearInterval(simIntervalRef.current); };
  }, []);


  const renderPCB = () => (
    <div className="pcb">
      <svg width="100%" height="100%" style={{ display: "block" }}>
        <defs>
          <pattern id="pcbgrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="#1a4828"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pcbgrid)"/>
        {wires.map(w => {
          const f = findPin(w.from); const t = findPin(w.to);
          if (!f || !t) return null;
          const midX = (f.pos.x + t.pos.x) / 2;
          return (
            <g key={w.id}>
              <path d={`M ${f.pos.x} ${f.pos.y} L ${midX} ${f.pos.y} L ${midX} ${t.pos.y} L ${t.pos.x} ${t.pos.y}`}
                stroke="#c9a227" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9"/>
            </g>
          );
        })}
        {placed.map(comp => (
          <g key={comp.uid}>
            <rect x={comp.x} y={comp.y + 22} width={comp.w} height={comp.h} fill="#0d5030" stroke="#c9a227" strokeWidth="1" opacity="0.9"/>
            <text x={comp.x + comp.w/2} y={comp.y + 22 + comp.h/2} fill="#ffd700" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">{comp.name}</text>
            {comp.pins.map((pin, i) => {
              const pos = getPinPos(comp, pin);
              return (
                <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r="5" fill="#c9a227" stroke="#ffd700" strokeWidth="0.5"/>
                  <circle cx={pos.x} cy={pos.y} r="2" fill="#0a2818"/>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <div className="pcb-tb">
        <button className="sch-btn on">{I.pcb} PCB View</button>
        <button className="sch-btn" onClick={() => openSpecial("schematic", "Schematic", "schematic")}>{I.comp} Schematic</button>
        <button className="sch-btn" onClick={() => openSpecial("export", "Export", "export")}>{I.export} Export</button>
      </div>
      <div className="pcb-info">
        {placed.length} footprints | {wires.length} traces | Auto-generated
      </div>
    </div>
  );

  // ─── Render code editor with VS Code-like features ─
  const renderCodeEditor = (id) => {
    const code = files[id] || "";
    const lineNums = code.split("\n").map((_, i) => i + 1).join("\n");

    const updateCode = (newCode, selStart, selEnd) => {
      setFiles(f => ({ ...f, [id]: newCode }));
      // Restore cursor after React re-render
      requestAnimationFrame(() => {
        const ta = document.querySelector(".ta");
        if (ta) {
          ta.selectionStart = selStart;
          ta.selectionEnd = selEnd ?? selStart;
        }
      });
    };

    const handleKeyDown = (e) => {
      const ta = e.target;
      const { selectionStart: ss, selectionEnd: se, value: v } = ta;
      const before = v.slice(0, ss);
      const after = v.slice(se);
      const sel = v.slice(ss, se);
      const lineStart = before.lastIndexOf("\n") + 1;
      const currentLine = before.slice(lineStart);
      const indent = currentLine.match(/^\s*/)[0];

      // Tab → 2 spaces, or indent selected lines
      if (e.key === "Tab") {
        e.preventDefault();
        if (ss !== se && sel.includes("\n")) {
          // Multi-line: indent each line
          const startLineBegin = before.lastIndexOf("\n") + 1;
          const block = v.slice(startLineBegin, se);
          const newBlock = e.shiftKey
            ? block.split("\n").map(l => l.startsWith("  ") ? l.slice(2) : l.startsWith(" ") ? l.slice(1) : l).join("\n")
            : block.split("\n").map(l => "  " + l).join("\n");
          const newV = v.slice(0, startLineBegin) + newBlock + after;
          const delta = newBlock.length - block.length;
          updateCode(newV, startLineBegin, se + delta);
        } else if (e.shiftKey) {
          // Unindent current line
          if (currentLine.startsWith("  ")) {
            const newV = v.slice(0, lineStart) + currentLine.slice(2) + after;
            updateCode(newV, Math.max(lineStart, ss - 2));
          }
        } else {
          // Insert 2 spaces
          const newV = before + "  " + after;
          updateCode(newV, ss + 2);
        }
        return;
      }

      // Enter → auto-indent
      if (e.key === "Enter") {
        e.preventDefault();
        let newIndent = indent;
        // Increase indent after opening brace
        const charBefore = before[before.length - 1];
        const charAfter = after[0];
        if (charBefore === "{" || charBefore === "[" || charBefore === "(") {
          newIndent = indent + "  ";
        }
        // If cursor is between {} or [] or (), add extra line
        if ((charBefore === "{" && charAfter === "}") ||
            (charBefore === "[" && charAfter === "]") ||
            (charBefore === "(" && charAfter === ")")) {
          const newV = before + "\n" + newIndent + "\n" + indent + after;
          updateCode(newV, ss + 1 + newIndent.length);
        } else {
          const newV = before + "\n" + newIndent + after;
          updateCode(newV, ss + 1 + newIndent.length);
        }
        return;
      }

      // Auto-close brackets and quotes
      const pairs = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" };
      if (pairs[e.key]) {
        // If text is selected, wrap it
        if (ss !== se) {
          e.preventDefault();
          const newV = before + e.key + sel + pairs[e.key] + after;
          updateCode(newV, ss + 1, se + 1);
          return;
        }
        // Don't auto-close quote if already inside a word
        const prevChar = before[before.length - 1];
        if ((e.key === '"' || e.key === "'") && prevChar && /\w/.test(prevChar)) {
          return; // let default handle
        }
        e.preventDefault();
        const newV = before + e.key + pairs[e.key] + after;
        updateCode(newV, ss + 1);
        return;
      }

      // Skip over closing bracket if it matches
      if ([")", "]", "}", '"', "'"].includes(e.key)) {
        if (after[0] === e.key) {
          e.preventDefault();
          updateCode(v, ss + 1);
          return;
        }
      }

      // Backspace: if between matching pair, remove both
      if (e.key === "Backspace" && ss === se) {
        const pb = before[before.length - 1];
        const pa = after[0];
        if (pairs[pb] === pa) {
          e.preventDefault();
          const newV = before.slice(0, -1) + after.slice(1);
          updateCode(newV, ss - 1);
          return;
        }
      }

      // Ctrl+/ → toggle line comment
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        const startLineBegin = before.lastIndexOf("\n") + 1;
        const endLineEnd = after.indexOf("\n") === -1 ? v.length : se + after.indexOf("\n");
        const block = v.slice(startLineBegin, endLineEnd);
        const lines = block.split("\n");
        const allCommented = lines.every(l => l.trim().startsWith("//") || l.trim() === "");
        const newLines = allCommented
          ? lines.map(l => l.replace(/^(\s*)\/\/ ?/, "$1"))
          : lines.map(l => l.trim() === "" ? l : l.replace(/^(\s*)/, "$1// "));
        const newBlock = newLines.join("\n");
        const newV = v.slice(0, startLineBegin) + newBlock + v.slice(endLineEnd);
        const delta = newBlock.length - block.length;
        updateCode(newV, ss + (allCommented ? -3 : 3), se + delta);
        return;
      }

      // Ctrl+D → duplicate line
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && ss === se) {
        e.preventDefault();
        const lineEnd = after.indexOf("\n") === -1 ? v.length : ss + after.indexOf("\n");
        const fullLine = v.slice(lineStart, lineEnd);
        const newV = v.slice(0, lineEnd) + "\n" + fullLine + v.slice(lineEnd);
        updateCode(newV, ss + fullLine.length + 1);
        return;
      }

      // Home → smart home
      if (e.key === "Home" && !e.shiftKey) {
        const firstNonWs = lineStart + currentLine.match(/^\s*/)[0].length;
        if (ss !== firstNonWs) {
          e.preventDefault();
          updateCode(v, firstNonWs);
        } else {
          e.preventDefault();
          updateCode(v, lineStart);
        }
        return;
      }
    };

    return (
      <div className="code">
        <pre className="lines">{lineNums}</pre>
        <div className="code-wrap">
          <pre className="hl" dangerouslySetInnerHTML={{ __html: highlightCode(code) + "\n" }}/>
          <textarea className="ta" value={code}
            onChange={e => setFiles(f => ({ ...f, [id]: e.target.value }))}
            onKeyDown={handleKeyDown}
            onScroll={e => {
              const wrap = e.target.parentElement;
              const hl = wrap.querySelector(".hl");
              if (hl) { hl.scrollTop = e.target.scrollTop; hl.scrollLeft = e.target.scrollLeft; }
              const lines = wrap.parentElement.querySelector(".lines");
              if (lines) lines.scrollTop = e.target.scrollTop;
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="// Ask HELIX AI to build your robot..."/>
        </div>
      </div>
    );
  };

  // ─── Render tab content ────────────────────────────
  const renderTab = () => {
    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return null;

    if (tab.type === "code") return renderCodeEditor(tab.id);
    if (tab.type === "schematic") return renderSchematic();
    if (tab.type === "pcb") return renderPCB();

    if (tab.type === "bom") {
      return (
        <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div className="sec-t">{I.bom} Bill of Materials — {bomItems.reduce((s, i) => s + i.qty, 0)} parts</div>
          <div className="bom">
            {bomItems.length === 0 ? <div className="empty">No components placed yet.</div> : (
              <table className="bom-t">
                <thead><tr><th>#</th><th>Component</th><th>Category</th><th>Domain</th><th>Description</th><th>Qty</th></tr></thead>
                <tbody>{bomItems.map((it, i) => (
                  <tr key={i}><td>{i+1}</td><td style={{color:"var(--text)"}}>{it.name}</td><td>{it.category}</td><td style={{color:"var(--cyan)"}}>{DOMAINS[it.domain]}</td><td style={{fontSize:11}}>{it.desc}</td><td style={{color:"var(--green)",fontWeight:600}}>{it.qty}</td></tr>
                ))}</tbody>
              </table>
            )}
            {bomItems.length > 0 && <div style={{marginTop:16}}><button className="btn sec" onClick={exportBOMcsv}>{I.download} Export BOM as CSV</button></div>}
          </div>
        </div>
      );
    }

    if (tab.type === "drc") {
      return (
        <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div className="sec-t">{I.drc} Design Rule Check — {drcResults.filter(d => d.type === "err").length} errors, {drcResults.filter(d => d.type === "warn").length} warnings</div>
          <div className="drc">
            {drcResults.map((d, i) => (
              <div key={i} className={`drc-item ${d.type}`}>
                <div className={`drc-icon ${d.type}`}>{d.type === "ok" ? "✓" : d.type === "warn" ? "!" : "×"}</div>
                <div className="drc-text">
                  <div className="drc-msg">{d.msg}</div>
                  <div className="drc-detail">{d.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (tab.type === "serial") {
      return (
        <div className="ser">
          <div className="ser-tb">
            <select className="mb-sel" value={serialBaud} onChange={e => setSerialBaud(e.target.value)}>
              {["9600", "19200", "38400", "57600", "115200"].map(b => <option key={b}>{b}</option>)}
            </select>
            <span style={{flex:1}}/>
            <button className="mb-btn" onClick={() => setSerialLines([])}>Clear</button>
            <button className="mb-btn pri" onClick={compile} disabled={compiling}>
              {compiling ? <div className="dots"><span/><span/><span/></div> : <>{I.play} Compile</>}
            </button>
            <span style={{color:"var(--green)",fontSize:10,display:"flex",alignItems:"center",gap:3}}><span className="dot g"/>Connected</span>
          </div>
          <div className="ser-out">
            {serialLines.map((l, i) => <div key={i} className="ser-line"><span className="ts">[{l.ts}]</span>{l.text}</div>)}
          </div>
          <div style={{padding:"6px 8px",borderTop:"1px solid var(--border)",display:"flex",gap:6}}>
            <input className="inp" placeholder="Send command..." value={serialInput} onChange={e => setSerialInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && serialInput) {
                  setSerialLines(s => [...s, { ts: new Date().toISOString().slice(11,19), text: "→ " + serialInput }]);
                  setSerialInput("");
                }
              }} style={{flex:1}}/>
          </div>
        </div>
      );
    }

    if (tab.type === "export") {
      return (
        <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div className="sec-t">{I.export} Export Schematic & PCB</div>
          <div className="exp">
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:8}}>{placed.length} components · {wires.length} connections</div>
            <div style={{fontSize:11,color:"var(--text2)",fontWeight:600,marginTop:14,marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Schematic</div>
            <div className="exp-grid">
              <button className="exp-btn" onClick={() => exportSVG(false)}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">SVG Vector</div><div className="exp-btn-d">Scalable for print</div></button>
              <button className="exp-btn" onClick={() => exportPNG(false)}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">PNG Image</div><div className="exp-btn-d">2x raster</div></button>
              <button className="exp-btn" onClick={() => exportPDF(false)}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">PDF</div><div className="exp-btn-d">Print-ready</div></button>
              <button className="exp-btn" onClick={() => dl(JSON.stringify({ components: placed, wires, board: selectedBoard }, null, 2), "helix-schematic.json", "application/json")}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">JSON</div><div className="exp-btn-d">Editable data</div></button>
            </div>
            <div style={{fontSize:11,color:"var(--text2)",fontWeight:600,marginTop:14,marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>PCB Layout</div>
            <div className="exp-grid">
              <button className="exp-btn" onClick={() => exportSVG(true)}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">PCB SVG</div><div className="exp-btn-d">Copper + silkscreen</div></button>
              <button className="exp-btn" onClick={() => exportPNG(true)}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">PCB PNG</div><div className="exp-btn-d">High-res print</div></button>
              <button className="exp-btn" onClick={() => exportPDF(true)}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">PCB PDF</div><div className="exp-btn-d">KiCad-style</div></button>
              <button className="exp-btn" onClick={exportGerberJSON}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">Gerber JSON</div><div className="exp-btn-d">Manufacturing</div></button>
            </div>
            <div style={{fontSize:11,color:"var(--text2)",fontWeight:600,marginTop:14,marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Project</div>
            <div className="exp-grid">
              <button className="exp-btn" onClick={exportBOMcsv}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">BOM CSV</div><div className="exp-btn-d">Bill of materials</div></button>
              <button className="exp-btn" onClick={() => dl(files[activeFile] || "", activeFile, "text/plain")}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">Current File</div><div className="exp-btn-d">{activeFile}</div></button>
              <button className="exp-btn" onClick={manualSave}><div className="exp-btn-i">{I.download}</div><div className="exp-btn-t">Full Project</div><div className="exp-btn-d">.helix file</div></button>
              <button className="exp-btn" onClick={loadProject}><div className="exp-btn-i">{I.upload}</div><div className="exp-btn-t">Load Project</div><div className="exp-btn-d">Import .helix</div></button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <>
      <style>{CSS}</style>
      <div className="H" onClick={() => setOpenMenu(null)}>
        {/* Menu Bar */}
        <div className="mb">
          <div className="mb-logo">{I.helix} HELIX</div>
          <button className="mb-item" onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "file" ? null : "file"); }}>
            File
            <div className={`dd ${openMenu === "file" ? "show" : ""}`}>
              <button className="dd-i" onClick={() => { setShowTemplates(true); setOpenMenu(null); }}>{I.plus} New from Template</button>
              <button className="dd-i" onClick={() => { createNewFile(); setOpenMenu(null); }}>{I.file} New File</button>
              <div className="dd-sep"/>
              <button className="dd-i" onClick={() => { manualSave(); setOpenMenu(null); }}>{I.download} Save Project <span className="k">Ctrl+S</span></button>
              <button className="dd-i" onClick={() => { loadProject(); setOpenMenu(null); }}>{I.upload} Open Project</button>
              <div className="dd-sep"/>
              <button className="dd-i" onClick={() => { setView("dashboard"); setOpenMenu(null); }}>Home</button>
            </div>
          </button>
          <button className="mb-item" onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "edit" ? null : "edit"); }}>
            Edit
            <div className={`dd ${openMenu === "edit" ? "show" : ""}`}>
              <button className="dd-i" onClick={() => { undo(); setOpenMenu(null); }}>{I.undo} Undo <span className="k">Ctrl+Z</span></button>
              <button className="dd-i" onClick={() => { redo(); setOpenMenu(null); }}>{I.redo} Redo <span className="k">Ctrl+Y</span></button>
            </div>
          </button>
          <button className="mb-item" onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "view" ? null : "view"); }}>
            View
            <div className={`dd ${openMenu === "view" ? "show" : ""}`}>
              <button className="dd-i" onClick={() => { setShowSide(s => !s); setOpenMenu(null); }}>Toggle Sidebar <span className="k">Ctrl+B</span></button>
              <button className="dd-i" onClick={() => { setChatOpen(s => !s); setOpenMenu(null); }}>Toggle AI Chat <span className="k">Ctrl+J</span></button>
              <div className="dd-sep"/>
              <button className="dd-i" onClick={() => { openSpecial("drc", "DRC", "drc"); setOpenMenu(null); }}>{I.drc} Design Rule Check</button>
              <button className="dd-i" onClick={() => { openSpecial("serial", "Serial", "serial"); setOpenMenu(null); }}>{I.serial} Serial Monitor</button>
            </div>
          </button>
          <button className="mb-item" onClick={() => openSpecial("export", "Export", "export")}>Export</button>
          <button className="mb-item" onClick={() => setShowHelp(true)}>Help</button>
          <button className="mb-item" onClick={() => setShowSettings(true)}>Settings</button>
          <div className="mb-r">
            <button className="mb-btn" onClick={() => { setShowCmdK(true); setTimeout(() => cmdKRef.current?.focus(), 50); }} title="AI Build (Ctrl+K)" style={{background:"rgba(0,229,204,.1)",borderColor:"rgba(0,229,204,.3)",color:"var(--cyan)"}}>
              ⌘K AI Build
            </button>
            <button className="mb-btn" onClick={undo} disabled={historyIdx === 0} title="Undo (Ctrl+Z)">{I.undo}</button>
            <button className="mb-btn" onClick={redo} disabled={historyIdx >= history.length - 1} title="Redo (Ctrl+Y)">{I.redo}</button>
            <button className="mb-btn pri" onClick={compile} disabled={compiling} title="Compile">
              {compiling ? <div className="dots"><span/><span/><span/></div> : <>{I.play} Compile</>}
            </button>
            <select className="mb-sel" value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)}>
              {Object.keys(BOARDS).map(b => <option key={b}>{b}</option>)}
            </select>
            <button className="mb-btn" onClick={() => setShowSettings(true)}>{I.settings}</button>
          </div>
        </div>

        {/* Body */}
        <div className="body">
          {/* Activity Bar */}
          <div className="act">
            <button className={`act-btn ${sidePanel === "files" && showSide ? "on" : ""}`} onClick={() => { setSidePanel("files"); setShowSide(true); }}>
              {I.file}<span className="act-tip">Files</span>
            </button>
            <button className={`act-btn ${sidePanel === "components" && showSide ? "on" : ""}`} onClick={() => { setSidePanel("components"); setShowSide(true); }}>
              {I.comp}<span className="act-tip">Components ({ROBOTICS_LIB.length})</span>
            </button>
            <button className={`act-btn ${activeTab === "schematic" ? "on" : ""}`} onClick={() => openSpecial("schematic", "Schematic", "schematic")}>
              {I.pcb}<span className="act-tip">Schematic</span>
            </button>
            <button className={`act-btn ${activeTab === "pcb" ? "on" : ""}`} onClick={() => openSpecial("pcb", "PCB", "pcb")}>
              {I.wire}<span className="act-tip">PCB View</span>
            </button>
            <button className={`act-btn ${activeTab === "drc" ? "on" : ""}`} onClick={() => openSpecial("drc", "DRC", "drc")}>
              {I.drc}<span className="act-tip">DRC</span>
              {drcWarningCount > 0 && <span className="act-bdg">{drcWarningCount}</span>}
            </button>
            <button className={`act-btn ${activeTab === "bom" ? "on" : ""}`} onClick={() => openSpecial("bom", "BOM", "bom")}>
              {I.bom}<span className="act-tip">BOM</span>
            </button>
            <button className={`act-btn ${activeTab === "serial" ? "on" : ""}`} onClick={() => openSpecial("serial", "Serial", "serial")}>
              {I.serial}<span className="act-tip">Serial</span>
            </button>
            <button className={`act-btn ${activeTab === "export" ? "on" : ""}`} onClick={() => openSpecial("export", "Export", "export")}>
              {I.export}<span className="act-tip">Export</span>
            </button>
            <div className="act-sep"/>
            <button className={`act-btn ${chatOpen ? "on" : ""}`} onClick={() => setChatOpen(!chatOpen)}>
              {I.chat}<span className="act-tip">AI Chat</span>
            </button>
            <button className="act-btn" onClick={() => setShowHelp(true)}>
              {I.help}<span className="act-tip">Help</span>
            </button>
            <button className="act-btn" onClick={() => setShowSettings(true)}>
              {I.settings}<span className="act-tip">Settings</span>
            </button>
          </div>

          {/* Sidebar - Files */}
          {showSide && sidePanel === "files" && (
            <div className="sb">
              <div className="sb-head">
                <span>Explorer</span>
                <div className="sb-head-btns">
                  <button className="sb-h-btn" onClick={createNewFile} title="New file">{I.plus}</button>
                  <button className="sb-h-btn" onClick={() => setShowSide(false)}>{I.x}</button>
                </div>
              </div>
              <div className="sb-scroll">{renderTree(tree)}</div>
            </div>
          )}

          {/* Sidebar - Components */}
          {showSide && sidePanel === "components" && (
            <div className="sb">
              <div className="sb-head">
                <span>Components ({filteredComps.length})</span>
                <button className="sb-h-btn" onClick={() => setShowSide(false)}>{I.x}</button>
              </div>
              <input className="cs" placeholder={`Search ${ROBOTICS_LIB.length} parts...`} value={compSearch} onChange={e => setCompSearch(e.target.value)}/>
              <div style={{padding:"0 8px 4px"}}>
                <div style={{fontSize:9,color:"var(--text3)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Domain</div>
                <div className="cfs" style={{padding:0}}>
                  {Object.entries(DOMAINS).map(([k, v]) => <button key={k} className={`cf ${domainFilter === k ? "on" : ""}`} onClick={() => setDomainFilter(k)}>{v}</button>)}
                </div>
              </div>
              <div style={{padding:"0 8px 4px"}}>
                <div style={{fontSize:9,color:"var(--text3)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Quick filter</div>
                <div className="cfs" style={{padding:0}}>
                  <button className={`cf ${compFilter === "All" ? "on" : ""}`} onClick={() => setCompFilter("All")}>All</button>
                  {CATEGORIES.map(c => <button key={c} className={`cf ${compFilter === c ? "on" : ""}`} onClick={() => setCompFilter(c)}>{c}</button>)}
                </div>
              </div>
              <div className="cl">
                {(() => {
                  // Group filtered components by category
                  const groups = {};
                  filteredComps.forEach(c => {
                    if (!groups[c.category]) groups[c.category] = [];
                    groups[c.category].push(c);
                  });
                  // Preserve canonical order
                  return CATEGORIES.filter(cat => groups[cat]).map(cat => {
                    const cc = catColor(cat);
                    const collapsed = collapsedCats.has(cat);
                    return (
                      <div key={cat}>
                        <button className="cat-hdr" onClick={() => {
                          const ns = new Set(collapsedCats);
                          if (collapsed) ns.delete(cat); else ns.add(cat);
                          setCollapsedCats(ns);
                        }}>
                          <span className={`ft-c ${!collapsed ? "o" : ""}`}>{I.chev}</span>
                          <span style={{color: cc.fg, fontWeight: 600}}>{cat}</span>
                          <span style={{color:"var(--text3)",marginLeft:"auto",fontFamily:"var(--mono)",fontSize:9}}>{groups[cat].length}</span>
                        </button>
                        {!collapsed && groups[cat].map(comp => (
                          <button key={comp.id} className="ci" onClick={() => addComponent(comp)}>
                            <div className="ci-sym" style={{background:cc.bg,color:cc.fg}}>{comp.pins.length}P</div>
                            <div className="ci-info">
                              <div className="ci-name">{comp.name}</div>
                              <div className="ci-desc">{comp.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  });
                })()}
                {filteredComps.length === 0 && <div className="empty">No components match.</div>}
              </div>
            </div>
          )}

          {/* Editor or Dashboard */}
          {view === "dashboard" ? (
            <div className="dash">
              <div className="dash-logo">HELIX</div>
              <div className="dash-sub">v4.0 · Robotics Engineering IDE · Build Anything That Moves</div>
              <div className="dash-g">
                {[
                  { icon: I.plus, t: "New from Template", d: "Line follower, drone, arm presets", a: () => setShowTemplates(true) },
                  { icon: I.upload, t: "Open Project", d: "Load .helix project file", a: loadProject },
                  { icon: I.comp, t: "Components", d: `${ROBOTICS_LIB.length} parts in ${CATEGORIES.length} categories`, a: () => { setSidePanel("components"); setShowSide(true); openSpecial("schematic", "Schematic", "schematic"); } },
                  { icon: I.pcb, t: "Schematic Editor", d: "Design with working pins", a: () => openSpecial("schematic", "Schematic", "schematic") },
                  { icon: I.code, t: "Code Editor", d: "Syntax-highlighted firmware", a: () => openFile("main.ino") },
                  { icon: I.chat, t: "HELIX AI", d: "AI builds entire robots", a: () => setChatOpen(true) },
                ].map((c, i) => (
                  <div key={i} className="dc" onClick={c.a}>
                    <div className="dc-i">{c.icon}</div>
                    <div className="dc-t">{c.t}</div>
                    <div className="dc-d">{c.d}</div>
                  </div>
                ))}
              </div>
              <div className="dash-sec-t">Quick Templates</div>
              <div className="dash-tg">
                {Object.entries(TEMPLATES).filter(([k]) => k !== "blank").map(([k, t]) => (
                  <div key={k} className="dc" style={{padding:12}} onClick={() => loadTemplate(k)}>
                    <div className="dc-t" style={{fontSize:12}}>{t.name}</div>
                    <div className="dc-d" style={{fontSize:10}}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="ed">
              <div className="tabs">
                {tabs.map(tab => (
                  <button key={tab.id} className={`tab ${activeTab === tab.id ? "on" : ""}`} onClick={() => setActiveTab(tab.id)}>
                    <span style={{display:"flex",alignItems:"center"}}>
                      {tab.type === "code" ? I.code : tab.type === "schematic" ? I.pcb : tab.type === "pcb" ? I.wire :
                       tab.type === "bom" ? I.bom : tab.type === "drc" ? I.drc : tab.type === "serial" ? I.serial : tab.type === "export" ? I.export : I.file}
                    </span>
                    <span>{tab.label}</span>
                    <span className="tab-x" onClick={e => { e.stopPropagation(); closeTab(tab.id); }}>{I.x}</span>
                  </button>
                ))}
              </div>
              <div className="ed-body">{renderTab()}</div>
            </div>
          )}

          {/* AI Chat */}
          {chatOpen && (
            <div className="chat">
              <div className="chat-h">
                <div className="chat-hl">{I.chat} HELIX AI</div>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <span className="chat-badge">{aiProvider === "ollama" ? ollamaModel : aiProvider === "anthropic" ? "Claude" : "GPT-4o"}</span>
                  <button className="mod-x" onClick={() => setChatOpen(false)}>{I.x}</button>
                </div>
              </div>
              <div className="chat-m">
                {messages.map((m, i) => <div key={i} className={`msg ${m.role === "u" ? "u" : m.role === "s" ? "s" : m.role === "exec" ? "exec" : "a"}`}>{m.text}</div>)}
                {chatLoading && <div className="msg a"><div className="dots"><span/><span/><span/></div></div>}
                <div ref={chatEnd}/>
              </div>
              <div className="chat-i">
                <div className="chat-r">
                  <textarea ref={chatInputRef} className="chat-in" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    placeholder="Build a robot, add components, generate code..." rows={1}/>
                  <button className="send" onClick={sendChat} disabled={!chatInput.trim() || chatLoading}>{I.send}</button>
                </div>
                <div className="chips">
                  {["Build a line follower", "Design a quadcopter", "Add 6-DOF arm", "Wire MPU6050"].map(s => (
                    <button key={s} className="chip" onClick={() => setChatInput(s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="st">
          <span><span className="dot g"/>HELIX v4.5</span>
          <button className="st-btn" onClick={() => setShowSettings(true)} title="Edit project name">{projectName}</button>
          <span>{selectedBoard}</span>
          <button className="st-btn" onClick={() => openSpecial("drc", "DRC", "drc")}>
            <span className={`dot ${drcWarningCount === 0 ? "g" : "y"}`}/>{drcWarningCount} DRC
          </button>
          <span style={{flex:1}}/>
          <button className="st-btn" onClick={() => setShowSettings(true)} title="AI settings">
            <span className={`dot ${aiConnected === true ? "g" : aiConnected === false ? "r" : "y"}`}/>
            {aiProvider === "ollama" ? `Ollama · ${ollamaModel}` : aiProvider === "anthropic" ? "Claude" : "GPT-4o"}
          </button>
          <span>{placed.length}c · {wires.length}w</span>
          <span title={autoSave ? "Auto-save enabled" : "Auto-save disabled"}>{autoSave ? "● saved" : "○ unsaved"}</span>
        </div>

        {/* Toast */}
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

        {/* New File Modal */}
        {newFileModal && (
          <div className="ov" onClick={() => setNewFileModal(false)}>
            <div className="mod" style={{width:420}} onClick={e => e.stopPropagation()}>
              <div className="mod-t"><span>{I.plus} New File</span><button className="mod-x" onClick={() => setNewFileModal(false)}>{I.x}</button></div>
              <div className="fld">
                <div className="lbl">Filename</div>
                <input className="inp" autoFocus value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") doCreateFile(newFileName);
                    if (e.key === "Escape") setNewFileModal(false);
                  }}
                  placeholder="e.g. drivers.h"/>
                <div style={{fontSize:10,color:"var(--text3)",marginTop:6}}>Use letters, numbers, dots, dashes, and underscores</div>
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button className="btn sec" onClick={() => setNewFileModal(false)}>Cancel</button>
                <button className="btn" onClick={() => doCreateFile(newFileName)} disabled={!newFileName.trim()}>Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {confirmModal && (
          <div className="ov" onClick={() => setConfirmModal(null)}>
            <div className="mod" style={{width:420}} onClick={e => e.stopPropagation()}>
              <div className="mod-t"><span>{confirmModal.title}</span><button className="mod-x" onClick={() => setConfirmModal(null)}>{I.x}</button></div>
              <div style={{color:"var(--text2)",fontSize:13,lineHeight:1.5,marginBottom:18}}>{confirmModal.message}</div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button className="btn sec" onClick={() => setConfirmModal(null)}>Cancel</button>
                <button className={`btn ${confirmModal.danger ? "dng" : ""}`} onClick={confirmModal.onConfirm} autoFocus>{confirmModal.confirmLabel || "Confirm"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Cmd+K Inline AI Prompt */}
        {showCmdK && (
          <div className="ov" onClick={() => !cmdKLoading && setShowCmdK(false)}>
            <div className="cmdk" onClick={e => e.stopPropagation()}>
              <div className="cmdk-h">
                <span style={{color:"var(--cyan)",fontFamily:"var(--mono)",fontSize:11,letterSpacing:1}}>HELIX AI · {aiProvider === "ollama" ? ollamaModel : aiProvider === "anthropic" ? "Claude" : "GPT-4o"}</span>
                <span style={{color:"var(--text3)",fontSize:10}}>esc to close</span>
              </div>
              <div className="cmdk-body">
                <input
                  ref={cmdKRef}
                  className="cmdk-in"
                  placeholder="Tell HELIX what to build..."
                  value={cmdKInput}
                  onChange={e => setCmdKInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !cmdKLoading) runCmdK();
                    if (e.key === "Escape") setShowCmdK(false);
                  }}
                  disabled={cmdKLoading}
                  autoFocus
                />
                {cmdKLoading && <div className="cmdk-load"><div className="dots"><span/><span/><span/></div> Building...</div>}
              </div>
              <div className="cmdk-suggestions">
                {[
                  "Build a self-guided line follower with VL53L0X sensors",
                  "Make an obstacle-avoiding robot",
                  "Create a 6-DOF robotic arm with PCA9685",
                  "Build a weather station with OLED display",
                  "Wire a quadcopter with Pixhawk",
                ].map(s => (
                  <button key={s} className="cmdk-sg" onClick={() => { setCmdKInput(s); setTimeout(() => cmdKRef.current?.focus(), 0); }}>{s}</button>
                ))}
              </div>
              <div className="cmdk-foot">
                <span style={{color:"var(--text3)"}}>Enter to build · Esc to cancel</span>
                <button className="btn" onClick={runCmdK} disabled={!cmdKInput.trim() || cmdKLoading}>{cmdKLoading ? "Building..." : "Build"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="ov" onClick={() => setShowSettings(false)}>
            <div className="mod" onClick={e => e.stopPropagation()}>
              <div className="mod-t"><span>{I.settings} Settings</span><button className="mod-x" onClick={() => setShowSettings(false)}>{I.x}</button></div>

              <div className="fld">
                <div className="lbl">Project Name</div>
                <input className="inp" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="my-robot-project"/>
              </div>

              <div className="divider"/>

              <div className="fld">
                <div className="lbl">AI Provider</div>
                <select className="sel" value={aiProvider} onChange={e => { setAiProvider(e.target.value); setAiConnected(null); }}>
                  <option value="ollama">Ollama (Local)</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="openai">OpenAI GPT-4o</option>
                </select>
              </div>
              {aiProvider === "ollama" && (
                <div className="row">
                  <div className="fld"><div className="lbl">Ollama URL</div><input className="inp" value={ollamaUrl} onChange={e => { setOllamaUrl(e.target.value); setAiConnected(null); }}/></div>
                  <div className="fld"><div className="lbl">Model</div><input className="inp" value={ollamaModel} onChange={e => { setOllamaModel(e.target.value); setAiConnected(null); }}/></div>
                </div>
              )}
              {aiProvider === "anthropic" && (
                <div className="fld"><div className="lbl">Anthropic API Key</div><input className="inp" type="password" value={anthropicKey} onChange={e => { setAnthropicKey(e.target.value); setAiConnected(null); }} placeholder="sk-ant-..."/></div>
              )}
              {aiProvider === "openai" && (
                <div className="fld"><div className="lbl">OpenAI API Key</div><input className="inp" type="password" value={openaiKey} onChange={e => { setOpenaiKey(e.target.value); setAiConnected(null); }} placeholder="sk-..."/></div>
              )}

              <div className="fld">
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button className="btn sec" onClick={testConnection} disabled={testingConn} style={{padding:"7px 14px",fontSize:11}}>
                    {testingConn ? <><div className="dots"><span/><span/><span/></div> Testing...</> : "Test Connection"}
                  </button>
                  {aiConnected === true && <span style={{color:"var(--green)",fontSize:11,display:"flex",alignItems:"center",gap:4}}><span className="dot g"/>Connected</span>}
                  {aiConnected === false && <span style={{color:"var(--red)",fontSize:11,display:"flex",alignItems:"center",gap:4}}><span className="dot r"/>Connection failed</span>}
                </div>
              </div>

              <div className="fld">
                <div className="lbl">AI Temperature: {aiTemp}</div>
                <input type="range" min="0" max="1" step="0.1" value={aiTemp} onChange={e => setAiTemp(parseFloat(e.target.value))} style={{width:"100%"}}/>
              </div>
              <div className="divider"/>
              <div className="fld">
                <div className="lbl">Default Board</div>
                <select className="sel" value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)}>
                  {Object.keys(BOARDS).map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="fld">
                <div className="lbl">Auto-save (LocalStorage)</div>
                <button className={`btn ${autoSave ? "" : "sec"}`} onClick={() => setAutoSave(s => !s)}>{autoSave ? "Enabled" : "Disabled"}</button>
              </div>
              <div className="fld">
                <div className="lbl">Chat History</div>
                <button className="btn sec" onClick={() => {
                  setConfirmModal({
                    title: "Clear chat history?",
                    message: "This removes all chat messages. The current schematic and code are not affected.",
                    confirmLabel: "Clear",
                    danger: true,
                    onConfirm: () => {
                      setMessages([{ role: "s", text: "Chat cleared. Press Ctrl+K to build with AI." }]);
                      setConfirmModal(null);
                      showToast("Chat cleared", "ok");
                    },
                  });
                }}>Clear Chat</button>
              </div>
              <div className="divider"/>
              <button className="btn dng" onClick={() => {
                setShowSettings(false);
                setConfirmModal({
                  title: "Reset HELIX?",
                  message: "This will permanently delete all your projects, files, schematics, settings, and chat history. This cannot be undone.",
                  confirmLabel: "Reset Everything",
                  danger: true,
                  onConfirm: () => {
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem(SETTINGS_KEY);
                    location.reload();
                  },
                });
              }}>Reset Everything</button>
              <button className="btn" style={{marginLeft:8}} onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        )}

        {/* Help Modal */}
        {showHelp && (
          <div className="ov" onClick={() => setShowHelp(false)}>
            <div className="mod" onClick={e => e.stopPropagation()}>
              <div className="mod-t"><span>{I.help} Help & Shortcuts</span><button className="mod-x" onClick={() => setShowHelp(false)}>{I.x}</button></div>
              <div className="help">
                <h3>AI</h3>
                <div className="help-row"><span>AI Build (inline prompt)</span><span className="help-key">Ctrl+K</span></div>
                <div className="help-row"><span>Toggle AI Chat</span><span className="help-key">Ctrl+J</span></div>
                <h3>Project</h3>
                <div className="help-row"><span>Save Project</span><span className="help-key">Ctrl+S</span></div>
                <div className="help-row"><span>Undo</span><span className="help-key">Ctrl+Z</span></div>
                <div className="help-row"><span>Redo</span><span className="help-key">Ctrl+Y</span></div>
                <h3>View</h3>
                <div className="help-row"><span>Toggle Sidebar</span><span className="help-key">Ctrl+B</span></div>
                <div className="help-row"><span>Show Help</span><span className="help-key">Ctrl+/</span></div>
                <h3>Code Editor</h3>
                <div className="help-row"><span>Indent / Tab</span><span className="help-key">Tab</span></div>
                <div className="help-row"><span>Unindent</span><span className="help-key">Shift+Tab</span></div>
                <div className="help-row"><span>Toggle line comment</span><span className="help-key">Ctrl+/</span></div>
                <div className="help-row"><span>Duplicate line</span><span className="help-key">Ctrl+D</span></div>
                <h3>Schematic</h3>
                <div className="help-row"><span>Delete Selected</span><span className="help-key">Delete</span></div>
                <div className="help-row"><span>Rotate Component</span><span className="help-key">R</span></div>
                <div className="help-row"><span>Cancel Wire</span><span className="help-key">Esc</span></div>
                <div className="help-row"><span>Zoom</span><span className="help-key">Mouse Wheel</span></div>
                <div className="help-row"><span>Pan</span><span className="help-key">Drag empty area</span></div>
                <div className="help-row"><span>Wire Pins</span><span className="help-key">Click pin → click pin</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="ov" onClick={() => setShowTemplates(false)}>
            <div className="mod lg" onClick={e => e.stopPropagation()}>
              <div className="mod-t"><span>{I.plus} Project Templates</span><button className="mod-x" onClick={() => setShowTemplates(false)}>{I.x}</button></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
                {Object.entries(TEMPLATES).map(([k, t]) => (
                  <div key={k} className="dc" onClick={() => loadTemplate(k)}>
                    <div className="dc-t">{t.name}</div>
                    <div className="dc-d">{t.desc}</div>
                    <div style={{fontSize:10,color:"var(--text3)",marginTop:4}}>{t.components?.length || 0} components</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Wrap with error boundary so crashes don't white-screen the whole app
export default function Helix() {
  return (
    <ErrorBoundary>
      <HelixApp />
    </ErrorBoundary>
  );
}
