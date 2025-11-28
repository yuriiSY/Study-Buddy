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
        setTests(res.data || []);
      } catch (err) {
        console.error("Failed to load tests:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, [fileId]);

  const handleCreateTest = async () => {
    try {
      const aiRes = await apiPY.post("/generate-mcq", {
        file_ids: [fileId],
        num_questions: 5,
      });

      const mcqs = aiRes.data.mcqs;

      const saveRes = await api.post("/test/create-from-mcqs", {
        file_id: fileId,
        title: `Test ${tests.length + 1}`,
        description: `Auto-generated test (${mcqs.length} questions)`,
        mcqs,
      });

      setTests((prev) => [...prev, saveRes.data]);
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
        {tests.map((test) => (
          <div key={test.id} className={styles.testCard}>
            <div className={styles.testInfo}>
              <h3 className={styles.testName}>{test.title}</h3>
              <p className={styles.testDesc}>{test.description}</p>
            </div>
            <button
              className={styles.takeTestBtn}
              onClick={() => onSelectTest(test.id)}
            >
              Take Test
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestsList;
