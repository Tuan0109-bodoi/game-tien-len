# Trò Chơi Tiến Lên

Một trò chơi Tiến Lên được xây dựng với **Phaser 3** (cho graphics và animation) và **TypeScript** (cho game logic).

## 🎮 Cấu trúc Dự Án

```
game-tien-len/
├── src/
│   ├── index.ts              # Entry point chính
│   ├── index.html            # HTML template
│   ├── game/
│   │   └── GameLogic.ts      # Core game logic (CardDeck, GameLogic)
│   ├── scenes/
│   │   └── GameScene.ts      # Phaser scene (graphics, animation, UI)
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── utils/                # Utility functions (nếu cần)
├── assets/
│   └── default/cards/        # Card images (clubs, diamonds, hearts, spades)
├── dist/                     # Build output
├── webpack.config.js         # Webpack configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 🚀 Cài Đặt & Chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```
Trò chơi sẽ chạy tại `http://localhost:8080`

### 3. Build cho production
```bash
npm run build
```

## 📁 Phân Chia Trách Vụ

### TypeScript (Game Logic) - `src/game/GameLogic.ts`
- **CardDeck**: Quản lý bộ bài (xáo trộn, rút bài)
- **GameLogic**: Xử lý logic trò chơi
  - Khởi tạo game
  - Xác thực nước đi
  - Quản lý lượt chơi
  - Kiểm tra điều kiện thắng

### Phaser (Graphics & Animation) - `src/scenes/GameScene.ts`
- Hiển thị bài trên bàn
- Xử lý tương tác người chơi (click, drag)
- Animation khi chơi bài
- UI buttons (Play, Pass)
- Hiệu ứng hình ảnh

## 🎯 Các Tính Năng Hiện Tại

✅ Khởi tạo game với 4 người chơi
✅ Chia bài tự động
✅ Hiển thị bài của người chơi
✅ Chọn bài để chơi
✅ Nút Play/Pass
✅ Quản lý lượt chơi

## 🔧 Tiếp Theo - Cần Implement

- [ ] Xác thực nước đi theo luật Tiến Lên
- [ ] AI cho các người chơi máy
- [ ] Animation khi chơi bài
- [ ] Sound effects
- [ ] Hiệu ứng khi thắng/thua
- [ ] Lưu trữ game state
- [ ] Multiplayer online (nếu cần)

## 📚 Luật Tiến Lên

Tiến Lên là trò chơi bài với các luật:
1. Người chơi phải chơi bài cao hơn bài trên bàn
2. Có thể chơi 1, 2, 3 lá bài hoặc các tổ hợp đặc biệt
3. Nếu không thể chơi, phải pass
4. Người chơi hết bài trước là người thắng

## 🛠️ Công Nghệ Sử Dụng

- **Phaser 3**: Framework game 2D
- **TypeScript**: Ngôn ngữ lập trình
- **Webpack**: Module bundler
- **WebP**: Format ảnh cho card

## 📝 Ghi Chú

- Assets card được lưu tại `assets/default/cards/`
- Mỗi card có file ảnh riêng: `card-{rank}-{suit}.webp`
- Game logic hoàn toàn tách biệt với Phaser scene
- Có thể dễ dàng thay đổi UI mà không ảnh hưởng logic

## 👨‍💻 Phát Triển

Để thêm tính năng mới:

1. **Thêm logic game**: Sửa `src/game/GameLogic.ts`
2. **Thêm UI/Graphics**: Sửa `src/scenes/GameScene.ts`
3. **Thêm types**: Cập nhật `src/types/index.ts`

---

**Tác giả**: Tuấn Bá
**License**: ISC
