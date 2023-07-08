import GPIO from 'rpi-gpio';
import express from 'express';
import cors from 'cors';

const app = express();
const LED_PIN = 22;
let LEDState = false;

async function switchLED(state) {
    console.log(state)
    return new Promise((resolve, reject) => {
        GPIO.write(LED_PIN, state, (err) => {
            if (err) return reject(err);

            LEDState = state;
            resolve({
                sucess: true,
                currentState: state
            });
        });
    });
}

async function setupPIN(PIN_NUM, direction) {
    return new Promise((resolve, reject) => {
        GPIO.setup(PIN_NUM, direction, (err) => {
            if (err) return reject(err);

            return resolve({ success: true });
        });
    });
}

async function init() {
    const toInit = [];

    toInit.push(setupPIN(LED_PIN, GPIO.DIR_OUT));

    return await Promise.all(toInit);
}

init().then(initialized => {
    if (initialized.every(item => item.success)) {
        console.log('All pins were initialized!');
    } else {
        throw 'There was something wrong on pins setup!';
    }
}).catch(err => {
    throw err;
});

app.use(cors());
app.post('/led/:state', async function (req, res) {
    const { state } = Object(req.params);

    const switcher = await switchLED(Boolean(state === 'on' ? true : false));

    if (switcher.success) {
        res.status(200).send(switcher);
    } else {
        res.status(500).send(switcher);
    }
});

app.listen(80, () => {
    console.log('Server is listening at: http://localhost:80');
});
