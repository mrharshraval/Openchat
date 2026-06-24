const ADJECTIVES = [
  "Curious", "Golden", "Brave", "Happy", "Clever", "Silent", "Cheerful", "Sleepy",
  "Swift", "Gentle", "Jolly", "Lucky", "Bright", "Kind", "Calm", "Eager",

  "Mighty", "Fearless", "Playful", "Witty", "Radiant", "Charming", "Lively", "Bold",
  "Nimble", "Friendly", "Wise", "Fierce", "Sunny", "Shiny", "Dreamy", "Cosmic",

  "Peaceful", "Vibrant", "Glowing", "Daring", "Energetic", "Magical", "Graceful",
  "Patient", "Reliable", "Adventurous", "Epic", "Elegant", "Gentle", "Honest",

  "Humble", "Inventive", "Joyful", "Keen", "Luminous", "Majestic", "Noble",
  "Optimistic", "Proud", "Quick", "Resilient", "Sincere", "Thoughtful",

  "Upbeat", "Valiant", "Warm", "Youthful", "Zesty", "Agile", "Breezy", "Crystal",
  "Dazzling", "Electric", "Fluffy", "Glorious", "Heroic", "Infinite", "Jovial",

  "Legendary", "Mellow", "Mystic", "Neat", "Orbiting", "Polished", "Royal",
  "Sparkling", "Tranquil", "Unique", "Vivid", "Whimsical", "Zen", "Amber",

  "Azure", "Blissful", "Copper", "Emerald", "Frosty", "Ivory", "Jade", "Lavender",
  "Midnight", "Pearl", "Ruby", "Silver", "Topaz", "Velvet", "Wild", "Wonderous"
];

const NOUNS = [
  "Fox", "Panda", "Koala", "Bear", "Dolphin", "Tiger", "Lion", "Rabbit", "Eagle",
  "Owl", "Otter", "Seal", "Wolf", "Deer", "Squirrel", "Falcon",

  "Phoenix", "Dragon", "Comet", "Meteor", "Galaxy", "Star", "Moon", "Sun",
  "Nebula", "Aurora", "Planet", "Cosmos", "Orbit", "Rocket", "Asteroid",

  "River", "Ocean", "Lake", "Mountain", "Forest", "Valley", "Canyon", "Waterfall",
  "Thunder", "Breeze", "Cloud", "Rain", "Snowflake", "Storm", "Wave",

  "Penguin", "Leopard", "Jaguar", "Panther", "Cheetah", "Moose", "Buffalo",
  "Hawk", "Raven", "Swan", "Peacock", "Parrot", "Turtle", "Shark", "Whale",

  "Compass", "Lantern", "Crown", "Diamond", "Crystal", "Gem", "Treasure",
  "Anchor", "Arrow", "Shield", "Sword", "Beacon", "Bridge", "Castle",

  "Explorer", "Voyager", "Guardian", "Wanderer", "Ranger", "Scholar",
  "Artist", "Inventor", "Pioneer", "Captain", "Champion", "Dreamer",

  "Maple", "Oak", "Willow", "Cedar", "Lotus", "Rose", "Orchid", "Tulip",
  "Sunflower", "Lavender", "Clover", "Fern", "Bamboo", "Pine",

  "Pixel", "Circuit", "Vector", "Nova", "Echo", "Pulse", "Signal",
  "Vertex", "Prism", "Matrix", "Spectrum", "Fusion", "Quantum"
];

export function generateNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

export function getOrInitializeNickname(): string {
  if (typeof window === "undefined") return "Guest User";
  let nickname = sessionStorage.getItem("moots_nickname");
  if (!nickname) {
    nickname = generateNickname();
    sessionStorage.setItem("moots_nickname", nickname);
  }
  return nickname;
}
