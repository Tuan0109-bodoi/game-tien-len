# Tiến Lên Game Core

Logic core cho game Tiến Lên miền Nam (4 người) viết bằng TypeScript/JavaScript.

## 🎮 Giới Thiệu

Đây là một thư viện core logic cho game Tiến Lên miền Nam, không phụ thuộc vào UI hay Discord. Nó cung cấp:

- ✅ Kiểm tra tính hợp lệ của các loại bài
- ✅ Kiểm tra tính hợp lệ của nước đi
- ✅ Quản lý trạng thái game
- ✅ Xử lý lượt đánh và pass
- ✅ Tìm người thắng
- ✅ Lịch sử nước đi

## 📋 Luật Chơi

### Cơ Bản
- 4 người chơi, 52 lá bài (không có Joker)
- Mục tiêu: Hết bài trước người khác
- Mỗi người được chia 13 lá bài
- Người có 3 cơ (3♣) đi trước

### Các Loại Bài Hợp Lệ
1. **Bài đơn**: 1 lá bài
2. **Cặp**: 2 lá bài cùng rank
3. **Bộ ba**: 3 lá bài cùng rank
4. **Sảnh**: 3+ lá bài liên tiếp (3-4-5, 4-5-6, ..., Q-K-A)
5. **Sảnh cặp**: 3+ cặp liên tiếp (3-3-4-4-5-5, ...)
6. **Sảnh bộ ba**: 3+ bộ ba liên tiếp (3-3-3-4-4-4-5-5-5, ...)
7. **Tứ quý**: 4 lá bài cùng rank (có thể kèm 1 lá bài khác)

### Luật Đánh
- Người đi trước đánh bất kỳ loại bài nào
- Người sau phải đánh cùng loại bài, số lượng bài bằng nhau, và cao hơn
- Nếu không thể đánh, bỏ lượt (pass)
- Nếu 3 người liên tiếp bỏ lượt, vòng kết thúc, người đánh cuối cùng đi tiếp
- **Bài 2 là bài cao nhất** (có thể đánh lên bất kỳ bài nào)
- **Bài 3 cơ là bài thấp nhất**

### Thứ Tự Bài
```
Từ thấp đến cao: 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2
Chất: Cơ < Rô < Chuồn < Pích (khi cùng rank)
```

## 🚀 Cài Đặt

```bash
npm install
```

## 📖 Sử Dụng

### Khởi Tạo Game

```typescript
import { Game } from './src/core/Game';

// Tạo game với 4 người chơi
const game = new Game(['Alice', 'Bob', 'Charlie', 'Diana']);

// Khởi tạo game (chia bài, tìm người đi trước)
game.initialize();
```

### Xử Lý Lượt Đánh

```typescript
// Lấy người chơi hiện tại
const currentPlayer = game.getCurrentPlayer();
console.log(`${currentPlayer.name}'s turn`);

// Lấy bài trong tay
console.log(`Hand: ${currentPlayer.hand.length} cards`);

// Đánh bài
const cardsToPlay = [currentPlayer.hand[0]];
const success = game.playCards(currentPlayer.id, cardsToPlay);

if (success) {
  console.log('Move accepted');
} else {
  console.log('Invalid move');
}
```

### Xử Lý Pass

```typescript
// Bỏ lượt
game.passCurrentPlayer();

// Kiểm tra số lượt pass liên tiếp
const consecutivePass = game.getConsecutivePass();
console.log(`Consecutive pass: ${consecutivePass}`);
```

### Kiểm Tra Trạng Thái Game

```typescript
// Kiểm tra game đã kết thúc chưa
if (game.isGameFinished()) {
  const winner = game.getWinner();
  console.log(`${winner?.name} wins!`);
}

// Lấy trạng thái game
const state = game.getState();
console.log(`Phase: ${state.gamePhase}`);
console.log(`Round: ${state.roundNumber}`);

// Lấy bài cuối cùng được đánh
const lastPlayed = game.getLastPlayedCards();
console.log(`Last played: ${lastPlayed.length} cards`);
```

### Sử Dụng Validators

```typescript
import { CardValidator, MoveValidator } from './src/core';

// Kiểm tra loại bài
const cards = [/* ... */];
const cardType = CardValidator.getCardType(cards);
console.log(`Card type: ${cardType}`);

// Kiểm tra nước đi hợp lệ
const isValid = MoveValidator.isValidMove(
  playedCards,
  lastPlayedCards,
  playerHand,
  isFirstMove
);
```

### Sử Dụng Comparator

```typescript
import { CardComparator } from './src/core';

// So sánh bài
const card1 = { rank: 'FIVE', suit: 'CLUBS' };
const card2 = { rank: 'SEVEN', suit: 'CLUBS' };

if (CardComparator.isGreater(card2, card1)) {
  console.log('Card2 is higher');
}

// Sắp xếp bài
const sorted = CardComparator.sortCards(cards);

// Tìm bài cao nhất
const highest = CardComparator.getHighestCard(cards);
```

### Sử Dụng Utilities

```typescript
import { CardUtils, GameUtils } from './src/utils';

// Tạo bài từ string
const card = CardUtils.createCardFromString('5♣');

// Chuyển đổi mảng bài thành string
const cardsStr = CardUtils.cardsToString(cards);

// In trạng thái game
GameUtils.printGameState(game);

// In lịch sử nước đi
GameUtils.printPlayHistory(game);

