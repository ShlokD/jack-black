import { useState } from "preact/hooks";
import "./app.css";
import { createDeck, drawRandom } from "./deck";

const getScore = (cards) => {
  return cards.reduce((score, card) => {
    if (
      card.value === "A" ||
      card.value === "K" ||
      card.value === "J" ||
      card.value === "Q"
    ) {
      score += 11;
    } else {
      score += parseInt(card.value);
    }
    return score;
  }, 0);
};
export function App() {
  const deck = createDeck();
  const [dealerCards, setDealerCards] = useState([
    drawRandom(deck),
    drawRandom(deck),
  ]);
  const [playerCards, setPlayerCards] = useState([
    drawRandom(deck),
    drawRandom(deck),
  ]);

  return (
    <>
      <p>Dealer:</p>
      {dealerCards.map((card) => (
        <p>
          {card.suit}
          {card.value}
        </p>
      ))}
      <p>Player: </p>
      <p>Score: {getScore(playerCards)}</p>
      {playerCards.map((card) => (
        <p>
          {card.suit}
          {card.value}
        </p>
      ))}
      <button>Hit</button>
      <button>Stand</button>
    </>
  );
}
