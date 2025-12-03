import { getDashboardStats } from "../services/dashboardService.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await getDashboardStats(userId);

    return res.json(stats);
  } catch (err) {
    console.error("Error getting dashboard stats:", err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};
