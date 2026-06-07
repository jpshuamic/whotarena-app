export type Shape =
  | 'circle'
  | 'triangle'
  | 'cross'
  | 'square'
  | 'star'
  | 'whot';

export type GameDirection = 'normal' | 'reverse';

export type GameStatus = 'waiting' | 'dealing' | 'active' | 'finished';

export type MoveType = 'play' | 'pick' | 'whot_call';

export type StakeLevel =
  | 'practice'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'diamond'
  | 'tournament';

export type GameVariant = '1v1' | '3player' | '5player';

export interface Card {
  id: string;
  shape: Shape;
  number: number;
}

export interface PlayerSlot {
  id: string;
  seatNumber: number;
  isBot: boolean;
}

export interface GameMove {
  playerId: string;
  moveType: MoveType;
  cardPlayed?: Card;
  whotCall?: Shape;
  cardsPicked?: number;
  timestamp: number;
}

export interface GameState {
  id: string;
  roomId: string;
  status: GameStatus;
  variant: GameVariant;
  players: PlayerSlot[];
  hands: Record<string, Card[]>;
  deck: Card[];
  pile: Card[];
  currentPlayerId: string;
  direction: GameDirection;
  calledShape: Shape | null;
  pendingPick: number;
  pendingPickType: 'two' | 'three' | null;
  winnerId: string | null;
  moveHistory: GameMove[];
  shuffleSeed: string;
  startedAt: number | null;
  finishedAt: number | null;
}

export interface PlayMoveInput {
  type: 'play';
  playerId: string;
  cardId: string;
  whotCall?: Shape;
}

export interface PickMoveInput {
  type: 'pick';
  playerId: string;
}

export type MoveInput = PlayMoveInput | PickMoveInput;

export interface BotConfig {
  targetWinRate: number;
  minThinkMs: number;
  maxThinkMs: number;
  aggression: number;
  deliberateSuboptimalRate: number;
}

export interface BotDecisionContext {
  botId: string;
  state: GameState;
  opponentCardCounts: Record<string, number>;
  config: BotConfig;
  calibrateDown: boolean;
}
