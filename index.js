/*
MIT Licence

Copyright (c) 2017 Nolialsea, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

const irc = require('irc'),
	fs = require('fs'),
	md5 = require('md5'),
	sqlite3 = require('sqlite3'),
	db = new sqlite3.Database('db.db'),
	sqlTimestamp = "strftime('%s','now')",
	channels = ['#cbna'],
	nickname = 'BotCoin',
	shortnick = 'bc',
	minimumDelta = 60	//Minimum time between minings in seconds

//Database initialisation
db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS User (login TEXT, password TEXT, nick TEXT, gold REAL, lastMining INTEGER)");
	db.run("CREATE TABLE IF NOT EXISTS Pickaxe (name TEXT, power REAL, durability REAL, userId INTEGER)");
});

let client = new irc.Client('irc.mibbit.net', nickname, {
	userName: 'NoliBot',
	realName: 'The Real NoliBot',
	port: 6667,
	localAddress: null,
	debug: false,
	showErrors: true,
	autoRejoin: true,
	autoConnect: true,
	channels: channels,
	secure: false,
	selfSigned: false,
	certExpired: false,
	floodProtection: true,
	floodProtectionDelay: 500,
	sasl: false,
	retryCount: 0,
	retryDelay: 2000,
	stripColors: false,
	channelPrefixes: "&#",
	messageSplit: 512,
	encoding: ''
});

client.addListener('message#', function (nick, channel, message) {
	console.log('['+channel + '] => ' + nick + ' : ' + message);

	let res,
		regMine = new RegExp("^"+shortnick+" mine","i"),
		regHelp = new RegExp("^"+shortnick+" help$","i");

	//Mining
	res = message.match(regMine);
	if (res){
		mine(nick);
		return;
	}

	//Help
	res = message.match(regHelp);
	if (res){
		help();
		return;
	}
});

client.addListener('pm', function (nick, message) {
	//console.log('[PRIVATE] => ' + nick + ' : ' + message);
	let res,
		regConnect = new RegExp("^connect ([^ ]*) ([^ ]*$)","i"),
		regRegister = new RegExp("^register ([^ ]*) ([^ ]*$)","i"),
		regCreatePickaxe = new RegExp("^create pickaxe (([0-9]*[.])?[0-9]+) ([^]*)","i");
	
	//Connection
	res = message.match(regConnect);
	if (res){
		if (res.length === 3){
			User.connect(nick, res[1], res[2]);
		}else{
			client.say(nick, "Error ! Use like this : \"connect LOGIN PASSWORD\"");
		}
		return;
	}

	//Registration
	res = message.match(regRegister);
	if (res){
		if (res.length === 3){
			User.register(nick, res[1], res[2]);
		}else{
			client.say(nick, "Error ! Use like this : \"register LOGIN PASSWORD\"");
		}
		return;
	}

	//Create pickaxe
	res = message.match(regCreatePickaxe);
	if (res){
		console.log(res);
		if (res.length === 4){
			createPickaxe(nick, res[1], res[3]);
		}else{
			client.say(nick, "Error ! Use like this : \"create pickaxe INVESTMENT NAME\"");
		}
		return;
	}
});

client.addListener('join', function (channel, nick, message) {
	console.log(nick + ' joined');
	if (nick === nickname){
		client.say(channels[0], "Blblbl");
	}
});

client.addListener('names', function (channel, nicks) {
	console.log('NAMES : ['+Object.keys(nicks).join(', ')+']');
});

client.addListener('nick', function(oldNick, newNick, channels, message) {
	User.updateNick(oldNick, newNick);
});

client.addListener('part', function(channel, nick, reason, message) {
	User.removeNick(nick);
});

client.addListener('quit', function(nick, reason, channels, message) {
	User.removeNick(nick);
});

client.addListener('error', function(message) {
	console.log('error: ', message);
});

function createPickaxe(nick, investment, name){
	User.getByNick(nick, function(user){
		if (user !== undefined){
			if (user.gold >= investment){
				User.addGold(nick, -investment);
				const power = Math.random()*investment;
				const durability = Math.random()*investment;
				Pickaxe.create(name, power, durability, user.id);
				client.say(nick, "You created ["+name+"] ! Power : "+power+" | durability : "+durability+"");
			}else{
				client.say(nick, "You don't have enough gold");
			}
		}
	});
}

function help(){
	client.say(channels[0], "Private commands (use \"/msg BotCoin COMMAND\") :");
	client.say(channels[0], "	 register LOGIN PASSWORD");
	client.say(channels[0], "	 connect LOGIN PASSWORD");
	client.say(channels[0], "	 create pickaxe INVESTMENT NAME");
	client.say(channels[0], "Channel commands :");
	client.say(channels[0], "	 "+shortnick+" help");
	client.say(channels[0], "	 "+shortnick+" mine");
}

function mine(nick){
	User.getByNick(nick, function(user){
		if (user === undefined){
			client.say(nick, "You are not logged in");
		}else{
			Pickaxe.getByUserId(user.id, function(pickaxe){

				const delta = Math.floor(Date.now()/1000) - user.lastMining;
				//Mining
				if (delta >= minimumDelta){
					const rand = Math.random();
					const gold = rand * (delta/86400);	//Max 1 per day
					
					User.addGold(nick, gold);
					client.say(channels[0], nick+" mined for "+(delta/60).toFixed(2)+" minute(s) at "+(rand*100).toFixed(2)+"% rate, earning "+gold+" gold !");

					if (pickaxe){
						let pickaxeRand = Math.random()*pickaxe.power;
						let pickaxeGold = pickaxeRand * (delta/86400);
						client.say(channels[0], "["+pickaxe.name+"] was used to dig, earning "+pickaxeGold+" more gold at "+(pickaxeRand*100).toFixed(2)+"% rate and "+pickaxe.power+" power")
						
						User.addGold(nick, pickaxeGold);
						//Pickaxe damage goes here
					}
				}
				//Too soon
				else if (delta < 10){
					//Ignore the fucker
				}
				//Too soon
				else{
					client.say(channels[0], nick+" cannot mine yet. Try again in "+(minimumDelta-delta)+" seconds.");
				}
			});
		}
	});
}

class Pickaxe{
	static create(name, power, durability, userId){
		db.serialize(function(){
			Pickaxe.delete(userId);
			db.run("INSERT INTO Pickaxe (name, power, durability, userId) VALUES ($name, $power, $durability, $userId)", {
				$name: name,
				$power: power,
				$durability: durability,
				$userId: userId
			});
		});
	}

	static getByUserId(userId, callback){
		db.get("SELECT rowid AS id, name, power, durability FROM Pickaxe WHERE userId=?", userId, function(err, row) {
			callback && callback(row);
		});
	}

	static delete(userId){	//Does not actually delete, on purpose for later
		db.run("UPDATE Pickaxe SET userId=0 WHERE userId=?", userId);
	}
}

class User{
	static register(nick, login, password){
		password = md5(password);
		db.serialize(function() {
			//Check if user exists
			User.getByLogin(login, function(row){
				if (row === undefined){
					//User doesn't exist yet
					db.run("INSERT INTO User (nick, login, password, gold, lastMining) VALUES ($nick, $login, $password, $gold, "+sqlTimestamp+")", {
						$nick: nick,
						$login: login,
						$password: password,
						$gold: 0
					});
					client.say(nick, "You are now registered");
				}else{
					//User already exists !
					client.say(nick, "This login is already used");
				}
			});
		});
	}

	static connect(nick, login, password){
		password = md5(password);
		db.serialize(function() {
			//Check if user exists
			User.getByLogin(login, function(row){
				if (row === undefined){
					client.say(nick, "No user was found for this login");
				}else{
					if (row.password === password){
						db.run("UPDATE User SET nick=$nick WHERE login=$login", {$nick: nick, $login: login});
						client.say(nick, "You are now logged in");
					}else{
						client.say(nick, "Incorrect password");
					}
				}
			});
		});
	}

	static getByLogin(login, callback){
		db.get("SELECT rowid AS id, login, nick, gold, lastMining FROM User WHERE login=?", login, function(err, row) {
			callback && callback(row);
		});
	}

	static getByNick(nick, callback){
		db.get("SELECT rowid AS id, login, nick, gold, lastMining FROM User WHERE nick=?", nick, function(err, row) {
			callback && callback(row);
		});
	}

	static updateNick(oldNick, newNick){
		db.run("UPDATE User SET nick=$newNick WHERE nick=$oldNick", {$newNick: newNick, $oldNick: oldNick});
	}

	static removeNick(nick){
		db.run("UPDATE User SET nick='none' WHERE nick=?", nick);
	}

	static addGold(nick, amount){
		db.run("UPDATE User SET gold=gold+$amount, lastMining="+sqlTimestamp+" WHERE nick=$nick", {$amount: amount, $nick: nick});
	}
}
