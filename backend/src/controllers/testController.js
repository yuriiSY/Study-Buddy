import {
  getFullLeaderboard,
  getLeaderboardForCollaborators,
  submitScore,
  getTestById,
  deleteTest,
  getTestsByFileId,
} from "../services/testService.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { testId, moduleId } = req.query;

    if (!testId) {
      return res.status(400).json({ message: "testId is required" });
    }

    let leaderboard;

    if (moduleId) {
      leaderboard = await getLeaderboardForCollaborators(
        testId,
        Number(moduleId)
      );
    } else {
      leaderboard = await getFullLeaderboard(testId);
    }

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

    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    const tests = await getTestsByFileId(fileId);
    return res.json(tests);
  } catch (error) {
    console.error("Error loading tests for file:", error);
    return res.status(500).json({ message: "Failed to load tests for file" });
  }
};
