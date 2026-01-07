import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
const LlmAdaptedStudyMethod=()=>{
    // const promp
    const[prompt,setPrompt]=useState("");
    const navigate=useNavigate();
    return(
        <div>
            {/* <h1>LLM Help Component</h1> */}

       
            <style>{`
                body {
                    // background-image: url(/ai-generated-8565631.jpg);
                    background-color: #0f0f0f0;
                    background-repeat: no-repeat;
                    background-size: cover;
                }
                    .search-container {
                        display: flex;
                        justify-content: center;
                        margin-top: 50px;
                    }
                      .search-input {
                          width: 400px;
                          padding: 10px;
                          font-size: 16px;
                          border: 1px solid #ccc;
                          border-radius: 4px;
                      }
                      
                      .search-button {
                          padding: 10px 20px;
                          font-size: 16px;
                          border: none;
                          border-radius: 4px;
                          background-color: #28a745;
                          color: white;
                          cursor: pointer;
                          margin-left: 10px;
                      }
                      
                      .search-button:hover {
                          background-color: #218838;
                      }   
                    .menu {
                        margin-top: 20px;
                        text-align: center;
                    }
                                                                           
                    .button {
                        background-color: #4CAF50; /* Green */
                        border: none;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 12px;
                    }
                    
                    .button:hover {
                        background-color: #45a049;
                    }

            `}</style> 
            <search className="search-container">
                <input type="text" className="search-input" placeholder="Ask your study-related question..." 
                value={prompt} onChange={(e)=>setPrompt(e.target.value)} />
                <button className="search-button">Search</button>
            </search>
            <menu className="menu">
                <button className="button">Summarize Text</button>
                <button className="button" onClick={() => navigate("/generate-quiz")}>Generate Quiz</button>
                <button className="button">Explain Concept</button>
                <button className="button">Create Study Plan</button>
            </menu>
            <br/>
            <button className="button">Back to Study Page</button>
            <div style={{paddingTop:"100px", textAlign:"center"}}>
                 </div>
             </div>

    );
    };

export default LlmAdaptedStudyMethod;