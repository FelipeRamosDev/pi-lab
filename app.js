import { Gpio } from 'pigpio';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const motorENA = new Gpio(25, { mode: Gpio.OUTPUT, edge: Gpio.RISING_EDGE });
const motorIN1 = new Gpio(23, { mode: Gpio.OUTPUT });
const motorIN2 = new Gpio(24, { mode: Gpio.OUTPUT });
const motorENB = new Gpio(26, { mode: Gpio.OUTPUT });
const motorIN3 = new Gpio(5, { mode: Gpio.OUTPUT });
const motorIN4 = new Gpio(6, { mode: Gpio.OUTPUT });

let motorDir = 1;
const maxSpeed = 255;

motorIN1.digitalWrite(motorDir);
motorIN2.digitalWrite(!motorDir);
motorIN3.digitalWrite(motorDir);
motorIN4.digitalWrite(!motorDir);

app.get('/motor/:cmd/:arg', async (req, res) => {
    const { cmd, arg } = Object(req.params);
    console.log(cmd, arg)
    try {
        switch (cmd) {
            case 'power': {
                power(arg);
                break;
            }
            case 'speed': {
                speed(Number(arg));
                break;
            }
        }
    
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

app.listen(80);

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

