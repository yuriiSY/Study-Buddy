import React, { useEffect, useState } from "react";
import styles from "./TestsList.module.css";
import api from "../../api/axios";
import apiPY from "../../api/axiosPython";

const TestsList = ({ fileId, onSelectTest }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileId) return;

    const loadTests = async () => {
      try {
        const res = await api.get(`/test/file/${fileId}`);
        const fetchedTests = res.data || [];
        setTests(fetchedTests);
      } catch (err) {
        console.error("Failed to load tests:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, [fileId]);

  const getTestNumberLabel = (index) => {
    return index + 1;
  };

  const handleCreateTest = async () => {
    try {
      const aiRes = await apiPY.post("/generate-mcq", {
        file_ids: [fileId],
        num_questions: 5,
      });

      const mcqs = aiRes.data.mcqs;
      const nextTestNumber = tests.length + 1;

      const saveRes = await api.post("/test/create-from-mcqs", {
        file_id: fileId,
        title: `Test ${nextTestNumber}`,
        description: `Auto-generated test (${mcqs.length} questions)`,
        mcqs,
      });

      setTests((prev) => [saveRes.data, ...prev]);
    } catch (err) {
      console.error("Failed to create test:", err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading tests...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tests</h2>
        <button className={styles.createBtn} onClick={handleCreateTest}>
          + Create Test
        </button>
      </div>

      {tests.length === 0 && (
        <div className={styles.empty}>No tests found for this file.</div>
      )}

      <div className={styles.list}>
        {tests.map((test, index) => {
          const hasScore = test.userScore !== null && test.userScore !== undefined;
          const percentage = hasScore ? Math.round((test.userScore / test.questions.length) * 100) : null;
          const scoreLevel = percentage >= 70 ? "good" : percentage >= 50 ? "average" : "poor";

          return (
            <div key={test.id} className={styles.testCard}>
              <div className={styles.testInfo}>
                <h3 className={styles.testName}>{test.title || `Test ${getTestNumberLabel(index)}`}</h3>
                <p className={styles.testDesc}>{test.description}</p>
              </div>
              
              <div className={styles.cardRight}>
                {hasScore && (
                  <div className={`${styles.scoreBadge} ${styles[scoreLevel]}`}>
                    <div className={styles.scorePercentage}>{percentage}%</div>
                    <div className={styles.scoreFraction}>{test.userScore}/{test.questions.length}</div>
                  </div>
                )}
                
                <button
                  className={styles.takeTestBtn}
                  onClick={() => onSelectTest(test.id)}
                >
                  {hasScore ? "Retake" : "Take Test"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestsList;
