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

  const startRecording = async () => {
    try {
      setError(null);
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
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
      setPendingAudioUrl(null);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setShowPlayButton(true);
    };

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
    <div className="voice-chat-simple">
      <div className="voice-chat-header">
        <span>Meet My AI Twin</span>
        {onClose && <button onClick={onClose} className="close-btn">×</button>}
      </div>

      <div className="voice-chat-messages">
        {error && <div className="error-message">{error}</div>}

        {messages.length === 0 && !error && (
          <div className="welcome-message">
            <p>I'm Brajesh's AI twin. Ask me anything about his experience and projects.</p>
          </div>
        )}

        {messages.map((message, index) => (
          message.role === "user" && (
            <div key={index} className="message user">
              <div className="message-content">{message.content}</div>
            </div>
          )
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-content">Processing...</div>
          </div>
        )}
      </div>

      <div className="voice-chat-controls">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading || isSpeaking}
          className={`mic-button ${isRecording ? "recording" : ""}`}
        >
          {isRecording ? "⏹️ I'm Done Speaking" : "Speak with My AI Twin"}
        </button>
        {showPlayButton && pendingAudioUrl && (
          <button
            onClick={playPendingAudio}
            className="play-button"
          >
            🔊 Play Response
          </button>
        )}
      </div>

      <style jsx>{`
        .voice-chat-simple {
          width: 100%;
          max-width: 420px;
          background: linear-gradient(145deg, #0b1f36, #06172c);
          border: 1px solid rgba(1, 118, 211, 0.3);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(1, 118, 211, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .voice-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(1, 118, 211, 0.2);
          background: rgba(1, 118, 211, 0.05);
        }

        .voice-chat-header span {
          font-weight: 800;
          color: #0d9dda;
          letter-spacing: 0.1em;
          font-size: 0.75rem;
        }

        .close-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 1.25rem;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .voice-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 320px;
        }

        .welcome-message {
          text-align: center;
          padding: 1.5rem 1rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .welcome-message p {
          font-size: 0.85rem;
          line-height: 1.6;
        }

        .error-message {
          padding: 0.9rem 1.1rem;
          background: rgba(254, 147, 57, 0.15);
          border: 1px solid rgba(254, 147, 57, 0.3);
          border-radius: 12px;
          color: #fe9339;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .message {
          max-width: 85%;
          padding: 0.9rem 1.1rem;
          border-radius: 16px;
        }

        .message.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #0176d3, #0d9dda);
          box-shadow: 0 4px 20px rgba(1, 118, 211, 0.3);
        }

        .message.assistant {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .message-content {
          font-size: 0.85rem;
          line-height: 1.5;
          color: white;
        }

        .voice-chat-controls {
          padding: 1.5rem;
          border-top: 1px solid rgba(1, 118, 211, 0.2);
          background: rgba(1, 118, 211, 0.03);
          display: flex;
          justify-content: center;
          gap: 0.75rem;
        }

        .mic-button {
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #0176d3, #0d9dda);
          color: white;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(1, 118, 211, 0.25);
        }

        .mic-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(1, 118, 211, 0.35);
        }

        .mic-button.recording {
          background: linear-gradient(135deg, #fe9339, #e3066a);
          box-shadow: 0 4px 20px rgba(254, 147, 57, 0.25);
        }

        .mic-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .play-button {
          padding: 0.875rem 1.5rem;
          border: 1px solid rgba(46, 132, 74, 0.5);
          border-radius: 12px;
          background: rgba(46, 132, 74, 0.15);
          color: #2e844a;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .play-button:hover {
          background: rgba(46, 132, 74, 0.25);
          border-color: #2e844a;
        }

        .voice-chat-messages::-webkit-scrollbar {
          width: 4px;
        }

        .voice-chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .voice-chat-messages::-webkit-scrollbar-thumb {
          background: rgba(1, 118, 211, 0.3);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
