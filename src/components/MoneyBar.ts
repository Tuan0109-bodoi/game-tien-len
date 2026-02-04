import Phaser from 'phaser';

export class MoneyBar {
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    amount: number
  ) {
    this.container = scene.add.container(x, y);

    // Pill-shaped semi-transparent black background
    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.6);
    this.background.fillRoundedRect(-50, -12, 100, 24, 12);

    // Money text with gold color
    this.text = scene.add.text(0, 0, this.formatMoney(amount), {
      fontSize: '14px',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    this.container.add([this.background, this.text]);
    this.container.setDepth(105);
  }

  private formatMoney(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  public updateAmount(amount: number): void {
    this.text.setText(this.formatMoney(amount));
  }

  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
