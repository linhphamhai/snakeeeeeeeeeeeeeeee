const io = require("socket.io-client");
var serverURL = 'http://codefest79.satek.vn';
const socket = io.connect(serverURL);
const teamId = "5b7a6c3709611442e9f39ab6";
const matchId = "5b7a6c3709611442e9f39ab6";

var squares;
var snake;
var food;
var moves = new Array();

var indexOfMySnake;
var currentTarget;
var enemy = [];
var foods = [];
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

socket.on(ClientConfig.PLAYER.INCOMMING.DRIVE_ELEPHANT_STATE, function (res) {

});

socket.emit(ClientConfig.PLAYER.OUTGOING.JOIN_ROOM, teamId, matchId);

socket.on(ClientConfig.PLAYER.INCOMMING.ROOM_STATE, function (res) {
    switch (res.code) {
        case AppConfig.API_CODE.SUCCESS:
            if (res.roomInfo) {
                if (res.roomInfo.players[0].name == 'CAM_QUIT') {
                    indexOfMySnake = 0;
                } else {
                    indexOfMySnake = 1;
                }
                snake = res.roomInfo.players[indexOfMySnake].segments;
                if (res.roomInfo.players.length > 1) {
                    enemy = res.roomInfo.players[1 - indexOfMySnake].segments;
                }
                foods = res.roomInfo.foods;
                currentTarget = findNearestTarget(snake, foods);
                food = currentTarget.coordinate;
                console.log(snake[0]);
                initMap(foods, enemy, snake);
                findpath_a("H1+H2");
                var direction = getMove(snake, moves);
                moves = new Array();
                socket.emit(ClientConfig.PLAYER.OUTGOING.DRIVE_ELEPHANT, teamId, matchId, direction);


                console.log("-----------------------------------------------------------------------------------------------------------------------------");
            }

        default:

            break;
    }

});



socket.emit(ClientConfig.PLAYER.OUTGOING.DRIVE_ELEPHANT, teamId, matchId, 3);

// Khoi tao map
function initMap(foods, enemy, snake) {
    squares = new Array(map.horizontal + 2);
    for (var i = 0; i < map.horizontal + 2; i++) {
        squares[i] = new Array(map.vertical + 2);
    }
    for (var i = 0; i <= map.horizontal + 1; i++) {
        for (var j = 0; j <= map.vertical + 1; j++) {
            if (i == 0 || j == 0 || i == map.horizontal + 1 || j == map.vertical + 1) {
                squares[i][j] = 3;
            } else {
                squares[i][j] = 0;
            }
        }
    }
    for (var i = 0; i < enemy.length; i++) {
        squares[enemy[i].x][enemy[i].y] = 3;
    }

    for (var i = 0; i < snake.length; i++) {
        squares[snake[i].x][snake[i].y] = 3;
    }

    for (var i = 0; i < foods.length; i++) {
        squares[foods[i].coordinate.x][foods[i].coordinate.y] = 2; // 3 : wall,  2: food
    }
}



function Node(parent, point, children, g_score, h_score) {
    this.parent = parent;
    this.point = point;
    this.children = children;
    this.g_score = g_score;
    this.h_score = h_score;
    this.f_score = g_score + h_score;
}

function Point(pos_x, pos_y) {
    this.x = pos_x;
    this.y = pos_y;
}

//updates scores of child nodes
function update_scores(parent) {
    for (var i = 0; i < parent.children.length; i++) {
        parent.children[i].g_score = parent.g_score + 1;
        parent.children[i].h_score = heuristic_estimate(parent.children[i].point);
        parent.children[i].f_score = parent.children[i].g_score + parent.children[i].h_score;
        //recursively update any child nodes that this child might have.
        update_scores(parent.children[i]);
    }
}


//check is aNode is in openList. If a match is found, return index, -1 if no match
function in_openlist(openList, aNode) {
    for (var i = 0; i < openList.length; i++) {
        if (openList[i].point.x == aNode.point.x && openList[i].point.y == aNode.point.y)
            return i;
    }
    return -1;
}

// lua chon ham heuristic
function heuristic_estimate(point1, point2, search_type) {
    switch (search_type) {
        case "H1":
            return heuristic_estimate_1(point1, point2);
        case "H2":
            return heuristic_estimate_2(point1, point2);
        case "H1+H2":
            return (heuristic_estimate_1(point1, point2) + heuristic_estimate_2(point1, point2)) / 2;
    }
}

