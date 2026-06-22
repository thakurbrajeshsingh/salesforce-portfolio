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
        <span>Brajesh AI</span>
        {onClose && <button onClick={onClose} className="close-btn">×</button>}
      </div>

      <div className="voice-chat-messages">
        {error && <div className="error-message">{error}</div>}

        {messages.length === 0 && !error && (
          <div className="welcome-message">
            <p>Ask me about Salesforce, Field Service, or my experience.</p>
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
          {isRecording ? "⏹️ Stop" : "🎤 Click to Speak"}
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
          max-width: 400px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .voice-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e0e0e0;
          background: #f5f8fc;
        }

        .voice-chat-header span {
          font-weight: 700;
          color: #0b1f36;
        }

        .close-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: #e0e0e0;
          border-radius: 6px;
          font-size: 1.25rem;
          cursor: pointer;
          color: #666;
        }

        .close-btn:hover {
          background: #d0d0d0;
        }

        .voice-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 300px;
        }

        .welcome-message {
          text-align: center;
          padding: 1rem;
          color: #607087;
        }

        .error-message {
          padding: 0.75rem;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          color: #856404;
          font-size: 0.85rem;
        }

        .message {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
        }

        .message.user {
          align-self: flex-end;
          background: #0176d3;
          color: white;
        }

        .message.assistant {
          align-self: flex-start;
          background: #f0f0f0;
          color: #333;
        }

        .message-content {
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .voice-chat-controls {
          padding: 1rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .mic-button {
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 10px;
          background: #0176d3;
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .mic-button:hover:not(:disabled) {
          background: #0b5cab;
        }

        .mic-button.recording {
          background: #dc3545;
        }

        .mic-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .play-button {
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 10px;
          background: #28a745;
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .play-button:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
}
