import React,{useState} from "react";
import { useNavigate } from "react-router-dom";

const Second=(setAuth)=>{
    const navigate=useNavigate();
    return(
        <div>
            <style>{`
                body {
                    background-image: url(/ai-generated-8565631.jpg);
                    background-repeat: no-repeat;
                    background-size: cover;
                }
            .side-bar {
                height: 100vh;
                width: 250px;
                position: fixed;
                top: 0;
                left: 0;
                background-color: #111;
                padding-top: 20px;
              }
                .side-bar a {
                    padding: 10px 15px;
                    text-decoration: none;
                    font-size: 18px;
                    color: #818181;
                    display: block;
                }
                
                .side-bar a:hover {
                    color: #f1f1f1;
                }
                .side-bar .active {
                    background-color: #04AA6D;
                    color: white;
                }

            
            `}</style>
            <nav className="side-bar">
                <a className="active" href="#home">Home</a>
                <a href="#services" onClick={() => navigate('/llm-adapted-study-method')}>LLM Adapted Study Method</a>
                <a href="#clients">Clients</a>
                <a href="#contact">Contact</a>
            </nav>
        
        </div>
    );

    // return );
};

export default Second;