import { GoogleGenAI } from "@google/genai";
import React  from "react";
import { useLocation ,useNavigate,useSubmit} from "react-router-dom";
const ai=new GoogleGenAI({apikey:process.env.React_APP_GOOGLE_API_KEY});
console.log("API Key loaded:", !!process.env.REACT_APP_GOOGLE_API_KEY);
const Summarize=()=>
{
    const location = useLocation();
    const prompt=location.state?.prompt ||'';
    const [summary,setSummary]=React.useState("");
    const navigate=useNavigate();
    const submit=useSubmit();
    const generateSummary=async()=>
    {
        try{
            const model="gemini-2.5-flash";
            const fullPrompt=`Summarize the following text:\n${prompt}`;
            const response=await ai.models.generateContent({
                model:model,
                contents:fullPrompt
            });
            setSummary(response.text);  
        }
        catch(error)
        {
            console.error("Error generating summary:",error);
        }
    }
    React.useEffect(()=>
    {
        generateSummary();
    },[]);
    const handleSave=()=>
    {
        const formData=new FormData();
        formData.append("summary",summary);
        submit(formData,{method:"post",action:"/save-summary"});
        navigate("/");
    }
    return(
        <div>
            <h1>Summary</h1>
            <p style={{whiteSpace:"pre-wrap"}}>
            {summary}
            </p>
            <button onClick={handleSave}>Save Summary</button>
        </div>
    );
};
export default Summarize;