# Responsive Card Sizing - Visual Guide

## Screen Size Breakpoints

### Desktop (1280x720)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         Player 2 (Top)                          │
│                      [Card] [Card] [Card]                       │
│                                                                 │
│  Player 3          ┌─────────────────────────┐          Player 1│
│  (Left)            │                         │          (Right) │
│  [C]               │      TABLE AREA         │          [C]     │
│  [a]               │                         │          [a]     │
│  [r]               │                         │          [r]     │
│  [d]               └─────────────────────────┘          [d]     │
│                                                                 │
│                    Player 0 (Bottom)                            │
│                 [Card] [Card] [Card] [Card]                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Card Dimensions:
- Width: ~80px (max constraint)
- Height: ~120px (max constraint)
- Spacing: ~12px
- Scale: 1.0 (100%)
```

### Tablet (768x1024)
```
┌──────────────────────────────────────────────┐
│                                              │
│            Player 2 (Top)                    │
│         [Card] [Card] [Card]                 │
│                                              │
│ Player 3  ┌──────────────────────┐ Player 1 │
│ (Left)    │                      │ (Right)  │
│ [C]       │    TABLE AREA        │ [C]      │
│ [a]       │                      │ [a]      │
│ [r]       │                      │ [r]      │
│ [d]       └──────────────────────┘ [d]      │
│                                              │
│         Player 0 (Bottom)                    │
│      [Card] [Card] [Card] [Card]             │
│                                              │
└──────────────────────────────────────────────┘

Card Dimensions:
- Width: ~50px
- Height: ~75px
- Spacing: ~7.5px
- Scale: 0.625 (62.5%)
```

### Mobile (375x667)
```
┌──────────────────────┐
│                      │
│  Player 2 (Top)      │
│  [C][C][C][C]        │
│                      │
│ P ┌──────────────┐ P │
│ 3 │              │ 1 │
│ L │  TABLE AREA  │ R │
│ a │              │ i │
│ y │              │ g │
│ e │              │ h │
│ r │              │ t │
│ 3 └──────────────┘   │
│                      │
│  Player 0 (Bottom)   │
│  [C][C][C][C]        │
│                      │
└──────────────────────┘

Card Dimensions:
- Width: ~30px (min constraint)
- Height: ~45px (min constraint)
- Spacing: ~4.5px
- Scale: 0.375 (37.5%)
```

## Calculation Formula

### For Horizontal Layout (Players 0 & 2)
```
Available Width = Screen Width - 200px (padding)
Card Width = min(80, max(30, (Available Width - (13-1) * 5) / 13))
Spacing = Card Width * 0.15
```

### For Vertical Layout (Players 1 & 3)
```
Available Height = Screen Height - 200px (padding)
Card Height = min(120, max(45, (Available Height - (13-1) * 5) / 13))
Spacing = Card Width * 0.15
```

### Sprite Scale
```
Base Card Width = 80px
Base Card Height = 120px
Scale X = Calculated Card Width / 80
Scale Y = Calculated Card Height / 120
Final Scale = min(Scale X, Scale Y)
```

## Responsive Behavior Examples

### Example 1: Desktop to Tablet Resize
```
Initial State (1280x720):
- Card Width: 80px
- Card Height: 120px
- Spacing: 12px

User resizes to 768x1024:
1. handleResize() triggered
2. calculateCardDimensions() recalculates:
   - Available Width: 768 - 200 = 568px
   - Card Width: (568 - 60) / 13 ≈ 39px → clamped to 50px
   - Card Height: (824 - 60) / 13 ≈ 59px → clamped to 75px
   - Spacing: 50 * 0.15 ≈ 7.5px
3. updateCardPositions() repositions all sprites
4. Cards smoothly transition to new positions
```

### Example 2: Mobile Orientation Change
```
Initial State (Portrait 375x667):
- Card Width: 30px (min)
- Card Height: 45px (min)
- Spacing: 4.5px

