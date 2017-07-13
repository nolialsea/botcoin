const irc = require('irc')
const cfg = require('configuration')
const User = require('user')

let client = new irc.Client(cfg.ircServer, nickname, {
	port: cfg.ircPort,
	userName: cfg.userName,
	realName: cfg.realName,
	localAddress: null,
	debug: false,
	showErrors: true,
	autoRejoin: true,
	autoConnect: true,
	channels: cfg.channels,
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

let command = {
	//Connection (example command)
	connect: function(nick, msg){
		//First regex should math only the first word
		let reg = new RegExp("^connect","i")
		let res = msg.match(reg);
		if (res){
			//Second regex can then extract arguments and process them however
			reg = new RegExp("^connect ([^ ]{1,32}) ([^ ]{1,32}$)","i")
			res = msg.match(reg);
			if (res){
				if (res.length === 3){
					let login = res[1];
					let password = res[2];
					User.connect(nick, login, password, function(connected){
						if (connected){
							client.say(nick, "Yep. Connected.");
						}else{
							client.say(nick, "Nope. Bad password or something.");
						}
					});
				}else{
					client.say(nick, "Nope. You don't use it correctly. Maybe try the \"connect help\" command ?");
				}
			}
			//You can also match different arguments
			reg = new RegExp("^connect help","i")
			res = msg.match(reg);
			if (res){
				client.say(nick, "https://github.com/nolialsea/botcoin/issues/1");
			}
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	},
	//Registration
	register: function(nick, msg){
		let reg = new RegExp("^register","i")
		let res = msg.match(reg);
		if (res){
			reg = new RegExp("^register ([^ ]*) ([^ ]*$)","i");
			res = msg.match(reg);
			if (res){
				if (res.length === 3){
					let login = res[1];
					let password = res[2];
					User.register(nick, login, password, function(registered){
						if (registered){
							client.say(nick, "Yep. Registered and connected.");
						}else{
							client.say(nick, "Nope. Somebody already have this login or something.");
						}
					});
				}else{
					client.say(nick, "Nope. You don't use it correctly. Maybe try the \"register help\" command ?");
				}
			}
			
			reg = new RegExp("^register help","i")
			res = msg.match(reg);
			if (res){
				client.say(nick, "https://github.com/nolialsea/botcoin/issues/1");
			}
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	}
	//Mining
	mine: function(nick, msg){
		let reg = new RegExp("^mine","i")
		let res = msg.match(reg);
		if (res){
			User.getByNick(nick, function(user){
				if (user === undefined){
					client.say(nick, "You are not logged in");
				}else{
					Pickaxe.getByUserId(user.id, function(pickaxe){
						const delta = Math.floor(Date.now()/1000) - user.lastMining;
						//Mining
						if (delta >= cfg.minimumDelta){
							const rand = Math.random();
							const gold = rand * (delta/86400);	//Max 1 per day
							
							User.addGold(nick, gold);
							client.say(nick, "You mined for "+(delta/60).toFixed(2)+" minute(s) at "+(rand*100).toFixed(2)+"% rate, earning "+gold+" gold !");

							if (pickaxe){
								let pickaxeRand = Math.random();
								let pickaxeGold = pickaxeRand * pickaxe.power * (delta/86400);
								client.say(nick, "["+pickaxe.name+"] was used to dig, earning "+pickaxeGold+" more gold at "+(pickaxeRand*100).toFixed(2)+"% rate and "+pickaxe.power+" power")
								
								User.addGold(nick, pickaxeGold);
								//Pickaxe damage goes here
							}
						}
						//Too soon
						else{
							client.say(nick, "You cannot mine yet. Try again in "+(cfg.minimumDelta-delta)+" seconds.");
						}
					});
				}
			});
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	}
	//Create pickaxe
	createPickaxe: function(nick, msg){
		let reg = new RegExp("^create pickaxe","i")
		let res = msg.match(reg);
		if (res){
			reg = new RegExp("^create pickaxe (([0-9]*[.])?[0-9]+) ([^]*)","i");
			res = msg.match(reg);
			if (res){
				if (res.length === 4){
					User.getByNick(nick, function(user){
						if (user !== undefined){
							let investment = res[1];
							let name = res[3];
							if (user.gold >= investment){
								User.addGold(nick, -investment);
								const randPower = Math.random();
								const power = randPower*investment*4;
								const randDurability = Math.random()
								const durability = randDurability*investment;
								Pickaxe.create(name, power, durability, user.id);
								client.say(nick, "You created ["+name+"] ! Power : "+power+" ("+(randPower*100*2).toString()+"% of your investment) | Max durability : "+durability+" ("+(randDurability*100*2).toString()+"% of your investment)");
							}else{
								client.say(nick, "You don't have enough gold");
							}
						}else{
							client.say(nick, "You are not connected.");
						}
					});
				}else{
					client.say(nick, "Nope. You don't use it correctly. Maybe try the \"create pickaxe help\" command ?");
				}
			}
			
			reg = new RegExp("^create pickaxe help","i")
			res = msg.match(reg);
			if (res){
				client.say(nick, "https://github.com/nolialsea/botcoin/issues/1");
			}
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	}
}

client.addListener('pm', function (nick, message) {
	let res,
		regConnect = new RegExp("^connect ([^ ]*) ([^ ]*$)","i"),
		regRegister = new RegExp("^register ([^ ]*) ([^ ]*$)","i"),
		regCreatePickaxe = new RegExp("^create pickaxe (([0-9]*[.])?[0-9]+) ([^]*)","i");
		regUpgradePickaxe = new RegExp("^upgrade pickaxe (([0-9]*[.])?[0-9]+)","i");
	
	//Connection
	res = message.match(regConnect);
	if (res){
		if (res.length === 3){
			User.connect(nick, res[1], res[2], function(connected){
				if (connected){

				}else{

				}
			});
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

	//Upgrade pickaxe
	res = message.match(regUpgradePickaxe);
	if (res){
		console.log(res);
		if (res.length === 3){
			upgradePickaxe(nick, res[1]);
		}else{
			client.say(nick, "Error ! Use like this : \"upgrade pickaxe INVESTMENT\"");
		}
		return;
	}
});

client.addListener('join', function (channel, nick, message) {
	console.log(nick + ' joined');
	if (nick === cfg.nickname){
		//client.say(nick, "Blblbl");
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