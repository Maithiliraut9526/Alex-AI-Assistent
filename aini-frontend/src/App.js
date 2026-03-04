import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Mic, MicOff, Video, VideoOff, X, Bot, User, ShieldCheck
} from 'lucide-react';

const App = () => {
  const [isInterfaceOpen, setIsInterfaceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [chatHistory, setChatHistory] = useState([
    { role: 'alex', text: "Welcome. I am Alex, your lead recruiter. Shall we begin?" }
  ]);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
                          .replace(/\*\*/g, '').replace(/```/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (messageText) => {
    if (!messageText) return;
    if (messageText !== "INTERVIEW_START_SIGNAL") {
      setChatHistory(prev => [...prev, { role: 'user', text: messageText }]);
    }

    try {
      const prompt = messageText === "INTERVIEW_START_SIGNAL" 
        ? "Hello! I'm Alex, a Senior AI Recruiter. I'm here to conduct your technical interview. To start, could you please tell me which job role you're applying for today?" 
        : messageText;

      const response = await axios.post('http://localhost:5000/chat', { message: prompt });
      const alexReply = response.data.reply;
      
      setChatHistory(prev => [...prev, { role: 'alex', text: alexReply }]);
      speak(alexReply); 
    } catch (error) {
      console.error("Backend Error", error);
    }
  };

  const launchInterface = () => {
    setIsInterfaceOpen(true);
    handleSend("INTERVIEW_START_SIGNAL");
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported");

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      handleSend(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    if (isInterfaceOpen && isCameraOn) {
      navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" } 
      })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(err => console.error("Camera denied", err));
    }
  }, [isInterfaceOpen, isCameraOn]);

  useEffect(() => {
    if (isInterfaceOpen) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg && lastMsg.role === 'alex') {
        speak(lastMsg.text);
      }
    }
  }, [isInterfaceOpen]);

  const lastMessage = chatHistory[chatHistory.length - 1];

  return (
    <div className="text-white">
      {!isInterfaceOpen ? (
        <div className="bg-[#050505] min-h-screen flex flex-col">
          {/* Navigation */}
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-4 md:px-20 lg:px-40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bot size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Alex AI</h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium hover:text-blue-500 transition-colors" href="#how">How it works</a>
              <a className="text-sm font-medium hover:text-blue-500 transition-colors" href="#roles">Roles</a>
              <a className="text-sm font-medium hover:text-blue-500 transition-colors" href="#languages">Languages</a>
            </nav>
            <div className="flex items-center gap-4">
              <button onClick={launchInterface} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/25">
                Get Started
              </button>
            </div>
          </header>

          <main className="flex-1">
            {/* Hero Section */}
            <section className="px-6 py-16 md:px-20 lg:px-40">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <span className="inline-flex items-center gap-2 text-blue-400 font-semibold text-sm tracking-widest uppercase">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
                      </span>
                      Now Live: V2 Voice Engine
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                      Master Your Voice-Based Technical Interview with <span className="text-blue-500">Alex</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-xl">
                      The first AI interviewer that hears your logic and understands your expertise through conversation. No coding, just pure technical dialogue.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={launchInterface} className="bg-blue-600 hover:bg-blue-500 text-white h-14 px-8 rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-900/30 flex items-center gap-2">
                      Begin Interview
                    </button>
                  </div>
                </div>

                {/* Voice Visualizer Hero Element */}
                <div className="relative group cursor-pointer" onClick={toggleVoiceInput}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative bg-zinc-900/60 backdrop-blur-xl rounded-xl p-8 aspect-square flex flex-col items-center justify-center overflow-hidden border border-white/10">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #3b82f6 0%, transparent 70%)' }}></div>
                    
                    {/* AI Persona Avatar */}
                    <div className="mb-12 relative">
                      <div className={`w-32 h-32 rounded-full border-2 border-blue-500/50 flex items-center justify-center bg-blue-600/10 relative z-10 transition-transform ${isSpeaking ? 'scale-110' : ''}`}>
                        <Bot size={64} className="text-blue-500" />
                      </div>
                      {/* Pulse Rings */}
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-500/20 rounded-full ${isSpeaking || isListening ? 'animate-pulse' : ''}`}></div>
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-500/10 rounded-full ${isSpeaking || isListening ? 'animate-pulse delay-700' : ''}`}></div>
                    </div>

                    {/* Visualizer Bars */}
                    <div className="flex items-end gap-1.5 h-20">
                      {[0.1, 0.3, 0.5, 0.2, 0.4, 0.6, 0.8].map((delay, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 rounded-full ${i === 3 ? 'bg-cyan-400' : 'bg-blue-600'} ${isSpeaking || isListening ? 'animate-bounce' : ''}`} 
                          style={{ animationDelay: `${delay}s`, height: (isSpeaking || isListening) ? undefined : '15px' }}
                        ></div>
                      ))}
                    </div>
                    <p className="mt-8 text-blue-400 font-mono text-sm tracking-widest uppercase">
                      {isListening ? "I'm listening..." : isSpeaking ? "Alex is speaking..." : "Alex is ready"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Languages Section */}
            <section id="languages" className="px-6 py-20 md:px-20 lg:px-40 bg-zinc-900/30">
              <div className="max-w-[960px] mx-auto flex flex-col gap-10">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight mb-4">Choose Your Interview Programming Language</h2>
                  <p className="text-zinc-400">Alex evaluates your technical logic across multiple programming languages with deep syntax awareness.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {['Python', 'Java', 'C++', 'JavaScript', 'Go'].map((lang) => (
                    <div key={lang} onClick={launchInterface} className="p-6 rounded-xl border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer group hover:bg-blue-600/5">
                      <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                        <Bot size={24} className="text-blue-500 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{lang}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-6">Expert evaluation of {lang} standards and logic manipulation.</p>
                      <button className="w-full py-2 rounded-lg border border-blue-600/30 text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors">Select</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Roles Section */}
            <section id="roles" className="px-6 py-20 md:px-20 lg:px-40">
              <div className="max-w-[960px] mx-auto flex flex-col gap-10">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight mb-4">Select Your Professional Role</h2>
                  <p className="text-zinc-400">Alex tailors questions based on industry standards for your specific path.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {['Backend Engineer', 'Frontend Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'Security Engineer'].map((role) => (
                    <div key={role} onClick={launchInterface} className="p-6 rounded-xl border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer group hover:bg-blue-600/5">
                      <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                        <User size={24} className="text-blue-500 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{role}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">Evaluation tailored for {role} industry standards.</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Feature Spotlight */}
            <section id="how" className="px-6 py-20 md:px-20 lg:px-40 bg-zinc-900/50">
              <div className="max-w-[960px] mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold tracking-tight mb-6">Talk, Don't Type.</h2>
                  <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                    Coding is only half the battle. Real engineers need to explain their logic clearly. Alex simulates a real-world interview environment.
                  </p>
                  <ul className="flex flex-col gap-4">
                    {['NLP for jargon', 'Real-time feedback', 'Zero latency'].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-cyan-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full relative">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-zinc-900">
                    <div className="w-full h-full flex items-center justify-center">
                      <Bot size={64} className="text-blue-600/30" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 px-6 py-12 md:px-20 lg:px-40 bg-black">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <Bot size={24} className="text-blue-500" />
                <span className="text-lg font-bold">Alex AI</span>
              </div>
              <p className="text-sm text-zinc-500">© 2026 Alex AI Interviewer. All rights reserved.</p>
            </div>
          </footer>
        </div>
      ) : (
        <div className="flex flex-col h-screen overflow-hidden">
          
          <header className="flex-none flex items-center justify-between px-10 py-5 bg-zinc-900/40 border-b border-white/5 backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                {/* 5. Updated Header Name */}
                <span className="block font-black tracking-[0.3em] uppercase text-xs text-white">Alex Recruiter</span>
                <div className="flex items-center gap-2">
                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Live Technical Screening</span>
                    <ShieldCheck size={12} className="text-blue-500" />
                </div>
              </div>
            </div>
            <button onClick={() => setIsInterfaceOpen(false)} className="group p-2.5 hover:bg-white/10 rounded-full transition-all">
              <X size={24} className="text-zinc-500 group-hover:text-white" />
            </button>
          </header>

          <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 p-6 gap-6 overflow-hidden">
            
            {/* LEFT SIDE: ALEX */}
            <div className="relative bg-zinc-900/20 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-between p-8 shadow-2xl overflow-hidden ring-1 ring-white/5">
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                    <div className={`absolute inset-0 border-4 border-blue-500/10 rounded-full ${isSpeaking ? 'animate-ping' : ''}`}></div>
                    <div className="w-full h-full bg-zinc-950 rounded-full border border-blue-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.1)]">
                    <div className="flex items-center gap-2.5 h-20">
                        {[1,2,3,4,5,6].map(i => (
                        <div key={i} className={`w-2.5 bg-blue-500 rounded-full transition-all duration-300 ${isSpeaking ? 'animate-bounce' : 'h-4'}`}
                                style={{ 
                                    height: isSpeaking ? `${20 + Math.random() * 80}%` : '16px', 
                                    animationDelay: `${i * 0.1}s`
                                }}></div>
                        ))}
                    </div>
                    </div>
                </div>
              </div>

              <div className="w-full mt-4">
                <div className="bg-zinc-900/60 backdrop-blur-xl px-6 py-5 rounded-3xl border border-white/10 text-center">
                    <p className="text-blue-100 text-base md:text-lg font-medium italic leading-relaxed">
                        {/* 6. Changed check to use 'alex' role */}
                        {lastMessage.role === 'alex' ? lastMessage.text : 'Listening to your response...'}
                    </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: CANDIDATE */}
            <div className="relative bg-black border border-white/5 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/5">
              <div className="flex-1 relative overflow-hidden rounded-t-[2.5rem] bg-zinc-950">
                {isCameraOn ? (
                    <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-contain scale-x-[-1]" 
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 text-zinc-700">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                        <User size={48} strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.5em] font-black">Camera Offline</p>
                    </div>
                )}
                
                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border border-white/10 flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                    Candidate
                </div>

                <div className="absolute bottom-6 right-6">
                    <button onClick={() => setIsCameraOn(!isCameraOn)} className="p-3 bg-zinc-900/90 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all shadow-2xl">
                        {isCameraOn ? <Video size={18} /> : <VideoOff size={18} className="text-red-500" />}
                    </button>
                </div>
              </div>

              <div className="bg-zinc-900/40 p-6 border-t border-white/5">
                <div className={`min-h-[60px] flex items-center justify-center rounded-2xl px-4 transition-all ${lastMessage.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-transparent'}`}>
                    <p className={`text-center font-bold tracking-tight ${lastMessage.role === 'user' ? 'text-white text-lg' : 'text-zinc-500 text-sm italic'}`}>
                        {lastMessage.role === 'user' ? lastMessage.text : "Waiting for your response..."}
                    </p>
                </div>
              </div>
            </div>

          </main>

          <footer className="flex-none p-8 flex justify-center bg-gradient-to-t from-black via-black/80 to-transparent">
            <button 
              onClick={toggleVoiceInput} 
              className={`flex items-center gap-6 px-14 py-5 rounded-full font-black transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${
                isListening 
                ? 'bg-red-500 text-white shadow-red-900/40' 
                : 'bg-blue-600 text-white shadow-blue-900/40'
              }`}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              <span className="tracking-[0.4em] text-sm uppercase">{isListening ? "Listening" : "Click to Speak"}</span>
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;