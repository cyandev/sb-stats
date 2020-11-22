module.exports = {
  pets: { /* Adapted from leaphant/skyblock-stats, sky.lea.moe */
    "MEGALODON": {
      skin: "http://textures.minecraft.net/texture/a94ae433b301c7fb7c68cba625b0bd36b0b14190f20e34a7c8ee0d9de06d53b9",
      type: "fishing",
      baseStats: {},
      perLevelStats: {
        str: 0.5,
        mf: 0.1,
        fer: 0.05,
      },
    },
    "GRIFFIN": {
      "skin": "http://textures.minecraft.net/texture/4c27e3cb52a64968e60c861ef1ab84e0a0cb5f07be103ac78da67761731f00c8",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        cc: 0.1,
        cd: 0.5,
        str: 0.25,
        mf: 0.1,
        int: 0.1
      }
    },
    "BAT": {
      "skin": "http://textures.minecraft.net/texture/382fc3f71b41769376a9e92fe3adbaac3772b999b219c9d6b4680ba9983e527",
      "type": "mining",
      "baseStats": {},
      "perLevelStats": {
        int: 1,
        spd: 0.05
      }
    },
    "BLAZE": {
      "skin": "./public/img/blaze.png",
      "type": "combat",
      "baseStats": {
        def: 10
      },
      "perLevelStats": {
        int: 1,
        def: 0.2
      }
    },
    "CHICKEN": {
      "skin": "http://textures.minecraft.net/texture/7f37d524c3eed171ce149887ea1dee4ed399904727d521865688ece3bac75e",
      "type": "farming",
      "baseStats": {},
      "perLevelStats": {
        hp: 2
      }
    },
    "HORSE": {
      "skin": "http://textures.minecraft.net/texture/36fcd3ec3bc84bafb4123ea479471f9d2f42d8fb9c5f11cf5f4e0d93226",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        int: 0.5,
        spd: 0.25
      }
    },
    "JERRY": {
      "skin": "http://textures.minecraft.net/texture/822d8e751c8f2fd4c8942c44bdb2f5ca4d8ae8e575ed3eb34c18a86e93b",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        int: -1
      }
    },
    "OCELOT": {
      "skin": "http://textures.minecraft.net/texture/5657cd5c2989ff97570fec4ddcdc6926a68a3393250c1be1f0b114a1db1",
      "type": "foraging",
      "baseStats": {},
      "perLevelStats": {
        spd: 0.5,
        fer: 0.1,
      }
    },
    "PIGMAN": {
      "skin": "http://textures.minecraft.net/texture/63d9cb6513f2072e5d4e426d70a5557bc398554c880d4e7b7ec8ef4945eb02f2",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        str: 0.5,
        def: 0.5,
        fer: 0.05,
      }
    },
    "RABBIT": {
      "skin": "http://textures.minecraft.net/texture/117bffc1972acd7f3b4a8f43b5b6c7534695b8fd62677e0306b2831574b",
      "type": "farming",
      "baseStats": {},
      "perLevelStats": {
        hp: 1,
        spd: 0.2
      }
    },
    "SHEEP": {
      "skin": "http://textures.minecraft.net/texture/64e22a46047d272e89a1cfa13e9734b7e12827e235c2012c1a95962874da0",
      "type": "alchemy",
      "baseStats": {},
      "perLevelStats": {
        int: 1,
        ad: 0.5
      }
    },
    "SILVERFISH": {
      "skin": "http://textures.minecraft.net/texture/da91dab8391af5fda54acd2c0b18fbd819b865e1a8f1d623813fa761e924540",
      "type": "mining",
      "baseStats": {},
      "perLevelStats": {
        def: 1,
        hp: 0.2
      }
    },
    "WITHER_SKELETON": {
      "skin": "http://textures.minecraft.net/texture/f5ec964645a8efac76be2f160d7c9956362f32b6517390c59c3085034f050cff",
      "type": "mining",
      "baseStats": {},
      "perLevelStats": {
        cd: 0.25,
        def: 0.25,
        str: 0.25,
        int: 0.25,
        cc: 0.05
      }
    },
    "SKELETON_HORSE": {
      "skin": "http://textures.minecraft.net/texture/47effce35132c86ff72bcae77dfbb1d22587e94df3cbc2570ed17cf8973a",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        int: 1,
        spd: 0.5
      }
    },
    "WOLF": {
      "skin": "http://textures.minecraft.net/texture/dc3dd984bb659849bd52994046964c22725f717e986b12d548fd169367d494",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        hp: 0.5,
        spd: 0.2,
        td: 0.1,
        cd: 0.1
      }
    },
    "ENDERMAN": {
      "skin": "http://textures.minecraft.net/texture/6eab75eaa5c9f2c43a0d23cfdce35f4df632e9815001850377385f7b2f039ce1",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        cd: 0.75
      }
    },
    "PHOENIX": {
      "skin": "http://textures.minecraft.net/texture/23aaf7b1a778949696cb99d4f04ad1aa518ceee256c72e5ed65bfa5c2d88d9e",
      "type": "combat",
      "baseStats": {
        int: 50,
        str: 10
      },
      "perLevelStats": {
        int: 1,
        str: 1
      }
    },
    "MAGMA_CUBE": {
      "skin": "http://textures.minecraft.net/texture/38957d5023c937c4c41aa2412d43410bda23cf79a9f6ab36b76fef2d7c429",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        hp: 0.5,
        def: 0.333,
        str: 0.2
      }
    },
    "FLYING_FISH": {
      "skin": "http://textures.minecraft.net/texture/40cd71fbbbbb66c7baf7881f415c64fa84f6504958a57ccdb8589252647ea",
      "type": "fishing",
      "baseStats": {},
      "perLevelStats": {
        hp: 0.5,
        def: 0.5
      }
    },
    "BLUE_WHALE": {
      "skin": "http://textures.minecraft.net/texture/dab779bbccc849f88273d844e8ca2f3a67a1699cb216c0a11b44326ce2cc20",
      "type": "fishing",
      "baseStats": {},
      "perLevelStats": {
        hp: 2
      }
    },
    "TIGER": {
      "skin": "http://textures.minecraft.net/texture/fc42638744922b5fcf62cd9bf27eeab91b2e72d6c70e86cc5aa3883993e9d84",
      "type": "combat",
      "baseStats": {
        str: 5
      },
      "perLevelStats": {
        cd: 0.5,
        str: 0.1,
        cc: 0.05,
        fer: 0.1
      }
    },
    "LION": {
      "skin": "http://textures.minecraft.net/texture/38ff473bd52b4db2c06f1ac87fe1367bce7574fac330ffac7956229f82efba1",
      "type": "foraging",
      "baseStats": {},
      "perLevelStats": {
        str: 0.5,
        spd: 0.25
      }
    },
    "PARROT": {
      "skin": "http://textures.minecraft.net/texture/5df4b3401a4d06ad66ac8b5c4d189618ae617f9c143071c8ac39a563cf4e4208",
      "type": "alchemy",
      "baseStats": {},
      "perLevelStats": {
        int: 1,
        cd: 0.1
      }
    },
    "SNOWMAN": {
      "skin": "http://textures.minecraft.net/texture/11136616d8c4a87a54ce78a97b551610c2b2c8f6d410bc38b858f974b113b208",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        dmg: 0.25,
        str: 0.25,
        cd: 0.25
      }
    },
    "TURTLE": {
      "skin": "http://textures.minecraft.net/texture/212b58c841b394863dbcc54de1c2ad2648af8f03e648988c1f9cef0bc20ee23c",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        def: 1,
        hp: 1
      }
    },
    "BEE": {
      "skin": "http://textures.minecraft.net/texture/7e941987e825a24ea7baafab9819344b6c247c75c54a691987cd296bc163c263",
      "type": "farming",
      "baseStats": {},
      "perLevelStats": {
        int: 0.5,
        str: 0.25,
        spd: 0.1
      }
    },
    "ENDER_DRAGON": {
      "skin": "http://textures.minecraft.net/texture/aec3ff563290b13ff3bcc36898af7eaa988b6cc18dc254147f58374afe9b21b9",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        str: 0.5,
        cd: 0.5,
        cc: 0.1
      }
    },
    "GUARDIAN": {
      "skin": "http://textures.minecraft.net/texture/221025434045bda7025b3e514b316a4b770c6faa4ba9adb4be3809526db77f9d",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        int: 1,
        def: 0.5
      }
    },
    "SQUID": {
      "skin": "http://textures.minecraft.net/texture/01433be242366af126da434b8735df1eb5b3cb2cede39145974e9c483607bac",
      "type": "fishing",
      "baseStats": {},
      "perLevelStats": {
        int: 1,
        hp: 1
      }
    },
    "GIRAFFE": {
      "skin": "http://textures.minecraft.net/texture/176b4e390f2ecdb8a78dc611789ca0af1e7e09229319c3a7aa8209b63b9",
      "type": "foraging",
      "baseStats": {},
      "perLevelStats": {
        hp: 1,
        cc: 0.05
      }
    },
    "ELEPHANT": {
      "skin": "http://textures.minecraft.net/texture/7071a76f669db5ed6d32b48bb2dba55d5317d7f45225cb3267ec435cfa514",
      "type": "farming",
      "baseStats": {},
      "perLevelStats": {
        hp: 1,
        int: 0.75
      }
    },
    "MONKEY": {
      "skin": "http://textures.minecraft.net/texture/13cf8db84807c471d7c6922302261ac1b5a179f96d1191156ecf3e1b1d3ca",
      "type": "foraging",
      "baseStats": {},
      "perLevelStats": {
        spd: 0.2,
        int: 0.5
      }
    },
    "SPIDER": {
      "skin": "http://textures.minecraft.net/texture/cd541541daaff50896cd258bdbdd4cf80c3ba816735726078bfe393927e57f1",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        cc: 0.1,
        str: 0.1
      }
    },
    "ENDERMITE": {
      "skin": "http://textures.minecraft.net/texture/5a1a0831aa03afb4212adcbb24e5dfaa7f476a1173fce259ef75a85855",
      "type": "mining",
      "baseStats": {},
      "perLevelStats": {
        int: 1
      }
    },
    "GHOUL": {
      "skin": "http://textures.minecraft.net/texture/87934565bf522f6f4726cdfe127137be11d37c310db34d8c70253392b5ff5b",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        hp: 1,
        int: 0.7,
        fer: 0.05,
      }
    },
    "JELLYFISH": {
      "skin": "http://textures.minecraft.net/texture/913f086ccb56323f238ba3489ff2a1a34c0fdceeafc483acff0e5488cfd6c2f1",
      "type": "alchemy",
      "baseStats": {},
      "perLevelStats": {
        hp: 2
      }
    },
    "PIG": {
      "skin": "http://textures.minecraft.net/texture/621668ef7cb79dd9c22ce3d1f3f4cb6e2559893b6df4a469514e667c16aa4",
      "type": "farming",
      "baseStats": {},
      "perLevelStats": {
        spd: 0.25
      }
    },
    "ROCK": {
      "skin": "http://textures.minecraft.net/texture/cb2b5d48e57577563aca31735519cb622219bc058b1f34648b67b8e71bc0fa",
      "type": "mining",
      "baseStats": {},
      "perLevelStats": {
        def: 2,
        td: 0.1
      }
    },
    "SKELETON": {
      "skin": "http://textures.minecraft.net/texture/fca445749251bdd898fb83f667844e38a1dff79a1529f79a42447a0599310ea4",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        cc: 0.15,
        cd: 0.3
      }
    },
    "ZOMBIE": {
      "skin": "http://textures.minecraft.net/texture/56fc854bb84cf4b7697297973e02b79bc10698460b51a639c60e5e417734e11",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        hp: 1,
        cd: 0.25
      }
    },
    "DOLPHIN": {
      "skin": "http://textures.minecraft.net/texture/cefe7d803a45aa2af1993df2544a28df849a762663719bfefc58bf389ab7f5",
      "type": "fishing",
      "baseStats": {},
      "perLevelStats": {
        scc: 0.05,
        int: 1
      }
    },
    "BABY_YETI": {
      "skin": "http://textures.minecraft.net/texture/ab126814fc3fa846dad934c349628a7a1de5b415021a03ef4211d62514d5",
      "type": "fishing",
      "baseStats": {},
      "perLevelStats": {
        str: 0.4,
        int: 0.74
      }
    },
    "GOLEM": {
      "skin": "http://textures.minecraft.net/texture/89091d79ea0f59ef7ef94d7bba6e5f17f2f7d4572c44f90f76c4819a714",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        hp: 1.5,
        str: 0.25
      }
    },
    "HOUND": {
      "skin": "http://textures.minecraft.net/texture/b7c8bef6beb77e29af8627ecdc38d86aa2fea7ccd163dc73c00f9f258f9a1457",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        str: 0.4,
        "as": 0.15,
        fer: 0.05,
      }
    },
    "TARANTULA": {
      "skin": "http://textures.minecraft.net/texture/8300986ed0a04ea79904f6ae53f49ed3a0ff5b1df62bba622ecbd3777f156df8",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        str: 0.1,
        cc: 0.1,
        cd: 0.3
      }
    },
    "BLACK_CAT": {
      "skin": "http://textures.minecraft.net/texture/e4b45cbaa19fe3d68c856cd3846c03b5f59de81a480eec921ab4fa3cd81317",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        spd: 0.25,
        int: 1
      }
    },
    "SPIRIT": {
      "skin": "http://textures.minecraft.net/texture/8d9ccc670677d0cebaad4058d6aaf9acfab09abea5d86379a059902f2fe22655",
      "type": "combat",
      "baseStats": {},
      "perLevelStats": {
        spd: 0.3,
        int: 1
      }
    }
  },
  petLeveling: { /* Adapted from sky.lea.moe */
    table: [100, 110, 120, 130, 145, 160, 175, 190, 210, 230, 250, 275, 300, 330, 360, 400, 440, 490, 540, 600, 660, 730, 800, 880, 960, 1050, 1150, 1260, 1380, 1510, 1650, 1800, 1960, 2130, 2310, 2500, 2700, 2920, 3160, 3420, 3700, 4000, 4350, 4750, 5200, 5700, 6300, 7000, 7800, 8700, 9700, 10800, 12000, 13300, 14700, 16200, 17800, 19500, 21300, 23200, 25200, 27400, 29800, 32400, 35200, 38200, 41400, 44800, 48400, 52200, 56200, 60400, 64800, 69400, 74200, 79200, 84700, 90700, 97200, 104200, 111700, 119700, 128200, 137200, 146700, 156700, 167700, 179700, 192700, 206700, 221700, 237700, 254700, 272700, 291700, 311700, 333700, 357700, 383700, 411700, 441700, 476700, 516700, 561700, 611700, 666700, 726700, 791700, 861700, 936700, 1016700, 1101700, 1191700, 1286700, 1386700, 1496700, 1616700, 1746700, 1886700, 0],
    rarityOffset: {
      COMMON: 0,
      UNCOMMON: 6,
      RARE: 11,
      EPIC: 15,
      LEGENDARY: 19
    },
    total: {
      COMMON: 5624785,
      UNCOMMON: 8644220,
      RARE: 12626665,
      EPIC: 18608500,
      LEGENDARY: 25353230
    }
  },
  petItems: {
    WASHED_UP_SOUVENIR: {
      name: "Washed Up Souvenir",
      description: "§7§7Increases §3α Sea §3Creature Chance §7by §a5",
      stats: {
        add: {scc: 5}
      }
    },
    ANTIQUE_REMEDIES: {
      description: "§7§7Increases the pet's §c❁ §cStrength §7by §a80%",
      name: "Antique Remedies",
      stats: {
        multiply: {str: 1.8}
      }
    },
    PET_ITEM_ALL_SKILLS_BOOST_COMMON: {
      description: "§7Gives +§a10% §7pet exp for all skills",
      name: "All Skills Exp Boost",
    },
    PET_ITEM_BIG_TEETH_COMMON: {
      description: "§7Increases §9Crit Chance §7by §a5%",
      name: "Big Teeth",
      stats: {
        add: {cc: 5},
        multiply: {}
      }
    },
    PET_ITEM_IRON_CLAWS_COMMON: {
      description: "§7Increases the pet's §9Crit Damage §7by §a40% §7and §9Crit Chance §7by §a40%",
      name: "Iron Claws",
      stats: {
        add: {},
        multiply: {cc: 1.4, cd: 1.4}
      }
    },
    PET_ITEM_SHARPENED_CLAWS_UNCOMMON: {
      description: "§7Increases §9Crit Damage §7by §a15%",
      name: "Sharpened Claws",
      stats: {
        add: {cd: 15},
        multiply: {}
      }
    },
    PET_ITEM_HARDENED_SCALES_UNCOMMON: {
      description: "§7Increases §aDefense §7by §a25",
      name: "Hardened Scales",
      stats: {
        add: {def: 25},
        multiply: {}
      }
    },
    PET_ITEM_BUBBLEGUM: {
      description: "§7Your pet fuses its power with placed §aOrbs §7to give them §a2x §7duration",
      name: "Bubblegum",
    },
    PET_ITEM_LUCKY_CLOVER: {
      description: "§7Increases §bMagic Find §7by §a7",
      name: "Lucky Clover",
    },
    PET_ITEM_TEXTBOOK: {
      description: "§7Increases the pet's §bIntelligence §7by §a100%",
      name: "Textbook",
      stats: {
        add: {},
        multiply: {int: 2}
      }
    },
    PET_ITEM_SADDLE: {
      description: "§7Increase horse speed by §a50% §7 and jump boost by §a100%",
      name: "Saddle"
    },
    PET_ITEM_EXP_SHARE: {
      description: "§7While unequipped this pet gains §a25% §7of the equipped pet's xp, this is §7split between all pets holding the item.",
      name: "EXP Share"
    },
    PET_ITEM_TIER_BOOST: {
      description: "§7Boosts the §ararity §7of your pet by 1 tier!",
      name: "Tier Boost"
    },
    PET_ITEM_COMBAT_SKILL_BOOST_COMMON: {
      description: "§7Gives +§a20% §7pet exp for Combat",
      name: "Combat Exp Boost"
    },
    PET_ITEM_COMBAT_SKILL_BOOST_UNCOMMON: {
      description: "§7Gives +§a30% §7pet exp for Combat",
      name: "Combat Exp Boost"
    },
    PET_ITEM_COMBAT_SKILL_BOOST_RARE: {
      description: "§7Gives +§a40% §7pet exp for Combat",
      name: "Combat Exp Boost"
    },
    PET_ITEM_COMBAT_SKILL_BOOST_EPIC: {
      description: "§7Gives +§a50% §7pet exp for Combat",
      name: "Combat Exp Boost"
    },
    PET_ITEM_FISHING_SKILL_BOOST_COMMON: {
      description: "§7Gives +§a20% §7pet exp for Fishing",
      name: "Fishing Exp Boost"
    },
    PET_ITEM_FISHING_SKILL_BOOST_UNCOMMON: {
      description: "§7Gives +§a30% §7pet exp for Fishing",
      name: "Fishing Exp Boost"
    },
    PET_ITEM_FISHING_SKILL_BOOST_RARE: {
      description: "§7Gives +§a40% §7pet exp for Fishing",
      name: "Fishing Exp Boost"
    },
    PET_ITEM_FISHING_SKILL_BOOST_EPIC: {
      description: "§7Gives +§a50% §7pet exp for Fishing",
      name: "Fishing Exp Boost"
    },
    PET_ITEM_FORAGING_SKILL_BOOST_COMMON: {
      description: "§7Gives +§a20% §7pet exp for Foraging",
      name: "Foraging Exp Boost"
    },
    PET_ITEM_FORAGING_SKILL_BOOST_UNCOMMON: {
      description: "§7Gives +§a30% §7pet exp for Foraging",
      name: "Foraging Exp Boost"
    },
    PET_ITEM_FORAGING_SKILL_BOOST_RARE: {
      description: "§7Gives +§a40% §7pet exp for Foraging",
      name: "Foraging Exp Boost"
    },
    PET_ITEM_FORAGING_SKILL_BOOST_EPIC: {
      description: "§7Gives +§a50% §7pet exp for Foraging",
      name: "Foraging Exp Boost"
    },
    PET_ITEM_MINING_SKILL_BOOST_COMMON: {
      description: "§7Gives +§a20% §7pet exp for Mining",
      name: "Mining Exp Boost"
    },
    PET_ITEM_MINING_SKILL_BOOST_UNCOMMON: {
      description: "§7Gives +§a30% §7pet exp for Mining",
      name: "Mining Exp Boost"
    },
    PET_ITEM_MINING_SKILL_BOOST_RARE: {
      description: "§7Gives +§a40% §7pet exp for Mining",
      name: "Mining Exp Boost"
    },
    PET_ITEM_MINING_SKILL_BOOST_EPIC: {
      description: "§7Gives +§a50% §7pet exp for Mining",
      name: "Mining Exp Boost"
    },
    PET_ITEM_FARMING_SKILL_BOOST_COMMON: {
      description: "§7Gives +§a20% §7pet exp for Farming",
      name: "Farming Exp Boost"
    },
    PET_ITEM_FARMING_SKILL_BOOST_UNCOMMON: {
      description: "§7Gives +§a30% §7pet exp for Farming",
      name: "Farming Exp Boost"
    },
    PET_ITEM_FARMING_SKILL_BOOST_RARE: {
      description: "§7Gives +§a40% §7pet exp for Farming",
      name: "Farming Exp Boost"
    },
    PET_ITEM_FARMING_SKILL_BOOST_EPIC: {
      description: "§7Gives +§a50% §7pet exp for Farming",
      name: "Farming Exp Boost"
    }
  },
  skillNames: ["alchemy","combat","enchanting","farming","fishing","foraging","mining","taming"],
  skillNamesToAchievements: {
    "alchemy": "concoctor",
    "combat": "combat",
    "enchanting": "augmentation",
    "farming": "harvester",
    "fishing": "angler",
    "foraging": "gatherer",
    "mining": "excavator",
    "taming": "domesticator"
  },
  excludedSkills: ["carpentry","runecrafting","catacombs","healer","mage","berserk","archer","tank"],
  skillStats: {
    "combat": {
      stat: "cc",
      table: [0,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5]
    },
    "foraging": {
      stat: "str",
      table: [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    },
    "enchanting": {
      stat: "int",
      table: [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    },
    "alchemy": {
      stat: "int",
      table: [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    }
  },
  xp_table: [0,50,125,200,300,500,750,1000,1500,2000,3500,5000,7500,10000,15000,20000,30000,50000,75000,100000,200000,300000,400000,500000,600000,700000,800000,900000,1000000,1100000,1200000,1300000,1400000,1500000,1600000,1700000,1800000,1900000,2000000,2100000,2200000,2300000,2400000,2500000,2600000,2750000,2900000,3100000,3400000,3700000,4000000],
  xp_table_runecrafting: [0,50,100,125,160,200,250,315,400,500,625,785,1000,1250,1600,2000,2465,3125,4000,5000,6200,7800,9800,12200,15300,19050],
  xp_table_60: [0,50,125,200,300,500,750,1000,1500,2000,3500,5000,7500,10000,15000,20000,30000,50000,75000,100000,200000,300000,400000,500000,600000,700000,800000,900000,1000000,1100000,1200000,1300000,1400000,1500000,1600000,1700000,1800000,1900000,2000000,2100000,2200000,2300000,2400000,2500000,2600000,2750000,2900000,3100000,3400000,3700000,4000000,4300000,4600000,4900000,5200000,5500000,5800000,6100000,6400000,6700000,7000000],
  xp_table_catacombs: [0,50,75,110,160,230,330,470,670,950,1340,1890,2665,3760,5260,7380,10300,14400,20000,27600,38000,52500,71500,97000,132000,180000,243000,328000,445000,600000,800000,1065000,1410000,1900000,2500000,3300000,4300000,5600000,7200000,9200000,12000000,15000000,19000000,24000000,30000000,38000000,48000000,60000000,75000000,93000000,116250000],
  xp_table_slayer: [0,5,10,185,800,4000,15000,80000,300000,600000],
  xp_table_slayer_wolf: [0,10,15,225,1250,3500,15000,80000,300000,600000],
  slayerStats: {
    spider: {
      cd: [0,1,2,3,4,6,8,8,11,14],
      cc: [0,0,0,0,0,0,0,1,1,1]
    },
    wolf: {
      cd: [0,0,0,0,0,1,1,3,3,3]
    }
  },
  minionNames: ["COBBLESTONE", "OBSIDIAN", "GLOWSTONE", "GRAVEL", "SAND", "CLAY", "ICE", "SNOW", "COAL", "IRON", "GOLD", "DIAMOND", "LAPIS", "REDSTONE", "EMERALD", "QUARTZ", "ENDER_STONE", "WHEAT", "MELON", "PUMPKIN", "CARROT", "POTATO", "MUSHROOM", "CACTUS", "COCOA", "SUGAR_CANE", "NETHER_WARTS", "FLOWER", "FISHING", "ZOMBIE", "REVENANT", "SKELETON", "CREEPER", "SPIDER", "TARANTULA", "CAVESPIDER", "BLAZE", "MAGMA_CUBE", "ENDERMAN", "GHAST", "SLIME", "COW", "PIG", "CHICKEN", "SHEEP", "RABBIT", "OAK", "SPRUCE", "BIRCH", "DARK_OAK", "ACACIA", "JUNGLE"],
  minionCrafts: {
    "COBBLESTONE": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 16}, {item: "ENCHANTED_name", quantity: 32}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}], 

    "OBSIDIAN": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 16}, {item: "ENCHANTED_name", quantity: 32}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}], 

    "GLOWSTONE": [null, {item: "name_DUST", quantity: 128}, {item: "name_DUST", quantity: 256}, {item: "name_DUST", quantity: 512}, {item: "ENCHANTED_name_DUST", quantity: 8}, {item: "ENCHANTED_name_DUST", quantity: 24}, {item: "ENCHANTED_name_DUST", quantity: 64}, {item: "ENCHANTED_name_DUST", quantity: 128}, {item: "ENCHANTED_name_DUST", quantity: 256}, {item: "ENCHANTED_name_DUST", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 16}], 

    "GRAVEL": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_FLINT", quantity: 8}, {item: "ENCHANTED_FLINT", quantity: 16}, {item: "ENCHANTED_FLINT", quantity: 32}, {item: "ENCHANTED_FLINT", quantity: 64}, {item: "ENCHANTED_FLINT", quantity: 128}, {item: "ENCHANTED_FLINT", quantity: 256}, {item: "ENCHANTED_FLINT", quantity: 512}], 

    "SAND": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 16}, {item: "ENCHANTED_name", quantity: 32}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}], 

    "CLAY": [null, {item: "name_BALL", quantity: 80}, {item: "name_BALL", quantity: 160}, {item: "name_BALL", quantity: 320}, {item: "name_BALL", quantity: 512}, {item: "ENCHANTED_name_BALL", quantity: 8}, {item: "ENCHANTED_name_BALL", quantity: 16}, {item: "ENCHANTED_name_BALL", quantity: 32}, {item: "ENCHANTED_name_BALL", quantity: 64}, {item: "ENCHANTED_name_BALL", quantity: 128}, {item: "ENCHANTED_name_BALL", quantity: 256}, {item: "ENCHANTED_name_BALL", quantity: 512}], 

    "ICE": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "PACKED_name", quantity: 128}, {item: "PACKED_name", quantity: 256}, {item: "PACKED_name", quantity: 512}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}], 

    "SNOW": [null, null, {item: "name_BLOCK", quantity: 32}, {item: "name_BLOCK", quantity: 64}, {item: "name_BLOCK", quantity: 128}, {item: "name_BLOCK", quantity: 256}, {item: "name_BLOCK", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}, {item: "ENCHANTED_name_BLOCK", quantity: 16}, {item: "ENCHANTED_name_BLOCK", quantity: 32}, {item: "ENCHANTED_name_BLOCK", quantity: 64}, {item: "ENCHANTED_name_BLOCK", quantity: 128}], 

    "COAL": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}], 

    "IRON": [null, {item: "name_INGOT", quantity: 80}, {item: "name_INGOT", quantity: 160}, {item: "name_INGOT", quantity: 320}, {item: "name_INGOT", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}], 

    "GOLD": [null, {item: "name_INGOT", quantity: 80}, {item: "name_INGOT", quantity: 160}, {item: "name_INGOT", quantity: 320}, {item: "name_INGOT", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}], 

    "DIAMOND": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}], 

    "LAPIS": [null, {item: "INK_SACK:4", quantity: 32}, {item: "INK_SACK:4", quantity: 64}, {item: "ENCHANTED_name_LAZULI", quantity: 8}, {item: "ENCHANTED_name_LAZULI", quantity: 24}, {item: "ENCHANTED_name_LAZULI", quantity: 64}, {item: "ENCHANTED_name_LAZULI", quantity: 128}, {item: "ENCHANTED_name_LAZULI", quantity: 256}, {item: "ENCHANTED_name_LAZULI", quantity: 512}, {item: "ENCHANTED_name_LAZULI_BLOCK", quantity: 8}, {item: "ENCHANTED_name_LAZULI_BLOCK", quantity: 16}, {item: "ENCHANTED_name_LAZULI_BLOCK", quantity: 32}], 
    
    "REDSTONE": [null, {item: "name", quantity: 128}, {item: "name", quantity: 256}, {item: "name", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}, {item: "ENCHANTED_name_BLOCK", quantity: 16}], 

    "EMERALD": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}], 

    "QUARTZ": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}],  

    "ENDER_STONE": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_ENDSTONE", quantity: 8}, {item: "ENCHANTED_ENDSTONE", quantity: 16}, {item: "ENCHANTED_ENDSTONE", quantity: 32}, {item: "ENCHANTED_ENDSTONE", quantity: 64}, {item: "ENCHANTED_ENDSTONE", quantity: 128}, {item: "ENCHANTED_ENDSTONE", quantity: 256}, {item: "ENCHANTED_ENDSTONE", quantity: 512}], 

    "WHEAT": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "HAY_BLOCK", quantity: 96}, {item: "HAY_BLOCK", quantity: 192}, {item: "HAY_BLOCK", quantity: 384}, {item: "HAY_BLOCK", quantity: 512}, {item: "ENCHANTED_HAY_BLOCK", quantity: 8}, {item: "ENCHANTED_HAY_BLOCK", quantity: 16}, {item: "ENCHANTED_HAY_BLOCK", quantity: 32}], 

    "MELON": [null, {item: "name", quantity: 256}, {item: "name", quantity: 512}, {item: "name", quantity: 1152}, {item: "name", quantity: 2304}, {item: "ENCHANTED_name", quantity: 4608}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}, {item: "ENCHANTED_name_BLOCK", quantity: 16}], 

    "PUMPKIN": [null, {item: "name", quantity: 80}, {item: "name", quantity: 160}, {item: "name", quantity: 320}, {item: "name", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 16}, {item: "ENCHANTED_name", quantity: 32}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}], 

    "CARROT": [null, {item: "name_ITEM", quantity: 128}, {item: "name_ITEM", quantity: 256}, {item: "name_ITEM", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_GOLDEN_name", quantity: 8}, {item: "ENCHANTED_GOLDEN_name", quantity: 16}], 

    "POTATO": [null, {item: "name_ITEM", quantity: 128}, {item: "name_ITEM", quantity: 256}, {item: "name_ITEM", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_BAKED_name", quantity: 8}, {item: "ENCHANTED_BAKED_name", quantity: 16}], 

    "MUSHROOM": [null, {item: "RED_name", quantity: 80}, {item: "RED_name", quantity: 160}, {item: "RED_name", quantity: 320}, {item: "RED_name", quantity: 512}, {item: "ENCHANTED_RED_name", quantity: 8}, {item: "ENCHANTED_RED_name", quantity: 16}, {item: "ENCHANTED_RED_name", quantity: 32}, {item: "ENCHANTED_RED_name", quantity: 64}, {item: "ENCHANTED_RED_name", quantity: 128}, {item: "ENCHANTED_RED_name", quantity: 256}, {item: "ENCHANTED_RED_name", quantity: 512}], 

    "CACTUS": [null, {item: "name", quantity: 128}, {item: "name", quantity: 256}, {item: "name", quantity: 512}, {item: "ENCHANTED_name_GREEN", quantity: 8}, {item: "ENCHANTED_name_GREEN", quantity: 24}, {item: "ENCHANTED_name_GREEN", quantity: 64}, {item: "ENCHANTED_name_GREEN", quantity: 128}, {item: "ENCHANTED_name_GREEN", quantity: 256}, {item: "ENCHANTED_name_GREEN", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 16}], 

    "COCOA": [null, {item: "INK_SACK:3", quantity: 80}, {item: "INK_SACK:3", quantity: 160}, {item: "INK_SACK:3", quantity: 320}, {item: "INK_SACK:3", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 24}, {item: "ENCHANTED_name", quantity: 64}, {item: "ENCHANTED_name", quantity: 128}, {item: "ENCHANTED_name", quantity: 256}, {item: "ENCHANTED_name", quantity: 512}, {item: "ENCHANTED_COOKIE", quantity: 8}], 

    "SUGAR_CANE": [null, {item: "name", quantity: 128}, {item: "name", quantity: 256}, {item: "name", quantity: 512}, {item: "ENCHANTED_SUGAR", quantity: 8}, {item: "ENCHANTED_SUGAR", quantity: 24}, {item: "ENCHANTED_SUGAR", quantity: 64}, {item: "ENCHANTED_SUGAR", quantity: 128}, {item: "ENCHANTED_SUGAR", quantity: 256}, {item: "ENCHANTED_SUGAR", quantity: 512}, {item: "ENCHANTED_name", quantity: 8}, {item: "ENCHANTED_name", quantity: 16}], 

    "NETHER_WARTS": [null, {item: "NETHER_STALK", quantity: 80}, {item: "NETHER_STALK", quantity: 160}, {item: "NETHER_STALK", quantity: 320}, {item: "NETHER_STALK", quantity: 512}, {item: "ENCHANTED_NETHER_STALK", quantity: 8}, {item: "ENCHANTED_NETHER_STALK", quantity: 16}, {item: "ENCHANTED_NETHER_STALK", quantity: 32}, {item: "ENCHANTED_NETHER_STALK", quantity: 64}, {item: "ENCHANTED_NETHER_STALK", quantity: 128}, {item: "ENCHANTED_NETHER_STALK", quantity: 256}, {item: "ENCHANTED_NETHER_STALK", quantity: 512}], 

    "FLOWER": [null, null, null, null, null, null, null, null, null, null, null, null], 

    "FISHING": [null, {item: "RAW_FISH", quantity: 64}, {item: "RAW_FISH", quantity: 128}, {item: "RAW_FISH", quantity: 256}, {item: "RAW_FISH", quantity: 512}, {item: "ENCHANTED_RAW_FISH", quantity: 8}, {item: "ENCHANTED_RAW_FISH", quantity: 24}, {item: "ENCHANTED_RAW_FISH", quantity: 64}, {item: "ENCHANTED_RAW_FISH", quantity: 128}, {item: "ENCHANTED_RAW_FISH", quantity: 256}, {item: "ENCHANTED_RAW_FISH", quantity: 512}, {item: "ENCHANTED_COOKED_FISH", quantity: 8}], 

    "ZOMBIE": [null, {item: "ROTTEN_FLESH", quantity: 80}, {item: "ROTTEN_FLESH", quantity: 160}, {item: "ROTTEN_FLESH", quantity: 320}, {item: "ROTTEN_FLESH", quantity: 512}, {item: "ENCHANTED_ROTTEN_FLESH", quantity: 8}, {item: "ENCHANTED_ROTTEN_FLESH", quantity: 16}, {item: "ENCHANTED_ROTTEN_FLESH", quantity: 32}, {item: "ENCHANTED_ROTTEN_FLESH", quantity: 64}, {item: "ENCHANTED_ROTTEN_FLESH", quantity: 128}, {item: "ENCHANTED_ROTTEN_FLESH", quantity: 256}, {item: "ENCHANTED_ROTTEN_FLESH", quantity: 512}], 

    "REVENANT": [null, null, null, null, null, null, null, null, null, null, null, null],

    "SKELETON": [null, {item: "BONE", quantity: 80}, {item: "BONE", quantity: 160}, {item: "BONE", quantity: 320}, {item: "BONE", quantity: 512}, {item: "ENCHANTED_BONE", quantity: 8}, {item: "ENCHANTED_BONE", quantity: 16}, {item: "ENCHANTED_BONE", quantity: 32}, {item: "ENCHANTED_BONE", quantity: 64}, {item: "ENCHANTED_BONE", quantity: 128}, {item: "ENCHANTED_BONE", quantity: 256}, {item: "ENCHANTED_BONE", quantity: 512}],
  //aaaaaaa
    "CREEPER": [null, {item: "SULPHUR", quantity: 80}, {item: "SULPHUR", quantity: 160}, {item: "SULPHUR", quantity: 320}, {item: "SULPHUR", quantity: 512}, {item: "ENCHANTED_GUNPOWDER", quantity: 8}, {item: "ENCHANTED_GUNPOWDER", quantity: 24}, {item: "ENCHANTED_GUNPOWDER", quantity: 64}, {item: "ENCHANTED_GUNPOWDER", quantity: 128}, {item: "ENCHANTED_GUNPOWDER", quantity: 256}, {item: "ENCHANTED_GUNPOWDER", quantity: 512}, {item: "ENCHANTED_FIREWORK_ROCKET", quantity: 16}], 

    "SPIDER": [null, {item: "STRING", quantity: 80}, {item: "STRING", quantity: 160}, {item: "STRING", quantity: 320}, {item: "STRING", quantity: 512}, {item: "ENCHANTED_STRING", quantity: 8}, {item: "ENCHANTED_STRING", quantity: 16}, {item: "ENCHANTED_STRING", quantity: 32}, {item: "ENCHANTED_STRING", quantity: 64}, {item: "ENCHANTED_STRING", quantity: 128}, {item: "ENCHANTED_STRING", quantity: 256}, {item: "ENCHANTED_STRING", quantity: 512}], 

    "TARANTULA": [null, null, null, null, null, null, null, null, null, null, null, null], 

    "CAVESPIDER": [null, {item: "SPIDER_EYE", quantity: 80}, {item: "SPIDER_EYE", quantity: 160}, {item: "SPIDER_EYE", quantity: 320}, {item: "SPIDER_EYE", quantity: 512}, {item: "ENCHANTED_SPIDER_EYE", quantity: 8}, {item: "ENCHANTED_SPIDER_EYE", quantity: 24}, {item: "ENCHANTED_SPIDER_EYE", quantity: 64}, {item: "ENCHANTED_SPIDER_EYE", quantity: 128}, {item: "ENCHANTED_SPIDER_EYE", quantity: 256}, {item: "ENCHANTED_SPIDER_EYE", quantity: 512}, {item: "ENCHANTED_FERMENTED_SPIDER_EYE", quantity: 16}], 

    "BLAZE": [null, {item: "BLAZE_ROD", quantity: 80}, {item: "BLAZE_ROD", quantity: 160}, {item: "BLAZE_ROD", quantity: 320}, {item: "BLAZE_ROD", quantity: 512}, {item: "ENCHANTED_BLAZE_POWDER", quantity: 8}, {item: "ENCHANTED_BLAZE_POWDER", quantity: 24}, {item: "ENCHANTED_BLAZE_POWDER", quantity: 64}, {item: "ENCHANTED_BLAZE_POWDER", quantity: 128}, {item: "ENCHANTED_BLAZE_POWDER", quantity: 256}, {item: "ENCHANTED_BLAZE_POWDER", quantity: 512}, {item: "ENCHANTED_BLAZE_ROD", quantity: 8}],

    "MAGMA_CUBE": [null, {item: "MAGMA_CREAM", quantity: 80}, {item: "MAGMA_CREAM", quantity: 160}, {item: "MAGMA_CREAM", quantity: 320}, {item: "MAGMA_CREAM", quantity: 512}, {item: "ENCHANTED_MAGMA_CREAM", quantity: 8}, {item: "ENCHANTED_MAGMA_CREAM", quantity: 16}, {item: "ENCHANTED_MAGMA_CREAM", quantity: 32}, {item: "ENCHANTED_MAGMA_CREAM", quantity: 64}, {item: "ENCHANTED_MAGMA_CREAM", quantity: 128}, {item: "ENCHANTED_MAGMA_CREAM", quantity: 256}, {item: "ENCHANTED_MAGMA_CREAM", quantity: 512}], 

    "ENDERMAN": [null, {item: "ENDER_PEARL", quantity: 64}, {item: "ENDER_PEARL", quantity: 128}, {item: "ENCHANTED_ENDER_PEARL", quantity: 8}, {item: "ENCHANTED_ENDER_PEARL", quantity: 24}, {item: "ENCHANTED_ENDER_PEARL", quantity: 48}, {item: "ENCHANTED_ENDER_PEARL", quantity: 96}, {item: "ENCHANTED_EYE_OF_ENDER", quantity: 8}, {item: "ENCHANTED_EYE_OF_ENDER", quantity: 24}, {item: "ENCHANTED_EYE_OF_ENDER", quantity: 48}, {item: "ENCHANTED_EYE_OF_ENDER", quantity: 96}, {item: "ENCHANTED_EYE_OF_ENDER", quantity: 192}],
     
    "GHAST": [null, {item: "GHAST_TEAR", quantity: 64}, {item: "GHAST_TEAR", quantity: 128}, {item: "GHAST_TEAR", quantity: 256}, {item: "GHAST_TEAR", quantity: 512}, {item: "ENCHANTED_GHAST_TEAR", quantity: 256}, {item: "ENCHANTED_GHAST_TEAR", quantity: 512}, {item: "ENCHANTED_GHAST_TEAR", quantity: 800}, {item: "ENCHANTED_GHAST_TEAR", quantity: 1600}, {item: "ENCHANTED_GHAST_TEAR", quantity: 3200}, {item: "ENCHANTED_GHAST_TEAR", quantity: 6400}, {item: "ENCHANTED_GHAST_TEAR", quantity: 12800}], 

    "SLIME": [null, {item: "name_BALL", quantity: 80}, {item: "name_BALL", quantity: 160}, {item: "name_BALL", quantity: 320}, {item: "name_BALL", quantity: 512}, {item: "ENCHANTED_name_BALL", quantity: 8}, {item: "ENCHANTED_name_BALL", quantity: 24}, {item: "ENCHANTED_name_BALL", quantity: 64}, {item: "ENCHANTED_name_BALL", quantity: 128}, {item: "ENCHANTED_name_BALL", quantity: 256}, {item: "ENCHANTED_name_BALL", quantity: 512}, {item: "ENCHANTED_name_BLOCK", quantity: 8}], 

    "COW": [null, {item: "RAW_BEEF", quantity: 80}, {item: "RAW_BEEF", quantity: 160}, {item: "RAW_BEEF", quantity: 320}, {item: "RAW_BEEF", quantity: 512}, {item: "ENCHANTED_RAW_BEEF", quantity: 8}, {item: "ENCHANTED_RAW_BEEF", quantity: 24}, {item: "ENCHANTED_RAW_BEEF", quantity: 64}, {item: "ENCHANTED_RAW_BEEF", quantity: 128}, {item: "ENCHANTED_RAW_BEEF", quantity: 256}, {item: "ENCHANTED_RAW_BEEF", quantity: 512}, {item: "ENCHANTED_LEATHER", quantity: 32}], 

    "PIG": [null, {item: "PORK", quantity: 80}, {item: "PORK", quantity: 160}, {item: "PORK", quantity: 320}, {item: "PORK", quantity: 512}, {item: "ENCHANTED_PORK", quantity: 8}, {item: "ENCHANTED_PORK", quantity: 24}, {item: "ENCHANTED_PORK", quantity: 64}, {item: "ENCHANTED_PORK", quantity: 128}, {item: "ENCHANTED_PORK", quantity: 256}, {item: "ENCHANTED_PORK", quantity: 512}, {item: "ENCHANTED_GRILLED_PORK", quantity: 8}], 

    "CHICKEN": [null, {item: "RAW_name", quantity: 80}, {item: "RAW_name", quantity: 160}, {item: "RAW_name", quantity: 320}, {item: "RAW_name", quantity: 512}, {item: "ENCHANTED_RAW_name", quantity: 8}, {item: "ENCHANTED_RAW_name", quantity: 16}, {item: "ENCHANTED_RAW_name", quantity: 32}, {item: "ENCHANTED_RAW_name", quantity: 64}, {item: "ENCHANTED_RAW_name", quantity: 128}, {item: "ENCHANTED_RAW_name", quantity: 256}, {item: "ENCHANTED_RAW_name", quantity: 512}], 

    "SHEEP": [null, {item: "MUTTON", quantity: 80}, {item: "MUTTON", quantity: 160}, {item: "MUTTON", quantity: 320}, {item: "MUTTON", quantity: 512}, {item: "ENCHANTED_MUTTON", quantity: 8}, {item: "ENCHANTED_MUTTON", quantity: 24}, {item: "ENCHANTED_MUTTON", quantity: 64}, {item: "ENCHANTED_MUTTON", quantity: 128}, {item: "ENCHANTED_MUTTON", quantity: 256}, {item: "ENCHANTED_MUTTON", quantity: 512}, {item: "ENCHANTED_COOKED_MUTTON", quantity: 8}], 

    "RABBIT": [null, {item: "name", quantity: 64}, {item: "name", quantity: 128}, {item: "name", quantity: 256}, {item: "name", quantity: 512}, {item: "ENCHANTED_name_FOOT", quantity: 32}, {item: "ENCHANTED_name_FOOT", quantity: 64}, {item: "ENCHANTED_name_FOOT", quantity: 128}, {item: "ENCHANTED_name_FOOT", quantity: 256}, {item: "ENCHANTED_name_FOOT", quantity: 512}, {item: "ENCHANTED_name_HIDE", quantity: 32}, {item: "ENCHANTED_name_HIDE", quantity: 64}], 

    "OAK": [null, {item: "LOG", quantity: 80}, {item: "LOG", quantity: 160}, {item: "LOG", quantity: 320}, {item: "LOG", quantity: 512}, {item: "ENCHANTED_name_LOG", quantity: 8}, {item: "ENCHANTED_name_LOG", quantity: 16}, {item: "ENCHANTED_name_LOG", quantity: 32}, {item: "ENCHANTED_name_LOG", quantity: 64}, {item: "ENCHANTED_name_LOG", quantity: 128}, {item: "ENCHANTED_name_LOG", quantity: 256}, {item: "ENCHANTED_name_LOG", quantity: 512}], 

    "SPRUCE": [null, {item: "LOG:1", quantity: 80}, {item: "LOG:1", quantity: 160}, {item: "LOG:1", quantity: 320}, {item: "LOG:1", quantity: 512}, {item: "ENCHANTED_name_LOG", quantity: 8}, {item: "ENCHANTED_name_LOG", quantity: 16}, {item: "ENCHANTED_name_LOG", quantity: 32}, {item: "ENCHANTED_name_LOG", quantity: 64}, {item: "ENCHANTED_name_LOG", quantity: 128}, {item: "ENCHANTED_name_LOG", quantity: 256}, {item: "ENCHANTED_name_LOG", quantity: 512}], 

    "BIRCH": [null, {item: "LOG:2", quantity: 80}, {item: "LOG:2", quantity: 160}, {item: "LOG:2", quantity: 320}, {item: "LOG:2", quantity: 512}, {item: "ENCHANTED_name_LOG", quantity: 8}, {item: "ENCHANTED_name_LOG", quantity: 16}, {item: "ENCHANTED_name_LOG", quantity: 32}, {item: "ENCHANTED_name_LOG", quantity: 64}, {item: "ENCHANTED_name_LOG", quantity: 128}, {item: "ENCHANTED_name_LOG", quantity: 256}, {item: "ENCHANTED_name_LOG", quantity: 512}], 
 

    "DARK_OAK": [null, {item: "LOG_2:1", quantity: 80}, {item: "LOG_2:1", quantity: 160}, {item: "LOG_2:1", quantity: 320}, {item: "LOG_2:1", quantity: 512}, {item: "ENCHANTED_name_LOG", quantity: 8}, {item: "ENCHANTED_name_LOG", quantity: 16}, {item: "ENCHANTED_name_LOG", quantity: 32}, {item: "ENCHANTED_name_LOG", quantity: 64}, {item: "ENCHANTED_name_LOG", quantity: 128}, {item: "ENCHANTED_name_LOG", quantity: 256}, {item: "ENCHANTED_name_LOG", quantity: 512}], 
 

    "ACACIA": [null, {item: "LOG_2", quantity: 80}, {item: "LOG_2", quantity: 160}, {item: "LOG_2", quantity: 320}, {item: "LOG_2", quantity: 512}, {item: "ENCHANTED_name_LOG", quantity: 8}, {item: "ENCHANTED_name_LOG", quantity: 16}, {item: "ENCHANTED_name_LOG", quantity: 32}, {item: "ENCHANTED_name_LOG", quantity: 64}, {item: "ENCHANTED_name_LOG", quantity: 128}, {item: "ENCHANTED_name_LOG", quantity: 256}, {item: "ENCHANTED_name_LOG", quantity: 512}], 


    "JUNGLE": [null, {item: "LOG:3", quantity: 80}, {item: "LOG:3", quantity: 160}, {item: "LOG:3", quantity: 320}, {item: "LOG:3", quantity: 512}, {item: "ENCHANTED_name_LOG", quantity: 8}, {item: "ENCHANTED_name_LOG", quantity: 16}, {item: "ENCHANTED_name_LOG", quantity: 32}, {item: "ENCHANTED_name_LOG", quantity: 64}, {item: "ENCHANTED_name_LOG", quantity: 128}, {item: "ENCHANTED_name_LOG", quantity: 256}, {item: "ENCHANTED_name_LOG", quantity: 512}],

  },
  minionSlots: {
    0: 5,
    5: 6,
    15: 7,
    30: 8,
    50: 9,
    75: 10,
    100: 11,
    125: 12,
    150: 13,
    175: 14,
    200: 15,
    225: 16,
    250: 17,
    275: 18,
    300: 19,
    350: 20,
    400: 21,
    450: 22,
    500: 23,
    550: 24,
    600: 25
  },
  statAlias: {
    "Redstone Pigman": "Pigman",
    "Jockey Shot Silverfish": "Silverfish",
    "Splitter Spider Silverfish": "Silverfish",
    "Invisible Creeper": "Creeper",
    "Random Slime": "Slime",
    "Emerald Slime": "Slime",
    "Zealot Enderman": "Zealot",
    "Obsidian Wither": "Obsidian Defender",
    "Unburried Zombie": "Crypt Ghoul",
    "Skeleton Emperor": "Sea Emperor",
    "Guardian Emperor": "Sea Emperor",
    "Sniper Skeleton": "Skeleton",
    "Watcher Summon Undead": "Watcher Undead",
    "Diamond Guy": "Angry Archaeologist",
    "Brood Mother Cave Spider": "Brood Mother",
    "Brood Mother Spider": "Brood Mother",
    "Fireball Magma Cube": "Magma Cube",
    "Magma Cube Boss": "Magma Boss",
    "Night Respawning Skeleton": "Respawning Skeleton",
    "Crypt Tank Zombie": "Tank Zombie",
    "Dungeon Respawning Skeleton Skull": "Dungeon Respawning Skeleton",
    "Bonzo Summon Undead": "Bonzo Undead",
    "Blaze Higher Or Lower": "Dungeon Blaze",
    "Professor Guardian Summon": "Professor Guardian",
    "Crypt Witherskeleton": "Crypt Wither Skeleton",
    "Spirit Miniboss": "Spirit Bear",
    "Tentaclees": "Fel",
    "Pet Milestone Ores Mined": "Ores Mined",
    "Pet Milestone Sea Creatures Killed": "Sea Creatures Killed",
    "Items Fished Normal": "Normal Items Fished",
    "Items Fished Treasure": "Treasures Fished",
    "Items Fished Large Treasure": "Large Treasures Fished",
    "Most Winter Snowballs Hit": "Most Snowball Hits",
    "Most Winter Damage Dealt": "Most Damage",
    "Most Winter Magma Damage Dealt": "Most Magma Damage",
    "Most Winter Cannonballs Hit": "Most Cannon Hits",
    "End Race Best Time": "End Race",
    "Chicken Race Best Time 2": "Chicken Race",
    "Foraging Race Best Time": "Foraging Race"
  },
  talismanClassifiers: {
    "SPEED_TALISMAN": "SPEED",
    "SPEED_RING": "SPEED",
    "SPEED_ARTIFACT": "SPEED",
    "FEATHER_TALISMAN": "FEATHER",
    "FEATHER_RING": "FEATHER",
    "FEATHER_ARTIFACT": "FEATHER",
    "BROKEN_PIGGY_BANK": "PIGGY",
    "CRACKED_PIGGY_BANK": "PIGGY",
    "PIGGY_BANK": "PIGGY",
    "POTION_AFFINITY_TALISMAN": "POTION_AFFINITY",
    "RING_POTION_AFFINITY": "POTION_AFFINITY",
    "ARTIFACT_POTION_AFFINITY": "POTION_AFFINITY",
    "HEALING_TALISMAN": "HEALING",
    "HEALING_TALISMAN": "HEALING",
    "HEALING_RING": "HEALING",
    "SEA_CREATURE_TALISMAN": "SEA_CREATURE",
    "SEA_CREATURE_RING": "SEA_CREATURE",
    "SEA_CREATURE_ARTIFACT": "SEA_CREATURE",
    "PERSONAL_COMPACTOR_4000": "PERSONAL_COMPACTOR",
    "PERSONAL_COMPACTOR_5000": "PERSONAL_COMPACTOR",
    "PERSONAL_COMPACTOR_6000": "PERSONAL_COMPACTOR",
    "ZOMBIE_TALISMAN": "ZOMBIE",
    "ZOMBIE_RING": "ZOMBIE",
    "ZOMBIE_ARTIFACT": "ZOMBIE",
    "INTIMIDATION_TALISMAN": "INTIMIDATION",
    "INTIMIDATION_RING": "INTIMIDATION",
    "INTIMIDATION_ARTIFACT": "INTIMIDATION",
    "BAT_TALISMAN": "BAT",
    "BAT_RING": "BAT",
    "BAT_ARTIFACT": "BAT",
    "CANDY_TALISMAN": "CANDY",
    "CANDY_RING": "CANDY",
    "CANDY_ARTIFACT": "CANDY",
    "BEASTMASTER_CREST_COMMON": "BEASTMASTER_CREST",
    "BEASTMASTER_CREST_UNCOMMON": "BEASTMASTER_CREST",
    "BEASTMASTER_CREST_RARE": "BEASTMASTER_CREST",
    "BEASTMASTER_CREST_EPIC": "BEASTMASTER_CREST",
    "BEASTMASTER_CREST_LEGENDARY": "BEASTMASTER_CREST",
    "SPIDER_TALISMAN": "SPIDER",
    "SPIDER_RING": "SPIDER",
    "SPIDER_ARTIFACT": "SPIDER",
    "WOLF_TALISMAN": "WOLF",
    "WOLF_RING": "WOLF",
    "RED_CLAW_TALISMAN": "RED_CLAW",
    "RED_CLAW_RING": "RED_CLAW",
    "RED_CLAW_ARTIFACT": "RED_CLAW",
    "HUNTER_TALISMAN": "HUNTER",
    "HUNTER_RING": "HUNTER",
    "SHADY_RING": "LUCIUS",
    "CROOKED_ARTIFACT": "LUCIUS",
    "SEAL_OF_THE_FAMILY": "LUCIUS",
    "CAT_TALISMAN": "DUNGEON_HUB",
    "LYNX_TALISMAN": "DUNGEON_HUB",
    "CHEETAH_TALISMAN": "DUNGEON_HUB",
    "CAMPFIRE_TALISMAN_.+": "CAMPFIRE",
    "WEDDING_RING_.+": "ROMERO",
    "SCARF_STUDIES": "SCARF",
    "SCARF_THESIS": "SCARF",
    "SCARF_GRIMOIRE": "SCARF",
    "TREASURE_TALISMAN": "TREASURE",
    "TREASURE_RING": "TREASURE",
    "TREASURE_ARTIFACT": "TREASURE",
    "RAGGEDY_SHARK_TOOTH_NECKLACE": "SHARK",
    "DULL_SHARK_TOOTH_NECKLACE": "SHARK",
    "HONED_SHARK_TOOTH_NECKLACE": "SHARK",
    "SHARP_SHARK_TOOTH_NECKLACE": "SHARK",
    "RAZOR_SHARP_SHARK_TOOTH_NECKLACE": "SHARK",
  }
}