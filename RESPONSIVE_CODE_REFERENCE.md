# Responsive Implementation - Code Reference & Troubleshooting

## Code Reference

### 1. calculateCardDimensions() - Complete Implementation

```typescript
private calculateCardDimensions(): void {
  const width = this.cameras.main.width;
  const height = this.cameras.main.height;
  const maxCards = 13; // Maximum cards in a hand
  const padding = 100; // Padding from edges
  const minCardWidth = 30;
  const maxCardWidth = 80;
  const minCardHeight = 45;
  const maxCardHeight = 120;

  // Calculate card width for horizontal layout (Player 0 and 2)
  const availableWidth = width - 2 * padding;
  const cardWidthFromWidth = Math.max(
    minCardWidth,
    Math.min(maxCardWidth, (availableWidth - (maxCards - 1) * 5) / maxCards)
  );

  // Calculate card height for vertical layout (Player 1 and 3)
  const availableHeight = height - 2 * padding;
  const cardHeightFromHeight = Math.max(
    minCardHeight,
    Math.min(maxCardHeight, (availableHeight - (maxCards - 1) * 5) / maxCards)
  );

  // Set card dimensions
  this.cardWidth = cardWidthFromWidth;
  this.cardHeight = cardHeightFromHeight;

  // Spacing is proportional to card size (15% of card width)
  this.spacing = Math.round(this.cardWidth * 0.15);
}
```

**Key Points:**
- Uses `Math.max()` to enforce minimum constraints
- Uses `Math.min()` to enforce maximum constraints
- Spacing is calculated as 15% of card width for proportional scaling
- Accounts for 13 maximum cards with small gaps between them

### 2. updateCardPositions() - Complete Implementation

```typescript
private updateCardPositions(): void {
  const width = this.cameras.main.width;
  const height = this.cameras.main.height;
  const gameState = this.gameLogic.getGameState();

  // Update each player's hand
  gameState.players.forEach((player, playerIndex) => {
    const hand = this.gameLogic.getPlayerHand(playerIndex);
    const sprites = this.playerHands.get(playerIndex) || [];

    // Calculate base position for this player
    let x: number, y: number;

    switch (playerIndex) {
      case 0: // Bottom - Horizontal
        y = height - 150;
        x = width / 2 - (hand.length * (this.cardWidth + this.spacing)) / 2;
        break;
      case 1: // Right - Vertical
        x = width - 120;
        y = height / 2 - (hand.length * (this.cardHeight + this.spacing)) / 2;
        break;
      case 2: // Top - Horizontal
        y = 50;
        x = width / 2 - (hand.length * (this.cardWidth + this.spacing)) / 2;
        break;
      case 3: // Left - Vertical
        x = 20;
        y = height / 2 - (hand.length * (this.cardHeight + this.spacing)) / 2;
        break;
      default:
        x = 0;
        y = 0;
    }

    // Update each card position
    sprites.forEach((sprite, cardIndex) => {
      let cardX = x;
      let cardY = y;

      if (playerIndex === 0 || playerIndex === 2) {
        cardX += cardIndex * (this.cardWidth + this.spacing);
      } else {
        cardY += cardIndex * (this.cardHeight + this.spacing);
      }

      sprite.setPosition(cardX, cardY);
    });

    // Update player name position
    const nameText = this.playerNameTexts.get(playerIndex);
    if (nameText) {
      nameText.setPosition(x, y - 40);
    }
  });

  // Update button positions
  this.playButton.setPosition(width - 100, height - 50);
  this.playButtonText.setPosition(width - 100, height - 50);

  this.passButton.setPosition(width - 100, height - 100);
  this.passButtonText.setPosition(width - 100, height - 100);
}
```

**Key Points:**
- Iterates through all players and their cards
- Recalculates base position for each player
- Updates individual card positions based on index
- Updates associated text elements
- Updates button positions

### 3. handleResize() - Event Handler

```typescript
private handleResize(): void {
  this.calculateCardDimensions();
  this.updateCardPositions();
}
```

**Usage:**
```typescript
// In create() method:
this.scale.on('resize', () => {
  this.handleResize();
});
```

### 4. Dynamic Scale Calculation in displayPlayerHands()

