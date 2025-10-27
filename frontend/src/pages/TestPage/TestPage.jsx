import MCQTest from "../../components/MCQTest/MCQTest";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";

const sampleQuestions = [
  {
    id: "q1",
    topic: "Derivatives",
    difficulty: "Medium",
    question: "What is the derivative of f(x) = x³ + 2x² - 5x + 1?",
    options: [
      "3x² + 4x - 5",
      "3x² + 2x - 5",
      "x⁴ + 2x³ - 5x² + x",
      "3x² + 4x + 5",
    ],
    correctAnswer: "3x² + 2x - 5",
  },
];

export const TestPage = () => {
  const handleSubmit = (answers) => {
    console.log("Submitted answers:", answers);
  };

  return (
    <Layout>
      <Header />
      <MCQTest questions={sampleQuestions} onSubmit={handleSubmit} />;
    </Layout>
  );
};
