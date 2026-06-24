"use client";

import { useState, useRef, useEffect } from "react";
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
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
      microphoneStreamRef.current = stream;

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

      // Stop microphone stream and analyzer
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
      }
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
      console.log("Audio blob received, size:", audioBlob.size, "type:", audioBlob.type);
      const audioUrl = URL.createObjectURL(audioBlob);
      setPendingAudioUrl(audioUrl);
      setShowPlayButton(false);

      await playAudio(audioBlob);
    } catch (error) {
      console.error("Error playing speech:", error);
      setIsSpeaking(false);
    }
  };

  const playAudio = async (audioBlob: Blob) => {
    console.log("playAudio called with blob size:", audioBlob.size);
    setIsSpeaking(true);
    console.log("isSpeaking set to true");
    console.log("AudioContext state:", audioContextRef.current?.state);

    try {
      // Try Web Audio API first
      const arrayBuffer = await audioBlob.arrayBuffer();
      console.log("Array buffer size:", arrayBuffer.byteLength);

      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      console.log("Audio buffer decoded, duration:", audioBuffer.duration, "seconds");

      // Stop any previous audio source
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }

      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      audioSourceRef.current = source;

      const gainNode = audioContextRef.current!.createGain();
      gainNode.gain.value = 1.0;
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current!.destination);

      console.log("Web Audio API: source -> gain -> destination");

      source.onended = () => {
        console.log("Audio playback ended");
        setIsSpeaking(false);
        if (pendingAudioUrl) {
          URL.revokeObjectURL(pendingAudioUrl);
          setPendingAudioUrl(null);
        }
        audioSourceRef.current = null;
      };

      source.start(0);
      console.log("Audio started playing via Web Audio API");
    } catch (error) {
      console.error("Web Audio API failed, falling back to HTML5 Audio:", error);
      
      // Fallback to HTML5 Audio
      try {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          console.log("HTML5 Audio playback ended");
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          if (pendingAudioUrl) {
            URL.revokeObjectURL(pendingAudioUrl);
            setPendingAudioUrl(null);
          }
        };

        audio.onerror = (e) => {
          console.error("HTML5 Audio error:", e);
          setIsSpeaking(false);
          setShowPlayButton(true);
        };

        console.log("Attempting HTML5 Audio play...");
        await audio.play();
        console.log("HTML5 Audio started playing");
      } catch (fallbackError) {
        console.error("HTML5 Audio also failed:", fallbackError);
        setIsSpeaking(false);
        setShowPlayButton(true);
      }
    }
  };

  const playPendingAudio = async () => {
    if (!pendingAudioUrl) return;
    setShowPlayButton(false);

    try {
      const response = await fetch(pendingAudioUrl);
      const audioBlob = await response.blob();
      await playAudio(audioBlob);
    } catch (error) {
      console.error("Error playing pending audio:", error);
      setIsSpeaking(false);
    }
  };

  const handleClose = () => {
    // Stop any playing audio
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (pendingAudioUrl) {
      URL.revokeObjectURL(pendingAudioUrl);
      setPendingAudioUrl(null);
    }
    setIsSpeaking(false);
    setIsRecording(false);
    setShowPlayButton(false);
    setAudioLevels(new Array(20).fill(0));

    // Call the onClose callback
    if (onClose) {
      onClose();
    }
  };

  // Update audio levels with simulated waveform (both recording and speaking)
  useEffect(() => {
    console.log("Waveform effect triggered, isRecording:", isRecording, "isSpeaking:", isSpeaking);

    if (!isRecording && !isSpeaking) {
      setAudioLevels(new Array(20).fill(0));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const updateAudioLevels = () => {
      const levels = new Array(20).fill(0);

      // Simulate waveform for both recording and speaking
      for (let i = 0; i < 20; i++) {
        levels[i] = Math.random() * 0.5 + 0.3;
      }

      setAudioLevels(levels);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
    };

    animationFrameRef.current = requestAnimationFrame(updateAudioLevels);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, isSpeaking]);

  return (
    <div className="voice-chat-overlay">
      {onClose && (
        <button
          onClick={handleClose}
          className="ai-close"
        >
          ✕
        </button>
      )}

      <div className="ai-mode-container">
        <div
          className={`ai-orb ${isRecording
            ? "listening"
            : isSpeaking
              ? "speaking"
              : ""
            }`}
        >
          {(isRecording || isSpeaking) && (
            <>
              <span className="pulse-ring pulse-ring-1" />
              <span className="pulse-ring pulse-ring-2" />
              <span className="pulse-ring pulse-ring-3" />
            </>
          )}

          {/* <Image
            src={aiAvatar}
            alt="AI Avatar"
            width={150}
            className="ai-orb"
            height={150}
          /> */}
          <span className="orb-text">
            BK
          </span>
        </div>
        <p className="ai-subtitle">
          My portfolio works for free. My AI twin has cloud bills.
        </p>

        {(isRecording || isSpeaking) && (
          <div className="waveform-container">
            {audioLevels.map((level, index) => (
              <div
                key={index}
                className="waveform-bar"
                style={{
                  height: `${Math.max(
                    level * 100,
                    8
                  )}%`,
                }}
              />
            ))}
          </div>
        )}

        {/* <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div className="ai-status">
            {isRecording
              ? "🎤 Listening..."
              : isLoading
                ? "⚡ Thinking..."
                : isSpeaking
                  ? "🔊 Speaking..."
                  : "Ready to talk"}
          </div>
        </div> */}

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              borderRadius: "12px",
              background: "#fef1ee",
              color: "#ba0517",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={
              isRecording
                ? stopRecording
                : startRecording
            }
            disabled={isLoading || isSpeaking}
            className={`ai-action-btn ${isRecording ? "recording" : ""
              }`}
          >
            {isRecording && "Stop Recording"}
            {isLoading && "⚡ Thinking..."}
            {!isLoading && isSpeaking && "Speaking..."}
            {!isRecording &&
              !isLoading &&
              !isSpeaking &&
              "Start Conversation"}
          </button>
        </div>

        {showPlayButton &&
          pendingAudioUrl && (
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                onClick={playPendingAudio}
                className="button-secondary"
              >
                Play Response
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