```typescript
// Calculate scale based on card dimensions
const baseCardWidth = 80;  // Original card width at scale 1
const baseCardHeight = 120; // Original card height at scale 1
const scaleX = this.cardWidth / baseCardWidth;
const scaleY = this.cardHeight / baseCardHeight;
const scale = Math.min(scaleX, scaleY);

const sprite = this.physics.add.sprite(cardX, cardY, `card-${card.rank}-${card.suit}`);
sprite.setScale(scale);
```

**Why Math.min()?**
- Ensures cards maintain aspect ratio
- Prevents distortion
- Uses the smaller scale to fit within bounds

## Troubleshooting Guide

### Issue 1: Cards Overlapping on Mobile

**Symptoms:**
- Cards overlap each other on small screens
- Cards extend beyond screen boundaries

**Causes:**
- Minimum card width constraint too large
- Padding value too high
- Spacing calculation incorrect

**Solutions:**
```typescript
// Option 1: Reduce minimum card width
const minCardWidth = 25;  // Was 30

// Option 2: Reduce padding
const padding = 80;  // Was 100

// Option 3: Reduce spacing percentage
this.spacing = Math.round(this.cardWidth * 0.10);  // Was 0.15 (10% instead of 15%)
```

### Issue 2: Cards Too Small on Desktop

**Symptoms:**
- Cards appear smaller than expected on large screens
- Lots of empty space around cards

**Causes:**
- Maximum card width constraint too small
- Padding value too high

**Solutions:**
```typescript
// Option 1: Increase maximum card width
const maxCardWidth = 100;  // Was 80

// Option 2: Reduce padding
const padding = 80;  // Was 100

// Option 3: Increase spacing percentage
this.spacing = Math.round(this.cardWidth * 0.20);  // Was 0.15 (20% instead of 15%)
```

### Issue 3: Cards Not Repositioning on Resize

**Symptoms:**
- Cards stay in original positions after window resize
- No response to screen size changes

**Causes:**
- Resize listener not attached
- handleResize() not being called
- playerHands map not properly populated

**Solutions:**
```typescript
// Verify resize listener is attached in create():
this.scale.on('resize', () => {
  console.log('Resize event triggered');
  this.handleResize();
});

// Add debugging to handleResize():
private handleResize(): void {
  console.log('handleResize called');
  console.log('New dimensions:', this.cameras.main.width, this.cameras.main.height);
  this.calculateCardDimensions();
  console.log('New card size:', this.cardWidth, this.cardHeight);
  this.updateCardPositions();
}

// Verify playerHands is populated:
console.log('Player hands:', this.playerHands.size);
```

### Issue 4: Player Names Not Updating Position

**Symptoms:**
- Player names stay in original position after resize
- Names appear disconnected from cards

**Causes:**
- playerNameTexts map not properly populated
- updateCardPositions() not updating text positions

**Solutions:**
```typescript
// Verify playerNameTexts is populated in displayPlayerHands():
const nameText = this.add.text(x, y - 40, player.name, {
  fontSize: '16px',
  color: '#ffffff',
});
this.playerNameTexts.set(index, nameText);
console.log('Added player name:', index, nameText);

// Verify updateCardPositions() updates text:
const nameText = this.playerNameTexts.get(playerIndex);
if (nameText) {
  console.log('Updating name position for player', playerIndex);
  nameText.setPosition(x, y - 40);
} else {
  console.warn('No name text found for player', playerIndex);
}
```

### Issue 5: Buttons Not Repositioning

**Symptoms:**
- Play/Pass buttons stay in original position
- Buttons go off-screen on small devices

**Causes:**
- Button references not stored
- updateCardPositions() not updating button positions

**Solutions:**
```typescript
// Verify buttons are stored in setupUI():
this.playButton = this.add.rectangle(width - 100, height - 50, 80, 40, 0x00aa00);
this.playButtonText = this.add.text(width - 100, height - 50, 'Play', {...});

// Verify updateCardPositions() updates buttons:
this.playButton.setPosition(width - 100, height - 50);
this.playButtonText.setPosition(width - 100, height - 50);

// Add debugging:
console.log('Button position:', this.playButton.x, this.playButton.y);
```

### Issue 6: Cards Distorted (Wrong Aspect Ratio)

**Symptoms:**
- Cards appear stretched or squashed
- Cards look deformed

**Causes:**
- Scale calculation using different values for X and Y
- Not using Math.min() for scale

