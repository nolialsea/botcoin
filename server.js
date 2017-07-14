const irc = require('irc');
const cfg = require('configuration');
const User = require('user');
const Pickaxe = require('pickaxe');
const colors = require('colors');

let client = new irc.Client(cfg.ircServer, cfg.nickname, {
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

/*User.disconnectAll();
console.log('All clients have been disconnected'.underline.red);*/

let command = {
	//Connection (example command)
	connect: function(nick, msg){
		//First regex should math only the first word
		let reg = new RegExp("^connect","i")
		let res = msg.match(reg);
		if (res){
			//Second regex can then extract arguments and process them however
			reg = new RegExp("^connect ([^ ]*) ([^ ]*$)","i")
			res = msg.match(reg);
			if (res){
				if (res.length === 3){
					let login = res[1];
					let password = res[2];
					User.connect(nick, login, password, function(connected){
						if (connected === 2){
							client.say(nick, "Yep. Connected.");
						}else if(connected === 1){
							client.say(nick, "That account is already connected.");
						}else if(connected === 0){
							client.say(nick, "Nope. Bad password.");
						}else if (connected === -1){
							client.say(nick, "Nope. No account with this login");
						}else{
							client.say(nick, "Wtf ?! You shouldn't see this, that's clearly a bug.");
						}
					});
				}else{
					client.say(nick, "Nope. You don't use it correctly. Maybe try the \"connect help\" command ?");
				}
			}

			//You can also match different arguments
			reg = new RegExp("^connected","i");
			res = msg.match(reg);
			if (res){
				User.getByNick(nick, function(user){
					if (!user){
						client.say(nick, "Nope, you are not connected.");
					}else{
						client.say(nick, "Yep, you are connected.");
					}
				});
			}

			//Help
			reg = new RegExp("^connect help","i")
			res = msg.match(reg);
			if (res){
				client.say(nick, "https://github.com/nolialsea/botcoin");
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
				client.say(nick, "https://github.com/nolialsea/botcoin");
			}
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	},
	//Mining
	mine: function(nick, msg){
		let reg = new RegExp("^mine","i")
		let res = msg.match(reg);
		if (res){
			User.getByNick(nick, function(user){
				if (user === undefined){
					client.say(nick, "You are not connected");
				}else{
					Pickaxe.getByUserId(user.id, function(pickaxe){
						const delta = Math.floor(Date.now()/1000) - user.lastMining;
						//Mining
						if (delta >= cfg.minimumDelta || true){	//Mininum mining delta disabled for now
							const rand = Math.random();
							const gold = rand * (delta/86400);	//Max 1 per day

							let pickaxeRand;
							let pickaxeGold;
							let damageRand;
							let damage;
							
							User.addGold(nick, gold);
							User.updateLastMining(nick);
							client.say(nick, "You mined for "+(delta/60).toFixed(2)+" minute(s) at "+(rand*100).toFixed(2)+"% rate, earning "+gold.toFixed(8)+" gold !");

							// Pickaxe
							if (pickaxe){
								pickaxeRand = Math.random();
								pickaxeGold = pickaxeRand * (delta/86400) * pickaxe.power;
								damageRand = Math.random();
								damage = damageRand * (delta/86400);

								Pickaxe.damage(user.id, damage);
								
								// Destroyed pickaxe
								if (pickaxe.durability-damage <= 0){
									Pickaxe.delete(user.id);
									client.say(nick, "Your pickaxe broke before you finished and gold has been lost ! Be more careful next time");
								}
								//Pickaxe mining
								else{
									User.addGold(nick, pickaxeGold);
									Pickaxe.addToTotalGoldMined(user.id, pickaxeGold);
									client.say(nick, "["+pickaxe.name+"] was used to dig, earning "+pickaxeGold.toFixed(8)+" more gold at "+(pickaxeRand*100).toFixed(2)+"% rate and "+pickaxe.power.toFixed(8)+" power")
									client.say(nick, "Your pickaxe lost "+damage.toFixed(8)+" durability at "+(damageRand*100).toFixed(2)+"% damage rate. Durability left : "+((pickaxe.durability-damage)/pickaxe.maxDurability*100).toFixed(2)+"%"+
									", "+((pickaxe.durability-damage)*24*60).toFixed(2)+" minute(s) of mining remaining minimum");
								}
							}
							client.say(nick, "You now have "+(user.gold+gold+(pickaxe?pickaxe.durability-damage>0?pickaxeGold:0:0)).toFixed(8)+" gold (+"+(gold+(!pickaxe?0:pickaxe.durability-damage<=0?0:pickaxeGold)).toFixed(8)+")");
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
	},
	//Create pickaxe
	createPickaxe: function(nick, msg){
		let reg = new RegExp("^create","i")
		let res = msg.match(reg);
		if (res){
			reg = new RegExp("^create (([0-9]*[.])?[0-9]+) ([^]*)","i");
			res = msg.match(reg);
			if (res){
				if (res.length === 4){
					let investment = res[1];
					let name = res[3];
					User.getByNick(nick, function(user){
						if (user !== undefined){
							if (user.gold >= investment){
								User.addGold(nick, -investment);
								const randPower = Math.random();
								const power = randPower*investment*4;
								const randDurability = Math.random();
								const durability = randDurability*investment;
								Pickaxe.create(user.id, name, power, durability, investment);
								client.say(nick, "You created ["+name+"] ! Power : "+power.toFixed(8)+" ("+(randPower*100*4).toFixed(2)+"% of your investment) | Max durability : "+durability.toFixed(8)+" ("+(randDurability*100).toFixed(2)+"% of your investment)");
							}else{
								client.say(nick, "You don't have enough gold");
							}
						}else{
							client.say(nick, "You are not connected.");
						}
					});
				}else{
					client.say(nick, "Nope. You don't use it correctly. Maybe try the \"create help\" command ?");
				}
			}
			
			reg = new RegExp("^create help","i")
			res = msg.match(reg);
			if (res){
				client.say(nick, "https://github.com/nolialsea/botcoin");
			}
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	},
	//Upgrade pickaxe
	upgradePickaxe: function(nick, msg){
		let reg = new RegExp("^upgrade","i")
		let res = msg.match(reg);
		if (res){
			reg = new RegExp("^upgrade (([0-9]*[.])?[0-9]+)","i");
			res = msg.match(reg);
			if (res){
				if (res.length === 3){
					let investment = res[1];
					User.getByNick(nick, function(user){
						if (user !== undefined){
							Pickaxe.getByUserId(user.id, function(pickaxe){
								if (pickaxe){
									if (user.gold >= investment){
										User.addGold(nick, -investment);
										const randPower = Math.random();
										const power = randPower*investment*4;
										const randDurability = Math.random();
										const durability = randDurability*investment;
										Pickaxe.upgrade(user.id, power, durability, investment);
										client.say(nick, 
											"You upgrade ["+pickaxe.name+"] ! New power : "+(pickaxe.power+power).toFixed(8)+
											" (+"+power.toFixed(8)+", or "+(randPower*100*4).toFixed(2)+
											"% of your investment) | New max durability : "+(pickaxe.maxDurability+durability).toFixed(8)+
											" (+"+(randDurability*100).toFixed(2)+"% of your investment), minimum "+(pickaxe.durability*24*60).toFixed(2)+" minute(s) of mining remaining)"
										);
									}else{
										client.say(nick, "You don't have enough gold");
									}
								}else{
									client.say(nick, "You don't have a pickaxe");
								}
							});
						}else{
							client.say(nick, "You are not connected.");
						}
					});
				}else{
					client.say(nick, "Nope. You don't use it correctly. Maybe try the \"upgrade help\" command ?");
				}
			}
			
			reg = new RegExp("^upgrade help","i")
			res = msg.match(reg);
			if (res){
				client.say(nick, "https://github.com/nolialsea/botcoin");
			}
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	},
	//Repair pickaxe
	repairPickaxe: function(nick, msg){
		let reg = new RegExp("^repair","i")
		let res = msg.match(reg);
		if (res){
			reg = new RegExp("^repair (([0-9]*[.])?[0-9]+)","i");
			res = msg.match(reg);
			if (res){
				if (res.length === 3){
					let investment = res[1];
					User.getByNick(nick, function(user){
						if (user !== undefined){
							Pickaxe.getByUserId(user.id, function(pickaxe){
								if (pickaxe){
									if (user.gold >= investment){
										User.addGold(nick, -investment);
										const randDurability = Math.random()*3;
										const durability = randDurability*investment;
										Pickaxe.repair(user.id, durability, investment);
										client.say(nick, "You repaired ["+pickaxe.name+"] ! Durability : "+
											Math.min(pickaxe.durability+durability, pickaxe.maxDurability).toFixed(8)+"/"+pickaxe.maxDurability.toFixed(8)+
											" ("+(Math.min(pickaxe.durability+durability, pickaxe.maxDurability)/pickaxe.maxDurability*100).toFixed(2)+"%, +"+
											(randDurability*100).toFixed(2)+"% of your investment), "+((pickaxe.durability+durability)*24*60).toFixed(2)+" minute(s) of mining remaining minimum)");
									}else{
										client.say(nick, "You don't have enough gold");
									}
								}else{
									client.say(nick, "You don't have a pickaxe");
								}
							});
						}else{
							client.say(nick, "You are not connected.");
						}
					});
				}else{
					client.say(nick, "Nope. You don't use it correctly. Maybe try the \"repair help\" command ?");
				}
			}
			
			reg = new RegExp("^repair help","i")
			res = msg.match(reg);
			if (res){
				client.say(nick, "https://github.com/nolialsea/botcoin");
			}
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	},
	//Display gold
	showGold: function(nick, msg){
		let reg = new RegExp("^gold","i")
		let res = msg.match(reg);
		if (res){
			User.getByNick(nick, function(user){
				if (!user){
					client.say(nick, "You are not connected");
				}else{
					client.say(nick, "You have "+user.gold.toFixed(8)+" gold");
				}
			});
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	},
	//Show pickaxe
	showPickaxe: function(nick, msg){
		let reg = new RegExp("^pick(axe)?","i")
		let res = msg.match(reg);
		if (res){
			User.getByNick(nick, function(user){
				if (!user){
					client.say(nick, "You are not connected");
				}else{
					Pickaxe.getByUserId(user.id, function(pickaxe){
						if (!pickaxe){
							client.say(nick, "You don't have a pickaxe");
						}else{
							client.say(nick, "["+pickaxe.name+"]\tPower: "+pickaxe.power.toFixed(8)+
								"\tDurability: "+pickaxe.durability.toFixed(8)+"/"+pickaxe.maxDurability.toFixed(8)+
								" ("+(pickaxe.durability/pickaxe.maxDurability*100).toFixed(2)+
								"%, "+(pickaxe.durability*24*60).toFixed(2)+" minute(s) of mining remaining minimum)");
							client.say(nick, "Upgrades: "+pickaxe.upgrade+"\tRepairs: "+pickaxe.repair);
							client.say(nick, "Total gold mined: "+pickaxe.totalGoldMined.toFixed(8));
							client.say(nick, "Total investment: "+pickaxe.totalInvestment.toFixed(8));
						}
					});
				}
			});
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	},
	//Show delta
	showDelta: function(nick, msg){
		let reg = new RegExp("^delta","i")
		let res = msg.match(reg);
		if (res){
			User.getByNick(nick, function(user){
				if (!user){
					client.say(nick, "You are not connected");
				}else{
					const delta = Math.floor(Date.now()/1000) - user.lastMining;
					client.say(nick, "Last mining was "+(delta/60).toFixed(2)+" minutes ago");
				}
			});
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	},
	//Show help
	showHelp: function(nick, msg){
		let reg = new RegExp("^help","i")
		let res = msg.match(reg);
		if (res){
			client.say(nick, "https://github.com/nolialsea/botcoin");
			return true; //Return true if command is found
		}
		return false;	//Return false if command is not found
	}
}

client.addListener('pm', function (nick, message) {
	console.log("Message from "+nick+" : "+message.match(/^[^ ]*/i)[0]+"...");	//Log only the first word, mostly for privacy reasons
	for (var key in command) {
	    command[key](nick, message);
	}
});

client.addListener('join', function (channel, nick, message) {
	console.log(nick + ' joined');
	if (nick === cfg.nickname){
		//client.say(cfg.channels[0], "Type \"/msg "+cfg.nickname+" help\" to know more about me.");
	}

});

client.addListener('names', function (channel, nicks) {
	console.log('NAMES : ['+Object.keys(nicks).join(', ')+']');

});

client.addListener('nick', function(oldNick, newNick, channels, message) {
	User.updateNick(oldNick, newNick);
	console.log(oldNick + ' is now named '+newNick);
});

client.addListener('part', function(channel, nick, reason, message) {
	User.removeNick(nick);
	console.log(nick + ' parted');
});

client.addListener('quit', function(nick, reason, channels, message) {
	User.removeNick(nick);
	console.log(nick + ' quited');
});

client.addListener('error', function(message) {
	console.log('error: ', message);
});