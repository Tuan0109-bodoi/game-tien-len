# 🎮 START HERE - Trò Chơi Tiến Lên

## ⚡ Bắt Đầu Trong 30 Giây

```bash
npm run dev
```

Truy cập: **http://localhost:8080**

---

## 📚 Tài Liệu (Chọn Một)

| Tài Liệu | Thời Gian | Nội Dung |
|----------|----------|---------|
| **QUICKSTART.md** | 2 phút | Bắt đầu nhanh + ví dụ |
| **README.md** | 5 phút | Tổng quan dự án |
| **DEVELOPMENT.md** | 10 phút | Hướng dẫn chi tiết |
| **PROJECT_SUMMARY.md** | 5 phút | Tóm tắt toàn bộ |
| **FILES_CREATED.md** | 3 phút | Danh sách file |

---

## 🎯 Cấu Trúc Dự Án

```
src/
├── index.ts              ← Entry point
├── index.html            ← HTML
├── game/
│   ├── GameLogic.ts     ← Core logic (TypeScript)
│   └── TienLenValidator.ts ← Luật game
├── scenes/
│   └── GameScene.ts     ← Graphics (Phaser)
└── types/
    └── index.ts         ← TypeScript types

assets/
└── default/cards/       ← 52 card images
```

---

## 🎮 Cách Chơi

1. **Click bài** để chọn (highlight vàng)
2. **Click "Play"** để chơi bài
3. **Click "Pass"** để bỏ lượt
4. Lượt tự động chuyển sang người tiếp theo

---

## 🔧 Các Lệnh

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build

# Xem build output
ls dist/
```

---

## 💡 Phân Chia Trách Vụ

| Phần | File | Trách Vụ |
|------|------|---------|
| **Logic** | `src/game/GameLogic.ts` | Xử lý game rules |
| **Validator** | `src/game/TienLenValidator.ts` | Xác thực luật |
| **Graphics** | `src/scenes/GameScene.ts` | Vẽ UI, animation |
| **Types** | `src/types/index.ts` | TypeScript types |

---

## ✨ Features Hoàn Thành

✅ Khởi tạo game 4 người chơi
✅ Chia bài tự động (13 lá/người)
✅ Hiển thị bài của 4 người
✅ Chọn bài (click)
✅ Play/Pass buttons
✅ Quản lý lượt chơi
✅ Xác thực nước đi (cơ bản)
✅ TienLenValidator (xác thực luật chi tiết)

---

## 🔧 Cần Implement Tiếp

**Priority 1:**
- [ ] Integrate TienLenValidator vào GameLogic
- [ ] Thêm AI players
- [ ] Hiển thị bài trên bàn

**Priority 2:**
- [ ] Animation khi chơi bài
- [ ] Sound effects
- [ ] Hiệu ứng thắng/thua

**Priority 3:**
- [ ] Multiplayer online
- [ ] Leaderboard
- [ ] Themes

---

## 📖 Ví Dụ Nhanh

### Thêm Xác Thực Luật

**File**: `src/game/GameLogic.ts`

```typescript
import { TienLenValidator } from './TienLenValidator';

export class GameLogic {
  private validator = new TienLenValidator();

  private isValidMove(cards: Card[]): boolean {
    if (cards.length === 0) return false;
    if (this.gameState.table.length === 0) return true;
    
    return this.validator.isValidMove(cards, this.gameState.table);
  }
}
```

### Thêm Animation

**File**: `src/scenes/GameScene.ts`

```typescript
private playSelectedCards(): void {
  // ... existing code ...
  
  this.tweens.add({
    targets: cardsToPlay.map(c => this.cardSprites.get(c.id)),
    y: this.cameras.main.height / 2,
    duration: 500,
  });
}
```

---

## 🎓 Công Nghệ

- **Phaser 3** - Game framework
- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundler
- **WebP** - Card images

---

## 🔗 Links

- [Phaser Docs](https://photonstorm.github.io/phaser3-docs/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Webpack Docs](https://webpack.js.org/)

---

## ✅ Next Steps

1. ✅ **Chạy game**: `npm run dev`
2. 📖 **Đọc**: QUICKSTART.md (2 phút)
3. 🔧 **Implement**: TienLenValidator integration
4. 🤖 **Thêm**: AI players
5. 🎨 **Thêm**: Animation & effects
6. 🚀 **Deploy**: `npm run build`

---

## 🎮 Ready to Play!

```bash
npm run dev
# → http://localhost:8080
```

**Chúc bạn phát triển vui vẻ! 🚀**
