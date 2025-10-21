import Flashcard from "../../components/Flashcard/Flashcard";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";

const cardsData = [
  {
    id: 1,
    topic: "Integration",
    difficulty: "Hard",
    question: "State the Fundamental Theorem of Calculus",
    answer:
      "It links the concept of differentiation and integration, stating that the derivative of the integral of a function is the function itself.",
  },
  {
    id: 2,
    topic: "Limits",
    difficulty: "Medium",
    question: "What is the limit of sin(x)/x as x approaches 0?",
    answer: "The limit is 1.",
  },
];

export const FlashcardPage = () => {
  const handleFinish = () => alert("You finished all flashcards!");

  return (
    <Layout>
      <Header />
      <Flashcard cards={cardsData} onFinish={handleFinish} />;
    </Layout>
  );
};
