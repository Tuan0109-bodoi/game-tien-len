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

    // Draw table area - Green felt
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x1a5f3f, 0.9);
    graphics.fillRect(width / 4, height / 4, width / 2, height / 2);
    graphics.generateTexture('table-bg', width / 2, height / 2);
    graphics.destroy();

    this.add.image(width / 2, height / 2, 'table-bg').setDepth(0);

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

      // Add player name with background
      const nameText = this.add.text(x, y - 35, player.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 5, y: 3 },
      });
      this.playerNameTexts.set(index, nameText);
    });
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

    // Play button - Center of table
    this.playButton = this.add.rectangle(width / 2 - 60, height / 2 + 30, 100, 35, 0x00aa00);
    this.playButton.setInteractive();
    this.playButton.on('pointerdown', () => this.playSelectedCards());
    this.playButton.setDepth(100);

    this.playButtonText = this.add.text(width / 2 - 60, height / 2 + 30, 'PLAY', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(101);

    // Pass button - Center of table
    this.passButton = this.add.rectangle(width / 2 + 60, height / 2 + 30, 100, 35, 0xaa0000);
    this.passButton.setInteractive();
    this.passButton.on('pointerdown', () => this.passMove());
    this.passButton.setDepth(100);

    this.passButtonText = this.add.text(width / 2 + 60, height / 2 + 30, 'PASS', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(101);
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
