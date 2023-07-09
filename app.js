import { Server } from 'socket.io';

const io = new Server({
    cors: {
        origin: ['http://localhost:3000']
    }
});

io.on('connection', connected => {
    console.log(connected.id);

    connected.on('motor:power', (state) => {
        console.log('Motor power:', state)
    });

    connected.on('test:connection', () => {
        console.log('Connection state:', 'connected')
        connected.emit('testFE:connection', { currentState: 'connected' });
    });

});


io.listen(5555);
