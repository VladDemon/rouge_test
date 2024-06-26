var MAP_HEIGHT = 24;
var MAP_WIDTH = 40;
var ROOMS = 6;
var WIDTH_ROOM = 7;
var HEIGHT_ROOM = 5;
var moveDelay = 200;
var isEnd = false;
var heroHealth = 100;
var heroStrength = 100;
var enemyHp = 10;
var DAMAGE = 10; 

// блок
function Tile(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
}

// генерация карты 
function generateMap() {
    var map = [];
    for (var y = 0; y < MAP_HEIGHT; y++) {
        var row = [];
        for (var x = 0; x < MAP_WIDTH; x++) {
            row.push(new Tile(x, y, 1)); 
        }
        map.push(row);
    } 
    return map;
}

// рендеринг карты 
function renderMap(map) {
    var field = document.querySelector('.field');
    field.innerHTML = ''; 

    for (var y = 0; y < MAP_HEIGHT; y++) {
        for (var x = 0; x < MAP_WIDTH; x++) {
            var tile = document.createElement('div');
            tile.classList.add('tile');
            tile.style.left = (x * 20) + 'px';
            tile.style.top = (y * 20) + 'px';
     
            tile.classList.add(map[y][x].type === 1 ? 'wall' : 'floor');
            field.appendChild(tile);
        }
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// комнаты
function addRooms(map) {
    var rooms = [];
    var roomCount = getRandomInt(5, 10);
    for (var i = 0; i < roomCount; i++) {
        var roomWidth = getRandomInt(3, 10);
        var roomHeight = getRandomInt(3, 10);
        var roomX = getRandomInt(1, MAP_WIDTH - roomWidth - 1);
        var roomY = getRandomInt(1, MAP_HEIGHT - roomHeight - 1);

        var room = { x: roomX, y: roomY, width: roomWidth, height: roomHeight };
        rooms.push(room);

        for (var y = roomY; y < roomY + roomHeight; y++) {
            for (var x = roomX; x < roomX + roomWidth; x++) {
                map[y][x].type = 0;
            }
        }
    }

    return rooms;
}

// коридоры с верт и гор линиями
function addCorridors(map, rooms) {
    var verticalCorridors = getRandomInt(3, 5);
    var horizontalCorridors = getRandomInt(3, 5);
    function connectRooms(room1, room2) {
        var point1 = { x: getRandomInt(room1.x, room1.x + room1.width - 1), y: getRandomInt(room1.y, room1.y + room1.height - 1) };
        var point2 = { x: getRandomInt(room2.x, room2.x + room2.width - 1), y: getRandomInt(room2.y, room2.y + room2.height - 1) };
        while (point1.x !== point2.x || point1.y !== point2.y) {
            if (point1.x !== point2.x) {
                if (point1.x < point2.x) point1.x++;
                else point1.x--;
            } else if (point1.y !== point2.y) {
                if (point1.y < point2.y) point1.y++;
                else point1.y--;
            }
            map[point1.y][point1.x].type = 0;
        }
    }

    for (var i = 0; i < verticalCorridors; i++) {
        var x = getRandomInt(1, MAP_WIDTH - 2);
        for (var y = 0; y < MAP_HEIGHT; y++) {
            map[y][x].type = 0;
        }
    }

    for (var i = 0; i < horizontalCorridors; i++) {
        var y = getRandomInt(1, MAP_HEIGHT - 2);
        for (var x = 0; x < MAP_WIDTH; x++) {
            map[y][x].type = 0; 
        }
    }
    

    for (var i = 1; i < rooms.length; i++) {
        connectRooms(rooms[i - 1], rooms[i]);
    }
}


// функция для расстановки item и врагов
function placeRandomItem(count, itemClass, map) {
    for (var i = 0; i < count; i++) {
        var x, y;
        do {
            x = getRandomInt(0, MAP_WIDTH - 1);
            y = getRandomInt(0, MAP_HEIGHT - 1);
        } while (map[y][x].type != 0);

        var item = document.createElement('div');
        item.classList.add('tile', itemClass);
        item.style.left = (x * 20) + 'px';
        item.style.top = (y * 20) + 'px';
        document.querySelector('.field').appendChild(item);


        if (itemClass === 'hero') {
            item.power = DAMAGE; // Example attack strength for hero
        } else if (itemClass === 'enemy') {
            item.health = enemyHp; // Example health for enemy
            item.strength = DAMAGE; // Example strength for enemy
        }

    }
}

function placeItemsAndCharacters(map) {
    placeRandomItem(2, 'sword', map);
    placeRandomItem(10, 'potion', map);
    placeRandomItem(1, 'hero', map);
    placeRandomItem(10, 'enemy', map);
}

// статус бар
function updateStatusBars(hero, health, strength) {
    const healthBar = hero.querySelector('.health');
    const strengthBar = hero.querySelector('.strength');

    healthBar.style.width = health + '%';
    strengthBar.style.width = strength + '%';
}

// коллизия
function collision(hero, enemy) {
    var heroX = parseInt(hero.style.left) / 20;
    var heroY = parseInt(hero.style.top) / 20;
    var enemyX = parseInt(enemy.style.left) / 20;
    var enemyY = parseInt(enemy.style.top) / 20;

    return Math.abs(heroX - enemyX) <= 1 && Math.abs(heroY - enemyY) <= 1;
}

// ранд движение врага
function moveEnemies(enemies, map) {
    enemies.forEach(enemy => {
        var x = parseInt(enemy.style.left) / 20;
        var y = parseInt(enemy.style.top) / 20;
        var direction = getRandomInt(1, 4);

        if (direction === 1 && y > 0 && map[y - 1][x].type === 0) y--;
        if (direction === 2 && y < MAP_HEIGHT - 1 && map[y + 1][x].type === 0) y++;
        if (direction === 3 && x > 0 && map[y][x - 1].type === 0) x--;
        if (direction === 4 && x < MAP_WIDTH - 1 && map[y][x + 1].type === 0) x++;

        enemy.style.left = (x * 20) + 'px';
        enemy.style.top = (y * 20) + 'px';
    });
}

function main() {
    document.addEventListener('DOMContentLoaded', function () {
        if (isEnd) {
            endPlate.style.display = "block";
            return;
        }

        var map = generateMap(MAP_WIDTH, MAP_HEIGHT);
        var moveCounter = 20;
        var rooms = addRooms(map);
        var canMove = true;
        addCorridors(map, rooms);
        renderMap(map);
        placeItemsAndCharacters(map);
        const hero = document.querySelector('.hero');
        document.querySelector('#moves-counter').innerText = `Moves: ${moveCounter}`;
        var endPlate = document.querySelector('.end-game');
        const items = document.querySelectorAll('.potion, .sword');
        const enemies = document.querySelectorAll('.enemy');

        hero.innerHTML = `
            <div class="status-bar">
                <div class="health" style="width: 100%;"></div>
                <div class="strength" style="width: 100%;"></div>
            </div>
        `;


        document.addEventListener('keydown', function (event) {
            if (!hero || moveCounter <= 0 || !canMove) return;

            var key = event.key;
            var x = parseInt(hero.style.left) / 20;
            var y = parseInt(hero.style.top) / 20;
            var moved = false;

            if ((key === 'w' || key === 'ц') && y > 0 && map[y - 1][x].type === 0) {
                y--;
                moved = true;
            }
            if ((key === 's' || key === 'ы') && y < MAP_HEIGHT - 1 && map[y + 1][x].type === 0) {
                y++;
                moved = true;
            }
            if ((key === 'a' || key === 'ф') && x > 0 && map[y][x - 1].type === 0) {
                x--;
                moved = true;
            }
            if ((key === 'd' || key === 'в') && x < MAP_WIDTH - 1 && map[y][x + 1].type === 0) {
                x++;
                moved = true;
            }

            // коллизия для убийства врага
            if (key === ' ' && !moved) {
                enemies.forEach(enemy => {
                    if (collision(hero, enemy)) {
                        enemy.health -= hero.power;
                        if(enemy.health <= 0) {
                            enemy.remove();
                            moveCounter += 10;
                        }
                    }
                });
            }

            // коллизия для итемов
            if(key === ' ') {
                items.forEach(function (item) {
                    if (collision(hero, item)) {
                        if (item.classList.contains('potion')) {
                            heroHealth += 10;
                            item.remove();
                            updateStatusBars(hero, heroHealth, heroStrength);
                        } else if (item.classList.contains('sword')) {
                            heroStrength += 10;
                            item.remove();
                            updateStatusBars(hero, heroHealth, heroStrength);
                        }
                    }
                })
            }


            if (moved) {
                hero.style.left = (x * 20) + 'px';
                hero.style.top = (y * 20) + 'px';
                moveCounter--;
                canMove = false;

                document.querySelector('#moves-counter').innerText = `Moves: ${moveCounter}`;
                
                updateStatusBars(hero, heroHealth, heroStrength);

                setTimeout( function () {
                    canMove = true;
                }, moveDelay);

                if (moveCounter <= 0) {
                    alert('Game over! You have run out of moves.');
                    isEnd = true;
                }

                moveEnemies(enemies, map);

                enemies.forEach(enemy => {
                    if (collision(hero, enemy)) {
                        heroHealth -= enemy.strength;
                        if (heroHealth <= 0) {
                            alert('Game over! You have been killed.');
                            isEnd = true;
                        }
                        updateStatusBars(hero, heroHealth, heroStrength);
                    }
                });
            }
        });
    });
}

main();
