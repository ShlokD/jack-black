const reds = ["♥️", "♦️"];
const blacks = ["♠️", "♣️"];
const cards = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "K",
  "Q",
];
export const createDeck = () => {
  const deck = [];
  for (let i = 0; i < reds.length; ++i) {
    for (let j = 0; j < cards.length; ++j) {
      deck.push({ value: cards[j], suit: reds[i], seen: false, color: "red" });
    }
  }

  for (let i = 0; i < blacks.length; ++i) {
    for (let j = 0; j < cards.length; ++j) {
      deck.push({
        value: cards[j],
        suit: blacks[i],
        seen: false,
        color: "black",
      });
    }
  }
  return deck.concat(deck.slice());
};

export const drawRandom = (deck) => {
  const allSeen = deck.every((card) => card.seen);
  if (allSeen) {
    return null;
  }
  let random;

  while (true) {
    const index = Math.floor(Math.random() * deck.length);
    random = deck[index];
    if (!random.seen) {
      deck[index].seen = true;
      break;
    }
  }

  return random;
};

export const isNearEmpty = (deck) => {
  return deck.filter((card) => !card.seen).length < 4;
};
