# BotCoin
IRC bot that allows to mine worthless virtual gold, designed by/for the #CBNA channel on Mibbit.  
You should probably check the wiki first : https://github.com/nolialsea/botcoin/wiki

This page will change as new features are implemented or defined on paper, so make sure to take a look often  
The project is still WIP, you can submit ideas for new features here : https://github.com/nolialsea/botcoin/issues/1

# Drastic changes are coming

## Planned features:
- Temporal Actions : 
  - Mining redone : alone or in a group, you can go mining for a specified amount of time. Mined gold is only earned at the end, and splitted in equal parts if mining in group. Mining alone or in group changes nothing at same level/power except a better gold repartition
  - Dungeons : same as mining but with different outcomes (different gold chances, chances to loot pickaxes). Dungeons are dangerous, and it is recommended to go in groups
  - Other types of "temporal action" with different outcomes (quests, adventures, dragon slaying, ...)
- Guilds !
  - Guild tax : Guild masters can define a tax percentage. Each time a guild member earn gold, a tax is preleved and added to the guilds bank
  - HeadQuarter : When you create a guild, you basically buy a headquarter that you can upgrade to unlock bonuses. Guild members are considered in the headquarter when they are available (have no temporal action in process)
    - Bank : Tax money is stored in here. You can upgrade its max durability and repair it when damaged. Repairing it is cheapest than upgrading it
    - Defenses : They defend your headquarter during attacks, dealing damages to opponents. They do not need a player operating it, and cannot be completely destroyed
    - War machines : They are used when attacking another guild, dealing damages to opponents. Every war machine require at least one player to operate it, and can be completely destroyed
  - Guild PvP : Guilds can attack other Guilds headquarters to steal their gold.
    - A guild master can order a war on a specified guild. Each available member then have 10 minutes to confirm that they participate
    - War machines are automatically used by attackers if enough members can operate them
    - Defender guild automatically use defenses by every available defender guild member
    - The war takes form of iterations, repeated until one side is defeated or surrenders.
    - During the attack, each side inflict damages at the same time, total damages is calculated by the base level of players, power of their pickaxes and power of war machines or defenses.
      - The sum of these damages is applied respectively on war machines and defenses durability if any
      - If there is no war machine anymore and the defenders does more damages than attackers, the defenders win the war
      - If attackers breaks the defenses, they then damage the bank until open
      - When the bank is opened, attackers win the war and returns to their headquarter with all the banks gold
    