User rotates to Landscape (667x375):
1. handleResize() triggered
2. calculateCardDimensions() recalculates:
   - Available Width: 667 - 200 = 467px
   - Card Width: (467 - 60) / 13 ≈ 31px → stays at 30px (min)
   - Available Height: 375 - 200 = 175px
   - Card Height: (175 - 60) / 13 ≈ 8px → clamped to 45px (min)
3. updateCardPositions() repositions all sprites
4. Game adapts to landscape layout
```

## Position Calculation

### Player 0 (Bottom - Horizontal)
```
Base Y = Screen Height - 150
Base X = Screen Width / 2 - (Hand Length * (Card Width + Spacing)) / 2

For each card at index i:
Card X = Base X + i * (Card Width + Spacing)
Card Y = Base Y
```

### Player 1 (Right - Vertical)
```
Base X = Screen Width - 120
Base Y = Screen Height / 2 - (Hand Length * (Card Height + Spacing)) / 2

For each card at index i:
Card X = Base X
Card Y = Base Y + i * (Card Height + Spacing)
```

### Player 2 (Top - Horizontal)
```
Base Y = 50
Base X = Screen Width / 2 - (Hand Length * (Card Width + Spacing)) / 2

For each card at index i:
Card X = Base X + i * (Card Width + Spacing)
Card Y = Base Y
```

### Player 3 (Left - Vertical)
```
Base X = 20
Base Y = Screen Height / 2 - (Hand Length * (Card Height + Spacing)) / 2

For each card at index i:
Card X = Base X
Card Y = Base Y + i * (Card Height + Spacing)
```

## Constraint Ranges

| Dimension | Min | Max | Reason |
|-----------|-----|-----|--------|
| Card Width | 30px | 80px | Ensure cards are clickable on mobile, not too large on desktop |
| Card Height | 45px | 120px | Maintain aspect ratio, ensure visibility |
| Spacing | 4.5px | 12px | Proportional to card size (15% of width) |

## Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Game Initialization                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │  calculateCardDimensions() │
            │  - Compute card sizes      │
            │  - Set spacing             │
            └────────────┬───────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │  displayPlayerHands()      │
            │  - Create sprites          │
            │  - Position cards          │
            │  - Add event listeners     │
            └────────────┬───────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │  setupUI()                 │
            │  - Create buttons          │
            │  - Add text labels         │
            └────────────┬───────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │  Add Resize Listener       │
            │  scale.on('resize', ...)   │
            └────────────┬───────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Game Running │
                  └──────┬───────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
    ┌─────────────┐          ┌──────────────────────┐
    │ User Action │          │ Screen Resize Event  │
    │ (Play/Pass) │          │ (Browser/Orientation)│
    └─────────────┘          └──────────┬───────────┘
                                        │
                                        ▼
                            ┌──────────────────────┐
                            │  handleResize()      │
                            └──────────┬───────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
        ┌──────────────────────┐        ┌──────────────────────┐
        │calculateCardDimensions│        │updateCardPositions() │
        │- Recalculate sizes   │        │- Update all positions│
        └──────────────────────┘        └──────────────────────┘
```

## Testing Checklist

### ✅ Dimension Calculation
- [ ] Desktop (1280x720): Cards ~80x120px
- [ ] Tablet (768x1024): Cards ~50x75px
- [ ] Mobile (375x667): Cards ~30x45px

### ✅ Positioning
- [ ] Player 0 (Bottom): Cards centered horizontally
- [ ] Player 1 (Right): Cards centered vertically
- [ ] Player 2 (Top): Cards centered horizontally
- [ ] Player 3 (Left): Cards centered vertically

### ✅ Responsive Behavior
- [ ] Resize from 1280x720 to 800x600: Cards resize smoothly
- [ ] Resize from 800x600 to 1920x1080: Cards scale up
- [ ] Mobile portrait to landscape: Layout adapts
- [ ] No flickering or jumping during resize

### ✅ UI Elements
- [ ] Player names reposition with cards
- [ ] Buttons stay in bottom-right corner
- [ ] All text remains readable

### ✅ Interaction
- [ ] Cards remain clickable after resize
- [ ] Selection highlighting works
- [ ] Play/Pass buttons functional

---

**Last Updated**: 2024
**Status**: Implementation Complete
