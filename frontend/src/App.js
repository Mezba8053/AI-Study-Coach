import React from 'react';
import './App.css';
import {BrowserRouter ,Routes,Route} from 'react-router-dom';
import Starting from './components/starting';
import Second from './components/second';
import Study from './components/study';
import LlmAdaptedStudyMethod from './components/llm-adapted-study-method';
import Gem from './components/gem';
import Summarize from './components/summarize';
import WrittenExam from './components/written-exam';
function App() {
  return (
    <BrowserRouter>
    <div className="App">
      <Routes>
        <Route path='/' element={<Starting/>}/>
        <Route path='/second' element={<Second/>}/>
        <Route path='/study' element={<Study/>}/>
        <Route path='/llm-adapted-study-method' element={<LlmAdaptedStudyMethod/>}/>
        <Route path='/gem' element={<Gem/>}/>
        <Route path='/summarize' element={<Summarize/>}/>
        <Route path='/written-exam' element={<WrittenExam/>}/>
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
