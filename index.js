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

let irc = require('irc');
let fs = require('fs');
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.db');
let sqlTimestamp = "strftime('%s','now')";
let channels = ['#cbna'];
let nickname = 'BotCoin';
let shortnick = 'bc';

//Database initialisation
db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS User (login TEXT, password TEXT, nick TEXT, gold REAL, lastMining INTEGER)");
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
    floodProtectionDelay: 1000,
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

    let regMine = new RegExp("^"+shortnick+" mine","i");
    let res = message.match(regMine);
    if (res){
    	mine(nick);
    }

    let regHelp = new RegExp("^"+shortnick+" help","i");
    res = message.match(regHelp);
    if (res){
        help();
    }
});

client.addListener('pm', function (nick, message) {
    console.log('[PRIVATE] => ' + nick + ' : ' + message);

    //Connection
    let regConnect = new RegExp("^connect ([^ ]*) ([^ ]*)","i");
    let res = message.match(regConnect);
    if (res){
        if (res.length === 3){
            User.connect(nick, res[1], res[2]);
        }else{
            client.say(nick, "Error ! Use like this : \"connect LOGIN PASSWORD\"");
        }
    }

    //Registration
    let regRegister = new RegExp("^register ([^ ]*) ([^ ]*)","i");
    res = message.match(regRegister);
    if (res){
        if (res.length === 3){
            User.register(nick, res[1], res[2]);
        }else{
            client.say(nick, "Error ! Use like this : \"register LOGIN PASSWORD\"");
        }
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

function help(){
    client.say(channels[0], "Private commands :");
    client.say(channels[0], "    register LOGIN PASSWORD");
    client.say(channels[0], "    connect LOGIN PASSWORD");
    client.say(channels[0], "Channel commands :");
    client.say(channels[0], "    bc help");
    client.say(channels[0], "    bc mine");
}

function mine(nick){
    User.getByNick(nick, function(user){
        if (user === undefined){
            client.say(nick, "You are not logged in");
        }else{
            const gold = Math.random();
            let delta = Math.floor(Date.now()/1000) - user.lastMining;

            if (delta >= 60){
                db.run("UPDATE User SET gold=gold+$gold, lastMining="+sqlTimestamp+" WHERE nick=$nick", {$gold: gold, $nick: nick});
                client.say(channels[0], nick+" found "+gold.toFixed(3)+"g of gold ! Total gold for "+nick+" : "+(user.gold+gold).toFixed(3));
            }else{
                client.say(channels[0], nick+" tried to mine but is still too tired. You have to rest for at least one minute between minings.");
            }
        }
    });
}

class User{
    static register(nick, login, password){
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
            console.log(row);
            callback && callback(row);
        });
    }

    static getByNick(nick, callback){
        db.get("SELECT rowid AS id, login, nick, gold, lastMining FROM User WHERE nick=?", nick, function(err, row) {
            console.log(row);
            callback && callback(row);
        });
    }

    static updateNick(oldNick, newNick){
        db.run("UPDATE User SET nick=$newNick WHERE nick=$oldNick", {$newNick: newNick, $oldNick: oldNick});
    }

    static removeNick(nick){
        db.run("UPDATE User SET nick='none' WHERE nick=?", nick);
    }
}
