let _ = require('underscore');
let tool = require('../../common/tool');
// let g = require('../../common/const');

let intoRoom = (req, socket, io, uid) => {
    
    if (req.roomId) {

        socket.join(`r_${req.roomId}`);
        
        io.in(`r_${req.roomId}`).clients((error, clients) => {

            if (error) {

                throw error;
                
            }

            // => [Anw2LatarvGVVXEIAAAD]
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
                io.to(`r_${req.roomId}`).emit('sys', `${uid}离开了房间,房间人数：${clients.length}`);
                
            });
        
        }
        
    }
    
};

let chat = (req, socket, io, uid) => {

    if (req.roomId) {

        let rooms = _.keys(socket.rooms);

        if (rooms.indexOf(`r_${req.roomId}`) >= 0) {

            io.to(`r_${req.roomId}`).emit('chat', JSON.stringify({
                from: uid,
                content: req.content
            }));

        }

    }

};

let choice = (req, socket, io, uid) => {

    if (req.roomId && req.choice >= 0 && uid) {

        let rooms = _.keys(socket.rooms);

        if (rooms.indexOf(`r_${req.roomId}`) >= 0) {

            return tool.getRiddle(req.roomId)
            .then((riddle) => {
                
                if (!riddle) {

                    return tool.newRiddle(req.roomId);

                }

                return Promise.resolve(riddle);

            })
            .then((riddle) => tool.getAnswers(riddle._id)
                .then((answers) => {
                    
                    let index = answers.length + 1;

                    let ans = {
                        uid,
                        riddleid: riddle._id,
                        index,
                        ans: req.choice,
                        ctime: +new Date()
                    };

                    return tool.doAnswer(ans)
                    .then(() => {

                        let newAns = 2 * riddle.answer + parseInt(req.choice);

                        riddle.answer = newAns;

                        riddle.ansindex = index;

                        riddle.status = tool.judgeAnswer(index, riddle.len, newAns, riddle.riddle);

                        return tool.updateRidle(riddle)
                        .then(() => {

                            io.to(`r_${req.roomId}`).emit('reward', tool.turnAnswer(newAns, index, riddle.len));

                            if (+riddle.status !== 0) {

                                return tool.newRiddle(req.roomId)
                                .then(() => io.to(`r_${req.roomId}`).emit('newRiddle'));

                            }

                        });

                    });

                })
            );

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
    choice,
    countRoom
};
