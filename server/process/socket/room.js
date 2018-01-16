let g = require('../../common/const');
let msg = require('../../common/msg');

let intoRoom = (req, socket, io, uid) => {
    
    if (req.roomId) {

        socket.join(req.roomId);

        io.to(req.roomId).emit('sys', `${uid}加入了房间`, req.roomId);
        
    }
    
};

let exitRoom = (req, socket, io, uid) => {
    
    if (req.roomId) {
        
        socket.leave(req.roomId);
        
        io.to(req.roomId).emit('sys', `${uid}离开了房间`, req.roomId);
        
    }
    
};

export default {
    intoRoom,
    exitRoom
};
