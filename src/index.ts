import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { grid } from './grid';
import { game } from './game';

var bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static('web'));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//initialize a simple http server
const webSocketServer = http.createServer(app);

//initialize the WebSocket webSocketServer instance
const wss = new WebSocket.Server({ server: webSocketServer }); wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {


        switch (message) {
            case 'left':
                game.left()
                break;
            case 'right':
                game.right()
                break;
            case 'action':
                game.action()
                break;
            case 'reset':
                game.init()
                break;
        }
        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(grid.toJSON());
    });

    ws.on('close', function close() {
        console.log('disconnected');
    });


    console.log('ws client connected');

    //send immediatly a feedback to the incoming connection    
    ws.send(grid.toJSON());
});

grid.registerUpdate(() => {
    wss.clients.forEach(client => client.send(grid.toJSON()));
    // JSON.parse(grid.toJSON()).map((row: string[]) => row.map(item => item == '#F00' && '+' || item == '#0F0' && '-' || ' ')).forEach((row: string[]) => console.log(row))
    // console.log('------------------------------------')
});

// for (let i = 0; i < 7; i++) {
//     for (let j = 0; j < 7; j++) {
//         grid.set(i, j, '#' + i + '0' + j);
//     }
// }
grid.update();

app.get('/left', (req, res) => {
    console.log('left')
    game.left();
    res.send("left");

});
app.get('/right', (req, res) => {
    console.log('right')
    game.right();

    res.send("right");
});

app.get('/action', (req, res) => {
    console.log('action')
    game.action();
    res.send("action");
});

app.get('/reset', (req, res) => {
    console.log('reset')
    game.init();
    res.send("reset");
});

webSocketServer.listen(process.env.PORT || 3000, () => console.log('listening on ' + (<any>webSocketServer.address()).port));
