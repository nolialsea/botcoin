# BotCoin
IRC bot that allows to mine worthless virtual gold, designed specifically for the #CBNA

This page will change as new features are implemented or defined on paper, so make sure to take a look often
The project is still WIP, you can submit ideas for new features here : https://github.com/nolialsea/botcoin/issues/1

## Current features

### Configurations
#### Pickaxe creation
- Power ratio : 3
- Max durability ratio: 3  
#### Pickaxe upgrade
- Power ratio : 1
- Max durability ratio : 1  
#### Pickaxe repair
- Durability ratio : 1
#### Pickaxe damages when mining
- Damage ratio : 0.5

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
Mining damages the equipped pickaxe proportionnally to its power (`random()*delta*damageRatio`).
A pickaxe that is completely broken is **DESTROYED**, but you can repair damaged ones.
You can invest gold to upgrade them, the quality of the upgrade is based on the amount of gold invested, same for pickaxe creation.
I try to keep the maths of how much gold a pickaxe can mine (before repairs and upgrades) in its lifetime to roughly double its investment.
So due to randomness, a pickaxe have a small chance to actually mine less gold than how much you invested on it

### Pickaxes creation
Command : `create INVESTMENT NAME`
Creating a pickaxe gives it `random()*INVESTMENT*creationPowerRatio` power and `random()*INVESTMENT*creationMaxDurabilityRatio` max durability.
`INVESTMENT` is the amount of gold you want to spend to forge this pickaxe, it should be a positive floating number
`INVESTMENT` should be a positive floating number, so `0.42`, `42` and `.42` have a correct format
NAME can be 32 characters long and contain pretty much any character, even spaces
You can only have one pickaxe, and creating a new one will **DELETE** the previous

### Pickaxe upgrade
Command : `upgrade INVESTMENT`
Upgrading a pickaxe adds `random()*INVESTMENT*upgradePowerRatio` to its power and `random()*INVESTMENT*upgradeMaxDurabilityRatio` to max durability, but does not repair it
`INVESTMENT` should be a positive floating number, so `0.42`, `42` and `.42` have a correct format
Pickaxes keep track of how many upgrades they have... I may or may not use it later

### Pickaxe repair
Command : `repair INVESTMENT`
Repairing a pickaxe adds `random()*INVESTMENT*repairRatio` to its durability, but is limited by the max durability of the pickaxe. Excess investment is **LOST**
`INVESTMENT` should be a positive floating number, so `0.42`, `42` and `.42` have a correct format

### Show pickaxe
Command : `pickaxe` or `pick`  
Shows detailed description of your equiped pickaxe

### Leveling
You can invest gold and time to gain experience.  
`train` to train and `level` or `lvl` to display your level  
Training **COUNT AS A MINING** since it takes time (it updates your lastMining), but does not give you gold.
You gain `random()*delta` levels when doing a training.  
Your level allows you to :
- Increase your base power when hand mining (does not affect pickaxe)
- Increase your daily mining bonus (see super mining, not implemented yet)

### Show delta
Command : `delta`  
Shows the time since the last mining. Use this to be sure you won't break your pickaxe.

### Show gold
Command : `gold`  
Simply shows you how much gold you have.

## Planned features

### Economy update
Be able to give/receive money to/from other players.  
Sell/buy pickaxes ? Causes an issue with the "one pickaxe per player" rule.  
Economy needs ways to spend gold, here are some solutions :  
- Enchantments : invest a lot of gold to have a small chance of succeeding enchanting your pickaxe (see enchantments)
- Gamble : invest gold and sometimes get much more gold, but the rest of the time you always lose. (see gambling)
- Leveling : invest gold to level up and gain bonuses (see leveling)  


### Super mining ( Daily mining )
Command : `supermine`  
Its a mining that you can use **once a day** (from 00:00:00 to 23:59:59), but it does not count as a normal mining (does not update lastMining).  
It gives you `level*random()` gold.

### Enchantments
You can invest gold to have a chance of enchanting your pickaxe.  
`enchant INVESTMENT` will create a random enchantment, on your pickaxe, of power and magnitude relative to the investment.  
Enchantments ideas :
- [UNIQUE] Double hit : Gives `(sigmoid(ENCHANT_POWER)-0.5)*200`% chance of hitting two times with the pickaxe when mining, second it have power reduced by half, but damages are applied only on the first hit.  
ENCHANT_POWER is `INVESTMENT*random()`
- [EXAMPLE] Glow in the light : Useless

### Guilds
Find allies to mine with !  
Mining while being part of a guild makes everyone share a percentage of their mining gains with others. This allows a more regular income, and better progression of the less wealthier.  
Guilds also have the possibility to impose a tax on members, giving a percentage of the gold mined by every member to the guild.  
Taxes gold earned by the guild can only be used on guild upgrades (they still have to be defined).  

### Gambling
Gamble your money and lose it like real men.  
We can imagine many mini games for that, it's still largely up to debate.  
Mini games ideas :  
- `gamble INVESTMENT MULTIPLICATOR`, where CHANCES is a positive integer greater than one.  
So `gamble 0.1 10` will give you 1 gold 1/10 times, the 9/10 others you will lose 0.1
- `randomize INVESTMENT` will give you `INVESTMENT*random()*2` gold.

### PvP/PvE events
Zombies attack, general melee, arena, duels, you can go wild on this one  
- [PvE] Army of the dead  
Random PvE event that sends a message in the channel to warn players that, during X minutes, they can use the `kill zombies` command **once** to fight with their pickaxes (only pickaxes damages count, you do not want to fight zombies with bare hands). At the end of the event, all players that participated are recompensed with gold, proportional to the total damage they did (totalDamage/nbPlayer gold).
- [PvP] Bar fight  
Random PvP event that sends a message in the channel to warn players that, during X minutes, they can use the `bar fight` command **once** to fight with their bare hands. At the end of the event, the players that participated and did the most damage is recompensed with gold, proportional to the total damage dealth in the bar fight. Level bonuses applies for hand fighting.

## Potential features

### World map
Explore, travel, find dungeons, slay dragons, fuck princesses.
You may explore the map tile by tile, but also modify it('s description).
Tiles can have stats like `goldRatio`, `monsterLevel`, `isDungeon`...

### Web interface
Access and manage your account from the web
I don't like this idea so much, since this project is an IRC bot...
But just a general overview of what happens would be cool to have, especially if there is a map

### Slaves
They mine or repair you pickaxe automatically for you !
Maybe you can craft them a pickaxe too ?
Send them on missions ?
They will most probably die anyway.
