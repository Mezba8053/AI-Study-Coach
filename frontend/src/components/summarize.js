// // import { GoogleGenAI } from "@google/genai";
// // import React from "react";
// // import { useLocation, useNavigate, useSubmit } from "react-router-dom";

// // const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GOOGLE_API_KEY });  // Fixed: 'apikey' -> 'apiKey'
// // console.log("API Key loaded:", !!process.env.REACT_APP_GOOGLE_API_KEY);

// // const Summarize = () => {
// //     const location = useLocation();
// //     const prompt = location.state?.prompt || '';
// //     const [summary, setSummary] = React.useState("");
// //     const navigate = useNavigate();
// //     // const submit = useSubmit();

// //     const generateSummary = async () => {
// //         try {
// //             const model = "gemini-2.5-flash";
// //             const fullPrompt = `Summarize the following text:\n${prompt}`;
// //             const response = await ai.models.generateContent({
// //                 model: model,
// //                 contents: fullPrompt
// //             });
// //             setSummary(response.text);
// //         } catch (error) {
// //             console.error("Error generating summary:", error);
// //         }
// //     };

// //     React.useEffect(() => {
// //         generateSummary();
// //     }, []);

// //     // const handleSave = () => {
// //     //     const formData = new FormData();
// //     //     formData.append("summary", summary);
// //     //     // submit(formData, { method: "post", action: "/save-summary" });
// //     //     navigate("/");
// //     // };

// //     return (
// //         <div>
// //             <h1>Summary</h1>
// //             <p style={{ whiteSpace: "pre-wrap" }}>
// //                 {summary}
// //             </p>
// //             {/* <button onClick={handleSave}>Save Summary</button> */}
// //         </div>
// //     );
// // };

// // export default Summarize;
// import { GoogleGenAI } from "@google/genai";
// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GOOGLE_API_KEY });
// console.log("API Key loaded:", !!process.env.REACT_APP_GOOGLE_API_KEY);

// const Summarize = () => {
//     const location = useLocation();
//     const prompt = location.state?.prompt || '';
//     const [summary, setSummary] = useState("");
//     const [isEditing, setIsEditing] = useState(false);
//     const [editedSummary, setEditedSummary] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [showFull, setShowFull] = useState(false);
//     const navigate = useNavigate();

//     const generateSummary = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const model = "gemini-2.5-flash";
//             const fullPrompt = `Summarize the following text:\n${prompt}`;
//             const response = await ai.models.generateContent({
//                 model: model,
//                 contents: fullPrompt
//             });
//             setSummary(response.text);
//             setEditedSummary(response.text);
//         } catch (err) {
//             console.error("Error generating summary:", err);
//             setError("Failed to generate summary. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     React.useEffect(() => {
//         if (prompt) generateSummary();
//     }, [prompt]);

//     const handleEdit = () => {
//         setIsEditing(true);
//         setEditedSummary(summary);
//     };

//     const handleSaveEdit = () => {
//         setSummary(editedSummary);
//         setIsEditing(false);
//     };

//     const handleCancelEdit = () => {
//         setEditedSummary(summary);
//         setIsEditing(false);
//     };
//     const btnStyle = {
//   padding: "8px 14px",
//   borderRadius: "6px",
//   border: "1px solid #ccc",
//   background: "#fff",
//   cursor: "pointer",
//   transition: "all 0.2s ease"
// };

//     const handleSave = () => {
//         // Example: Save to localStorage or send to backend
//         localStorage.setItem("savedSummary", summary);
//         alert("Summary saved!");
//         navigate("/");
//     };

//     const truncatedSummary = summary.length > 200 ? summary.substring(0, 200) + "..." : summary;

//     return (
//         <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
//             <h1>Summary</h1>
//             {loading && <p>Loading summary...</p>}
//             {error && <p style={{ color: "red" }}>{error} <button onClick={generateSummary}>Retry</button></p>}
//             {!loading && !error && (
//                 <div>
//                     {isEditing ? (
//                         <div>
//                             <textarea
//                                 value={editedSummary}
//                                 onChange={(e) => setEditedSummary(e.target.value)}
//                                 rows={10}
//                                 style={{ width: "100%", padding: "10px" }}
//                             />
//                             <button onClick={handleSaveEdit}>Save Changes</button>
//                             <button onClick={handleCancelEdit} style={{ marginLeft: "10px" }}>Cancel</button>
//                         </div>
//                     ) : (
//                         <div>
//                             <p style={{ whiteSpace: "pre-wrap", cursor: "pointer" }} onClick={handleEdit}>
//                                 {showFull ? summary : truncatedSummary}
//                             </p>
//                             {summary.length > 200 && (
//                                 <button onClick={() => setShowFull(!showFull)}>
//                                     {showFull ? "Show Less" : "Show More"}
//                                 </button>
//                             )}
//                         </div>
//                     )}
//                     <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
//   <button onClick={handleEdit}>✏️ Edit</button>
//   <button style={btnStyle}  onMouseOver={e => e.target.style.background = "#f0f0f0"}
//     onMouseOut={e => e.target.style.background = "#fff"}
// onClick={generateSummary}>🔄 Regenerate</button>
// </div>

//                 </div>
//             )}
//         </div>
//     );
// };

// export default Summarize;
import { GoogleGenAI } from "@google/genai";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ai = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY
});

const Summarize = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prompt = location.state?.prompt || "";

  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [hoveredSentence, setHoveredSentence] = useState(null);
  const [showFull, setShowFull] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Summarize the following text:\n${prompt}`
      });

      setSummary(response.text);
    } catch (err) {
      setError("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prompt) generateSummary();
  }, [prompt]);

  const sentences = summary
    .split(". ")
    .filter(s => s.trim().length > 0);

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <h1>Summary</h1>

      {loading && <p>Generating summary…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && summary && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            maxHeight: showFull ? "1000px" : "300px",
            overflow: "hidden",
            transition: "max-height 0.4s ease"
          }}
        >
          {sentences.map((sentence, index) => (
            <div
              key={index}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const updated = [...sentences];
                updated[index] = e.currentTarget.textContent;
                setSummary(updated.join(". "));
              }}
              onClick={() => setSelectedSentence(index)}
              onMouseEnter={() => setHoveredSentence(index)}
              onMouseLeave={() => setHoveredSentence(null)}
              style={{
                padding: "8px",
                marginBottom: "6px",
                borderRadius: "6px",
                cursor: "text",
                background:
                  selectedSentence === index
                    ? "#fff3cd"
                    : hoveredSentence === index
                    ? "#f5f5f5"
                    : "transparent",
                outline: "none"
              }}
            >
              {sentence}.
              {hoveredSentence === index && (
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(sentence)
                  }
                  style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Copy
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {summary.length > 300 && (
        <button
          onClick={() => setShowFull(!showFull)}
          style={{ marginTop: "10px" }}
        >
          {showFull ? "Show Less" : "Show More"}
        </button>
      )}

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px"
        }}
      >
        <button onClick={generateSummary}>🔄 Regenerate</button>
        <button
          onClick={() => {
            localStorage.setItem("savedSummary", summary);
            alert("Summary saved");
          }}
        >
          💾 Save
        </button>
        <button onClick={() => navigate("/")}>⬅ Back</button>
      </div>
    </div>
  );
};

export default Summarize;