**Solutions:**
```typescript
// Correct implementation:
const baseCardWidth = 80;
const baseCardHeight = 120;
const scaleX = this.cardWidth / baseCardWidth;
const scaleY = this.cardHeight / baseCardHeight;
const scale = Math.min(scaleX, scaleY);  // Use Math.min()
sprite.setScale(scale);

// Wrong implementation (don't do this):
sprite.setScale(scaleX, scaleY);  // Different X and Y scales
```

### Issue 7: Performance Issues on Resize

**Symptoms:**
- Game stutters or freezes during resize
- High CPU usage

**Causes:**
- Redrawing all sprites instead of just repositioning
- Too many calculations in handleResize()

**Solutions:**
```typescript
// Current implementation (efficient):
private handleResize(): void {
  this.calculateCardDimensions();  // Just recalculate numbers
  this.updateCardPositions();      // Just update positions
}

// Avoid this (inefficient):
private handleResize(): void {
  this.updateDisplay();  // This destroys and recreates all sprites!
}

// If performance is still an issue, add throttling:
private resizeTimeout: number | null = null;

private handleResize(): void {
  if (this.resizeTimeout) {
    clearTimeout(this.resizeTimeout);
  }

  this.resizeTimeout = window.setTimeout(() => {
    this.calculateCardDimensions();
    this.updateCardPositions();
    this.resizeTimeout = null;
  }, 100);  // Wait 100ms after resize stops
}
```

## Debugging Tips

### 1. Enable Console Logging

```typescript
private calculateCardDimensions(): void {
  const width = this.cameras.main.width;
  const height = this.cameras.main.height;

  console.log('Screen size:', width, 'x', height);

  // ... calculation code ...

  console.log('Card dimensions:', this.cardWidth, 'x', this.cardHeight);
  console.log('Spacing:', this.spacing);
}
```

### 2. Visual Debugging

```typescript
// Add visual guides to see card boundaries
private displayPlayerHands(): void {
  // ... existing code ...

  // Add debug rectangle around card
  const graphics = this.make.graphics({ x: 0, y: 0 });
  graphics.lineStyle(2, 0xff0000);
  graphics.strokeRect(cardX - this.cardWidth/2, cardY - this.cardHeight/2,
                      this.cardWidth, this.cardHeight);
}
```

### 3. Test Different Screen Sizes

```bash
# Test in browser DevTools
# 1. Open DevTools (F12)
# 2. Click device toolbar icon
# 3. Select different devices:
#    - iPhone SE (375x667)
#    - iPad (768x1024)
#    - Desktop (1280x720)
# 4. Resize window manually
# 5. Check console for logs
```

## Performance Metrics

### Expected Performance

| Operation | Time | Notes |
|-----------|------|-------|
| calculateCardDimensions() | <1ms | Simple math calculations |
| updateCardPositions() | <5ms | Updates ~52 sprites (4 players × 13 cards) |
| handleResize() | <10ms | Total resize handling |
| Full redraw (updateDisplay()) | 50-100ms | Avoid if possible |

### Optimization Tips

1. **Don't redraw on resize** - Just reposition
2. **Use throttling** - Limit resize handler calls
3. **Cache calculations** - Store computed values
4. **Batch updates** - Update all positions at once

## Testing Scenarios

### Scenario 1: Desktop to Mobile
```
1. Start game at 1280x720
2. Open DevTools
3. Toggle device toolbar
4. Select iPhone SE (375x667)
5. Verify: Cards resize, reposition, remain playable
```

### Scenario 2: Orientation Change
```
1. Open game on mobile device
2. Hold in portrait (375x667)
3. Rotate to landscape (667x375)
4. Verify: Layout adapts, cards reposition
5. Rotate back to portrait
6. Verify: Layout returns to original
```

### Scenario 3: Manual Resize
```
1. Open game in browser
2. Resize window from 1280x720 to 800x600
3. Verify: Cards resize smoothly
4. Resize to 1920x1080
5. Verify: Cards scale up to max size
6. Resize to 400x300
7. Verify: Cards stay at min size, don't overflow
```

### Scenario 4: Gameplay During Resize
```
1. Start game
2. Select some cards
3. Resize window
4. Verify: Selected cards remain selected
5. Verify: Can still play/pass
6. Verify: Game logic unaffected
```

---

**Last Updated**: 2024
**Status**: Complete Reference Guide
