export interface CurveConfig {
  playerIndex: number;
  numCards: number;
  screenWidth: number;
  screenHeight: number;
  cardWidth: number;
  cardHeight: number;
}

export interface CardPosition {
  x: number;
  y: number;
  rotation: number; // in degrees
}

export class CurvedCardLayout {
  /**
   * Calculate linear positions for Player 0's hand
   * Cards arranged horizontally in a straight line below the avatar
   */
  public static calculateCardPosition(
    config: CurveConfig,
    cardIndex: number
  ): CardPosition {
    const { playerIndex, numCards, screenWidth, screenHeight } = config;

    // Only calculate positions for Player 0 (human player)
    if (playerIndex !== 0) {
      return { x: 0, y: 0, rotation: 0 };
    }

    // Linear horizontal layout for Player 0
    const centerX = screenWidth / 2;
    const centerY = screenHeight - 100; // Push cards to very bottom

    // Calculate spacing between cards - wider spread
    const maxSpacing = 25;
    const minSpacing = 12;
    const availableWidth = screenWidth - 200; // Less margin on sides for wider spread
    const spacing = Math.max(minSpacing, Math.min(maxSpacing, availableWidth / numCards));

    // Calculate x position for this card
    const totalWidth = (numCards - 1) * spacing;
    const startX = centerX - totalWidth / 2;
    const x = startX + cardIndex * spacing;

    return {
      x: x,
      y: centerY,
      rotation: 0 // Cards stay upright - no rotation
    };
  }

  /**
   * Calculate all positions for a player's hand
   * For Player 0: returns linear fan-out positions
   * For others: returns empty array (not displaying full hands)
   */
  public static calculateHandPositions(config: CurveConfig): CardPosition[] {
    const positions: CardPosition[] = [];

    // Only calculate positions for Player 0
    if (config.playerIndex !== 0) {
      return positions;
    }

    for (let i = 0; i < config.numCards; i++) {
      positions.push(this.calculateCardPosition(config, i));
    }
    return positions;
  }
}
