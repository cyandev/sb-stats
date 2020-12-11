/*
Adapted from my reforge optimiser
*/

/*
Reforges are stored here as functions which modify the base stats object, applying the reforge n times. Reforges also need to have their name in REFORGES_NAMES at the same index as their function. 
base function: (stats,n) => { stats.str += 0 * n; stats.cd += 0 * n; stats["as"] += 0 * n}
*/
let REFORGES = {
  c: [
    (stats, n) => { if (stats.stones) stats.cd += 5 * n }, //silky
    (stats, n) => { stats.str += 4 * n }, //forceful
    (stats, n) => { if (stats.stones) {stats.str += 1 * n; stats.cd += 3 * n; stats["as"] += 1 * n }}, // bloody
    (stats, n) => { stats.str += 2 * n; stats.cd += 3 * n } //shaded
  ],
  u: [
    (stats, n) => { if (stats.stones) stats.cd += 6 * n }, //silky
    (stats, n) => { stats.str += 5 * n }, //forceful
    (stats, n) => { stats.str += 1 * n; stats.cd += 2 * n; stats["as"] += 2 * n }, //strange
    (stats, n) => { if (stats.stones) { stats.str += 1 * n; stats.cd += 4 * n; stats["as"] += 1 * n }}, // bloody
    (stats, n) => { stats.str += 3 * n; stats.cd += 4 * n } //shaded
  ],
  r: [
    (stats, n) => { if (stats.stones) stats.cd += 8 * n }, //silky
    (stats, n) => { stats.str += 7 * n }, //forceful
    (stats, n) => { if (stats.stones) { stats.str += 1 * n; stats.cd += 5 * n; stats["as"] += 1 * n }}, // bloody
    (stats, n) => { stats.str += 4 * n; stats.cd += 5 * n } //shaded
  ],
  e: [
    (stats, n) => { stats.str += 3 * n; stats.cd += 1 * n; stats["as"] += 4 * n }, //strange
    (stats, n) => { stats.str += 10 * n }, //forceful
    (stats, n) => {stats.str += 2 * n; stats.cd += 6 * n; stats["as"]+= 2 *n}, //bloody
    (stats, n) => { stats.str += 5 * n; stats.cd += 6 * n } //shaded
  ],
  l: [
    (stats, n) => { stats.str += 8 * n; stats.cd += 8 * n }, //strong
  ],
  m: [
    (stats, n) => { stats.str += 12 * n; stats.cd += 12 * n }, //strong
  ]
}
let REFORGES_NAMES = { //"bizarre","ominous","simple","pleasant","shiny","vivid","pretty","keen","unpleasant","superior","forceful","hurtful","strong","demonic","zealous","godly","itchy","strange","silky","bloody",
  c: ["silky", "forceful", "bloody","shaded"],
  u: ["silky", "forceful", "strange", "bloody","shaded"],
  r: ["silky", "forceful", "bloody","shaded"],
  e: ["strange", "forceful","bloody","shaded"],
  l: ["strong","shaded"],
  m: ["strong"]
}
const RARITY_NAMES = {
  c: "common",
  u: "uncommon",
  r: "rare",
  e: "epic",
  l: "legendary",
  m: "mythic"
}
class TalismanSet {
  constructor(base) {
    this.base = base;
    this.reforges = {};
    //create reforges list with all 0s
    for (let rarity in REFORGES) {
      this.reforges[rarity] = Array.from({ length: REFORGES[rarity].length }, () => 0)
    }
  }
  randomize() { //radomize reforges
    for (let rarity in this.reforges) {
      for (let i = 0; i < this.base[rarity]; i++) {
        this.reforges[rarity][Math.floor(Math.random() * this.reforges[rarity].length)]++;
      }
    }
  }
  mutate() { // in a random rarity decrement one reforge and increment another
    let rarity = Object.keys(this.reforges)[Math.floor(Math.random() * Object.keys(this.reforges).length)]; //pick a random rarity
    let randomIndex = Math.floor(Math.random() * this.reforges[rarity].length); //pick a random reforge index
    if (this.reforges[rarity][randomIndex] > 0 && this.reforges[rarity].length > 1) { //make sure the specified rarity + reforge can go down and there is another reforge at the rarity
      this.reforges[rarity][randomIndex]--;
      let secondIndex = Math.floor(Math.random() * this.reforges[rarity].length);
      while (secondIndex == randomIndex) secondIndex = Math.floor(Math.random() * this.reforges[rarity].length); // not the same #
      this.reforges[rarity][secondIndex]++;
    } else {
      this.mutate(); //call it again if the random picked rarity + reforge has nothing
    }
  }
  /* 
  Score is damage formula without enchantments, item bonuses, combat skill, etc. rounded down and then multiplied by 1 + bonusattackspeed / 100 to get "average damage per normal hit time without enchantments or combat skill or weapon bonuses"
  */
  getScore() { //TODO: special stats bonuses (pots, tara helm, fabled)
    //insert pots here
    if (this.score) return this.score; //score wont change with a set
    let stats = {
      dmg: this.base.dmg,
      str: this.base.str,
      cc: this.base.cc,
      cd: this.base.cd,
      "as": this.base["as"],
      int: this.base.int,
      fer: this.base.fer,
      stones: true
    }
    //add talisman reforges
    for (let rarity in this.reforges) {
      for (let index in this.reforges[rarity]) {
        REFORGES[rarity][index](stats, this.reforges[rarity][index]);
      }
    }
    if (typeof scoreFunc != "function") {console.log(scoreFunc)}
    this.score = scoreFunc(stats);
    this.stats = stats;
    return this.score;
  }
  getUniqueData() {
    var arr = []
    for (let rarity in this.reforges) {
      arr = arr.concat(this.reforges[rarity]);
    }
    return arr;
  }
  static fromTwo(parent1, parent2) {
    let parent1Unique = parent1.getUniqueData();
    let parent2Unique = parent2.getUniqueData();
    let newUnique = [];
    /* Set two break points such that if
    bp1 = 2 and bp2 = 5
    parent1: =========
    parent2: ---------
      child: ==---====
    */
    let bp1 = Math.floor(Math.random() * parent2Unique.length) + 1;
    let bp2 = Math.floor(Math.random() * parent2Unique.length) + 1;
    while (bp2 == bp1) { //cant be equal
      bp2 = Math.floor(Math.random() * parent2Unique.length) + 1;
    }

    //create the new unique data
    if (bp1 < bp2) {
      newUnique = newUnique.concat(parent1Unique.slice(0, bp1), parent2Unique.slice(bp1, bp2), parent1Unique.slice(bp2, parent1Unique.length));
    } else {
      newUnique = newUnique.concat(parent1Unique.slice(0, bp2), parent2Unique.slice(bp2, bp1), parent1Unique.slice(bp1, parent1Unique.length));
    }
    //make a child from the new unique data
    let child = new TalismanSet(parent1.base);
    let startIndex = 0;
    for (let rarity in child.reforges) {
      child.reforges[rarity] = newUnique.slice(startIndex, startIndex + child.reforges[rarity].length);
      startIndex += child.reforges[rarity].length;
    }
    //make sure the new child's reforges / rarity sum to the correct number from base data
    for (let rarity in child.reforges) {
      while (child.reforges[rarity].reduce((t, x) => t + x) > child.base[rarity]) {
        let randomIndex = Math.floor(Math.random() * child.reforges[rarity].length);
        if (child.reforges[rarity][randomIndex] > 0) {
          child.reforges[rarity][randomIndex]--
        }
      }
      while (child.reforges[rarity].reduce((t, x) => t + x) < child.base[rarity]) {
        child.reforges[rarity][Math.floor(Math.random() * child.reforges[rarity].length)]++
      }
    }
    //return the final child
    return child;
  }

}

