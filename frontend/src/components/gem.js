 
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
const formatQuizResponse = async (responseText) => {
  try {
    const res = await fetch("/format-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quizText: responseText }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error formatting quiz:", error);
    return {questions: [], answer_key: ''};
  }
};

const Gem = () => {
    const location = useLocation();
    const prompt = location.state?.prompt || '';
    const [quiz, setQuiz] = useState({questions: []});
    const [loading, setLoading] = useState(false);
    const [answerKey, setAnswerKey] = useState('');
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResult, setShowResult] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const score = Object.keys(showResult).filter(q => showResult[q] && selectedAnswers[q] === answerKey[q]).length;
    const isGeneratingRef = useRef(false);
    const hasGeneratedRef = useRef(false);

    const generateQuiz = useCallback(async (force = false) => {
      if (!prompt || isGeneratingRef.current) return;
      isGeneratingRef.current = true;
      setLoading(true);
      if(score>=4){
        setDifficulty("hard");
      }  
      setErrorMessage("");
        try {
            const res = await fetch("/api/generate-quiz", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt,
                difficulty,
                force,
                nonce: force ? String(Date.now()) : null
              })
            });
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            const responseText = data.text || "";
            const formattedQuiz = await formatQuizResponse(responseText);
            
            setQuiz(formattedQuiz);
            setAnswerKey(formattedQuiz.answer_key);
        } catch (error) {
            console.error("AI Error:", error);
            setErrorMessage("Rate limit hit. Please wait a moment and try again.");
        } finally {
            setLoading(false);
            isGeneratingRef.current = false;
        }
    }, [prompt, difficulty]);
const saveQuiz=async(quizData)=>{
  try {
    const response = await fetch('/api/saveQuiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quizData: {
          topic: prompt,
          questions: quizData.questions,
          answer_key: quizData.answer_key
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save quiz');
    }
    
    const result = await response.json();
    console.log('Quiz saved successfully:', result);
  } catch (error) {
    console.error('Error saving quiz:', error);
  }
};
    //... handleAnswerClick and getButtonStyle remain the same
const getButtonStyle = (qIndex, option, correctAnswer) => {
  if (!showResult[qIndex]) return {};

  if (option === correctAnswer) {
    return { backgroundColor: "#1bae20", color: "white" }; // green
  }

  if (selectedAnswers[qIndex] === option) {
    return { backgroundColor: "#F44336", color: "white" }; // red
  }

  return {};
};
const handleAnswerClick = (qIndex, option) => {
  if (showResult[qIndex]) return; // prevent re-click

  setSelectedAnswers(prev => ({
    ...prev,
    [qIndex]: option
  }));

  setShowResult(prev => ({
    ...prev,
    [qIndex]: true
  }));
};
// const [selectedAnswers, setSelectedAnswers] = useState({});
// const [showResult, setShowResult] = useState({});

    useEffect(() => {
      if (!prompt || hasGeneratedRef.current) return;
      hasGeneratedRef.current = true;
      generateQuiz();
    }, [generateQuiz, prompt]);

    return (
        <div>
            <h1>Generated Quiz</h1>
            <h2>Based on: {prompt}</h2>
            <p>Score: {score} correct</p>
            
{loading ? <p>Loading...</p> :

 <div style={{ maxWidth: "800px", margin: "auto" }}>
  <h1 style={{ color: "#2563eb", textAlign: "center" }}>
    Multiple Choice Quiz
  </h1> 

  {quiz.questions?.slice(0, 10).map((q, index) => (

    <div
      key={index}
      style={{
        background: "#f9fafb",
        padding: "20px",
        marginBottom: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}
    >
      <h3> {q.question}</h3>

      {q.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleAnswerClick(index, opt)}
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            margin: "8px 0",
            borderRadius: "8px",
            border: "1px solid #ccc",
            cursor: "pointer",
            ...getButtonStyle(index, opt, answerKey[index])
          }}
        >
          {opt}
        </button>
      ))}

      {/* Show correct answer if wrong */}
      {showResult[index] &&
  selectedAnswers[index] !== answerKey[index] && (
    <p style={{ color: "#16a34a", marginTop: "10px" }}>
      ✅ Correct answer: <strong>{answerKey[index]}</strong>
    </p>
  )}
    </div>
  ))}
</div>
}
<button onClick={() => generateQuiz(true)}>More Question</button>
{errorMessage && <p style={{ color: "#dc2626" }}>{errorMessage}</p>}  
<button onClick= {()=>saveQuiz(quiz)}>Save Quiz</button>        
 <button onClick={() => window.history.back()}>Back</button>
        </div>
    );
};

export default Gem;