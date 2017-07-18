const irc = require('irc');
const cfg = require('configuration');
const User = require('user');
const Pickaxe = require('pickaxe');
const colors = require('colors');
const command = require('command');

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
	floodProtectionDelay: cfg.floodProtectionDelay,
	sasl: false,
	retryCount: 0,
	retryDelay: 2000,
	stripColors: false,
	channelPrefixes: "&#",
	messageSplit: 512,
	encoding: ''
});

if (cfg.debug){
	User.disconnectAll();
	console.log('All clients have been disconnected'.underline.red);
}

function output(to, message){
	client.say(to, message);
}

function sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t))+0.5;
}

let commandName = [
	"connect",
	"register",
	"mine",
	"createPickaxe",
	"upgradePickaxe",
	"repairPickaxe",
	"showGold",
	"showPickaxe",
	"showDelta",
	"showHelp",
	"showLevel",
	"train",
	"randomize"
]

client.addListener('pm', function (nick, message) {
	console.log("Message from "+nick+" : "+message.match(/^[^ ]*/i)[0]+"...");	//Log only the first word, mostly for privacy reasons
	for (let i=0; i<command.length; i++) {
	    command[commandName](nick, message);
	}
});

client.addListener('join', function (channel, nick, message) {
	console.log(nick + ' joined');
	if (nick === cfg.nickname){
		//output(cfg.channels[0], "Type \"/msg "+cfg.nickname+" help\" to know more about me.");
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