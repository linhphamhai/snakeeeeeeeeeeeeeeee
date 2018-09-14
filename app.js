const io = require("socket.io-client");
var serverURL = 'http://codefest79.satek.vn';
const socket = io.connect(serverURL);
const teamId = "5b7a6c3709611442e9f39ab6";
const matchId = "5b7a6c3709611442e9f39ab6";
var indexOfMySnake;
var mySnake = []; // Array of my snake
var enemy = [];     // Array of enemy Snake
var foods = [];
var walls = [];
var nodes = [];
var currentDirection;
var map = {
    horizontal: 30,
    vertical: 30
};

var ClientConfig = {
    PLAYER: {
        OUTGOING: {
            JOIN_ROOM: 'player join room',
            DRIVE_ELEPHANT: 'player drive elephant',
        },
        INCOMMING: {
            ROOM_STATE: 'player room state',
            DRIVE_ELEPHANT_STATE: 'player drive elephant state',
        },
    }
};

var AppConfig = {
    API_CODE: {
        UN_KNOWN: 0,
        SUCCESS: 1,
        NOT_EXISTED_ROOM: 100,
        INVALID_KEY: 101,
        SYSTEM_ERROR: 102,
        INVALID_PARAMETER: 103,
    }
};
socket.on(ClientConfig.PLAYER.INCOMMING.ROOM_STATE, function (res) {
    switch (res.code) {

        case AppConfig.API_CODE.SUCCESS:
            if (res.roomInfo) {
                foods = res.roomInfo.foods;
                map = res.roomInfo.map;
                if(res.roomInfo.players[0].name == 'CAM_QUIT'){
                    indexOfMySnake = 0
                }else{
                    indexOfMySnake = 1;
                }
                mySnake = res.roomInfo.players[indexOfMySnake];
                if (res.roomInfo.players.length > 1) {
                    enemy = res.roomInfo.players[1 - indexOfMySnake];
                }

                for(var i = 1; i <= map.cols; i ++){
                    nodes[i] = [];
                    for(var j = 1; j <= map.rows; j ++){
                        nodes[i][j] = 
                    }
                }
            }

        default:

            break;
    }

});

socket.on(ClientConfig.PLAYER.INCOMMING.DRIVE_ELEPHANT_STATE, function (res) {
   
});

socket.emit(ClientConfig.PLAYER.OUTGOING.JOIN_ROOM, teamId, matchId);


// Use queue
function Queue() {
    var data = [];

    this.clear = function () {
        data.length = 0;
    }

    this.getLength = function () {
        return data.length;
    }

    this.isEmpty = function () {
        return data.length == 0;
    }

    this.enqueue = function (item) {
        data.push(item);
    }

    this.dequeue = function () {
        if (data.length == 0) return undefined;
        return data.shift();
    }

    this.peek = function () {
        return (data.length > 0 ? data[0] : undefined);
    }
}

// Class Node
function Node(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
}


function BreathFirstSearch(walls, cols, rows) {
    var open = new Queue();

    var nodes = [];


    // khoi tao cac node la walls
    for (var i = 0; i < cols; i++) {
        nodes[i] = [];
        for (var j = 0; j < rows; j++) {
            nodes[i][j] = new Node(i, j, walls[i][j]);
        }
    }

    this.findPath = function (snakeData, start, goal) {
        var node;
        if (open) {
            open.clear();
            // reset all visited nodes
            for (var i = 0; i < cols; i++)
                for (var j = 0; j < rows; j++) {
                    node = nodes[i][j];
                    if (node.value == VISITED || node.value == SNAKE) {
                        node.previous = undefined;
                        node.value = BLANK;
                    }
                }
        } else {
            open = new Queue();
        }
        // consider the snake body as wall
        for (var i = 0; i < snakeData.length; i++) {
            var x = snakeData[i].x,
                y = snakeData[i].y;
            nodes[x][y].value = SNAKE;
        }

        // add the start node to queue
        open.enqueue(start);
        // the main loop

        while (!open.isEmpty()) {
            node = open.dequeue();
            if (node) {
                if (node.x == goal.x && node.y == goal.y) {
                    return getSolution(node);
                }
                genMove(node);
            } else
                break;
        }
        return null;
    }

    function genMove(node) {
        if (node.x < cols - 1)
            addToOpen(node.x + 1, node.y, node);
        if (node.y < rows - 1)
            addToOpen(node.x, node.y + 1, node);
        if (node.x > 0)
            addToOpen(node.x - 1, node.y, node);
        if (node.y > 0)
            addToOpen(node.x, node.y - 1, node);
    }

    function addToOpen(x, y, previous) {
        var node = nodes[x][y];

        if (node.value == BLANK) {
            node.value = VISITED;
            node.previous = previous;
            open.enqueue(node);
        }
    }

    function getSolution(p) {
        var nodes = [];
        nodes.push(p);
        while (p.previous) {
            nodes.push(p.previous);
            p = p.previous;
        }
        return nodes;
    }

}

function getBestTarget (start, foods, mySnake){

}