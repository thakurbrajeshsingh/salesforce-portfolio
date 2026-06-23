"use client";

import { useState, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceChatProps {
  onClose?: () => void;
}

export default function VoiceChat({ onClose }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Initialize AudioContext on user gesture to enable autoplay later
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription failed");

      const data = await response.json();
      if (data.text) {
        await sendMessage(data.text);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setError("Failed to transcribe audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const data = await response.json();

      // Speak the response
      await speakText(data.message);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Speech generation failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setPendingAudioUrl(audioUrl);
      setShowPlayButton(false);

      await playAudio(audioUrl);
    } catch (error) {
      console.error("Error playing speech:", error);
      setIsSpeaking(false);
    }
  };

  const playAudio = async (audioUrl: string) => {
    setIsSpeaking(true);
    
    try {
      // Use Web Audio API with the established AudioContext
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current!.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        setPendingAudioUrl(null);
      };
      
      source.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsSpeaking(false);
      setShowPlayButton(true);
    }
  };

  const playPendingAudio = () => {
    if (!pendingAudioUrl) return;
    setShowPlayButton(false);
    playAudio(pendingAudioUrl);
  };

  return (
  <div className="agentforce-wrapper">
    <div className="agentforce-card">

      <div className="agentforce-header">
        <div className="header-left">
          <div className="agentforce-icon">✦</div>

          <div>
            <div className="agentforce-title">Agentforce</div>
            <div className="agentforce-subtitle">
              Brajesh AI Assistant
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="close-btn"
          >
            ×
          </button>
        )}
      </div>

      <div className="agent-section">

        <div className="avatar-container">
          <div
            className={`avatar-circle ${
              isRecording
                ? "listening"
                : isSpeaking
                ? "speaking"
                : ""
            }`}
          >
            BK
          </div>
        </div>

        <h2 className="agent-name">
          Brajesh Kumar
        </h2>

        <p className="agent-role">
          😄 The portfolio is free to read... my AI twin isn't. Browse first!
        </p>

        <div className="status-pill">
          {isRecording
            ? "🎤 Listening..."
            : isLoading
            ? "⚡ Thinking..."
            : isSpeaking
            ? "🔊 Speaking..."
            : "✓ Ready"}
        </div>

        {/* <p className="intro-text">
          Ask me about Salesforce projects,
          certifications, Field Service,
          Agentforce, Apex, LWC, and my
          professional experience.
        </p>

        <div className="prompt-grid">
          <button>Projects</button>
          <button>Agentforce</button>
          <button>Field Service</button>
          <button>Certifications</button>
        </div> */}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <button
          onClick={
            isRecording
              ? stopRecording
              : startRecording
          }
          disabled={isLoading || isSpeaking}
          className={`primary-button ${
            isRecording ? "recording" : ""
          }`}
        >
          {isRecording
            ? "Stop Recording"
            : "Start Conversation"}
        </button>

        {showPlayButton &&
          pendingAudioUrl && (
            <button
              onClick={playPendingAudio}
              className="secondary-button"
            >
              Play Response
            </button>
          )}
      </div>
    </div>

    <style jsx>{`
      .agentforce-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .agentforce-card {
        width: 100%;
        max-width: 430px;
        background: #ffffff;
        border: 1px solid #dddbda;
        border-radius: 18px;
        overflow: hidden;
        box-shadow:
          0 2px 8px rgba(0,0,0,0.08),
          0 8px 24px rgba(0,0,0,0.08);
      }

      .agentforce-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 20px;
        border-bottom: 1px solid #dddbda;
        background: #fafaf9;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .agentforce-icon {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: #0176d3;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }

      .agentforce-title {
        font-size: 16px;
        font-weight: 700;
        color: #032d60;
      }

      .agentforce-subtitle {
        font-size: 12px;
        color: #706e6b;
      }

      .close-btn {
        border: none;
        background: none;
        font-size: 22px;
        color: #706e6b;
        cursor: pointer;
      }

      .agent-section {
        padding: 30px 24px;
        text-align: center;
      }

      .avatar-container {
        display: flex;
        justify-content: center;
      }

      .avatar-circle {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        border: 4px solid #0176d3;
        background: #eef4ff;
        color: #032d60;
        font-size: 30px;
        font-weight: 700;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .avatar-circle.listening {
        animation: pulse 1.5s infinite;
      }

      .avatar-circle.speaking {
        animation: bounce 1s infinite;
      }

      @keyframes pulse {
        0% {
          box-shadow:
            0 0 0 0 rgba(1,118,211,0.4);
        }

        100% {
          box-shadow:
            0 0 0 28px rgba(1,118,211,0);
        }
      }

      @keyframes bounce {
        0% {
          transform: scale(1);
        }

        50% {
          transform: scale(1.06);
        }

        100% {
          transform: scale(1);
        }
      }

      .agent-name {
        margin-top: 18px;
        margin-bottom: 8px;
        color: #032d60;
      }

      .agent-role {
        color: #706e6b;
        font-size: 14px;
        margin-bottom: 18px;
      }

      .status-pill {
        display: inline-block;
        background: #eef4ff;
        color: #014486;
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 18px;
      }

      .intro-text {
        color: #444;
        line-height: 1.6;
        font-size: 14px;
        margin-bottom: 24px;
      }

      .prompt-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        margin-bottom: 24px;
      }

      .prompt-grid button {
        border: 1px solid #d8dde6;
        background: white;
        color: #032d60;
        padding: 8px 14px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 13px;
      }

      .prompt-grid button:hover {
        background: #eef4ff;
      }

      .primary-button {
        width: 100%;
        border: none;
        background: #0176d3;
        color: white;
        padding: 14px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
      }

      .primary-button:hover {
        background: #014486;
      }

      .primary-button.recording {
        background: #ba0517;
      }

      .secondary-button {
        width: 100%;
        margin-top: 10px;
        border: none;
        background: #2e844a;
        color: white;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
      }

      .error-box {
        margin-bottom: 18px;
        background: #fef1ee;
        color: #ba0517;
        border: 1px solid #ea001e;
        padding: 12px;
        border-radius: 8px;
      }
    `}</style>
  </div>
);
  
}