// Ham heuristic 1
function heuristic_estimate_1(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}
// Ham heuristic 2
function heuristic_estimate_2(point1, point2) {
    return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

// kiem tra co lien ke nhau khong
function is_adjacent(point1, point2) {
    if (point1.x == point2.x && (point1.y == point2.y - 1 || point1.y == point2.y + 1))
        return true;
    if (point1.y == point2.y && (point1.x == point2.x - 1 || point1.x == point2.x + 1))
        return true;
    return false;
}

function findpath_a(search_type) {
    var openList = new Array();
    var closedList = new Array(map.horizontal + 2);
    for (var i = 0; i <= map.horizontal + 1; i++) {
        closedList[i] = new Array(map.vertical + 2);
    }

    for (var i = 0; i <= map.horizontal + 1; i++) {
        for (var j = 0; j <= map.vertical + 1; j++) {
            closedList[i][j] = 0;
        }
    }
    openList.push(new Node(null, snake[0], new Array(), 0, heuristic_estimate(snake[0], currentTarget, search_type)));
    while (openList.length != 0) {
        openList.sort(function (a, b) {
            return a.f_score - b.f_score
        });
        var n = openList.shift();
        // neu node n da dc xet
        if (closedList[n.point.x][n.point.y] == 1) {
            continue;
        }

        if (squares[n.point.x][n.point.y] == 2) { // la thuc an
            do {
                moves.unshift(n.point);
                if (squares[n.point.x][n.point.y] == 0)
                    squares[n.point.x][n.point.y] = 1;
                n = n.parent;
            } while (n.parent != null)
            break;
        }

        // danh dau la da duoc xet den
        closedList[n.point.x][n.point.y] = 1;

        if (closedList[n.point.x][n.point.y - 1] == 0 && (squares[n.point.x][n.point.y - 1] == 0 || squares[n.point.x][n.point.y - 1] == 2)) {
            n.children.unshift(new Node(n, new Point(n.point.x, n.point.y - 1), new Array(), n.g_score + 1, heuristic_estimate(new Point(n.point.x, n.point.y - 1), food, search_type)));
            // console.log(n.children);
            // console.log(closedList[n.point.x]);
        }

        if (closedList[n.point.x + 1][n.point.y] == 0 && (squares[n.point.x + 1][n.point.y] == 0 || squares[n.point.x + 1][n.point.y] == 2)) {
            n.children.unshift(new Node(n, new Point(n.point.x + 1, n.point.y), new Array(), n.g_score + 1, heuristic_estimate(new Point(n.point.x + 1, n.point.y), food, search_type)));
            // console.log(n.children);
            // console.log(closedList[n.point.x + 1]);
        }

        if (closedList[n.point.x][n.point.y + 1] == 0 && (squares[n.point.x][n.point.y + 1] == 0 || squares[n.point.x][n.point.y + 1] == 2)) {
            n.children.unshift(new Node(n, new Point(n.point.x, n.point.y + 1), new Array(), n.g_score + 1, heuristic_estimate(new Point(n.point.x, n.point.y + 1), food, search_type)));
            // console.log(n.children);
            // console.log(closedList[n.point.x]);
        }

        if (closedList[n.point.x - 1][n.point.y] == 0 && (squares[n.point.x - 1][n.point.y] == 0 || squares[n.point.x - 1][n.point.y] == 2)) {
            n.children.unshift(new Node(n, new Point(n.point.x - 1, n.point.y), new Array(), n.g_score + 1, heuristic_estimate(new Point(n.point.x - 1, n.point.y), food, search_type)));
            // console.log(n.children);
            // console.log(closedList[n.point.x - 1]);
        }


        for (var i = 0; i < n.children.length; i++) {
            var index = in_openlist(openList, n.children[i]);
            if (index < 0) {
                openList.push(n.children[i]);
            } else {
                if (n.children[i].f_score < openList[index].f_score) {
                    for (var j = 0; j < openList[index].children.length; j++) {
                        openList[index].children[j].parent = n.children[i];
                    }
                    n.children[i].children = openList[index].children;
                    openList.splice(index, 1);
                    openList.push(n.children[i]);
                    update_scores(n.children[i]);
                }
            }
        }
    }
}


function getMove(snake, moves) {
    var head = snake[0];
    var next = moves[0];
    if (next.x == head.x && next.y < head.y) {
        return 1; // up
    }
    if (next.x < head.x && next.y == head.y) {
        return 2; // left
    }
    if (next.x == head.x && next.y > head.y) {
        return 3; // down
    }
    if (next.x > head.x && next.y == head.y) {
        return 4; // right
    }
}



// Tim thuc an gan nhat(chua toi uu nhat)
function findNearestTarget(snake, foods) {
    var target = foods[0];
    var head = snake[0];
    var lengthOfFoods = foods.length;
    for (var i = 1; i < lengthOfFoods; i++) {
        if (calculateDistance(head, target.coordinate) > calculateDistance(head, foods[i].coordinate)) {
            target = foods[i];
        }
    }

    return target;
}

// Tinh toan khoang cach giua 2 diem
function calculateDistance(point1, point2) {
    var len = 0;
    if (point1.x - point2.x < 0) {
        len = len - (point1.x - point2.x);
    } else {
        len = len + (point1.x - point2.x);
    }

    if (point1.y - point2.y < 0) {
        len = len - (point1.y - point2.y);
    } else {
        len = len + (point1.y - point2.y);
    }

    return len;
}