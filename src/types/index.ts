// Card types
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isActive: boolean;
  position: number; // 0-3 for 4 players
  passed: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  table: Card[];
  deck: Card[];
  gamePhase: 'waiting' | 'playing' | 'finished';
  winner?: string;
}

export interface PlayMove {
  playerId: string;
  cards: Card[];
  timestamp: number;
}

export interface GameConfig {
  playerCount: number;
  playerNames: string[];
}
