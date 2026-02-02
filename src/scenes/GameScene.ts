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
  private cardWidth: number = 40;
  private cardHeight: number = 60;
  private spacing: number = 15;
  private playerNameTexts: Map<number, Phaser.GameObjects.Text> = new Map();
  private playButton!: Phaser.GameObjects.Rectangle;
  private passButton!: Phaser.GameObjects.Rectangle;
  private playButtonText!: Phaser.GameObjects.Text;
  private passButtonText!: Phaser.GameObjects.Text;
  private currentPlayerText!: Phaser.GameObjects.Text;

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
  }

  /**
   * Calculate card dimensions dynamically based on screen size
   */
  private calculateCardDimensions(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const maxCards = 13;
    const padding = 120; // Tăng padding để có chỗ cho 4 player
    const minCardWidth = 15;
    const maxCardWidth = 35;
    const minCardHeight = 22;
    const maxCardHeight = 52;
    const minSpacing = 10;
    const maxSpacing = 15;

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

    // Create casino-style table with wooden rail - FULL SCREEN
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Wooden rail border (dark brown) - covers entire screen
    const railWidth = 60;
    graphics.fillStyle(0x3d2817, 1);
    graphics.fillRoundedRect(
      railWidth,
      railWidth,
      width - railWidth * 2,
      height - railWidth * 2,
      30
    );

    // Inner shadow for rail depth
    graphics.lineStyle(4, 0x2a1810, 0.8);
    graphics.strokeRoundedRect(
      railWidth + 4,
      railWidth + 4,
      width - railWidth * 2 - 8,
      height - railWidth * 2 - 8,
      30
    );

    // Green felt table surface - full screen
    graphics.fillStyle(0x1a5f3f, 1);
    graphics.fillRoundedRect(railWidth + 10, railWidth + 10, width - (railWidth + 10) * 2, height - (railWidth + 10) * 2, 25);

    graphics.generateTexture('table-bg', width, height);
    graphics.destroy();

    this.add.image(width / 2, height / 2, 'table-bg').setDepth(0);

    // Add vignette effect (darker corners) - lighter for better performance
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0);
    vignette.fillRect(0, 0, width, height);

    // Simplified vignette - only 3 layers instead of 5
    for (let i = 0; i < 3; i++) {
      const alpha = 0.1 - (i * 0.03);
      const size = Math.min(width, height) * (0.4 + i * 0.25);
      vignette.lineStyle(size, 0x000000, alpha);
      vignette.strokeRect(0, 0, width, height);
    }
    vignette.setDepth(5);

    // Add table label
    this.add.text(width / 2, height / 2 - 20, 'TABLE', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(1);
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

      switch (index) {
        case 0: // Bottom - Player
          y = height - 70;
          x = width / 2 - (hand.length * (this.cardWidth + this.spacing)) / 2;
          isHorizontal = true;
          break;
        case 1: // Right - Opponent
          x = width - 100;
          y = height / 2 - (hand.length * (this.cardHeight + this.spacing)) / 2;
          isHorizontal = false;
          break;
        case 2: // Top - Opponent
          y = 60;
          x = width / 2 - (hand.length * (this.cardWidth + this.spacing)) / 2;
          isHorizontal = true;
          break;
        case 3: // Left - Opponent
          x = 60;
          y = height / 2 - (hand.length * (this.cardHeight + this.spacing)) / 2;
          isHorizontal = false;
          break;
        default:
          x = 0;
          y = 0;
          isHorizontal = true;
      }

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

        // Add subtle drop shadow for depth (lighter for better performance)
        if (sprite.preFX) {
          sprite.preFX.addShadow(1, 1, 0.03, 0.5, 0x000000, 3);
        }

        sprite.setData('originalY', cardY);
        sprite.setData('originalX', cardX);
        sprite.setData('playerIndex', index);
        sprite.setData('cardId', card.id);

        sprite.on('pointerdown', () => this.selectCard(card, sprite));

        // Hover effect only for player 0
        if (index === 0) {
          sprite.on('pointerover', () => {
            if (!this.selectedCards.has(card.id)) {
              sprite.setTint(0xcccccc);
              sprite.setY(cardY - 12);
            }
          });

          sprite.on('pointerout', () => {
            if (!this.selectedCards.has(card.id)) {
              sprite.clearTint();
              sprite.setY(cardY);
            }
          });
        }

        sprites.push(sprite);
        this.cardSprites.set(card.id, sprite);
      });

      this.playerHands.set(index, sprites);

      // Create avatar with metallic gold border
      const avatarSize = 50;
      const avatarX = index === 0 ? width / 2 : (index === 1 ? width - 80 : (index === 2 ? width / 2 : 80));
      const avatarY = index === 0 ? height - 120 : (index === 1 ? height / 2 : (index === 2 ? 100 : height / 2));

      // Avatar background circle
      const avatarBg = this.add.circle(avatarX, avatarY, avatarSize / 2, this.getPlayerColor(index));
      avatarBg.setDepth(100);

      // Metallic gold border
      const border = this.add.graphics();
      border.lineStyle(4, 0xFFD700, 1);
      border.strokeCircle(avatarX, avatarY, avatarSize / 2);
      border.setDepth(101);

      // Highlight arc (top-left)
      const highlight = this.add.graphics();
      highlight.lineStyle(2, 0xFFFFAA, 0.8);
      highlight.beginPath();
      highlight.arc(avatarX, avatarY, avatarSize / 2 - 1, Phaser.Math.DegToRad(225), Phaser.Math.DegToRad(315), false);
      highlight.strokePath();
      highlight.setDepth(102);

      // Shadow arc (bottom-right)
      const shadow = this.add.graphics();
      shadow.lineStyle(2, 0xCC9900, 0.8);
      shadow.beginPath();
      shadow.arc(avatarX, avatarY, avatarSize / 2 - 1, Phaser.Math.DegToRad(45), Phaser.Math.DegToRad(135), false);
      shadow.strokePath();
      shadow.setDepth(102);

      // Player initials
      const initials = player.name.substring(0, 2).toUpperCase();
      this.add.text(avatarX, avatarY, initials, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Impact, Arial Black, sans-serif',
      }).setOrigin(0.5).setDepth(103);

      // Name tag with rounded black background
      const nameTag = this.add.text(avatarX, avatarY + avatarSize / 2 + 15, player.name, {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
      }).setOrigin(0.5).setDepth(100);

      // Round the name tag corners
      nameTag.setStyle({ ...nameTag.style, borderRadius: 10 });

      this.playerNameTexts.set(index, nameTag);
    });
  }

  private getPlayerColor(index: number): number {
    const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A];
    return colors[index % colors.length];
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
      sprite.setY(originalY - 25);
    }
  }

  private setupUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Current player indicator
    const gameState = this.gameLogic.getGameState();
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    this.currentPlayerText = this.add.text(width / 2, height / 2 - 60, `${currentPlayer.name}'s Turn`, {
      fontSize: '16px',
      color: '#ffff00',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      align: 'center',
    }).setOrigin(0.5).setDepth(101);

    // Play button - Green with 3D bevel effect
    const playBtnX = width / 2 - 80;
    const playBtnY = height / 2 + 30;

    // Button shadow (bottom layer)
    const playShadow = this.add.rectangle(playBtnX + 2, playBtnY + 2, 120, 40, 0x004400);
    playShadow.setDepth(99);

    // Main button with gradient effect (simulate with multiple rectangles)
    this.playButton = this.add.rectangle(playBtnX, playBtnY, 120, 40, 0x00CC00);
    this.playButton.setInteractive();
    this.playButton.setDepth(100);

    // Top highlight for 3D effect
    const playHighlight = this.add.rectangle(playBtnX, playBtnY - 2, 120, 8, 0x00FF00, 0.3);
    playHighlight.setDepth(101);

    // Button border
    const playBorder = this.add.graphics();
    playBorder.lineStyle(2, 0x008800, 1);
    playBorder.strokeRoundedRect(playBtnX - 60, playBtnY - 20, 120, 40, 5);
    playBorder.setDepth(101);

    this.playButtonText = this.add.text(playBtnX, playBtnY, 'PLAY', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Impact, Arial Black, sans-serif',
      align: 'center',
    }).setOrigin(0.5).setDepth(102);

    // Hover effect for play button
    this.playButton.on('pointerover', () => {
      this.playButton.setFillStyle(0x00FF00);
    });
    this.playButton.on('pointerout', () => {
      this.playButton.setFillStyle(0x00CC00);
    });
    this.playButton.on('pointerdown', () => this.playSelectedCards());

    // Pass button - Red with 3D bevel effect
    const passBtnX = width / 2 + 80;
    const passBtnY = height / 2 + 30;

    // Button shadow (bottom layer)
    const passShadow = this.add.rectangle(passBtnX + 2, passBtnY + 2, 120, 40, 0x440000);
    passShadow.setDepth(99);

    // Main button
    this.passButton = this.add.rectangle(passBtnX, passBtnY, 120, 40, 0xCC0000);
    this.passButton.setInteractive();
    this.passButton.setDepth(100);

    // Top highlight for 3D effect
    const passHighlight = this.add.rectangle(passBtnX, passBtnY - 2, 120, 8, 0xFF0000, 0.3);
    passHighlight.setDepth(101);

    // Button border
    const passBorder = this.add.graphics();
    passBorder.lineStyle(2, 0x880000, 1);
    passBorder.strokeRoundedRect(passBtnX - 60, passBtnY - 20, 120, 40, 5);
    passBorder.setDepth(101);

    this.passButtonText = this.add.text(passBtnX, passBtnY, 'PASS', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Impact, Arial Black, sans-serif',
      align: 'center',
    }).setOrigin(0.5).setDepth(102);

    // Hover effect for pass button
    this.passButton.on('pointerover', () => {
      this.passButton.setFillStyle(0xFF0000);
    });
    this.passButton.on('pointerout', () => {
      this.passButton.setFillStyle(0xCC0000);
    });
    this.passButton.on('pointerdown', () => this.passMove());
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
      const offsetX = (index - cards.length / 2 + 0.5) * 40;
      const offsetY = (index - cards.length / 2 + 0.5) * 30;

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
      sprite.setAngle(Phaser.Math.Between(-15, 15)); // Random rotation

      this.tableCards.push(sprite);
    });
  }

  private passMove(): void {
    const gameState = this.gameLogic.getGameState();
    const currentPlayerIndex = gameState.currentPlayerIndex;

    console.log('Pass move called for player', currentPlayerIndex);
    if (this.gameLogic.passMove(currentPlayerIndex)) {
      console.log('Pass successful');
      this.selectedCards.clear();
      this.updateDisplay();
    } else {
      console.log('Pass failed');
    }
  }

  private updateDisplay(): void {
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites.clear();
    this.playerHands.clear();

    this.playerNameTexts.forEach(text => text.destroy());
    this.playerNameTexts.clear();

    // Update current player indicator
    const gameState = this.gameLogic.getGameState();
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    if (this.currentPlayerText) {
      this.currentPlayerText.setText(`${currentPlayer.name}'s Turn`);
      this.currentPlayerText.setPosition(width / 2, height / 2 - 60);
    }

    this.displayPlayerHands();
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
          x = width - 100;
          y = height / 2 - (hand.length * (this.cardHeight + this.spacing)) / 2;
          isHorizontal = false;
          break;
        case 2:
          y = 60;
          x = width / 2 - (hand.length * (this.cardWidth + this.spacing)) / 2;
          isHorizontal = true;
          break;
        case 3:
          x = 60;
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
        nameText.setPosition(x, y - 35);
      }
    });

    // Update button positions - Center of table
    this.playButton.setPosition(width / 2 - 60, height / 2 + 30);
    this.playButtonText.setPosition(width / 2 - 60, height / 2 + 30);

    this.passButton.setPosition(width / 2 + 60, height / 2 + 30);
    this.passButtonText.setPosition(width / 2 + 60, height / 2 + 30);

    this.currentPlayerText.setPosition(width / 2, height / 2 - 60);
  }

  private handleResize(): void {
    this.calculateCardDimensions();
    this.updateCardPositions();
  }

  update(): void {
    // Game loop updates
  }
}
