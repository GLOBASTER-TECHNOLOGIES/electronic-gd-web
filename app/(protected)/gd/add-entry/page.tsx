"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Save, ShieldAlert, Loader2, X, CheckCircle2, ShieldCheck } from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  rank: string;
  forceNumber: string;
  division: string;
  postName: string;
}

export default function AddGDEntryPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  
  // 1. Live Time State
  const [time, setTime] = useState(new Date());

  const [formData, setFormData] = useState({
    abstract: "",
    details: "",
  });

  // Acknowledgment State
  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [ackInput, setAckInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const REQUIRED_ACK_TEXT = "I ACKNOWLEDGE THAT EVERYTHING I HAVE ENTERED IS CORRECT AND TRUTHFUL"; 

  useEffect(() => {
    // 2. Clock Interval (Updates every second)
    const timer = setInterval(() => setTime(new Date()), 1000);

    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", {
            params: { fields: "name,rank,forceNumber,division,postName" }
        });
        setUser(res.data.user);
      } catch {
        router.push("/login");
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUser();

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [router]);

  // Focus the invisible input when modal opens
  useEffect(() => {
    if (isAckModalOpen && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isAckModalOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = () => {
    if (!formData.abstract || !formData.details) {
      alert("Please fill in the Abstract and Details first.");
      return;
    }
    setIsAckModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!user) return;
    
    if (ackInput !== REQUIRED_ACK_TEXT) return;

    setLoading(true);

    try {
      await axios.post("/api/gd/create-entry", {
        ...formData,
        division: user.division,
        post: user.postName,
        officerId: user._id,
        officerName: user.name,
        rank: user.rank,
        forceNumber: user.forceNumber,
        acknowledged: true,
        timeOfSubmission: time, // Sending the submission time
      });

      setFormData({ abstract: "", details: "" });
      setAckInput("");
      setIsAckModalOpen(false);
      router.refresh();
      alert("Entry Verified & Recorded. Reference Number Generated.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#eef0f3] py-8 px-4 flex justify-center font-sans text-gray-900">
      
      {/* Document Container */}
      <div className="w-full max-w-3xl bg-white shadow-sm border border-gray-300 min-h-[900px] flex flex-col relative">
        
        {/* --- HEADER SECTION --- */}
        <header className="border-b-2 border-black p-8 pb-4">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight leading-none">General Diary</h1>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">Railway Protection Force</p>
                </div>
                <div className="text-right">
                    <div className="inline-block border border-gray-900 px-2 py-1">
                        <p className="text-[10px] font-bold uppercase">Form No.</p>
                        <p className="text-sm font-mono font-bold">RPF-GD-2026</p>
                    </div>
                </div>
            </div>

            {/* Metadata Grid (4 Columns including Time) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm border-t border-gray-200 pt-4">
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Station / Post</span>
                    <span className="block font-semibold uppercase">{user.postName}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Division</span>
                    <span className="block font-semibold uppercase">{user.division}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</span>
                    <span className="block font-mono">{time.toLocaleDateString('en-GB')}</span>
                </div>
                {/* 4. Displaying Time */}
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Time</span>
                    <span className="block font-mono text-red-700 font-bold">
                        {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </span>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-8">
                 <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Duty Officer</span>
                    <span className="block font-medium">{user.name}</span>
                </div>
                 <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Rank & ID</span>
                    <span className="block font-medium">{user.rank} / {user.forceNumber}</span>
                </div>
            </div>
        </header>

        {/* --- BODY SECTION --- */}
        <div className="flex-1 p-8 md:p-10 flex flex-col gap-8">
            
            {/* Abstract Line */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Abstract</label>
                <input
                    type="text"
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    required
                    placeholder="ENTER ABSTRACT HERE..."
                    className="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-black py-2 outline-none uppercase placeholder:text-gray-300 transition-colors"
                />
            </div>

            {/* --- BOOK PAGE ENTRY AREA --- */}
            <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Occurrence Details</label>
                
                {/* The Ruled Page */}
                <div className="flex-1 w-full border border-gray-200 bg-white shadow-inner relative">
                    <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        required
                        className="w-full h-full resize-none outline-none text-xl leading-[2.5rem] font-serif text-gray-900 bg-transparent px-6 py-0"
                        style={{
                            // Ruled lines pattern
                            backgroundImage: 'linear-gradient(transparent 96%, #e2e8f0 97%, #e2e8f0 100%)',
                            backgroundSize: '100% 2.5rem',
                            backgroundAttachment: 'local',
                            lineHeight: '2.5rem'
                        }}
                        placeholder="Record the occurrence here..."
                    />
                </div>
            </div>

            {/* --- FOOTER / INITIAL SUBMIT --- */}
            <div className="pt-6 border-t-2 border-black flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-red-600 font-bold uppercase">
                    <ShieldAlert size={14} />
                    <span>Official Record • Cannot be modified</span>
                </div>

                <button
                    onClick={handleInitialSubmit}
                    type="button"
                    className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <CheckCircle2 size={14} />
                    Acknowledge & Submit
                </button>
            </div>
        </div>

        {/* --- ACKNOWLEDGMENT MODAL OVERLAY --- */}
        {isAckModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 animate-in fade-in duration-200">
             
             <div className="bg-white border-2 border-black w-full max-w-2xl shadow-2xl relative flex flex-col">
                
                {/* Close Button */}
                <button 
                  onClick={() => setIsAckModalOpen(false)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-black hover:bg-gray-100 transition-colors z-20"
                >
                  <X size={20} />
                </button>

                {/* Modal Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-6 text-center">
                    <div className="flex justify-center mb-3">
                        <ShieldCheck size={40} className="text-black" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Verify Submission</h3>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-8 text-center">
                   
                   <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-4 tracking-widest">
                        Type the highlighted text below:
                      </p>
                      
                      {/* --- MONKEYTYPE CONTAINER --- */}
                      <div 
                        className="relative w-full p-6 border-2 border-gray-200 bg-gray-50 cursor-text min-h-[120px] flex flex-wrap content-start text-left"
                        onClick={() => inputRef.current?.focus()} // Clicking anywhere focuses input
                      >
                        
                        {/* 1. VISUAL RENDERER (Spans) */}
                        <div className="font-mono text-lg font-bold uppercase tracking-wide leading-relaxed break-words w-full select-none">
                            {REQUIRED_ACK_TEXT.split('').map((char, index) => {
                                const userChar = ackInput[index];
                                let colorClass = "text-gray-300"; // Default (Untyped)
                                let cursorClass = "";

                                if (index < ackInput.length) {
                                    if (userChar === char) {
                                        colorClass = "text-black"; // Correct
                                    } else {
                                        colorClass = "text-red-500 underline decoration-2 decoration-red-500"; // Wrong
                                    }
                                }

                                // Cursor Effect (Blinking Block on current char)
                                if (index === ackInput.length) {
                                    cursorClass = "border-l-2 border-black animate-pulse";
                                }

                                return (
                                    <span key={index} className={`${colorClass} ${cursorClass}`}>
                                        {char}
                                    </span>
                                );
                            })}
                        </div>

                        {/* 2. INVISIBLE INPUT (Captures Keystrokes) */}
                        <textarea
                            ref={inputRef}
                            value={ackInput}
                            onChange={(e) => setAckInput(e.target.value.toUpperCase())}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-default resize-none"
                            spellCheck={false}
                            autoFocus
                        />

                      </div>
                   </div>

                   <p className="text-[10px] text-gray-400 font-medium leading-tight px-4">
                      By proceeding, I certify that the details entered are true to the best of my knowledge and I am liable for any false information recorded.
                   </p>

                   <button
                      onClick={handleFinalSubmit}
                      disabled={ackInput !== REQUIRED_ACK_TEXT || loading}
                      className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                   >
                      {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                      {loading ? "Verifying..." : "Confirm & Submit"}
                   </button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}