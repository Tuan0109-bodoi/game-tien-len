import Phaser from 'phaser';

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
   * Calculate ellipse parameters based on screen size
   */
  private static getEllipseParams(width: number, height: number) {
    const padding = 150; // More padding for cleaner layout
    return {
      centerX: width / 2,
      centerY: height / 2,
      radiusX: (width / 2) - padding,
      radiusY: (height / 2) - padding
    };
  }

  /**
   * Get arc range for each player
   * Player 0 (Bottom): Centered horizontal line - only middle area
   * Player 1 (Right): 330° to 210° (C-curve) - NO ROTATION
   * Player 2 (Top): 210° to 330° (concave arc) - NO ROTATION
   * Player 3 (Left): 150° to 30° (C-curve) - NO ROTATION
   */
  private static getArcRange(playerIndex: number): { start: number; end: number } {
    const ranges = [
      { start: Math.PI * 1.05, end: Math.PI * 0.95 },  // Bottom (189° to 171°) - very narrow, centered
      { start: Math.PI * 0.4, end: Math.PI * 0.6 },    // Right (72° to 108°)
      { start: Math.PI * 1.9, end: Math.PI * 2.1 },    // Top (342° to 378°/18°)
      { start: Math.PI * 1.4, end: Math.PI * 1.6 }     // Left (252° to 288°)
    ];
    return ranges[playerIndex];
  }

  /**
   * Get offset to push cards toward board edges
   */
  private static getEdgeOffset(playerIndex: number): { x: number; y: number } {
    const offsets = [
      { x: 0, y: 60 },    // Bottom: moderate push down
      { x: 100, y: 0 },   // Right: push right more
      { x: 0, y: -100 },  // Top: push up more
      { x: -100, y: 0 }   // Left: push left more
    ];
    return offsets[playerIndex];
  }

  /**
   * Calculate position for a single card
   */
  public static calculateCardPosition(
    config: CurveConfig,
    cardIndex: number
  ): CardPosition {
    const { playerIndex, numCards, screenWidth, screenHeight } = config;
    const ellipse = this.getEllipseParams(screenWidth, screenHeight);
    const arcRange = this.getArcRange(playerIndex);

    // Calculate parameter t for this card
    const t = numCards === 1
      ? (arcRange.start + arcRange.end) / 2
      : arcRange.start + (arcRange.end - arcRange.start) * (cardIndex / (numCards - 1));

    // Calculate position on ellipse
    const x = ellipse.centerX + ellipse.radiusX * Math.cos(t);
    const y = ellipse.centerY + ellipse.radiusY * Math.sin(t);

    // NO ROTATION - cards stay upright
    const rotation = 0;

    // Apply offset to push cards toward edges
    const offset = this.getEdgeOffset(playerIndex);

    return {
      x: x + offset.x,
      y: y + offset.y,
      rotation: rotation
    };
  }

  /**
   * Calculate all positions for a player's hand
   */
  public static calculateHandPositions(config: CurveConfig): CardPosition[] {
    const positions: CardPosition[] = [];
    for (let i = 0; i < config.numCards; i++) {
      positions.push(this.calculateCardPosition(config, i));
    }
    return positions;
  }
}
