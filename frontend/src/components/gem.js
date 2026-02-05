import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GOOGLE_API_KEY });
console.log("API Key loaded:", !!process.env.REACT_APP_GOOGLE_API_KEY);
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

    const generateQuiz = useCallback(async () => {
        setLoading(true);
        try {
            const modelId = "gemini-2.5-flash"; 
          
            async function callGeminiWithRetry(prompt, retries = 3) {
                try {
                    const fullPrompt = `Quiz Topic Name: ${prompt}\nGenerate a quiz (multiple choice) with 10 questions and answers. Format: "1. Question", "a) Option", and an "Answer Key" section at the end.`;
                    
                    const response = await ai.models.generateContent({
                        model: modelId,
                        contents: fullPrompt // The new SDK accepts strings directly here
                    });

                    // NEW SDK: use .text property
                    return response.text; 
                } catch (error) {
                    if (error.status === 429 && retries > 0) {
                        await new Promise(res => setTimeout(res, 15000));
                        return callGeminiWithRetry(prompt, retries - 1);
                    }
                    throw error;
                }
            }

            const responseText = await callGeminiWithRetry(prompt);
            const formattedQuiz = await formatQuizResponse(responseText);
            
            setQuiz(formattedQuiz);
            setAnswerKey(formattedQuiz.answer_key);
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setLoading(false);
        }
    }, [prompt]);
const saveQuiz=async(quizData)=>{
  try {
    const response = await fetch('/api/saveQuiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
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
    return { backgroundColor: "#4CAF50", color: "white" }; // green
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
        if (prompt) {
            generateQuiz();
            // {state:}
        }
    }, [generateQuiz, prompt]);

    return (
        <div>
            <h1>Generated Quiz</h1>
            <h2>Based on: {prompt}</h2>
            
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
<button onClick= {()=>saveQuiz(quiz)}>Save Quiz</button>        
 <button onClick={() => window.history.back()}>Back</button>
        </div>
    );
};

export default Gem;