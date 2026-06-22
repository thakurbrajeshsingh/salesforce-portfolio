"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startRecording = async () => {
    try {
      // Initialize AudioContext on user interaction
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
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

      // Speak the response first
      await speakText(data.message);

      // Add message after speaking (for voice-only experience)
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
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

      // Try to play automatically
      await playAudio(audioUrl);
    } catch (error) {
      console.error("Error generating speech:", error);
    }
  };

  const playAudio = async (audioUrl: string) => {
    setIsSpeaking(true);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
      setPendingAudioUrl(null);
    };

    audio.onerror = (error) => {
      console.error("Audio playback error:", error);
      setIsSpeaking(false);
      setShowPlayButton(true); // Show button if autoplay fails
    };

    audio.load();

    try {
      await audio.play();
    } catch (error) {
      console.log("Autoplay blocked, showing play button");
      setShowPlayButton(true);
      setIsSpeaking(false);
    }
  };

  const playPendingAudio = () => {
    if (!pendingAudioUrl) return;
    setShowPlayButton(false);
    playAudio(pendingAudioUrl);
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="jarvis-interface"
    >
      <div className="jarvis-header">
        <div className="jarvis-title">
          <motion.div
            className="jarvis-icon"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </motion.div>
          <span>BRAJESH AI</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="jarvis-close">×</button>
        )}
      </div>

      <div className="jarvis-messages">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="jarvis-welcome"
            >
              <div className="jarvis-status">
                <motion.span
                  className="status-dot"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>SYSTEM ONLINE</span>
              </div>
              <p>Ask me about Salesforce, Field Service, or my experience.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.map((message, index) => (
            message.role === "user" && (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="jarvis-message user"
              >
                <div className="message-label">YOU</div>
                <div className="message-text">{message.content}</div>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="jarvis-message assistant"
            >
              <div className="message-label">AI</div>
              <div className="message-text processing">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Processing...
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="jarvis-controls">
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading || isSpeaking}
          className={`jarvis-mic ${isRecording ? "recording" : ""}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="mic-ring"
            animate={isRecording ? { scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] } : {}}
            transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
          />
          <motion.div
            className="mic-core"
            animate={isRecording ? { scale: [1, 0.9, 1] } : {}}
            transition={{ duration: 0.8, repeat: isRecording ? Infinity : 0 }}
          >
            {isRecording ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showPlayButton && pendingAudioUrl && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={playPendingAudio}
              className="jarvis-play"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <span>Play Response</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .jarvis-interface {
          position: relative;
          width: 100%;
          max-width: 420px;
          height: 520px;
          background: linear-gradient(145deg, #0b1f36, #06172c);
          border: 1px solid rgba(1, 118, 211, 0.3);
          border-radius: 24px;
          box-shadow: 0 0 60px rgba(1, 118, 211, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .jarvis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(1, 118, 211, 0.2);
          background: rgba(1, 118, 211, 0.05);
        }

        .jarvis-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .jarvis-icon {
          width: 32px;
          height: 32px;
          color: #0d9dda;
        }

        .jarvis-title span {
          color: #0d9dda;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .jarvis-close {
          width: 28px;
          height: 28px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          border-radius: 8px;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .jarvis-close:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .jarvis-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .jarvis-welcome {
          text-align: center;
          padding: 2rem 1rem;
        }

        .jarvis-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: #2e844a;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2e844a;
        }

        .jarvis-welcome p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          line-height: 1.6;
        }

        .jarvis-message {
          max-width: 85%;
          padding: 0.9rem 1.1rem;
          border-radius: 16px;
        }

        .jarvis-message.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #0176d3, #0d9dda);
          box-shadow: 0 4px 20px rgba(1, 118, 211, 0.3);
        }

        .jarvis-message.assistant {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .message-label {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          margin-bottom: 0.35rem;
          opacity: 0.7;
        }

        .jarvis-message.user .message-label {
          color: rgba(255, 255, 255, 0.8);
        }

        .jarvis-message.assistant .message-label {
          color: rgba(255, 255, 255, 0.5);
        }

        .message-text {
          font-size: 0.85rem;
          line-height: 1.5;
          color: white;
        }

        .message-text.processing {
          color: rgba(255, 255, 255, 0.5);
        }

        .jarvis-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid rgba(1, 118, 211, 0.2);
          background: rgba(1, 118, 211, 0.03);
        }

        .jarvis-mic {
          position: relative;
          width: 72px;
          height: 72px;
          border: none;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mic-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid #0176d3;
          opacity: 0.5;
        }

        .mic-core {
          position: relative;
          z-index: 2;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0176d3, #0d9dda);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(1, 118, 211, 0.4);
        }

        .mic-core svg {
          width: 24px;
          height: 24px;
        }

        .jarvis-mic.recording .mic-ring {
          border-color: #fe9339;
        }

        .jarvis-mic.recording .mic-core {
          background: linear-gradient(135deg, #fe9339, #e3066a);
          box-shadow: 0 4px 20px rgba(254, 147, 57, 0.4);
        }

        .jarvis-mic:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .jarvis-play {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: 1px solid rgba(46, 132, 74, 0.5);
          border-radius: 12px;
          background: rgba(46, 132, 74, 0.15);
          color: #2e844a;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .jarvis-play svg {
          width: 18px;
          height: 18px;
        }

        .jarvis-play:hover {
          background: rgba(46, 132, 74, 0.25);
          border-color: #2e844a;
        }

        .jarvis-messages::-webkit-scrollbar {
          width: 4px;
        }

        .jarvis-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .jarvis-messages::-webkit-scrollbar-thumb {
          background: rgba(1, 118, 211, 0.3);
          border-radius: 2px;
        }
      `}</style>
    </motion.div>
  );
}
