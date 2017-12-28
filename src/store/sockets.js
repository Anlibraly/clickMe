import io from 'socket.io-client';
import g  from '../assets/const';

let socket = null;

let connect = () => {

    socket = io.connect(g.SERVER_SOCKET_ADDRESS);
    
    socket.on('connect', () => {
    
        console.log('\nconnect\n');
    
    });
    
    socket.on('disconnect', (reason) => {
    
        // ...
        console.log(reason);

        setTimeout(() => {

            connect();

        }, g.SOCKET_TIMEOUT);
    
    });
    
    socket.on('error', (error) => {
        
        console.log(error);
            
    });

    return socket;

};

export default {
    connect,
    getSocket: () => socket
};
