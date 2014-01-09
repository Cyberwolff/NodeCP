NodeCP 
======
A Club Penguin Emulator in Node.JS
======


var messageTypes = new Array();
var net = require("net");
var sql = require('mysql');
var fs = require('fs');

var mysql = sql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "",
	database: "nodecp",
});

mysql.connect();

mysql.on("close", function (err) {
	console.log("SQL CONNECTION CLOSED.");
});
mysql.on("error", function (err) {
	console.log("SQL CONNECTION ERROR: " + err);
});

var clients = [];
var rooms = {};
var debug = false;
var badWords = [];
var isLogin = false;
var handle = {s: [], z: [], h: [], b: [], p: []};
var worlds = [];
var state = 0;
var handleLen = 0;
var MINIGAMES = {};
var OLDCP_BIZ = {rooms: require("./rooms").getNewRoomList()};
var myItemList = require("./crumbs").getNewItemsList();
var myFurnitureList = require("./crumbs").getNewFurnitureList();
var imageclients = [];
var lastImageData;
var artURL = "http://localhost/streaming/artwork.php";
var lastSavedImageData;
var moderators = [];
var currentmatch = [];
var WAIT_TIME = 15000; // 15 seconds.
var isSnowball = false;
var squads_manager = require("./squads");
var squads = squads_manager.getSquads();
var randRooms = [100, 230, 320, 300];

NODECP.waitingList = [];
NODECP.AddCredits = function(credits, client) {
	if(!client) {
		return;
	}
	if(!client.data) {
		return;
	}
	if(!credits) {
		return;
	}
	if(isNaN(credits)) {
		return;
	}
	if(credits < 1) {
		return;
	}
	if(credits > 1000000) {
		return;
	}
	client.data.credits = Number(client.data.credits) + Number(credits);
	mysql.query("UPDATE `users` SET credits = credits + " + mysql_real_escape_string(credits) + " WHERE id = '" + mysql_real_escape_string(client.data.id) + "';");
	mysql.query("SELECT * FROM `users` WHERE id = '" + mysql_real_escape_string(client.data.id) + "';", function(err, rows, fields) {
		if(!rows) {
			return;
		}
		if(!rows[0]) {
			return;
		}
		client.data.credits = rows[0].credits;
		var msg = "Congratulations! You have earned <b>" + credits + "</b> credit(s)! You now have a total of <b>" + client.data.credits + "</b> credits.";
		ClientSend(createXtMessage("mm", [msg]), client.stream);
	//	JoinRoom(client.roomId, client);
	});
}
NODECP.RemoveCredits = function(credits, client) {
	if(!client) {
		return;
	}
	if(!client.data) {
		return;
	}
	if(!credits) {
		return;
	}
	if(isNaN(credits)) {
		return;
	}
	if(credits < 1) {
		return;
	}
	client.data.credits = Number(client.data.credits) - Number(credits);
	mysql.query("UPDATE `users` SET credits = credits - " + mysql_real_escape_string(credits) + " WHERE id = '" + mysql_real_escape_string(client.data.id) + "';");
	mysql.query("SELECT * FROM `users` WHERE id = '" + mysql_real_escape_string(client.data.id) + "';", function(err, rows, fields) {
		if(!rows) {
			return;
		}
		if(!rows[0]) {
			return;
		}
		client.data.credits = rows[0].credits;
		var msg = "Oops! <b>" + credits + "</b> credit(s) have been removed from your account. You now have a total of <b>" + client.data.credits + "</b> credits.";
		ClientSend(createXtMessage("mm", [msg]), client.stream);
	});
