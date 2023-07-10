import { Gpio } from 'pigpio';
import { Server } from 'socket.io';

const io = new Server({
   cors: { origin: ['http://localhost:3000', 'http://192.168.15.45:3000', 'http://192.168.30.21:3000'] }
});

const motorENA = new Gpio(25, { mode: Gpio.OUTPUT, edge: Gpio.RISING_EDGE });
const motorIN1 = new Gpio(23, { mode: Gpio.OUTPUT, edge: Gpio.RISING_EDGE });
const motorIN2 = new Gpio(24, { mode: Gpio.OUTPUT, edge: Gpio.RISING_EDGE });
const motorENB = new Gpio(26, { mode: Gpio.OUTPUT, edge: Gpio.RISING_EDGE });
const motorIN3 = new Gpio(5, { mode: Gpio.OUTPUT, edge: Gpio.RISING_EDGE });
const motorIN4 = new Gpio(6, { mode: Gpio.OUTPUT, edge: Gpio.RISING_EDGE });

let motorDir = 0;
const maxSpeed = 1000;
const HZ = 1000;

motorENA.pwmRange(maxSpeed);
motorENB.pwmRange(maxSpeed);
motorENA.pwmFrequency(HZ);
motorENB.pwmFrequency(HZ);
motorIN1.digitalWrite(motorDir);
motorIN2.digitalWrite(!motorDir);
motorIN3.digitalWrite(motorDir);
motorIN4.digitalWrite(!motorDir);

io.on('connection', (ioServer) => {
   console.log('Socket conneted at port 5555!', ioServer.id);

   ioServer.on('cmd:motor:power', (state) => {
      try {
         power(state);

         console.log('[CMD] Motor power:', state);
         ioServer.emit('cmd:motor:power:response', { success: true, state });
      } catch (err) {
         ioServer.emit('cmd:motor:power:response', err);
      }
   });
   ioServer.on('cmd:motor:speed', (speedValue) => {
      try {
         speed(speedValue);
         console.log('[CMD] Motor speed:', speedValue);
         ioServer.emit('cmd:motor:speed:response', { success: true, currentSpeed: speedValue });
      } catch (err) {
         ioServer.emit('cmd:motor:power:response', err);
      }
   });
});

io.listen(5555);

function power(state) {
   if (state === 'on') {
      motorENA.pwmWrite(maxSpeed);
      motorENB.pwmWrite(maxSpeed);
   } else if (state === 'off') {
      motorENA.pwmWrite(0);
      motorENB.pwmWrite(0);
   }
}

function speed(value) {
   if (value > maxSpeed) return;

   motorENA.pwmWrite(value);
   motorENB.pwmWrite(value);
}

