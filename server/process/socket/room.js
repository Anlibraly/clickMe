let _ = require('underscore');
// let g = require('../../common/const');
// let msg = require('../../common/msg');

let intoRoom = (req, socket, io, uid) => {
    
    if (req.roomId) {

        socket.join(`r_${req.roomId}`);
        
        io.in(`r_${req.roomId}`).clients((error, clients) => {

            if (error) {

                throw error;
                
            }

            // => [Anw2LatarvGVVXEIAAAD]
            console.log(clients);
            io.to(`r_${req.roomId}`).emit('sys', `${uid}加入了房间,房间人数：${clients.length}`);

        });
        
    }
    
};

let exitRoom = (req, socket, io, uid) => {
    
    if (req.roomId) {

        let rooms = _.keys(socket.rooms);

        if (rooms.indexOf(`r_${req.roomId}`) >= 0) {

            socket.leave(`r_${req.roomId}`);

            io.in(`r_${req.roomId}`).clients((error, clients) => {

                if (error) {
    
                    throw error;
    
                }
    
                // => [Anw2LatarvGVVXEIAAAD]
                console.log(clients);
                io.to(`r_${req.roomId}`).emit('sys', `${uid}离开了房间,房间人数：${clients.length}`);
                
            });
        
        }
        
    }
    
};

let chat = (req, socket, io, uid) => {

    if (req.roomId) {

        let rooms = _.keys(socket.rooms);

        console.log(rooms);

        if (rooms.indexOf(`r_${req.roomId}`) >= 0) {

            io.to(`r_${req.roomId}`).emit('chat', JSON.stringify({
                from: uid,
                content: req.content
            }));

        }

    }

};

let countRoom = (req, socket, io) => {

    if (req.roomId) {

        io.in(`r_${req.roomId}`).clients((error, clients) => {

            if (error) {

                throw error;

            }

            // => [Anw2LatarvGVVXEIAAAD]
            console.log(clients);

        });
    
    }

};

module.exports = {
    intoRoom,
    exitRoom,
    chat,
    countRoom
};
