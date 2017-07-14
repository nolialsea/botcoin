# BotCoin
IRC bot that allows to mine worthless virtual gold, designed specifically for the #CBNA

The project is still WIP, you can submit ideas for new features here : https://github.com/nolialsea/botcoin/issues/1

## Current features
### Commands are all PMs now !
There will be some channel commands to trade, show how much gold you have, show your pickaxe, etc, but frequent commands will be PM only.
This is to avoid unnecessary spamming on the main channel, and give it a more "gaming" feeling.
I plan to use the channel only for events announcement, pvp and pve, but not "solo" commands or notifications. 

### Show help
Command : `help`
Send you the link to this page. I don't want to write a command line documentation since everything is here, so yeah, deal with it.

### Register
Command : `register LOGIN PASSWORD`
Register a new account and connect to it automatically. You should only do it once.
The password is badly encrypted in md5, not even salted, so don't use your usual passwords (maybe i will salt it some day, but not much more).

### Connect
Command : `connect LOGIN PASSWORD`
Connect to an existing account.
You will need to reconnect basically after each time you quit the channel
You keep the connection even when you change your nick

### Connected
Command : `connected`
Tells you if you are connected or not

### Mine
Command : `mine`
Mine `random()*delta` gold, where delta is the number of days since the last mining (or registration) as a floating point.
Basically, you will earn between 0 and 1 gold per day with your bare hands (pickaxes allows to mine more)
Using this command only computes the gold you earned since the last mining, it "updates" your wallet if you prefer, but does not allow to earn more so spamming it is useless.
Mining damages your pickaxe if you have one. If the pickaxe break during the mining, the gold that should have been mined by the pickaxe is lost.

### Pickaxes
You can use your currencies to craft, upgrade, or repair pickaxes.
Mining damages the equipped pickaxe.
A pickaxe that is completely broken is **DESTROYED**, but you can repair damaged ones.
You can invest gold to upgrade them, the quality of the upgrade is based on the amount of gold invested, same for pickaxe creation.
I try to keep the maths of how much gold a pickaxe can mine (before repairs and upgrades) in its lifetime to roughly double its investment, but can actually be between x0 and x4.
So due to randomness, a pickaxe have a small chance to actually mine less gold than how much you invested on it
- Creating a pickaxe gives it `random()*investment*4` power and `random()*investment` max durability, so an investment of 1 gold will create a pickaxe that lives in average for one day and will mine in average 2 gold (can greatly vary)
- Upgrading a pickaxe adds `random()*investment*4` to its power and `random()*investment` to max durability, but does not repair it
- Repairing a pickaxe restores `random()*investment*3` durability points, limited by the max durability.
- Mining subtracts `random()*delta` to the durability, where delta represent the number of days since last mining as a floating point (so you can lose between zero and one durability point per day, depending on how lucky you are)
- Mining gives `random()*power*delta` more gold (it adds to the normal "punch mining")

#### Short version : Investing 1 gold will create a pickaxe that mines 0 to 4 gold per day, for 0 to ??? days (roughly).

### Pickaxes creation
Command : `create INVESTMENT NAME`
Creating a pickaxe gives it `random()*INVESTMENT*4` power and `random()*INVESTMENT` max durability, so an investment of 1 gold will create a pickaxe that lives in average for one day and will mine in average 2 gold
`INVESTMENT` is the amount of gold you want to spend to forge this pickaxe, it should be a positive floating number
`INVESTMENT` should be a positive floating number, so `0.42`, `42` and `.42` have a correct format
NAME can be 32 characters long and contain pretty much any character, even spaces
You can only have one pickaxe, and creating a new one will **DELETE** the previous

### Pickaxe upgrade
Command : `upgrade INVESTMENT`
Upgrading a pickaxe adds `random()*INVESTMENT*4` to its power and `random()*INVESTMENT` to max durability, but does not repair it
`INVESTMENT` should be a positive floating number, so `0.42`, `42` and `.42` have a correct format
Pickaxes keep track of how many upgrades they have... I may or may not use it later

### Pickaxe repair
Command : `repair INVESTMENT`
Repairing a pickaxe adds `random()*INVESTMENT*3` to its durability, but is limited by the max durability of the pickaxe. Excess investment is **LOST**
`INVESTMENT` should be a positive floating number, so `0.42`, `42` and `.42` have a correct format

### Show gold
Command : `gold`
Simply shows you how much gold you have.

### Show pickaxe
Command : `pickaxe`
Shows detailed description of your equiped pickaxe

### Show delta
Command : `delta`
Shows the time since the last mining. Use this to be sure you won't break your pickaxe. You can't do much if that's the case for now anyway.

## Planned features

### Trading
Be able to give and receive money from others.
Sell/buy pickaxes ?
Up to debate.

### Gambling
Gamble your money and lose it like real men.
We can imagine many mini games for that, it's still largely up to debate.

## Potential features
At first the bot was going to only be a fun currency mining tool without much usefulness for a very small IRC community, but why not as well make it a whole IRC game.

### World map
Explore, travel, find dungeons, slay dragons, fuck princesses.

### PvP/PvE events
Zombies attack, general melee, arena, duels, you can go wild on this one

### Web interface
Access and manage your account from the web
I don't like this idea so much, since this project is an IRC bot...
But just a general overview of what happens would be cool to have, especially if there is a map

### Slaves
They mine or repair you pickaxe automatically for you !
Maybe you can craft them a pickaxe too ?
Send them to missions ?
They will most probably die anyway.
