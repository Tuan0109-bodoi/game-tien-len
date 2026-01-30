/**
 * Tiến Lên Rules Validator
 *
 * Xác thực các nước đi theo luật Tiến Lên
 */

import { Card, Rank } from '../types';

export class TienLenValidator {
  private rankOrder: Record<Rank, number> = {
    '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5,
    '8': 6, '9': 7, '10': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12,
  };

  private suitOrder: Record<string, number> = {
    'spades': 0, 'hearts': 1, 'diamonds': 2, 'clubs': 3,
  };

  /**
   * Kiểm tra xem nước đi có hợp lệ không
   */
  isValidMove(playedCards: Card[], tableCards: Card[]): boolean {
    if (playedCards.length === 0) return false;

    // Nếu bàn trống, bất kỳ nước đi nào cũng hợp lệ
    if (tableCards.length === 0) {
      return true;
    }

    // Số lá bài phải bằng nhau
    if (playedCards.length !== tableCards.length) {
      return false;
    }

    // Kiểm tra theo loại nước đi
    const playedType = this.getPlayType(playedCards);
    const tableType = this.getPlayType(tableCards);

    if (playedType !== tableType) {
      return false;
    }

    // Kiểm tra bài cao hơn
    return this.isHigherThan(playedCards, tableCards);
  }

  /**
   * Xác định loại nước đi
   */
  private getPlayType(cards: Card[]): string {
    if (cards.length === 1) return 'single';
    if (cards.length === 2) return this.isPair(cards) ? 'pair' : 'invalid';
    if (cards.length === 3) return this.isTriple(cards) ? 'triple' : 'invalid';
    if (cards.length === 5) {
      if (this.isStraight(cards)) return 'straight';
      if (this.isFlush(cards)) return 'flush';
      if (this.isFullHouse(cards)) return 'fullhouse';
      if (this.isFourOfAKind(cards)) return 'fourofakind';
    }
    return 'invalid';
  }

  /**
   * Kiểm tra xem là đôi không
   */
  private isPair(cards: Card[]): boolean {
    return cards.length === 2 && cards[0].rank === cards[1].rank;
  }

  /**
   * Kiểm tra xem là ba lá không
   */
  private isTriple(cards: Card[]): boolean {
    return cards.length === 3 &&
      cards[0].rank === cards[1].rank &&
      cards[1].rank === cards[2].rank;
  }

  /**
   * Kiểm tra xem là sảnh không (5 lá liên tiếp)
   */
  private isStraight(cards: Card[]): boolean {
    if (cards.length !== 5) return false;

    const sorted = [...cards].sort((a, b) =>
      this.rankOrder[a.rank] - this.rankOrder[b.rank]
    );

    for (let i = 1; i < sorted.length; i++) {
      if (this.rankOrder[sorted[i].rank] !== this.rankOrder[sorted[i - 1].rank] + 1) {
        return false;
      }
    }

    return true;
  }

  /**
   * Kiểm tra xem là thùng không (5 lá cùng chất)
   */
  private isFlush(cards: Card[]): boolean {
    if (cards.length !== 5) return false;
    const suit = cards[0].suit;
    return cards.every(c => c.suit === suit);
  }

  /**
   * Kiểm tra xem là full house không (3 lá + 2 lá)
   */
  private isFullHouse(cards: Card[]): boolean {
    if (cards.length !== 5) return false;

    const rankCounts: Record<string, number> = {};
    cards.forEach(c => {
      rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    });

    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    return counts.length === 2 && counts[0] === 3 && counts[1] === 2;
  }

  /**
   * Kiểm tra xem là tứ quý không (4 lá cùng rank)
   */
  private isFourOfAKind(cards: Card[]): boolean {
    if (cards.length !== 5) return false;

    const rankCounts: Record<string, number> = {};
    cards.forEach(c => {
      rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    });

    const counts = Object.values(rankCounts);
    return counts.includes(4);
  }

  /**
   * Kiểm tra xem bài chơi có cao hơn bài trên bàn không
   */
  private isHigherThan(playedCards: Card[], tableCards: Card[]): boolean {
    // Với đôi, ba, tứ quý: so sánh rank
    if (playedCards.length <= 3 || this.isFourOfAKind(playedCards)) {
      const playedRank = this.rankOrder[playedCards[0].rank];
      const tableRank = this.rankOrder[tableCards[0].rank];
      return playedRank > tableRank;
    }

    // Với sảnh, thùng, full house: so sánh bài cao nhất
    const playedHighest = Math.max(...playedCards.map(c => this.rankOrder[c.rank]));
    const tableHighest = Math.max(...tableCards.map(c => this.rankOrder[c.rank]));

    if (playedHighest !== tableHighest) {
      return playedHighest > tableHighest;
    }

    // Nếu bài cao nhất bằng nhau, so sánh chất
    const playedHighestCard = playedCards.find(c => this.rankOrder[c.rank] === playedHighest)!;
    const tableHighestCard = tableCards.find(c => this.rankOrder[c.rank] === tableHighest)!;

    return this.suitOrder[playedHighestCard.suit] > this.suitOrder[tableHighestCard.suit];
  }

  /**
   * Lấy rank cao nhất của một tập bài
   */
  getHighestRank(cards: Card[]): Rank {
    return cards.reduce((highest, card) =>
      this.rankOrder[card.rank] > this.rankOrder[highest.rank] ? card : highest
    ).rank;
  }

  /**
   * So sánh hai lá bài
   */
  compareCards(a: Card, b: Card): number {
    const rankDiff = this.rankOrder[a.rank] - this.rankOrder[b.rank];
    if (rankDiff !== 0) return rankDiff;
    return this.suitOrder[a.suit] - this.suitOrder[b.suit];
  }
}
