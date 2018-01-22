// let g = require('../../common/const');
// let msg = require('../../common/msg');

let intoRoom = (req, socket, io, uid) => {
    
    if (req.roomId) {

        socket.join(`r_${req.roomId}`);
        io.to(`r_${req.roomId}`).emit('sys', `${uid}加入了房间`);
        
    }
    
};

let exitRoom = (req, socket, io, uid) => {
    
    if (req.roomId) {
        
        socket.leave(`r_${req.roomId}`);
        io.to(`r_${req.roomId}`).emit('sys', `${uid}离开了房间`);
        
    }
    
};

let chat = (req, socket, io, uid) => {

    if (req.roomId) {
        
        io.to(`r_${req.roomId}`).emit('chat', JSON.stringify({
            from: uid,
            content: req.content
        }));

    }

};

module.exports = {
    intoRoom,
    exitRoom,
    chat
};
