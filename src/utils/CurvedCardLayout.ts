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

    // Only calculate positions for Player 0 and Player 2
    if (playerIndex !== 0 && playerIndex !== 2) {
      return { x: 0, y: 0, rotation: 0 };
    }

    // Linear horizontal layout
    let centerX: number;
    let centerY: number;

    if (playerIndex === 0) {
      // Player 0 (bottom) - cards below avatar
      centerX = screenWidth / 2;
      centerY = screenHeight - 100; // Push cards to very bottom
    } else {
      // Player 2 (top) - cards above avatar
      centerX = screenWidth / 2;
      centerY = 100; // Push cards to very top
    }

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
   * For Player 0 and 2: returns linear positions
   * For others: returns empty array (not displaying full hands)
   */
  public static calculateHandPositions(config: CurveConfig): CardPosition[] {
    const positions: CardPosition[] = [];

    // Only calculate positions for Player 0 and Player 2
    if (config.playerIndex !== 0 && config.playerIndex !== 2) {
      return positions;
    }

    for (let i = 0; i < config.numCards; i++) {
      positions.push(this.calculateCardPosition(config, i));
    }
    return positions;
  }
}
