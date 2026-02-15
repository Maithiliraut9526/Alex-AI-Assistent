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
  
  // 1. Updated initial state name
  const [chatHistory, setChatHistory] = useState([
    { role: 'alex', text: "Welcome. I am Alex, your lead recruiter. Shall we begin?" }
  ]);
  const videoRef = useRef(null);

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
      // 2. Updated system prompt identity
      const prompt = messageText === "INTERVIEW_START_SIGNAL" 
        ? "Hello! I'm Alex, a Senior AI Recruiter. I'm here to conduct your technical interview. To start, could you please tell me which job role you're applying for today?" 
        : messageText;

      const response = await axios.post('http://localhost:5000/chat', { message: prompt });
      const alexReply = response.data.reply;
      
      // 3. Updated role key to 'alex' for consistency
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
    const recognition = new SpeechRecognition();
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

  const lastMessage = chatHistory[chatHistory.length - 1];

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      {!isInterfaceOpen ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-1000">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="relative w-28 h-28 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl">
              <Bot size={56} className="text-blue-500" />
            </div>
          </div>
          <div className="space-y-2">
            {/* 4. Updated Landing Name */}
            <h1 className="text-5xl font-black tracking-tighter uppercase">Alex</h1>
            <p className="text-zinc-500 tracking-[0.4em] text-xs font-bold uppercase">Advanced Talent Acquisition</p>
          </div>
          <button onClick={launchInterface} className="px-12 py-5 bg-blue-600 text-white font-black rounded-full hover:bg-blue-500 transition-all shadow-blue-900/20 shadow-2xl uppercase tracking-widest text-sm">
            Begin Interview
          </button>
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

