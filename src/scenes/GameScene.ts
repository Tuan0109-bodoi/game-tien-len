import Phaser from 'phaser';
import { Card, Player } from '../types';
import { GameLogic } from '../game/GameLogic';

export class GameScene extends Phaser.Scene {
  private gameLogic!: GameLogic;
  private cardSprites: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private playerHands: Map<number, Phaser.Physics.Arcade.Sprite[]> = new Map();
  private selectedCards: Set<string> = new Set();
  private tableCards: Phaser.Physics.Arcade.Sprite[] = [];

  // Responsive sizing properties
  private cardWidth: number = 25;
  private cardHeight: number = 37;
  private spacing: number = 5;
  private playerNameTexts: Map<number, Phaser.GameObjects.Text> = new Map();
  private playerCardCountTexts: Map<number, Phaser.GameObjects.Text> = new Map();
  private playButton!: Phaser.GameObjects.Rectangle;
  private passButton!: Phaser.GameObjects.Rectangle;
  private playButtonText!: Phaser.GameObjects.Text;
  private passButtonText!: Phaser.GameObjects.Text;

  private playerAvatars: Map<number, {
    background: Phaser.GameObjects.Arc;
    border: Phaser.GameObjects.Graphics;
    glowCircle: Phaser.GameObjects.Arc;
  }> = new Map();

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    // Load card images
    const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (const suit of suits) {
      for (const rank of ranks) {
        const key = `card-${rank}-${suit}`;
        const path = `assets/default/cards/${suit}/card-${rank}-${suit}.webp`;
        this.load.image(key, path);
      }
    }

