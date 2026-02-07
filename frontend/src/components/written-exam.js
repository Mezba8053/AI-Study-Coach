import { GoogleGenAI } from "@google/genai";
// import {openAI} from "@openai/openai";
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GOOGLE_API_KEY });
// const ai=new openAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY });
console.log("API Key loaded:", !!process.env.REACT_APP_OPENAI_API_KEY);
 const formatwrittenExamResponse=async(responseText)=>
    {
        try{
            const res =await fetch("/format-written-exam",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({content:responseText})
            });
            if(!res.ok)
            {
                throw new Error(`HTTP error! status:${res.status}`);
            }
            const data=await res.json();
            return data;
        }
        catch(error)
        {
            console.error("Error formatting written exam:",error);
            return { questions: [] };
        }
        
    };
const WrittenExam=()=>
{
    const location = useLocation();
    const prompt=location.state?.prompt ||'';
    const [examQuestions,setExamQuestions]=React.useState({ questions: [] });
    const navigate=useNavigate();
        const [loading, setLoading] = useState(false);
    
    // const submit=useSubmit();
    const generateExam= useCallback(async () => 
    {
                 setLoading(true);
                try {
                    const modelId = "gemini-2.5-flash"; 

                    async function callGeminiWithRetry(prompt, retries = 3) {
                try {
                    const fullPrompt = `Create a written exam based(not mcq but elaborate questions) on the following study material:\n${prompt}`;
                    
                    const response = await ai.models.generateContent({
                        model: modelId,
                        contents: fullPrompt // The new SDK accepts strings directly here
                    });
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
            const formattedExam = await formatwrittenExamResponse(responseText);

            setExamQuestions(formattedExam || { questions: [] });

            
     } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setLoading(false);
        }
    }, [prompt]);
    React.useEffect(()=>
    {
        generateExam();
    },[]);

    return(
        <div style={{ maxWidth: "800px", margin: "auto" }}>
  <h1 style={{ color: "#2563eb", textAlign: "center" }}>
     Written Exam
  </h1>
    {examQuestions?.questions?.map((q, index) => (
    <div key={index} style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f0f4ff", borderRadius: "8px" }}>
      <p style={{ fontWeight: "bold" }}>{q.question}</p>
      {/* <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
        {q.options.map((option, idx) => (
          <li key={idx} style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", cursor: "pointer" }}>
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                // onChange={() => setSelectedAnswers(prev => ({ ...prev, [index]: option }))}
                style={{ marginRight: "10px" }}
              />
              {option}
            </label>
          </li>
        ))}
      </ul> */}
    </div>
  ))}  
                </div>
       
    );
};
export default WrittenExam;