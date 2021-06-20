const app = require ("express") ();
const server = require("http").createServer(app) //we can get to server by requiring the http node module
const cors = require('cors') //this is a middleware package used to enable cross origin request


const io = require("socket.io")(server, {
    cors: {
        //origin allows accessfrom all origins
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send('Server is running');
});

io.on('connection', (socket) => {
    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
        socket.broadcast.emit("callended");
    });

    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit("callUser", {signal: signalData, from, name});
    })

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    });
});

server.listen(PORT, () => console.log(`server is listening on port ${PORT}`))