    // Load board background
    this.load.image('board', 'assets/board.webp');
  }

  /**
   * Calculate card dimensions dynamically based on screen size
   */
  private calculateCardDimensions(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const maxCards = 13;
    const padding = 150;
    const minCardWidth = 15;
    const maxCardWidth = 30;
    const minCardHeight = 22;
    const maxCardHeight = 45;
    const minSpacing = 3;
    const maxSpacing = 8;

    const availableWidth = width - 2 * padding;
    let spacing = Math.min(maxSpacing, Math.max(minSpacing, availableWidth / (maxCards + 5)));
    let cardWidthFromWidth = (availableWidth - (maxCards - 1) * spacing) / maxCards;
    cardWidthFromWidth = Math.max(minCardWidth, Math.min(maxCardWidth, cardWidthFromWidth));

    const availableHeight = height - 2 * padding;
    let cardHeightFromHeight = (availableHeight - (maxCards - 1) * spacing) / maxCards;
    cardHeightFromHeight = Math.max(minCardHeight, Math.min(maxCardHeight, cardHeightFromHeight));

    this.cardWidth = cardWidthFromWidth;
    this.cardHeight = cardHeightFromHeight;
    this.spacing = Math.max(minSpacing, Math.round(spacing));
  }

  create(): void {
    this.gameLogic = new GameLogic({
      playerCount: 4,
      playerNames: ['You', 'Player 2', 'Player 3', 'Player 4'],
    });

    this.calculateCardDimensions();
    this.setupBoard();
    this.displayPlayerHands();
    this.setupUI();

    this.scale.on('resize', () => {
      this.handleResize();
    });
  }

  private setupBoard(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Use board image as background
    const boardImage = this.add.image(width / 2, height / 2, 'board');
    boardImage.setDisplaySize(width, height);
    boardImage.setDepth(0);
  }

  private displayPlayerHands(): void {
    const gameState = this.gameLogic.getGameState();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    gameState.players.forEach((player, index) => {
      const hand = this.gameLogic.getPlayerHand(index);
      const sprites: Phaser.Physics.Arcade.Sprite[] = [];

      let x: number, y: number;
      let isHorizontal = false;

      // Position cards based on player index
      switch (index) {
        case 0: // Bottom - Player (horizontal)
          y = height - 70;
          x = width / 2 - (hand.length * (this.cardWidth + this.spacing)) / 2;
          isHorizontal = true;
          break;
        case 1: // Right - Opponent (vertical)
          x = width - 95;
          y = height / 2 - (hand.length * (this.cardHeight + this.spacing)) / 2;
          isHorizontal = false;
          break;
        case 2: // Top - Opponent (horizontal)
          y = 60;
          x = width / 2 - (hand.length * (this.cardWidth + this.spacing)) / 2;
          isHorizontal = true;
          break;
        case 3: // Left - Opponent (vertical)
          x = 95;
          y = height / 2 - (hand.length * (this.cardHeight + this.spacing)) / 2;
          isHorizontal = false;
          break;
        default:
          x = 0;
          y = 0;
          isHorizontal = true;
      }

      // Only display cards for current player (index 0)
      // For other players, show card back instead
      if (index === 0) {
        hand.forEach((card, cardIndex) => {
          let cardX = x;
          let cardY = y;

          if (isHorizontal) {
            cardX += cardIndex * (this.cardWidth + this.spacing);
          } else {
            cardY += cardIndex * (this.cardHeight + this.spacing);
          }

          const baseCardWidth = 80;
          const baseCardHeight = 120;
          const scaleX = this.cardWidth / baseCardWidth;
          const scaleY = this.cardHeight / baseCardHeight;
          const scale = Math.min(scaleX, scaleY);

          const sprite = this.physics.add.sprite(cardX, cardY, `card-${card.rank}-${card.suit}`);
          sprite.setScale(scale);
          sprite.setDepth(cardIndex + 10);
          sprite.setInteractive();

          sprite.setData('originalY', cardY);
          sprite.setData('originalX', cardX);
          sprite.setData('playerIndex', index);
          sprite.setData('cardId', card.id);

          sprite.on('pointerdown', () => this.selectCard(card, sprite));

          // Hover effect only for player 0
          sprite.on('pointerover', () => {
            if (!this.selectedCards.has(card.id)) {
              sprite.setTint(0xcccccc);
              sprite.setY(cardY - 10);
            }
          });

          sprite.on('pointerout', () => {
            if (!this.selectedCards.has(card.id)) {
              sprite.clearTint();
              sprite.setY(cardY);
            }
          });

          sprites.push(sprite);
          this.cardSprites.set(card.id, sprite);
        });
      }

      this.playerHands.set(index, sprites);

      // Create avatar
      const avatarSize = 65;
      const avatarX = index === 0 ? width / 2 : (index === 1 ? width - 75 : (index === 2 ? width / 2 : 75));
      const avatarY = index === 0 ? height - 140 : (index === 1 ? height / 2 : (index === 2 ? 90 : height / 2));

      // Glow circle (for active player - initially hidden)
      const glowCircle = this.add.circle(avatarX, avatarY, avatarSize / 2 + 10, 0xFFFF00, 0);
      glowCircle.setDepth(99);

      // Avatar background circle with solid color
      const avatarBg = this.add.circle(avatarX, avatarY, avatarSize / 2, this.getPlayerColor(index));
      avatarBg.setDepth(100);

      // Thick yellow border
      const border = this.add.graphics();
      border.lineStyle(7, 0xFFD700, 1);
      border.strokeCircle(avatarX, avatarY, avatarSize / 2);
      border.setDepth(101);

      // Store avatar references
      this.playerAvatars.set(index, {
        background: avatarBg,
        border: border,
        glowCircle: glowCircle
      });

      // Player initials in white
      const initials = player.name.substring(0, 2).toUpperCase();
      this.add.text(avatarX, avatarY, initials, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial Black, sans-serif',
      }).setOrigin(0.5).setDepth(103);

      // Name tag with rounded black background below avatar
      const nameTag = this.add.text(avatarX, avatarY + avatarSize / 2 + 22, player.name, {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 10, y: 4 },
      }).setOrigin(0.5).setDepth(100);

      this.playerNameTexts.set(index, nameTag);

      // Card count display for non-player opponents
      if (index !== 0) {
        const cardCountText = this.add.text(avatarX + 35, avatarY - 35, hand.length.toString(), {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold',
          backgroundColor: '#8B0000',
          padding: { x: 8, y: 4 },
        }).setOrigin(0.5).setDepth(102);

        this.playerCardCountTexts.set(index, cardCountText);
      }
    });
  }

  private getPlayerColor(index: number): number {
    // Colors: Red, Orange, Blue, Yellow
    const colors = [0xE74C3C, 0xFF9500, 0x3498DB, 0xF1C40F];
    return colors[index % colors.length];
  }

  /**
   * Highlight the active player's avatar with glow effect
   */
  private highlightActivePlayer(playerIndex: number): void {
    // Remove highlight from all players
    this.playerAvatars.forEach((avatar, index) => {
      // Stop old animations
      this.tweens.killTweensOf(avatar.glowCircle);

      if (avatar.glowCircle) {
        avatar.glowCircle.setAlpha(0);
      }

      // Reset border to normal gold
      avatar.border.clear();
      const pos = this.getAvatarPosition(index);
      avatar.border.lineStyle(7, 0xFFD700, 1);
      avatar.border.strokeCircle(pos.x, pos.y, 32.5);
    });

    // Highlight current player with pulsing glow
    const activeAvatar = this.playerAvatars.get(playerIndex);
    if (activeAvatar && activeAvatar.glowCircle) {
      // Pulsing glow effect
      this.tweens.add({
        targets: activeAvatar.glowCircle,
        alpha: { from: 0.5, to: 0.8 },
        scale: { from: 1, to: 1.15 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Keep border same thickness but brighter
      const pos = this.getAvatarPosition(playerIndex);
      activeAvatar.border.clear();
      activeAvatar.border.lineStyle(7, 0xFFFF00, 1); // Bright yellow
      activeAvatar.border.strokeCircle(pos.x, pos.y, 32.5);
    }
  }

  /**
   * Get avatar position for a player index
   */
  private getAvatarPosition(index: number): { x: number; y: number } {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    switch (index) {
      case 0: return { x: width / 2, y: height - 140 };
      case 1: return { x: width - 75, y: height / 2 };
      case 2: return { x: width / 2, y: 90 };
      case 3: return { x: 75, y: height / 2 };
      default: return { x: 0, y: 0 };
    }
  }

  private selectCard(card: Card, sprite: Phaser.Physics.Arcade.Sprite): void {
    const gameState = this.gameLogic.getGameState();
    const currentPlayerIndex = gameState.currentPlayerIndex;
    const playerIndex = sprite.getData('playerIndex');

    // Only allow current player to select cards
    if (playerIndex !== currentPlayerIndex) return;

    const originalY = sprite.getData('originalY');

    if (this.selectedCards.has(card.id)) {
      this.selectedCards.delete(card.id);
      sprite.clearTint();
      sprite.setY(originalY);
    } else {
      this.selectedCards.add(card.id);
      sprite.setTint(0xffff00);
      sprite.setY(originalY - 20);
    }
  }

  private setupUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Play button - Green
    const playBtnX = width / 2 - 80;
    const playBtnY = height / 2 + 35;

    this.playButton = this.add.rectangle(playBtnX, playBtnY, 130, 45, 0x27AE60);
    this.playButton.setInteractive();
    this.playButton.setDepth(100);

    this.playButtonText = this.add.text(playBtnX, playBtnY, 'PLAY', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial Black, sans-serif',
      align: 'center',
    }).setOrigin(0.5).setDepth(102);

    // Hover effect for play button
    this.playButton.on('pointerover', () => {
      this.playButton.setFillStyle(0x2ECC71);
    });
    this.playButton.on('pointerout', () => {
      this.playButton.setFillStyle(0x27AE60);
    });
    this.playButton.on('pointerdown', () => this.playSelectedCards());

    // Pass button - Red
    const passBtnX = width / 2 + 80;
    const passBtnY = height / 2 + 35;

    this.passButton = this.add.rectangle(passBtnX, passBtnY, 130, 45, 0xC0392B);
    this.passButton.setInteractive();
    this.passButton.setDepth(100);

    this.passButtonText = this.add.text(passBtnX, passBtnY, 'PASS', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial Black, sans-serif',
      align: 'center',
    }).setOrigin(0.5).setDepth(102);

    // Hover effect for pass button
    this.passButton.on('pointerover', () => {
      this.passButton.setFillStyle(0xE74C3C);
    });
    this.passButton.on('pointerout', () => {
      this.passButton.setFillStyle(0xC0392B);
    });
    this.passButton.on('pointerdown', () => this.passMove());

    // Highlight active player
    const gameState = this.gameLogic.getGameState();
    this.highlightActivePlayer(gameState.currentPlayerIndex);
  }

  private playSelectedCards(): void {
    const gameState = this.gameLogic.getGameState();
    const currentPlayerIndex = gameState.currentPlayerIndex;

    const selectedCardIds = Array.from(this.selectedCards);
    const hand = this.gameLogic.getPlayerHand(currentPlayerIndex);
    const cardsToPlay = hand.filter(c => selectedCardIds.includes(c.id));

    if (this.gameLogic.playCards(currentPlayerIndex, cardsToPlay)) {
      // Display played cards on table
      this.displayTableCards(cardsToPlay);
      this.selectedCards.clear();
      this.updateDisplay();
    }
  }

  private displayTableCards(cards: Card[]): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const tableX = width / 2;
    const tableY = height / 2;

    // Clear old table cards
    this.tableCards.forEach(sprite => sprite.destroy());
    this.tableCards = [];

    // Display new cards on table
    cards.forEach((card, index) => {
      const offsetX = (index - cards.length / 2 + 0.5) * 30;
      const offsetY = (index - cards.length / 2 + 0.5) * 20;

      const baseCardWidth = 80;
      const baseCardHeight = 120;
      const scaleX = this.cardWidth / baseCardWidth;
      const scaleY = this.cardHeight / baseCardHeight;
      const scale = Math.min(scaleX, scaleY);

      const sprite = this.physics.add.sprite(
        tableX + offsetX,
        tableY + offsetY,
        `card-${card.rank}-${card.suit}`
      );
      sprite.setScale(scale);
      sprite.setDepth(5);
      sprite.setAngle(Phaser.Math.Between(-15, 15));

      this.tableCards.push(sprite);
    });
  }

  private passMove(): void {
    const gameState = this.gameLogic.getGameState();
    const currentPlayerIndex = gameState.currentPlayerIndex;

    if (this.gameLogic.passMove(currentPlayerIndex)) {
      this.selectedCards.clear();
      this.updateDisplay();
    }
  }

  private updateDisplay(): void {
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites.clear();
    this.playerHands.clear();

    this.playerNameTexts.forEach(text => text.destroy());
    this.playerNameTexts.clear();

    this.playerCardCountTexts.forEach(text => text.destroy());
    this.playerCardCountTexts.clear();

    // Cleanup avatar objects
    this.playerAvatars.forEach(avatar => {
      this.tweens.killTweensOf(avatar.glowCircle);
      avatar.background.destroy();
      avatar.border.destroy();
      if (avatar.glowCircle) {
        avatar.glowCircle.destroy();
      }
    });
    this.playerAvatars.clear();

    // Redisplay everything
    this.displayPlayerHands();

    // Highlight active player
    const gameState = this.gameLogic.getGameState();
    this.highlightActivePlayer(gameState.currentPlayerIndex);
  }

  private updateCardPositions(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const gameState = this.gameLogic.getGameState();

    gameState.players.forEach((player, playerIndex) => {
      const hand = this.gameLogic.getPlayerHand(playerIndex);
      const sprites = this.playerHands.get(playerIndex) || [];

      let x: number, y: number;
      let isHorizontal = false;

      switch (playerIndex) {
        case 0:
          y = height - 70;
          x = width / 2 - (hand.length * (this.cardWidth + this.spacing)) / 2;
          isHorizontal = true;
          break;
        case 1:
          x = width - 95;
          y = height / 2 - (hand.length * (this.cardHeight + this.spacing)) / 2;
          isHorizontal = false;
          break;
        case 2:
          y = 60;
          x = width / 2 - (hand.length * (this.cardWidth + this.spacing)) / 2;
          isHorizontal = true;
          break;
        case 3:
          x = 95;
          y = height / 2 - (hand.length * (this.cardHeight + this.spacing)) / 2;
          isHorizontal = false;
          break;
        default:
          x = 0;
          y = 0;
          isHorizontal = true;
      }

      sprites.forEach((sprite, cardIndex) => {
        let cardX = x;
        let cardY = y;

        if (isHorizontal) {
          cardX += cardIndex * (this.cardWidth + this.spacing);
        } else {
          cardY += cardIndex * (this.cardHeight + this.spacing);
        }

        sprite.setData('originalY', cardY);
        sprite.setData('originalX', cardX);

        if (!this.selectedCards.has(sprite.getData('cardId'))) {
          sprite.setPosition(cardX, cardY);
        }
      });

      const nameText = this.playerNameTexts.get(playerIndex);
      if (nameText) {
        const pos = this.getAvatarPosition(playerIndex);
        nameText.setPosition(pos.x, pos.y + 40);
      }

      // Update card count text
      const cardCountText = this.playerCardCountTexts.get(playerIndex);
      if (cardCountText) {
        const pos = this.getAvatarPosition(playerIndex);
        cardCountText.setPosition(pos.x + 35, pos.y - 35);
        cardCountText.setText(hand.length.toString());
      }
    });

    // Update avatar positions on resize
    this.playerAvatars.forEach((avatar, index) => {
      const pos = this.getAvatarPosition(index);
      const avatarSize = 65;

      avatar.background.setPosition(pos.x, pos.y);
      if (avatar.glowCircle) {
        avatar.glowCircle.setPosition(pos.x, pos.y);
      }

      // Redraw graphics at new position
      const isActive = gameState.currentPlayerIndex === index;

      avatar.border.clear();
      avatar.border.lineStyle(7, isActive ? 0xFFFF00 : 0xFFD700, 1);
      avatar.border.strokeCircle(pos.x, pos.y, avatarSize / 2);
    });

    // Update button positions
    this.playButton.setPosition(width / 2 - 80, height / 2 + 35);
    this.playButtonText.setPosition(width / 2 - 80, height / 2 + 35);

    this.passButton.setPosition(width / 2 + 80, height / 2 + 35);
    this.passButtonText.setPosition(width / 2 + 80, height / 2 + 35);
  }

  private handleResize(): void {
    this.calculateCardDimensions();
    this.updateCardPositions();
  }

  update(): void {
    // Game loop updates
  }
}
