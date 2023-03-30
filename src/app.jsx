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

const winColor = {
  W: "bg-blue",
  L: "bg-red",
  D: "bg-yellow",
};

const getEndMessage = (playerScore, dealerScore) => {
  if (dealerScore > 21 || (playerScore > dealerScore && playerScore <= 21)) {
    return { state: "WIN" };
  }
  if (dealerScore > playerScore) {
    return { state: "LOSE" };
  } else if (playerScore === dealerScore) {
    return { state: "DRAW" };
  }
};

const createUserState = (deck) => {
  let cards = [drawRandom(deck), drawRandom(deck)];
  while (getScore(cards) > 21) {
    cards = [drawRandom(deck), drawRandom(deck)];
  }

  return { cards, score: getScore(cards) };
};

const Button = ({ disabled, children, ...rest }) => {
  return (
    <button
      className={`pv2 ph4 ma2 b--none white br2 ${
        disabled ? "bg-black-20" : "bg-black-50"
      }`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

const Card = ({ suit, value, color }) => {
  return (
    <p
      className={`mw5 mh2 bg-white br3 pa3 pa4-ns mv3 ba b--black-10 f3 ${color}`}
    >
      {suit}
      {value}
    </p>
  );
};

export function App() {
  const [deck, setDeck] = useState(createDeck());
  const [currentGameState, setCurrentGameState] = useState("PLAYER");
  const [dealer, setDealer] = useState({ cards: [], score: 0 });
  const [player, setPlayer] = useState({ cards: [], score: 0 });
  const [wins, setWins] = useState([]);

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

  const handleDeal = () => {
    let currentDeck = deck;

    if (isNearEmpty(deck)) {
      const newDeck = createDeck();
      currentDeck = deck;
      setDeck(newDeck);
    }

    setDealer(createUserState(currentDeck));
    setPlayer(createUserState(currentDeck));
    const score = getEndMessage(player.score, dealer.score);
    setWins((prev) => [...prev, score.state[0]]);
    setCurrentGameState("PLAYER");
  };

  useEffect(() => {
    if (currentGameState === "DEALER") {
      updateVal();
    } else {
      clearInterval(timer.current);
    }

    return () => clearInterval(timer.current);
  }, [currentGameState]);

  useEffect(() => {
    setDealer(createUserState(deck));
    setPlayer(createUserState(deck));
  }, []);

  return (
    <>
      <h1>Black Jack</h1>
      <div className="flex flex-column items-center justify-center">
        {currentGameState === "PLAYER" ? (
          <Card {...dealer.cards[0]} />
        ) : (
          <div className="flex">
            {dealer.cards.map((card) => (
              <Card {...card} />
            ))}
          </div>
        )}
        <p className="ma0 f4">Dealer stops at 17, draws at 16</p>
        {currentGameState !== "PLAYER" && <p className="f3">{dealer.score}</p>}
        <hr className="ma4 b--solid bw2 br2 w-100" />
        <div class="flex justify-center ma2 flex-wrap">
          {wins.map((win) => (
            <p
              className={`bw1 b--black b--solid pa2 ${winColor[win]}`}
              style={{ width: "36px" }}
            >
              {win}
            </p>
          ))}
        </div>
        <div className="flex">
          {player.cards.map((card) => (
            <Card {...card} />
          ))}
        </div>
        <p className="f3 ma0n">{player.score}</p>
        <div className="flex items-center justify-center">
          <Button disabled={currentGameState !== "PLAYER"} onClick={handleHit}>
            Hit
          </Button>
          <Button
            disabled={currentGameState !== "PLAYER"}
            onClick={handleStand}
          >
            Stand
          </Button>
          <Button disabled={currentGameState !== "END"} onClick={handleDeal}>
            Deal
          </Button>
        </div>
        {currentGameState === "END" && (
          <div>
            <p>{getEndMessage(player.score, dealer.score)?.state}</p>
          </div>
        )}
      </div>
    </>
  );
}
