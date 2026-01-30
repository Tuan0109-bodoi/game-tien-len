import { Card, Suit, Rank, Player, GameState, GameConfig } from '../types';

export class CardDeck {
  private cards: Card[] = [];

  constructor() {
    this.initializeDeck();
  }

  private initializeDeck(): void {
    const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push({
          suit,
          rank,
          id: `${rank}-${suit}`,
        });
      }
    }

    this.shuffle();
  }

  private shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  drawCard(): Card | undefined {
    return this.cards.pop();
  }

  drawCards(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      if (card) drawn.push(card);
    }
    return drawn;
  }

  getRemainingCount(): number {
    return this.cards.length;
  }
}

export class GameLogic {
  private gameState: GameState;
  private deck: CardDeck;

  constructor(config: GameConfig) {
    this.deck = new CardDeck();
    this.gameState = this.initializeGame(config);
  }

  private initializeGame(config: GameConfig): GameState {
    const players: Player[] = config.playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      hand: [],
      isActive: true,
      position: index,
      passed: false,
    }));

    // Deal cards to players
    for (let i = 0; i < 13; i++) {
      for (const player of players) {
        const card = this.deck.drawCard();
        if (card) player.hand.push(card);
      }
    }

    // Sort hands
    players.forEach(player => {
      player.hand.sort((a, b) => this.compareCards(a, b));
    });

    return {
      players,
      currentPlayerIndex: 0,
      table: [],
      deck: [],
      gamePhase: 'playing',
    };
  }

  private compareCards(a: Card, b: Card): number {
    const rankOrder: Record<Rank, number> = {
      '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5,
      '8': 6, '9': 7, '10': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12,
    };

    const rankDiff = rankOrder[a.rank] - rankOrder[b.rank];
    if (rankDiff !== 0) return rankDiff;

    const suitOrder: Record<Suit, number> = {
      'spades': 0, 'hearts': 1, 'diamonds': 2, 'clubs': 3,
    };

    return suitOrder[a.suit] - suitOrder[b.suit];
  }

  playCards(playerIndex: number, cards: Card[]): boolean {
    const player = this.gameState.players[playerIndex];
    if (!player || playerIndex !== this.gameState.currentPlayerIndex) {
      return false;
    }

    // Validate cards are in player's hand
    for (const card of cards) {
      if (!player.hand.find(c => c.id === card.id)) {
        return false;
      }
    }

    // Validate move is legal
    if (!this.isValidMove(cards)) {
      return false;
    }

    // Remove cards from hand
    player.hand = player.hand.filter(
      c => !cards.find(card => card.id === c.id)
    );

    // Add cards to table
    this.gameState.table = cards;
    player.passed = false;

    // Move to next player
    this.nextTurn();

    return true;
  }

  passMove(playerIndex: number): boolean {
    const player = this.gameState.players[playerIndex];
    if (!player || playerIndex !== this.gameState.currentPlayerIndex) {
      return false;
    }

    player.passed = true;

    // Check if all other players passed
    const activePlayers = this.gameState.players.filter(p => p.isActive);
    const passedCount = activePlayers.filter(p => p.passed).length;

    if (passedCount === activePlayers.length - 1) {
      // Current player wins the round
      this.gameState.table = [];
      activePlayers.forEach(p => p.passed = false);
    }

    this.nextTurn();
    return true;
  }

  private nextTurn(): void {
    let nextIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;

    // Skip inactive players
    while (!this.gameState.players[nextIndex].isActive) {
      nextIndex = (nextIndex + 1) % this.gameState.players.length;
    }

    this.gameState.currentPlayerIndex = nextIndex;

    // Check win condition
    this.checkWinCondition();
  }

  private isValidMove(cards: Card[]): boolean {
    if (cards.length === 0) return false;

    // If table is empty, any move is valid
    if (this.gameState.table.length === 0) return true;

    // TODO: Implement Tiến Lên rules validation
    // For now, accept any move
    return true;
  }

  private checkWinCondition(): void {
    const activePlayers = this.gameState.players.filter(p => p.isActive);

    for (const player of activePlayers) {
      if (player.hand.length === 0) {
        this.gameState.gamePhase = 'finished';
        this.gameState.winner = player.id;
      }
    }
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getCurrentPlayer(): Player {
    return this.gameState.players[this.gameState.currentPlayerIndex];
  }

  getPlayerHand(playerIndex: number): Card[] {
    return this.gameState.players[playerIndex].hand;
  }
}
