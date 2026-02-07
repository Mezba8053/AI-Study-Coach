import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/* ---------- FORMAT EXAM ---------- */
const formatwrittenExamResponse = async (responseText) => {
  try {
    const res = await fetch("/format-written-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: responseText })
    });

    if (!res.ok) throw new Error("Formatting failed");
    return await res.json();
  } catch (err) {
    console.error(err);
    return { questions: [] };
  }
};

/* ---------- MAIN COMPONENT ---------- */
const WrittenExam = () => {
  const location = useLocation();
  const prompt = location.state?.prompt || "";

  const [exam, setExam] = useState({ questions: [] });
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState({});

  /* ---------- GENERATE EXAM ---------- */
  const generateExam = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-written-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, force, nonce: force ? String(Date.now()) : null })
      });

      if (!res.ok) throw new Error("Failed to generate exam");
      const data = await res.json();
      const formatted = await formatwrittenExamResponse(data.text || "");
      const newQuestions = formatted?.questions || [];
      if (force) {
        setExam(prev => {
          const existing = prev?.questions || [];
          const merged = [
            ...existing,
            ...newQuestions.filter(
              q => !existing.some(e => e.question === q.question)
            )
          ];
          return { questions: merged };
        });
      } else {
        setExam({ questions: newQuestions });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  useEffect(() => {
    generateExam(false);
  }, []
);

  /* ---------- EVALUATE ANSWER ---------- */
  const evaluateAnswer = async (index, question, answer) => {
    setEvaluating(prev => ({ ...prev, [index]: true }));

    try {
      const res = await fetch("/api/grade-written-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer })
      });

      if (!res.ok) throw new Error("Failed to grade answer");
      const data = await res.json();
      const result = data.result;
      const display = result
        ? `Score: ${result.score}/10\nFeedback: ${result.feedback}\nImprove: ${result.improve}`
        : data.text;
      setEvaluations(prev => ({
        ...prev,
        [index]: display
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(prev => ({ ...prev, [index]: false }));
    }
  };

  /* ---------- UI ---------- */
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Written Examination</h1>

      {loading && <p style={styles.center}>Generating exam…</p>}

      {exam.questions.map((q, index) => (
        <div key={index} style={styles.card}>
          <p style={styles.question}>
            Q{index + 1}. {q.question}
          </p>

          <textarea
            placeholder="Write your answer here…"
            value={answers[index] || ""}
            onChange={e =>
              setAnswers(prev => ({ ...prev, [index]: e.target.value }))
            }
            style={styles.textarea}
          />

          <button
            style={styles.evaluateBtn}
            disabled={!answers[index] || evaluating[index]}
            onClick={() =>
              evaluateAnswer(index, q.question, answers[index])
            }
          >
            {evaluating[index] ? "Evaluating…" : "Evaluate Answer"}
          </button>

          {evaluations[index] && (
            <div style={styles.feedback}>
              <pre style={styles.feedbackText}>
                {evaluations[index]}
              </pre>
            </div>
          )}

        </div>
        
      ))}
              <button onClick={() => generateExam(true)}>More Question</button>  

    </div>
  );
};

const styles = {
  page: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "system-ui"
  },
  title: {
    textAlign: "center",
    color: "#1e40af",
    marginBottom: "30px"
  },
  center: {
    textAlign: "center"
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
  },
  question: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px"
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    resize: "vertical",
    outline: "none"
  },
  evaluateBtn: {
    marginTop: "12px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer"
  },
  feedback: {
    marginTop: "15px",
    background: "#f9fafb",
    padding: "12px",
    borderRadius: "8px",
    borderLeft: "4px solid #22c55e"
  },
  feedbackText: {
    whiteSpace: "pre-wrap",
    fontSize: "13px"
  }
};

export default WrittenExam;
