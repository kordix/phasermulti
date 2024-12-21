const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#2d2d2d",
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
    scene: {
        preload,
        create,
        update,
    },
};

const game = new Phaser.Game(config);
let socket;
let player;
let otherPlayers;

function preload() {
    this.load.image("player", "https://via.placeholder.com/32/ff0000");
    this.load.image("otherPlayer", "https://via.placeholder.com/32/0000ff");
}

function create() {
    socket = io("http://localhost:3000");
    player = this.physics.add.sprite(100, 100, "player");
    player.setCollideWorldBounds(true);

    otherPlayers = this.physics.add.group();

    // Add existing players
    socket.on("currentPlayers", (players) => {
        Object.keys(players).forEach((id) => {
            if (id !== socket.id) {
                addOtherPlayer(this, players[id]);
            }
        });
    });

    // Add new player
    socket.on("newPlayer", (playerInfo) => {
        addOtherPlayer(this, playerInfo);
    });

    // Remove disconnected player
    socket.on("playerDisconnected", (id) => {
        otherPlayers.getChildren().forEach((otherPlayer) => {
            if (otherPlayer.id === id) {
                otherPlayer.destroy();
            }
        });
    });

    // Update player movement
    socket.on("playerMoved", (playerInfo) => {
        otherPlayers.getChildren().forEach((otherPlayer) => {
            if (otherPlayer.id === playerInfo.id) {
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });

    this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (this.cursors.left.isDown) {
        player.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
        player.setVelocityX(150);
    } else {
        player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
        player.setVelocityY(-150);
    } else if (this.cursors.down.isDown) {
        player.setVelocityY(150);
    } else {
        player.setVelocityY(0);
    }

    socket.emit("playerMove", { x: player.x, y: player.y });
}

function addOtherPlayer(scene, playerInfo) {
    const otherPlayer = scene.add.sprite(playerInfo.x, playerInfo.y, "otherPlayer");
    otherPlayer.id = playerInfo.id;
    otherPlayers.add(otherPlayer);
}
