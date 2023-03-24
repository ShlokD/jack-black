import { useState, useEffect, useCallback } from "preact/hooks";
import { createRef } from "preact";
import "./app.css";
import { createDeck, drawRandom, isNearEmpty } from "./deck";

const getScore = (cards) => {
  return cards.reduce((score, card) => {
    if (card.value === "K" || card.value === "J" || card.value === "Q") {
      score += 10;
    } else if (card.value === "A") {
      score += 11;
    } else {
      score += parseInt(card.value);
    }
    return score;
  }, 0);
};

const PLAYER = "PLAYER";
const DEALER = "DEALER";
const END = "END";

const getEndMessage = (playerScore, dealerScore) => {
  if (dealerScore > 21) {
    return "You Win!";
  }
  if (playerScore > 21 || dealerScore > playerScore) {
    return "You Lose!";
  } else if (playerScore > dealerScore) {
    return "You Win!";
  } else if (playerScore === dealerScore) {
    return "Draw!";
  }
};

const createUserState = (deck) => {
  let cards = [drawRandom(deck), drawRandom(deck)];
  while (getScore(cards) > 21) {
    cards = [drawRandom(deck), drawRandom(deck)];
  }

  return { cards, score: getScore(cards) };
};

export function App() {
  const [deck, setDeck] = useState(createDeck());
  const [currentGameState, setCurrentGameState] = useState("PLAYER");
  const [dealer, setDealer] = useState({ cards: [], score: 0 });
  const [player, setPlayer] = useState({ cards: [], score: 0 });

  const timer = createRef(null);

  const addPlayerCard = (card) => {
    const newCards = [...player.cards, card];
    const newScore = getScore(newCards);
    if (newScore >= 21) {
      setCurrentGameState("END");
    }
    setPlayer({
      score: newScore,
      cards: newCards,
    });
  };

  const addDealerCard = (card) => {
    setDealer((prev) => {
      const newCards = [...prev.cards, card];
      const newScore = getScore(newCards);
      if (newScore >= 17) {
        setCurrentGameState("END");
      } else if (newScore >= player.score) {
        setCurrentGameState("END");
      }
      return {
        score: newScore,
        cards: newCards,
      };
    });
  };

  const handleHit = () => {
    let currentDeck = deck;
    if (isNearEmpty(deck)) {
      currentDeck = createDeck();
      setDeck(currentDeck);
    }
    const card = drawRandom(currentDeck);
    addPlayerCard(card);
  };

  const dealerSim = () => {
    let currentDeck = deck;
    if (isNearEmpty(currentDeck)) {
      currentDeck = createDeck();
      setDeck(currentDeck);
    }
    const card = drawRandom(currentDeck);
    addDealerCard(card);
  };

  const updateVal = () => {
    timer.current =
      !timer.current &&
      setInterval(() => {
        dealerSim();
      }, 1000);
  };
  const handleStand = () => {
    if (dealer.score >= player.score) {
      setCurrentGameState("END");
    } else if (dealer.score >= 17 && player.score >= dealer.score) {
      setCurrentGameState("END");
    } else {
      setCurrentGameState("DEALER");
    }
  };

  useEffect(() => {
    if (currentGameState === "DEALER") {
      updateVal();
    } else {
      clearInterval(timer.current);
    }

    return () => clearInterval(timer.current);
  }, [currentGameState]);

  const handleDeal = () => {
    let currentDeck = deck;

    if (isNearEmpty(deck)) {
      const newDeck = createDeck();
      currentDeck = deck;
      setDeck(newDeck);
    }

    setDealer(createUserState(currentDeck));
    setPlayer(createUserState(currentDeck));
    setCurrentGameState("PLAYER");
  };

  useEffect(() => {
    setDealer(createUserState(deck));
    setPlayer(createUserState(deck));
  }, []);

  return (
    <>
      <p>Dealer:</p>
      {currentGameState === "PLAYER" ? (
        <p>
          {dealer.cards[0]?.suit}
          {dealer.cards[0]?.value}
        </p>
      ) : (
        dealer.cards.map((card) => (
          <p>
            {card?.suit}
            {card?.value}
          </p>
        ))
      )}
      <p>Dealer stops at 17, draws at 16</p>
      {currentGameState !== "PLAYER" && <p>Dealer score: {dealer.score}</p>}
      <hr className="ma4" />
      <p>Player: </p>
      <p>Score: {player.score}</p>
      {player.cards.map((card) => (
        <p>
          {card?.suit}
          {card?.value}
        </p>
      ))}
      <button disabled={currentGameState !== "PLAYER"} onClick={handleHit}>
        Hit
      </button>
      <button disabled={currentGameState !== "PLAYER"} onClick={handleStand}>
        Stand
      </button>
      <button disabled={currentGameState !== "END"} onClick={handleDeal}>
        Deal
      </button>
      {currentGameState === "END" && (
        <p>{getEndMessage(player.score, dealer.score)}</p>
      )}
    </>
  );
}
