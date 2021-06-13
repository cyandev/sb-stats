/* eslint-disable no-unused-vars, no-undef */

var minionNameMap = {"MITHRIL": "Mithril", "COBBLESTONE": "Cobbletone", "OBSIDIAN": "Obsidian", "GLOWSTONE": "Glowstone", "GRAVEL": "Gravel", "SAND": "Sand", "CLAY": "Clay", "ICE": "Ice", "SNOW": "Snow", "COAL": "Coal", "IRON": "Iron", "GOLD": "Gold", "DIAMOND": "Diamond", "LAPIS": "Lapis", "REDSTONE": "Redstone", "EMERALD": "Emerald", "QUARTZ": "Quartz", "ENDER_STONE": "Endstone", "WHEAT": "Wheat", "MELON": "Melon", "PUMPKIN": "Pumpkin", "CARROT": "Carrot", "POTATO": "Potato", "MUSHROOM": "Mushroom", "CACTUS": "Cactus", "COCOA": "Cocoa", "SUGAR_CANE": "Sugar Cane", "NETHER_WARTS": "Nether Wart", "FLOWER": "Flower", "FISHING": "Fishing", "ZOMBIE": "Zombie", "REVENANT": "Revenant", "SKELETON": "Skeleton", "CREEPER": "Creeper", "SPIDER": "Spider", "TARANTULA": "Tarantula", "CAVESPIDER": "Cave Spider", "BLAZE": "Blaze", "MAGMA_CUBE": "Magma", "ENDERMAN": "Enderman", "GHAST": "Ghast", "SLIME": "Slime", "COW": "Cow", "PIG": "Pig", "CHICKEN": "Chicken", "SHEEP": "Sheep", "RABBIT": "Rabbit", "OAK": "Oak", "SPRUCE": "Spruce", "BIRCH": "Birch", "DARK_OAK": "Dark Oak", "ACACIA": "Acacia", "JUNGLE": "Jungle"}
var talismanClassifier = {
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
    "CANDY_RELIC": "CANDY",
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
    "LUCKY_HOOF": "HOOF",
    "ETERNAL_HOOF": "HOOF",
    "BAT_PERSON_TALISMAN": "BAT_PERSON",
    "BAT_PERSON_RING": "BAT_PERSON",
    "BAT_PERSON_ARTIFACT": "BAT_PERSON",
    "WITHER_ARTIFACT": "WITHER",
    "WITHER_RELIC": "WITHER",
    "TITANIUM_TALISMAN": "TITANIUM",
    "TITANIUM_RING": "TITANIUM",
    "TITANIUM_ARTIFACT": "TITANIUM",
    "TITANIUM_RELIC": "TITANIUM",
    "PERSONAL_DELETOR_4000": "PERSONAL_DELETOR",
    "PERSONAL_DELETOR_5000": "PERSONAL_DELETOR",
    "PERSONAL_DELETOR_6000": "PERSONAL_DELETOR",
    "PERSONAL_DELETOR_7000": "PERSONAL_DELETOR",
    "ENDER_ARTIFACT": "ENDER",
    "ENDER_RELIC": "ENDER",
    "SOULFLOW_PILE": "SOULFLOW",
    "SOULFLOW_BATTERY": "SOULFLOW",
    "SOULFLOW_SUPERCELL": "SOULFLOW"
}
var rarityNum = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2, 
  EPIC: 3,
  LEGENDARY: 4,
  MYTHIC: 5
}