import type { GameMode } from "@yapzi/shared";

export type ModeStatus = "live" | "roadmap";

export interface ModeBlueprint {
  mode: GameMode;
  title: string;
  status: ModeStatus;
  shortPitch: string;
  summary: string;
  playerRange: string;
  bestFor: string;
  hostTip: string;
  loop: string[];
  vibeTags: string[];
  accent: string;
}

export const modeCatalog: ModeBlueprint[] = [
  {
    mode: "imposter",
    title: "Imposter",
    status: "live",
    shortPitch: "One word is wrong. The room has to smell it out.",
    summary:
      "Social deduction with bluffing, suspicion, and a reveal that lands hardest when everyone leans in.",
    playerRange: "3-10 players",
    bestFor: "Crews who like reading the room and calling bluffs.",
    hostTip: "Use short rounds and lock the lobby before the role reveal.",
    loop: ["instructions", "role", "action", "timer", "vote", "reveal", "recap"],
    vibeTags: ["deduction", "bluffing", "high tension"],
    accent: "#7cf7ff"
  },
  {
    mode: "drawing",
    title: "Cursed Drawing",
    status: "live",
    shortPitch: "Draw fast, guess faster, survive the chaos modifiers.",
    summary:
      "A sketch-based round that rewards speed, terrible handwriting, and the kind of guesses friends only make in a room together.",
    playerRange: "3-12 players",
    bestFor: "Groups that want a loud, kinetic round with visible progress.",
    hostTip: "Keep timers short and show the canvas early so the room feels alive.",
    loop: ["instructions", "action", "timer", "guess", "reveal", "recap"],
    vibeTags: ["drawing", "speed", "meme energy"],
    accent: "#ffd35c"
  },
  {
    mode: "expose",
    title: "Expose Vote",
    status: "live",
    shortPitch: "Vote on who fits the prompt. Drama is the feature.",
    summary:
      "A quick-vote pressure cooker built for accusations, overthinking, and instant scoreboard spikes.",
    playerRange: "3-12 players",
    bestFor: "Friend groups that thrive on fast polling and public reactions.",
    hostTip: "Rotate prompts fast so the room never has time to cool off.",
    loop: ["instructions", "vote", "reveal", "recap"],
    vibeTags: ["voting", "chaos", "speedrun"],
    accent: "#ff74cc"
  },
  {
    mode: "confession",
    title: "Confession",
    status: "live",
    shortPitch: "Anonymous truths, then a room full of guesses.",
    summary:
      "Players drop a secret or story and then scramble to identify who wrote what before the reveal lands.",
    playerRange: "2-12 players",
    bestFor: "Late-night rooms that want vulnerability with a playful edge.",
    hostTip: "Keep the prompts light enough that people want to answer honestly.",
    loop: ["instructions", "action", "guess", "reveal", "recap"],
    vibeTags: ["truth", "guessing", "story time"],
    accent: "#9dff6a"
  },
  {
    mode: "split",
    title: "Split or Steal",
    status: "live",
    shortPitch: "Secret choices, public betrayals, instant drama.",
    summary:
      "A compact two-player tension mode where trust, greed, and timing decide whether the room laughs or groans.",
    playerRange: "2-8 players",
    bestFor: "Pairs or smaller rooms that want a final round with real stakes.",
    hostTip: "Save it for the end of a session when everyone is already invested.",
    loop: ["instructions", "action", "reveal", "recap"],
    vibeTags: ["dilemma", "betrayal", "closer"],
    accent: "#ffa85c"
  },
  {
    mode: "undercover",
    title: "Undercover",
    status: "roadmap",
    shortPitch: "A polished cousin to the imposter loop.",
    summary:
      "Roadmap social deduction mode focused on secret identities, language traps, and sharper role asymmetry.",
    playerRange: "4-10 players",
    bestFor: "Future crew nights that want a tighter deduction meta.",
    hostTip: "Treat this as a future expansion of the deduction lane.",
    loop: ["instructions", "role", "action", "vote", "reveal", "recap"],
    vibeTags: ["roadmap", "deduction", "identity"],
    accent: "#8f93ff"
  },
  {
    mode: "drawing-telephone",
    title: "Drawing Telephone",
    status: "roadmap",
    shortPitch: "A chain of sketches and guesses that drifts into nonsense.",
    summary:
      "A future party mode that turns a prompt into a relay race of interpretation, memory, and visual sabotage.",
    playerRange: "4-12 players",
    bestFor: "Big rooms that like long reveal chains and group reactions.",
    hostTip: "Use this as the chain-based party mode after drawing lands.",
    loop: ["instructions", "action", "timer", "guess", "reveal", "recap"],
    vibeTags: ["relay", "art chaos", "telephone"],
    accent: "#6ef0d4"
  },
  {
    mode: "quiplash",
    title: "Quiplash",
    status: "roadmap",
    shortPitch: "Prompt answers with vote pressure and punchline energy.",
    summary:
      "A future prompt-vs-prompt card battler built for witty rooms and audience voting.",
    playerRange: "3-12 players",
    bestFor: "Players who want pure joke writing and audience buy-in.",
    hostTip: "Keep this as the comedy mode in the long-term setlist.",
    loop: ["instructions", "action", "vote", "reveal", "recap"],
    vibeTags: ["comedy", "prompt", "vote"],
    accent: "#ffcc66"
  },
  {
    mode: "codenames",
    title: "Codenames",
    status: "roadmap",
    shortPitch: "Teams, clue cards, and the pressure of one wrong guess.",
    summary:
      "A future word-association mode for larger rooms that want team strategy instead of direct accusation.",
    playerRange: "4-12 players",
    bestFor: "Bigger groups that want team play and a smarter win condition.",
    hostTip: "Use it when you want team identity instead of open-room chaos.",
    loop: ["instructions", "action", "guess", "reveal", "recap"],
    vibeTags: ["teams", "words", "strategy"],
    accent: "#84a9ff"
  },
  {
    mode: "truth-or-dare",
    title: "Truth or Dare",
    status: "roadmap",
    shortPitch: "Quick dares, honest answers, and high replayability.",
    summary:
      "A classic social mode for smaller, louder rooms that want a simple decision loop with plenty of replay value.",
    playerRange: "2-12 players",
    bestFor: "Casual sessions and warm-up rounds before the heavier games.",
    hostTip: "This can be the easiest on-ramp for first-time players.",
    loop: ["instructions", "action", "reveal", "recap"],
    vibeTags: ["icebreaker", "party", "classic"],
    accent: "#ff8ad6"
  },
  {
    mode: "would-you-rather",
    title: "Would You Rather",
    status: "roadmap",
    shortPitch: "Binary chaos with surprisingly good room debate.",
    summary:
      "A future quick-hit mode built for fast opinions, loud takes, and zero-stakes arguments between friends.",
    playerRange: "2-12 players",
    bestFor: "Icebreakers, warm-ups, and low-friction party flow.",
    hostTip: "Great as the first mode in a longer session.",
    loop: ["instructions", "vote", "reveal", "recap"],
    vibeTags: ["opinion", "icebreaker", "fast"],
    accent: "#b3ff6f"
  },
  {
    mode: "never-have-i-ever",
    title: "Never Have I Ever",
    status: "roadmap",
    shortPitch: "Fast confessions, fingers up, and immediate reveals.",
    summary:
      "A future game-night staple for rooms that want quick self-revelation and easy group energy.",
    playerRange: "2-12 players",
    bestFor: "When you want a familiar party loop with a modern presentation.",
    hostTip: "Use as an early-session warmer before the deduction modes.",
    loop: ["instructions", "action", "reveal", "recap"],
    vibeTags: ["confessional", "classic", "warm-up"],
    accent: "#ffb36c"
  },
  {
    mode: "whos-most-likely",
    title: "Who's Most Likely To",
    status: "roadmap",
    shortPitch: "The room points, laughs, and absolutely remembers everything.",
    summary:
      "A future prompt-based vote mode where reputation becomes the entire scoreboard.",
    playerRange: "3-12 players",
    bestFor: "Groups with long-running inside jokes and social memory.",
    hostTip: "Keep the prompt list sharp, not mean.",
    loop: ["instructions", "vote", "reveal", "recap"],
    vibeTags: ["social", "vote", "reputation"],
    accent: "#69d7ff"
  },
  {
    mode: "guess-who-said-it",
    title: "Guess Who Said It",
    status: "roadmap",
    shortPitch: "Anonymous lines, then the room plays detective.",
    summary:
      "A future quote-identification mode where text, memory, and roast culture all collide.",
    playerRange: "3-12 players",
    bestFor: "Rooms that love receipts and quote archaeology.",
    hostTip: "Let the guesses breathe so the reveal lands better.",
    loop: ["instructions", "guess", "reveal", "recap"],
    vibeTags: ["anonymous", "quotes", "guessing"],
    accent: "#ff7d9b"
  }
];

export const liveModeCatalog = modeCatalog.filter((entry) => entry.status === "live");

export const liveModeQueue = liveModeCatalog.map((entry) => entry.mode);

export const launchPresets: Record<string, GameMode[]> = {
  starter: ["imposter", "confession", "drawing", "expose", "split"],
  pressure: ["imposter", "expose", "split", "confession", "drawing"],
  showcase: ["drawing", "confession", "imposter", "expose", "split"]
};

export function getModeBlueprint(mode: GameMode): ModeBlueprint {
  return modeCatalog.find((entry) => entry.mode === mode) ?? modeCatalog[0];
}