function doGeneration(generation, cb,n) {
  generation.sort((a, b) => (b.getScore() - a.getScore()));
  //log the winner!
  //put the top 16 into the "winners" category
  let winners = generation.slice(0, Math.floor(Math.sqrt(generation.length)));
  if ((winners.reduce((t, x) => t + x.getScore(), 0) / winners.length).toFixed(2) == winners[0].getScore().toFixed(2)) { //check if the lineage is stagnant, if it is tell the cb
    cb(generation, false,n);
    return;
  }
  //clear out the losers
  generation = [];
  //all of the winners have children with everyone, even themselves.
  for (let p1 of winners) {
    for (let p2 of winners) {
      generation.push(TalismanSet.fromTwo(p1, p2));
    }
  }
  //mutate 20%
  for (let i = 0; i < Math.floor(generation.length / 5); i++) {
    generation[Math.floor(Math.random() * generation.length)];
  }
  cb(generation, true,n);
}
var scoreFunc;
function doTalismanOptimization(base,scoreFunction) {
  let totalLineages = 10;
  let lineageSize = 1000;
  scoreFunc = scoreFunction;
  return new Promise((res,rej) => {
    let finished = 0;
    let winner = {
      getScore: () => 0
    }
    function cb(generation, cont, n) {
      if (generation[0].getScore() > winner.getScore()) {
        winner = generation[0];
      }
      if (!cont) {
        finished++;
        if (finished == totalLineages) res(winner);
      }
      if (cont) setTimeout(() => { doGeneration(generation, cb, n+1) }, 1);
    }
    for (let i = 0; i < totalLineages; i++) { // make many cocurrent generations
      doGeneration(Array.from({ length: lineageSize }, () => {
        let t = new TalismanSet(base);
        t.randomize();
        return t;
      }), cb, 0);
    }
  })
}