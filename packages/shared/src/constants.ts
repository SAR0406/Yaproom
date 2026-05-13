/**
 * Game Constants and Rules
 * Centralized configuration for all games
 */

import type { GameType, GamePhase, GameRules } from './types.js';

// ============================================================================
// GAME RULES
// ============================================================================

export const GAME_RULES: Record<GameType, GameRules> = {
  undercover: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 10,
    roundDuration: 300000, // 5 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 4000,
      round_start: 3000,
      action: 120000,
      player_action: 120000, // 2 min per description round
      timer: 30000,
      guess: 60000,
      voting: 60000, // 1 min voting
      vote: 60000,
      reveal: 10000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  imposter: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 8,
    roundDuration: 300000,
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 4000,
      round_start: 3000,
      action: 90000,
      player_action: 90000,
      timer: 30000,
      guess: 45000,
      voting: 60000,
      vote: 60000,
      reveal: 10000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  drawing: {
    minPlayers: 3,
    maxPlayers: 12,
    defaultPlayers: 8,
    roundDuration: 300000,
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 90000,
      player_action: 90000,
      timer: 30000,
      guess: 60000,
      voting: 0,
      vote: 0,
      reveal: 15000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  'drawing-telephone': {
    minPlayers: 3,
    maxPlayers: 12,
    defaultPlayers: 10,
    roundDuration: 600000, // 10 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 90000,
      player_action: 90000, // 1.5 min per turn
      timer: 30000,
      guess: 60000,
      voting: 0,
      vote: 0,
      reveal: 20000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  quiplash: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 10,
    roundDuration: 480000, // 8 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 60000,
      player_action: 60000, // 1 min to answer
      timer: 30000,
      guess: 45000,
      voting: 45000, // 45 sec to vote
      vote: 45000,
      reveal: 10000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  codenames: {
    minPlayers: 4,
    maxPlayers: 20,
    defaultPlayers: 10,
    roundDuration: 600000, // 10 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 120000,
      player_action: 120000, // 2 min per turn (clue + guesses)
      timer: 30000,
      guess: 60000,
      voting: 0,
      vote: 0,
      reveal: 5000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  confession: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 10,
    roundDuration: 360000, // 6 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 90000,
      player_action: 90000, // 1.5 min to submit confession
      timer: 30000,
      guess: 60000,
      voting: 60000, // 1 min to vote
      vote: 60000,
      reveal: 30000, // Reveal all confessions
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  expose: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 8,
    roundDuration: 240000,
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 60000,
      player_action: 60000,
      timer: 30000,
      guess: 45000,
      voting: 45000,
      vote: 45000,
      reveal: 15000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  split: {
    minPlayers: 2,
    maxPlayers: 20,
    defaultPlayers: 8,
    roundDuration: 240000,
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 60000,
      player_action: 60000,
      timer: 30000,
      guess: 45000,
      voting: 30000,
      vote: 30000,
      reveal: 10000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
};

// ============================================================================
// PHASE ORDERING
// ============================================================================

export const PHASE_ORDER: GamePhase[] = [
  'lobby',
  'setup',
  'round_start',
  'player_action',
  'voting',
  'reveal',
  'scoring',
  'next_round',
  'match_end',
];

// ============================================================================
// GAME DESCRIPTIONS
// ============================================================================

export const GAME_DESCRIPTIONS: Record<GameType, { name: string; description: string }> = {
  undercover: {
    name: 'Undercover',
    description:
      'A hidden-role deduction game. One word divides civilians from spies. Can you spot the imposters?',
  },
  imposter: {
    name: 'Imposter',
    description:
      'One player gets a slightly different word. Blend in, discuss, and vote out the imposter.',
  },
  drawing: {
    name: 'Drawing',
    description:
      'One player draws while everyone else races to guess the prompt before time runs out.',
  },
  'drawing-telephone': {
    name: 'Drawing Telephone',
    description:
      'Write a prompt, draw a drawing, guess the picture. Watch chaos unfold with each step!',
  },
  quiplash: {
    name: 'Quiplash',
    description:
      'Answer wacky prompts with funny responses. Battle for laughs in head-to-head comedy duels.',
  },
  codenames: {
    name: 'Codenames',
    description:
      'Spymaster gives one-word clues to find secret agents. Can your team decode the message?',
  },
  confession: {
    name: 'Confession',
    description:
      'Submit anonymous confessions, vote on the wildest, then guess who said what. Full of surprises!',
  },
  expose: {
    name: 'Expose',
    description:
      'Cast suspicion, expose the most suspicious player, and survive the social chaos.',
  },
  split: {
    name: 'Split or Steal',
    description:
      'Choose split or steal in tense pairs. Trust can earn points, betrayal can win it all.',
  },
};

// ============================================================================
// PROMPTS & WORD LISTS
// ============================================================================

export const UNDERCOVER_WORD_PAIRS = [
  { civilian: 'penguin', undercover: 'puffin' },
  { civilian: 'lion', undercover: 'tiger' },
  { civilian: 'sunrise', undercover: 'sunset' },
  { civilian: 'book', undercover: 'magazine' },
  { civilian: 'piano', undercover: 'guitar' },
  { civilian: 'summer', undercover: 'winter' },
  { civilian: 'coffee', undercover: 'tea' },
  { civilian: 'laptop', undercover: 'tablet' },
  { civilian: 'hotel', undercover: 'motel' },
  { civilian: 'train', undercover: 'bus' },
  { civilian: 'bicycle', undercover: 'motorcycle' },
  { civilian: 'coin', undercover: 'token' },
  { civilian: 'doctor', undercover: 'nurse' },
  { civilian: 'soup', undercover: 'stew' },
  { civilian: 'ocean', undercover: 'sea' },
  { civilian: 'blanket', undercover: 'quilt' },
  { civilian: 'bread', undercover: 'toast' },
  { civilian: 'hat', undercover: 'cap' },
  { civilian: 'fork', undercover: 'spoon' },
  { civilian: 'eagle', undercover: 'hawk' },
];

export const DRAWING_TELEPHONE_PROMPTS = [
  'A cat wearing sunglasses',
  'Someone eating spaghetti at midnight',
  'A confused astronaut',
  'A birthday cake that went wrong',
  'A dancing dinosaur',
  'Someone stuck in an elevator',
  'A pizza delivery disaster',
  'A robot learning to smile',
  'Someone fighting an invisible enemy',
  'A very sad pizza',
  'A dog driving a car',
  'Someone being attacked by confetti',
  'A ghost trying on clothes',
  'Someone hiding from vegetables',
  'A confused penguin with a jetpack',
];

export const QUIPLASH_PROMPTS = [
  'What would you text to your crush after 3 drinks?',
  'What would a pirate put on their dating profile?',
  'What would a ghost say at a job interview?',
  'If you had to describe your ex in one sentence, what would you say?',
  'What would a cat write in their diary?',
  'What would you tell your younger self?',
  'What is the worst advice you could give someone?',
  'What would a time traveler be shocked to learn about 2024?',
  'What would you send to the group chat at 2am?',
  'What would you write on your tombstone?',
  'If you won the lottery, what\'s the dumbest thing you\'d buy?',
  'What would a potato say if it could talk?',
  'What would your pet say about you if they could text?',
  'What\'s the worst pickup line you\'ve heard?',
  'If you were a cereal, what would you be called?',
];

export const CODENAMES_WORDS = [
  'apple', 'band', 'cake', 'desk', 'eagle', 'fish', 'green', 'house', 'iron', 'jacket',
  'kite', 'lemon', 'mouse', 'noodle', 'orange', 'piano', 'queen', 'river', 'stone', 'tiger',
  'umbrella', 'violin', 'wallet', 'xylophone', 'yellow', 'zebra', 'anchor', 'balloon', 'candle', 'diamond',
  'engine', 'flower', 'galaxy', 'hammer', 'island', 'jungle', 'knight', 'ladder', 'mermaid', 'network',
  'octopus', 'palace', 'quartz', 'rocket', 'shadow', 'temple', 'universe', 'volcano', 'wizard', 'yankee',
];

export const CONFESSION_PROMPTS = [
  'What\'s something you\'ve lied to your best friend about?',
  'What do you secretly judge people for?',
  'What\'s your most embarrassing moment?',
  'What would you do if no one found out?',
  'Who in this room reminds you of someone?',
  'What\'s your biggest fear?',
  'What do you procrastinate on the most?',
  'What\'s a talent you secretly have?',
  'What do you spend way too much money on?',
  'What\'s your hottest take?',
];

// ============================================================================
// AVATAR COLORS
// ============================================================================

export const AVATAR_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Light Blue
  '#F8B88B', // Orange
  '#A8E6CF', // Light Green
  '#FFD3B6', // Peach
  '#FFAAA5', // Pink
  '#AA96DA', // Lavender
  '#FCBAD3', // Light Pink
  '#A8D8EA', // Sky Blue
  '#AA96DA', // Grape
];

export const AVATAR_EMOJIS = [
  '😀', '😎', '🤓', '😍', '🤔', '😂', '🤪', '😎',
  '👽', '🤖', '👻', '🎭', '🦄', '🦊', '🐱', '🐶',
];

// ============================================================================
// TIMEOUTS & LIMITS
// ============================================================================

export const RECONNECT_WINDOW_MS = 30000; // 30 seconds to reconnect
export const PLAYER_IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
export const ROOM_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_ACTIONS_PER_SECOND = 10;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_ANSWER_LENGTH = 200;
export const MAX_GUESS_LENGTH = 100;
export const MAX_CONFESSIONS_PER_PLAYER = 1;
export const MAX_DRAWING_STROKES = 10000;

// ============================================================================
// GAME-SPECIFIC CONFIG
// ============================================================================

export const UNDERCOVER_CONFIG = {
  CIVILIANS: 7,
  UNDERCOVER: 2,
  MR_WHITE: 1,
  ELIMINATION_ROUNDS: 3, // How many eliminations before game ends
  MR_WHITE_GUESS_TIME_MS: 15000, // 15 seconds for Mr. White final guess
};

export const QUIPLASH_CONFIG = {
  ANSWERS_PER_PROMPT: 2, // Head-to-head
  VOTING_TIME_MS: 45000, // 45 seconds to vote
  ANSWER_TIME_MS: 60000, // 1 minute to submit answer
  POINTS_FOR_WIN: 10,
  POINTS_FOR_AUDIENCE: 5,
  ROTATION_ROUNDS: 2, // Rotate audience every 2 rounds
};

export const CODENAMES_CONFIG = {
  GRID_SIZE: 5, // 5x5 grid
  RED_AGENTS: 9,
  BLUE_AGENTS: 8,
  BYSTANDERS: 7,
  ASSASSIN: 1,
  CLUE_TIME_MS: 30000, // 30 seconds
  GUESS_TIME_MS: 120000, // 2 minutes
};

export const DRAWING_TELEPHONE_CONFIG = {
  WRITE_TIME_MS: 45000, // 45 seconds to write prompt
  DRAW_TIME_MS: 90000, // 1.5 minutes to draw
  GUESS_TIME_MS: 30000, // 30 seconds to guess
};

export const CONFESSION_CONFIG = {
  SUBMISSION_TIME_MS: 90000, // 1.5 minutes to write confession
  VOTING_TIME_MS: 60000, // 1 minute to vote
  GUESS_TIME_MS: 45000, // 45 seconds to guess author
  REVEAL_DELAY_MS: 2000, // 2 seconds between reveals
};

// ============================================================================
// PHASE 1 GAME CONFIG
// ============================================================================

export const TRUTH_OR_DARE_CONFIG = {
  SPIN_DURATION_MS: 3000,
  CHOOSE_TIME_MS: 15000,
  COMPLETE_TIME_MS: 120000,
  DEFAULT_SPICE: 'spicy' as const,
};

export const WOULD_YOU_RATHER_CONFIG = {
  VOTE_TIME_MS: 30000,
  REVEAL_DELAY_MS: 2000,
  DEFAULT_ROUNDS: 10,
};

export const NEVER_HAVE_I_EVER_CONFIG = {
  STARTING_FINGERS: 5,
  TURN_TIME_MS: 45000,
  DEFAULT_SPICE: 'friendship' as const,
};

export const WHOS_MOST_LIKELY_CONFIG = {
  VOTE_TIME_MS: 30000,
  REVEAL_DELAY_MS: 2000,
  DEFAULT_ROUNDS: 10,
};

export const GUESS_WHO_SAID_IT_CONFIG = {
  SUBMIT_TIME_MS: 60000,
  GUESS_TIME_MS: 60000,
  REVEAL_DELAY_MS: 3000,
  DEFAULT_ROUNDS: 5,
  POINTS_CORRECT_GUESS: 10,
  POINTS_FOOLED_SOMEONE: 5,
};

// ============================================================================
// PHASE 1 GAME PROMPTS
// ============================================================================

export const TRUTH_OR_DARE_PROMPTS = {
  family: {
    truth: [
      'What is the most embarrassing thing your parents caught you doing?',
      'If you could switch lives with someone in this room for a day, who would it be?',
      'What is the weirdest food combination you secretly enjoy?',
      'What was your childhood dream job?',
      'If you could only eat one food for the rest of your life, what would it be?',
      'What is the last lie you told?',
      'What is your most useless talent?',
      'What song do you know all the lyrics to but are embarrassed about?',
      'If you could be any animal, what would you be and why?',
      'What is the longest you have gone without showering?',
    ],
    dare: [
      'Do your best impression of another player — everyone else guesses who it is.',
      'Speak in an accent for the next 3 rounds.',
      'Show the last photo in your camera roll.',
      'Do 10 jumping jacks right now.',
      'Sing the chorus of your favorite song.',
      'Try to make everyone laugh in 15 seconds.',
      'Post "I love this game" in the group chat right now.',
      'Do your best dance move on camera for 10 seconds.',
      'Talk without using the letter "E" for the next minute.',
      'Let the group pick your nickname for the rest of the game.',
    ],
  },
  spicy: {
    truth: [
      'What is the most embarrassing thing you\'ve done to impress a crush?',
      'Have you ever stalked someone\'s social media for more than 30 minutes?',
      'What is the worst date you\'ve ever been on?',
      'Have you ever sent a text to the wrong person? What did it say?',
      'What is the most childish thing you still do?',
      'What is your biggest insecurity?',
      'Have you ever pretended to like a gift? What was it?',
      'What is the pettiest reason you stopped talking to someone?',
      'Have you ever lied about your age? Why?',
      'What is the most awkward situation you\'ve been in?',
    ],
    dare: [
      'Send a voice note to the last person you texted saying "I think about you sometimes."',
      'Let the group choose your profile picture for the next 24 hours.',
      'Text your crush "I had a dream about you" and show the chat.',
      'Do a dramatic reading of your last 3 sent texts.',
      'Post an embarrassing childhood photo in the group chat.',
      'Let someone in the group post a status from your phone.',
      'Call a random contact and sing Happy Birthday.',
      'Recreate your most-used emoji as a facial expression for 15 seconds.',
      'Let the group go through your recently used emojis.',
      'Send a voice message to the group chat in a funny voice.',
    ],
  },
  savage: {
    truth: [
      'What is the biggest secret you\'ve kept from your best friend?',
      'Have you ever had a crush on someone in this room?',
      'What is the worst thing you\'ve ever said behind someone\'s back?',
      'Have you ever cheated on a test or exam?',
      'What is something you pretend to like but actually hate?',
      'Have you ever ghosted someone? Why?',
      'What is the most embarrassing thing in your search history?',
      'Have you ever lied to get out of plans? What was your excuse?',
      'What is the meanest thought you\'ve had about someone in this room?',
      'Have you ever read someone\'s private messages without permission?',
    ],
    dare: [
      'Send "I need to tell you something..." to the last person you texted and don\'t reply for 5 minutes.',
      'Let the group read your last DM conversation out loud.',
      'Post a blurry selfie with the caption "feeling cute, might delete later."',
      'Let someone in the group type and send one message to anyone in your contacts.',
      'Share your screen and let the group see your most used apps.',
      'Record yourself doing the Renegade dance and send it to the group.',
      'Let the group pick one app to delete from your phone for 24 hours.',
      'Send a voice message to your parents saying "I joined a cult" then explain it was a dare.',
      'Let the group write your next Instagram/Twitter caption.',
      'Call a friend and speak only in movie quotes for 1 minute.',
    ],
  },
};

export const WOULD_YOU_RATHER_PROMPTS = [
  { optionA: 'Always be 10 minutes late', optionB: 'Always be 20 minutes early' },
  { optionA: 'Be able to talk to animals', optionB: 'Be able to speak every human language' },
  { optionA: 'Have unlimited money but be alone forever', optionB: 'Be poor but surrounded by loved ones' },
  { optionA: 'Never use social media again', optionB: 'Never watch movies/TV again' },
  { optionA: 'Be famous but hated', optionB: 'Be unknown but deeply loved by a few' },
  { optionA: 'Have a rewind button for your life', optionB: 'Have a pause button for your life' },
  { optionA: 'Always say everything on your mind', optionB: 'Never speak again' },
  { optionA: 'Live in a virtual reality where you are happy', optionB: 'Live in reality but never be fully satisfied' },
  { optionA: 'Be stuck in a room with your ex for 24 hours', optionB: 'Be stuck in traffic for 24 hours' },
  { optionA: 'Have your search history made public', optionB: 'Have your camera roll made public' },
  { optionA: 'Lose your sense of taste', optionB: 'Lose your sense of touch' },
  { optionA: 'Be able to read minds', optionB: 'Be able to see the future' },
  { optionA: 'Never be able to lie again', optionB: 'Never be able to tell the truth' },
  { optionA: 'Have a pet dinosaur', optionB: 'Have a pet dragon' },
  { optionA: 'Be the funniest person in the room', optionB: 'Be the smartest person in the room' },
  { optionA: 'Always have to sing instead of speaking', optionB: 'Always have to dance instead of walking' },
  { optionA: 'Know when you will die', optionB: 'Know how you will die' },
  { optionA: 'Be able to teleport anywhere', optionB: 'Be able to time travel' },
  { optionA: 'Have your crush read your diary', optionB: 'Have your parents read your texts' },
  { optionA: 'Live without internet for a year', optionB: 'Live without AC/heat for a year' },
];

export const NEVER_HAVE_I_EVER_PROMPTS = {
  friendship: [
    'Never have I ever pretended to be sick to get out of plans.',
    'Never have I ever accidentally liked an old photo while stalking someone.',
    'Never have I ever sent a screenshot of a conversation to someone else.',
    'Never have I ever laughed at a joke I didn\'t understand.',
    'Never have I ever re-gifted a present someone gave me.',
    'Never have I ever fallen asleep on a video call.',
    'Never have I ever forgotten someone\'s name while talking to them.',
    'Never have I ever cried watching a cartoon.',
    'Never have I ever eaten food that fell on the floor.',
    'Never have I ever talked to myself in the mirror.',
    'Never have I ever Googled my own name.',
    'Never have I ever pretended to know a song and mumbled along.',
    'Never have I ever used a fake name at a coffee shop.',
    'Never have I ever binge-watched an entire series in one day.',
    'Never have I ever had a conversation with my pet.',
  ],
  spicy: [
    'Never have I ever had a crush on a friend\'s sibling.',
    'Never have I ever lied about my relationship status.',
    'Never have I ever sent a risky text and immediately regretted it.',
    'Never have I ever had a dream about someone in this room.',
    'Never have I ever stalked my ex\'s new partner online.',
    'Never have I ever made a fake account to look at someone\'s profile.',
    'Never have I ever ghosted someone after the first date.',
    'Never have I ever double-texted someone who left me on read.',
    'Never have I ever used a pickup line unironically.',
    'Never have I ever written a message and deleted it before sending.',
    'Never have I ever had an imaginary argument in the shower.',
    'Never have I ever checked someone\'s last seen status repeatedly.',
    'Never have I ever posted something just to get someone\'s attention.',
    'Never have I ever flirted to get out of trouble.',
    'Never have I ever screenshotted someone\'s story.',
  ],
  travel: [
    'Never have I ever missed a flight or train.',
    'Never have I ever gotten lost in a foreign country.',
    'Never have I ever packed way too much for a short trip.',
    'Never have I ever eaten something weird while traveling.',
    'Never have I ever stayed in a terrible hotel/hostel.',
    'Never have I ever made a friend while traveling.',
    'Never have I ever lied about being from somewhere else.',
    'Never have I ever taken a "shortcut" that made things worse.',
    'Never have I ever forgotten my passport/ID at a crucial moment.',
    'Never have I ever been scammed as a tourist.',
    'Never have I ever tried to speak a language I don\'t know.',
    'Never have I ever gotten sunburned so badly I couldn\'t move.',
    'Never have I ever gone on a trip with someone I barely knew.',
    'Never have I ever snuck into a hotel pool or facility.',
    'Never have I ever had a travel romance.',
  ],
  college: [
    'Never have I ever pulled an all-nighter before an exam.',
    'Never have I ever submitted an assignment at 11:59 PM.',
    'Never have I ever fallen asleep in class.',
    'Never have I ever skipped a class for no reason.',
    'Never have I ever lied about why I didn\'t do homework.',
    'Never have I ever had a crush on a teacher/professor.',
    'Never have I ever cheated on a test.',
    'Never have I ever been caught passing notes in class.',
    'Never have I ever made up a source for a paper.',
    'Never have I ever pretended to be paying attention in an online class.',
    'Never have I ever eaten in a lecture hall.',
    'Never have I ever cried over grades.',
    'Never have I ever joined a club just for the free food.',
    'Never have I ever had a group project where I did nothing.',
    'Never have I ever used ChatGPT for an entire assignment.',
  ],
};

export const WHOS_MOST_LIKELY_PROMPTS = [
  'Who is most likely to become a millionaire?',
  'Who is most likely to survive a zombie apocalypse?',
  'Who is most likely to ghost someone?',
  'Who is most likely to go viral on TikTok?',
  'Who is most likely to get married first?',
  'Who is most likely to forget their own birthday?',
  'Who is most likely to become famous?',
  'Who is most likely to end up in jail?',
  'Who is most likely to talk their way out of a ticket?',
  'Who is most likely to cry at a commercial?',
  'Who is most likely to stay friends with everyone in 10 years?',
  'Who is most likely to move to another country?',
  'Who is most likely to adopt 10 pets?',
  'Who is most likely to start a podcast?',
  'Who is most likely to win an argument with a Karen?',
  'Who is most likely to accidentally send a text to the wrong person?',
  'Who is most likely to become a CEO?',
  'Who is most likely to survive on a deserted island?',
  'Who is most likely to write a bestselling book?',
  'Who is most likely to become a stand-up comedian?',
];

export const GUESS_WHO_SAID_IT_PROMPTS = [
  'What would your autobiography be titled?',
  'Describe your ideal partner in 3 words.',
  'What is your spirit animal and why?',
  'If you could have one superpower, what would it be?',
  'What is the worst advice you\'ve ever received?',
  'What would you do if you were invisible for a day?',
  'What is your most controversial food opinion?',
  'If you could switch lives with a celebrity, who would it be?',
  'What is the first thing you\'d buy if you won the lottery?',
  'What is a hill you\'re willing to die on?',
  'Describe your worst date in one sentence.',
  'What would your warning label say?',
  'If your life was a movie, what genre would it be?',
  'What is the most overrated thing in the world?',
  'What would you tell your 15-year-old self?',
  'What is your go-to karaoke song?',
  'If you could erase one memory, what would it be?',
  'What is the weirdest compliment you\'ve ever received?',
  'What would your last meal be?',
  'What is a secret talent nobody knows about?',
];

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  INVALID_ROOM_CODE: 'INVALID_ROOM_CODE',
  ROOM_FULL: 'ROOM_FULL',
  INVALID_GAME_TYPE: 'INVALID_GAME_TYPE',
  NOT_HOST: 'NOT_HOST',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  INVALID_ACTION: 'INVALID_ACTION',
  INVALID_PHASE: 'INVALID_PHASE',
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  INVALID_STATE: 'INVALID_STATE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  DUPLICATE_SUBMISSION: 'DUPLICATE_SUBMISSION',
  INVALID_INPUT: 'INVALID_INPUT',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;
