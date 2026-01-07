import React,{useState,useEffect,Fragment, use} from "react";
import { useNavigate } from "react-router-dom";
const Second=()=>{
    const navigate=useNavigate();

    return(
        
        <Fragment>
            
                <style>{`
                    body {
                        background-image: url(/ai-generated-8565631.jpg);
                        background-repeat: no-repeat;
                        background-size: cover;
                    }
                    
                    .nav-bar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(10px);
                        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                        padding: 15px 30px;
                        // z-index: 1000;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    
                    .nav-brand {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        cursor: pointer;
                     transition: color 0.3s ease;
                    }
                    
                    .nav-brand:hover {
                        color: #007bff;
                    }
                    
                    .nav-menu {
                        display: flex;
                        list-style: none;
                        margin: 0;
                        padding: 0;
                        gap: 30px;
                    }
                    
                    .nav-item {
                        position: relative;
                    }
                    
                    .nav-link {
                        color: #333;
                        text-decoration: none;
                        font-size: 16px;
                        font-weight: 500;
                        padding: 8px 16px;
                        border-radius: 6px;
                        transition: all 0.3s ease;
                        cursor: pointer;
                    }
                    
                    .nav-link:hover {
                        background: rgba(0, 123, 255, 0.1);
                        color: #007bff;
                        transform: translateY(-1px);
                    }
                    
                    .nav-link.active {
                        background: #007bff;
                        color: white;
                    }
                    
                    /* Mobile responsive */
                    @media (max-width: 768px) {
                        .nav-menu {
                            flex-direction: column;
                            position: absolute;
                            top: 100%;
                            left: 0;
                            right: 0;
                            background: rgba(255, 255, 255, 0.95);
                            padding: 20px;
                            gap: 15px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                            display: none;
                        }
                        
                        .nav-menu.open {
                            display: flex;
                        }
                        
                        .menu-toggle {
                            display: block;
                            background: none;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                            color: #333;
                        }
                    }
                    
                    .menu-toggle {
                        display: none;
                    }
               `} </style>
            
            <nav className="nav-bar">
                <div className="nav-brand" onClick={() => navigate('/')}>
                    AI Study Coach
                </div>
                
                <ul className="nav-menu">
                    <li className="nav-item">
                        <span className="nav-link" onClick={() => navigate('/')}>Home</span>
                    </li>
                    <li className="nav-item">
                        <span className="nav-link" onClick={() => navigate('/study')}>Study</span>
                    </li>
                    <li className="nav-item">
                        <span className="nav-link" onClick={() => navigate('/profile')}>Profile</span>
                    </li>
                    <li className="nav-item">
                        <span className="nav-link" onClick={() => navigate('/settings')}>Settings</span>
                    </li>
                </ul>
            </nav>
            
        </Fragment>
    );
};
export default Second;