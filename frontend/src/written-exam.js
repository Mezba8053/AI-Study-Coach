import { GoogleGenAI  }     from "@google/genai";
import React, { useState, useEffect, useCallback } from "react";
import { useLocation ,useNavigate,useSubmit} from "react-router-dom";
const ai=new GoogleGenAI({apikey:process.env.React_APP_GOOGLE_API_KEY});
console.log("API Key loaded:", !!process.env.REACT_APP_GOOGLE_API_KEY);
const WrittenExam=()=>
{
    const location = useLocation();
    const prompt=location.state?.prompt ||'';
    const [examQuestions,setExamQuestions]=React.useState("");
    const navigate=useNavigate();
    const submit=useSubmit();
    const generateExam=async()=>
    {
        try{
            const model="gemini-2.5-flash";
            const fullPrompt=`Create a written exam based on the following study material:\n${prompt}`;
            const response=await ai.models.generateContent({
                model:model,
                contents:fullPrompt
            });
            setExamQuestions(response.text);  
        }
        catch(error)
        {
            console.error("Error generating exam:",error);                  

        }
    }
    React.useEffect(()=>
    {
        generateExam();
    },[]);
    const handleSave=()=>
    {
        const formData=new FormData();
        formData.append("examQuestions",examQuestions);
        submit(formData,{method:"post",action:"/save-exam"});
        navigate("/");
    }
    return(
        <div>
            <h1>Written Exam</h1>
            <p style={{whiteSpace:"pre-wrap"}}>
            {examQuestions}
            </p>
            <button onClick={handleSave}>Save Exam</button>
        </div>
    );
};
export default WrittenExam;