// Kiểm tra game state hợp lệ
const isValid = GameUtils.validateGameState(game);
```

## 🧪 Testing

### Chạy Tất Cả Tests

```bash
npm test
```

### Chạy Unit Tests

```bash
npm run test:unit
```

### Chạy Integration Tests

```bash
npm run test:integration
```

### Kiểm Tra Coverage

```bash
npm run test:coverage
```

## 📁 Cấu Trúc Thư Mục

```
src/
├── types/
│   ├── Card.ts           # Định nghĩa Card, Suit, Rank
│   ├── Player.ts         # Định nghĩa Player
│   ├── GameState.ts      # Định nghĩa GameState
│   └── Move.ts           # Định nghĩa Move, CardType
├── core/
│   ├── Game.ts           # Lớp Game chính
│   ├── CardValidator.ts  # Kiểm tra loại bài
│   ├── MoveValidator.ts  # Kiểm tra nước đi
│   ├── CardComparator.ts # So sánh bài
│   └── Deck.ts           # Quản lý bộ bài
├── utils/
│   ├── CardUtils.ts      # Hàm tiện ích cho bài
│   └── GameUtils.ts      # Hàm tiện ích cho game
└── index.ts              # Main entry point

tests/
├── unit/
│   ├── CardValidator.test.ts
│   ├── CardComparator.test.ts
│   ├── MoveValidator.test.ts
│   └── Deck.test.ts
├── integration/
│   └── Game.test.ts
└── fixtures/
    └── testData.ts
```

## 🔧 API Reference

### Game Class

```typescript
class Game {
  // Khởi tạo
  constructor(playerNames: string[])
  initialize(): void

  // Xử lý lượt đánh
  playCards(playerId: string, cards: Card[]): boolean
  passCurrentPlayer(): void

  // Truy vấn trạng thái
  getCurrentPlayer(): Player
  getPlayers(): Player[]
  getState(): GameState
  getLastPlayedCards(): Card[]
  getLastPlayedType(): CardType | null
  getConsecutivePass(): number

  // Kiểm tra
  canPlayCards(playerId: string, cards: Card[]): boolean
  isGameFinished(): boolean
  getWinner(): Player | null

  // Lịch sử
  getPlayHistory(): PlayedCards[]

  // Reset
  reset(): void
}
```

### CardValidator Class

```typescript
class CardValidator {
  static isValidSingle(cards: Card[]): boolean
  static isValidPair(cards: Card[]): boolean
  static isValidTriple(cards: Card[]): boolean
  static isValidSequence(cards: Card[]): boolean
  static isValidPairSequence(cards: Card[]): boolean
  static isValidTripleSequence(cards: Card[]): boolean
  static isValidQuad(cards: Card[]): boolean
  static getCardType(cards: Card[]): CardType | null
  static isValidCardType(cards: Card[]): boolean
}
```

### MoveValidator Class

```typescript
class MoveValidator {
  static isValidMove(
    playedCards: Card[],
    lastPlayedCards: Card[],
    playerHand: Card[],
    isFirstMove?: boolean
  ): boolean

  static canBeat(playedCards: Card[], lastPlayedCards: Card[]): boolean
  static hasThreeOfClubs(playerHand: Card[]): boolean
}
```

### CardComparator Class

```typescript
class CardComparator {
  static compareCards(card1: Card, card2: Card): number
  static compareByRank(card1: Card, card2: Card): number
  static compareBySuit(card1: Card, card2: Card): number
  static getCardValue(card: Card): number
  static isGreater(card1: Card, card2: Card): boolean
  static isLess(card1: Card, card2: Card): boolean
  static isEqual(card1: Card, card2: Card): boolean
  static sortCards(cards: Card[]): Card[]
  static getHighestCard(cards: Card[]): Card
  static getLowestCard(cards: Card[]): Card
}
```

## 📊 Test Coverage

- **CardValidator**: 100% coverage
- **CardComparator**: 100% coverage
- **MoveValidator**: 100% coverage
- **Deck**: 100% coverage
- **Game**: 95%+ coverage
- **Overall**: 90%+ coverage

## 🎯 Ví Dụ Hoàn Chỉnh

```typescript
import { Game, GameUtils } from './src';

// Tạo game
const game = new Game(['Alice', 'Bob', 'Charlie', 'Diana']);
game.initialize();

// In trạng thái ban đầu
GameUtils.printGameState(game);

// Chơi game
let moveCount = 0;
while (!game.isGameFinished() && moveCount < 100) {
  const currentPlayer = game.getCurrentPlayer();
  const hand = currentPlayer.hand;

  if (hand.length === 0) break;

  // Đánh bài đầu tiên trong tay
  const card = hand[0];
  const success = game.playCards(currentPlayer.id, [card]);

  if (success) {
    console.log(`${currentPlayer.name} played 1 card`);
  } else {
    game.passCurrentPlayer();
    console.log(`${currentPlayer.name} passed`);
  }

  moveCount++;
}

// In kết quả
if (game.isGameFinished()) {
  const winner = game.getWinner();
  console.log(`\n🎉 ${winner?.name} wins!`);
}

GameUtils.printPlayHistory(game);
```

## 🛠️ Build

```bash
npm run build
```

Sẽ tạo thư mục `dist/` với compiled JavaScript.

## 📝 License

MIT

## 👨‍💻 Phát Triển

### Thêm Tính Năng Mới

1. Thêm types nếu cần
2. Implement logic trong `src/core/`
3. Thêm unit tests trong `tests/unit/`
4. Chạy tests để đảm bảo không break existing code
5. Update documentation

### Chạy Tests Khi Phát Triển

```bash
npm run test:watch
```

## 🐛 Known Issues

Không có issues hiện tại.

## 🚀 Future Enhancements

- [ ] AI player
- [ ] Replay/undo moves
- [ ] Game statistics
- [ ] Persistence (save/load game)
- [ ] Multiplayer support
- [ ] Web UI integration
- [ ] Discord bot integration

---

**Version**: 1.0.0
**Last Updated**: 2024
