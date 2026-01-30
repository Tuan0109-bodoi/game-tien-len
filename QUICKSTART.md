# 🎮 Quick Start Guide - Trò Chơi Tiến Lên

## ⚡ Bắt Đầu Nhanh (2 phút)

### 1. Cài đặt
```bash
npm install
```

### 2. Chạy game
```bash
npm run dev
```

### 3. Mở trình duyệt
```
http://localhost:8080
```

---

## 📂 Cấu Trúc Dự Án

```
game-tien-len/
├── src/
│   ├── index.ts              ← Entry point
│   ├── index.html            ← HTML
│   ├── game/
│   │   ├── GameLogic.ts      ← Core logic (TypeScript)
│   │   └── TienLenValidator.ts ← Xác thực luật
│   ├── scenes/
│   │   └── GameScene.ts      ← Phaser scene (Graphics)
│   └── types/
│       └── index.ts          ← TypeScript types
├── assets/
│   └── default/cards/        ← Card images
├── dist/                     ← Build output
└── package.json
```

---

## 🎯 Phân Chia Trách Vụ

| Phần | File | Trách Vụ |
|------|------|---------|
| **Logic** | `src/game/GameLogic.ts` | Xử lý game rules, quản lý state |
| **Validator** | `src/game/TienLenValidator.ts` | Xác thực nước đi theo luật |
| **Graphics** | `src/scenes/GameScene.ts` | Vẽ UI, xử lý click, animation |
| **Types** | `src/types/index.ts` | TypeScript interfaces |

---

## 🔧 Các Lệnh Hữu Ích

```bash
# Development (hot reload)
npm run dev

# Build production
npm run build

# Xem file được build
ls dist/
```

---

## 📝 Ví Dụ: Thêm Xác Thực Luật

**File**: `src/game/GameLogic.ts`

Thay đổi method `isValidMove`:

```typescript
import { TienLenValidator } from './TienLenValidator';

export class GameLogic {
  private validator = new TienLenValidator();

  private isValidMove(cards: Card[]): boolean {
    if (cards.length === 0) return false;
    if (this.gameState.table.length === 0) return true;

    // Sử dụng validator
    return this.validator.isValidMove(cards, this.gameState.table);
  }
}
```

---

## 🎨 Ví Dụ: Thêm Animation

**File**: `src/scenes/GameScene.ts`

```typescript
private playSelectedCards(): void {
  // ... existing code ...

  if (this.gameLogic.playCards(currentPlayerIndex, cardsToPlay)) {
    // Thêm animation
    this.tweens.add({
      targets: cardsToPlay.map(c => this.cardSprites.get(c.id)),
      y: this.cameras.main.height / 2,
      duration: 500,
      ease: 'Power2.easeOut',
    });

    this.selectedCards.clear();
    this.updateDisplay();
  }
}
```

---

## 🤖 Ví Dụ: Thêm AI

**File**: `src/game/GameLogic.ts` (thêm class mới)

```typescript
export class SimpleAI {
  makeMove(hand: Card[], tableCards: Card[], validator: TienLenValidator): Card[] | null {
    // Tìm nước đi hợp lệ đầu tiên
    for (const card of hand) {
      if (validator.isValidMove([card], tableCards)) {
        return [card];
      }
    }
    return null; // Pass
  }
}
```

---

## 🐛 Debug

### Xem game state
```typescript
console.log(this.gameLogic.getGameState());
```

### Xem hand của player
```typescript
console.log(this.gameLogic.getPlayerHand(0));
```

### Xem card được chọn
```typescript
console.log(Array.from(this.selectedCards));
```

---

## 📚 Tài Liệu

- [README.md](./README.md) - Tổng quan dự án
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Hướng dẫn chi tiết
- [Phaser Docs](https://photonstorm.github.io/phaser3-docs/)

---

## ✅ Checklist Tính Năng

- [x] Khởi tạo game
- [x] Chia bài
- [x] Hiển thị bài
- [x] Chọn bài
- [x] Play/Pass buttons
- [ ] Xác thực luật (TienLenValidator sẵn sàng)
- [ ] AI players
- [ ] Animation
- [ ] Sound effects
- [ ] Multiplayer

---

## 🚀 Tiếp Theo

1. **Integrate TienLenValidator** vào GameLogic
2. **Thêm AI players** cho các máy
3. **Thêm animation** khi chơi bài
4. **Thêm sound effects**
5. **Deploy** lên web

---

**Chúc bạn phát triển vui vẻ! 🎮**
