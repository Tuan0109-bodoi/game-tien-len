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

    // If table is empty, any valid combination is allowed
    if (this.gameState.table.length === 0) {
      return this.isValidCombination(cards);
    }

    const tableCards = this.gameState.table;

    // Must play same number of cards
    if (cards.length !== tableCards.length) return false;

    // Must be valid combination
    if (!this.isValidCombination(cards)) return false;

    // Must be stronger than table cards
    return this.isStrongerCombination(cards, tableCards);
  }

  private isValidCombination(cards: Card[]): boolean {
    if (cards.length === 0) return false;
    if (cards.length === 1) return true; // Single card

    // Sort cards by rank for validation
    const sorted = [...cards].sort((a, b) => this.compareCards(a, b));

    if (cards.length === 2) {
      // Pair: same rank
      return sorted[0].rank === sorted[1].rank;
    }

    if (cards.length === 3) {
      // Triple: all same rank
      return sorted[0].rank === sorted[1].rank && sorted[1].rank === sorted[2].rank;
    }

    // Sequence: consecutive ranks, all same suit or all different suits
    if (cards.length >= 3) {
      return this.isSequence(sorted);
    }

    return false;
  }

  private isSequence(cards: Card[]): boolean {
    if (cards.length < 3) return false;

    const rankOrder: Record<Rank, number> = {
      '3': 0, '4': 1, '5': 2, '6': 3, '7': 4, '8': 5,
      '9': 6, '10': 7, 'J': 8, 'Q': 9, 'K': 10, 'A': 11, '2': 12,
    };

    // Check consecutive ranks
    for (let i = 1; i < cards.length; i++) {
      if (rankOrder[cards[i].rank] !== rankOrder[cards[i - 1].rank] + 1) {
        return false;
      }
    }

    return true;
  }

  private isStrongerCombination(cards: Card[], tableCards: Card[]): boolean {
    if (cards.length !== tableCards.length) return false;

    const rankOrder: Record<Rank, number> = {
      '3': 0, '4': 1, '5': 2, '6': 3, '7': 4, '8': 5,
      '9': 6, '10': 7, 'J': 8, 'Q': 9, 'K': 10, 'A': 11, '2': 12,
    };

    const suitOrder: Record<Suit, number> = {
      'spades': 0, 'clubs': 1, 'diamonds': 2, 'hearts': 3,
    };

    if (cards.length === 1) {
      // Single card: compare rank, then suit
      const cardRank = rankOrder[cards[0].rank];
      const tableRank = rankOrder[tableCards[0].rank];

      if (cardRank > tableRank) return true;
      if (cardRank === tableRank) {
        return suitOrder[cards[0].suit] > suitOrder[tableCards[0].suit];
      }
      return false;
    }

    if (cards.length === 2) {
      // Pair: compare rank of pair, then highest suit
      const cardRank = rankOrder[cards[0].rank];
      const tableRank = rankOrder[tableCards[0].rank];

      if (cardRank > tableRank) return true;
      if (cardRank === tableRank) {
        const cardHighSuit = Math.max(suitOrder[cards[0].suit], suitOrder[cards[1].suit]);
        const tableHighSuit = Math.max(suitOrder[tableCards[0].suit], suitOrder[tableCards[1].suit]);
        return cardHighSuit > tableHighSuit;
      }
      return false;
    }

    if (cards.length === 3) {
      // Triple: compare rank only
      const cardRank = rankOrder[cards[0].rank];
      const tableRank = rankOrder[tableCards[0].rank];
      return cardRank > tableRank;
    }

    // Sequence: compare highest card
    const cardsSorted = [...cards].sort((a, b) => this.compareCards(a, b));
    const tableSorted = [...tableCards].sort((a, b) => this.compareCards(a, b));

    const cardHighest = cardsSorted[cardsSorted.length - 1];
    const tableHighest = tableSorted[tableSorted.length - 1];

    const cardRank = rankOrder[cardHighest.rank];
    const tableRank = rankOrder[tableHighest.rank];

    if (cardRank > tableRank) return true;
    if (cardRank === tableRank) {
      return suitOrder[cardHighest.suit] > suitOrder[tableHighest.suit];
    }
    return false;
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
