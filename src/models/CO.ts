export enum ECO {
  ANDY,
  HACHI,
  JAKE,
  MAX,
  NELL,
  RACHEL,
  SAMI,
  COLIN,
  GRIT,
  OLAF,
  SASHA,
  DRAKE,
  EAGLE,
  JAVIER,
  JESS,
  GRIMM,
  KANBEI,
  SENSEI,
  SONJA,
  ADDER,
  FLAK,
  HAWKE,
  JUGGER,
  KINDLE,
  KOAL,
  LASH,
  STURM,
  VON_BOLT,
}

export type IPower = {
  name: string;
  cost: number;
  buff: any;
  debuff: any;
} | null;

export class CO {
  name: string;
  spriteIdx: ECO;
  COP: IPower = null;
  SCOP: IPower = null;

  static powers: Record<ECO, [IPower, IPower]> = [
    [
      {
        name: "Hyper Repair",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Hyper Upgrade",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Barter",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Merchant Union",
        cost: 2,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Beat Down",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Block Rock",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Max Force",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Max Blast",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Lucky Star",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Lady Luck",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Lucky Lass",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Covering Fire",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Double Time",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Victory March",
        cost: 5,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Gold Rush",
        cost: 2,
        buff: {},
        debuff: {},
      },
      {
        name: "Power of Money",
        cost: 4,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Snipe Attack",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Super Snipe",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Blizzard",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Winter Fury",
        cost: 4,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Market Crash",
        cost: 2,
        buff: {},
        debuff: {},
      },
      {
        name: "War Bonds",
        cost: 4,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Tsunami",
        cost: 4,
        buff: {},
        debuff: {},
      },
      {
        name: "Typhoon",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Lightening Drive",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Lightening Strike",
        cost: 6,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Tower Shield",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Tower of Power",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Turbo Charge",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Overdrive",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Knuckleduster",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Haymaker",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Morale Boost",
        cost: 4,
        buff: {},
        debuff: {},
      },
      {
        name: "Samurai Spirit",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Copter Command",
        cost: 2,
        buff: {},
        debuff: {},
      },
      {
        name: "Airborne Assault",
        cost: 4,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Enhanced Vision",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Counter Break",
        cost: 2,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Sideslip",
        cost: 2,
        buff: {},
        debuff: {},
      },
      {
        name: "Sidewinder",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Brute Force",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Barbaric Blow",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Black Wave",
        cost: 5,
        buff: {},
        debuff: {},
      },
      {
        name: "Black Storm",
        cost: 4,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Overclock",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "System Crash",
        cost: 4,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Urban Blight",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "High Society",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Forced March",
        cost: 3,
        buff: {},
        debuff: {},
      },
      {
        name: "Trail of Woe",
        cost: 2,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Terrain Tactics",
        cost: 4,
        buff: {},
        debuff: {},
      },
      {
        name: "Prime Tactics",
        cost: 3,
        buff: {},
        debuff: {},
      },
    ],
    [
      {
        name: "Meteor Strike",
        cost: 6,
        buff: {},
        debuff: {},
      },
      {
        name: "Meteor Strike II",
        cost: 4,
        buff: {},
        debuff: {},
      },
    ],
    [
      null,
      {
        name: "Ex Machina",
        cost: 10,
        buff: {},
        debuff: {},
      },
    ],
  ];

  constructor(index: ECO) {
    this.spriteIdx = index;
    const name = (Object.values(ECO)[index] as string).toLowerCase();
    this.name = name
      .split("_")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ");
    this.COP = CO.powers[index][0];
    this.COP = CO.powers[index][1];
  }
}
