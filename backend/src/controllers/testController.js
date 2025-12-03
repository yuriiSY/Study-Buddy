import {
  getFullLeaderboard,
  getLeaderboardForCollaborators,
  submitScore,
  getTestById,
  deleteTest,
  getTestsByFileId,
  createTestFromMCQs,
  getUserAveragePercentage,
} from "../services/testService.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { testId } = req.query;

    if (!testId) {
      return res.status(400).json({ message: "testId is required" });
    }

    const leaderboard = await getFullLeaderboard(testId);

    return res.json(leaderboard);
  } catch (err) {
    console.error("Error loading leaderboard:", err);
    return res.status(500).json({ message: "Failed to load leaderboard" });
  }
};

export const saveScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { testId, score } = req.body;

    if (!testId || score == null) {
      return res.status(400).json({ message: "testId and score are required" });
    }

    const updated = await submitScore(Number(userId), testId, Number(score));

    return res.json(updated);
  } catch (err) {
    console.error("Error submitting score:", err);
    return res.status(500).json({ message: "Failed to submit score" });
  }
};

export const getSingleTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await getTestById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json(test);
  } catch (error) {
    console.error("Error loading test:", error);
    res.status(500).json({ message: "Failed to load test" });
  }
};

export const deleteExistingTest = async (req, res) => {
  try {
    const { testId } = req.params;

    await deleteTest(testId);

    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({ message: "Failed to delete test" });
  }
};

export const getTestsForFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;

    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    const tests = await getTestsByFileId(fileId, userId);
    return res.json(tests);
  } catch (error) {
    console.error("Error loading tests for file:", error);
    return res.status(500).json({ message: "Failed to load tests for file" });
  }
};

export const createFromMCQs = async (req, res) => {
  try {
    const { file_id, title, description, mcqs, totalQuestions } = req.body;

    const test = await createTestFromMCQs({
      file_id,
      title,
      description,
      mcqs,
      totalQuestions,
    });

    res.json(test);
  } catch (err) {
    console.error("Create test error:", err);
    res.status(500).json({ error: "Failed to create test" });
  }
};

export const getAverageScorePercentage = async (req, res) => {
  try {
    const userId = req.user.id;

    const percentage = await getUserAveragePercentage(userId);

    if (percentage === null) {
      return res.json({ percentage: 0 });
    }

    return res.json({ percentage });
  } catch (err) {
    console.error("Error calculating percentage:", err);
    return res.status(500).json({ message: "Failed to calculate percentage" });
  }
};
