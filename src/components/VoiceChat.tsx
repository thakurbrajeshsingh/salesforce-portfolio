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
  const [error, setError] = useState<string | null>(null);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const greetingInProgressRef = useRef(false);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasGreetedRef = useRef(false);
  const startRecordingInProgressRef = useRef(false);

  const startRecording = async () => {
    // Prevent multiple simultaneous calls
    if (startRecordingInProgressRef.current) {
      console.log("startRecording already in progress, skipping");
      return;
    }

    try {
      setError(null);
      startRecordingInProgressRef.current = true;

      // Initialize AudioContext on user gesture to enable autoplay later
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // If this is the first interaction, greet and ask for name
      if (!hasGreetedRef.current && !greetingInProgressRef.current) {
        greetingInProgressRef.current = true;
        setIsGreeting(true);
        hasGreetedRef.current = true;
        setHasGreeted(true);
        const greeting = "Hello! I'm Brajesh AI, the professional twin of Brajesh Kumar. May I know your name?";
        await speakText(greeting);
        setIsGreeting(false);
        greetingInProgressRef.current = false;
        // Auto-start recording after greeting
        if (greetingTimeoutRef.current) {
          clearTimeout(greetingTimeoutRef.current);
        }
        greetingTimeoutRef.current = setTimeout(() => startRecording(), 500);
        return;
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
    } finally {
      startRecordingInProgressRef.current = false;
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
    // Prevent multiple simultaneous audio playbacks
    if (isSpeaking) {
      console.log("Already speaking, skipping new audio");
      return;
    }

    try {
      console.log("Speaking text:", text);
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Speech generation failed:", errorData);
        throw new Error("Speech generation failed");
      }

      const audioBlob = await response.blob();
      console.log("Audio blob received, size:", audioBlob.size, "type:", audioBlob.type);
      const audioUrl = URL.createObjectURL(audioBlob);
      setPendingAudioUrl(audioUrl);
      setShowPlayButton(false);

      await playAudio(audioBlob);
    } catch (error) {
      console.error("Error playing speech:", error);
      setIsSpeaking(false);
      setError("Failed to play audio. Please try again.");
    }
  };

  const playAudio = async (audioBlob: Blob) => {
    console.log("playAudio called with blob size:", audioBlob.size);
    setIsSpeaking(true);
    console.log("isSpeaking set to true");

    try {
      // Use HTML5 Audio directly as it's more reliable for simple playback
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      
      audio.onended = () => {
        console.log("Audio playback ended");
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioElementRef.current = null;
        if (pendingAudioUrl) {
          URL.revokeObjectURL(pendingAudioUrl);
          setPendingAudioUrl(null);
        }
        // Auto-start recording in continuous mode
        if (isContinuousMode) {
          setTimeout(() => startRecording(), 500);
        }
      };

      audio.onerror = (e) => {
        console.error("Audio error:", e);
        setIsSpeaking(false);
        audioElementRef.current = null;
        setShowPlayButton(true);
      };

      console.log("Attempting audio play...");
      await audio.play();
      console.log("Audio started playing");
    } catch (error) {
      console.error("Audio playback failed:", error);
      setIsSpeaking(false);
      audioElementRef.current = null;
      setShowPlayButton(true);
      setError("Failed to play audio. Please try again.");
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
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
    }

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
    setAudioLevel(0);

    // Call the onClose callback
    if (onClose) {
      onClose();
    }
  };

  // Update audio level from analyzer (recording) or simulate (speaking)
  useEffect(() => {
    console.log("Audio level effect triggered, isRecording:", isRecording, "isSpeaking:", isSpeaking);

    if (!isRecording && !isSpeaking) {
      setAudioLevel(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const updateAudioLevel = () => {
      let level = 0;

      if (isRecording && analyserRef.current) {
        // Use real analyzer data for recording
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        level = sum / dataArray.length / 255; // Normalize to 0-1
      } else if (isSpeaking) {
        // Simulate audio level for speaking
        level = Math.random() * 0.5 + 0.3;
      }

      setAudioLevel(level);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, isSpeaking]);

  return (
    <>
      {onClose && (
        <button
          onClick={handleClose}
          className="ai-close"
        >
          ✕
        </button>
      )}

      <div className="ai-mode-container">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--navy)", margin: 0, letterSpacing: "-0.03em" }}>
            Brajesh <span style={{ color: "var(--blue)" }}>AI</span>
          </h2>
          <div style={{ width: "40px", height: "4px", background: "linear-gradient(90deg, var(--blue), var(--cyan))", margin: "0.5rem auto 0", borderRadius: "2px" }} />
        </div>

        <motion.div
          className="mascot-container"
          style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto 1.5rem" }}
        >
          {/* Audio Glow Background */}
          {(isRecording || isSpeaking) && (
            <motion.div
              className="audio-glow"
              animate={{
                scale: [1, 1 + audioLevel * 0.6, 1],
                opacity: [0.2, audioLevel * 0.5 + 0.2, 0.2],
              }}
              transition={{ duration: 0.15, repeat: Infinity }}
              style={{
                position: "absolute",
                inset: "-50px",
                borderRadius: "50%",
                background: isRecording 
                  ? "radial-gradient(circle, rgba(1,118,211,0.5) 0%, rgba(1,118,211,0) 70%)"
                  : "radial-gradient(circle, rgba(46,132,74,0.5) 0%, rgba(46,132,74,0) 70%)",
                zIndex: 0,
              }}
            />
          )}

          {/* Astro Mascot Image */}
          <motion.img
            src="/astro-mascot.png"
            alt="Agentforce Astro"
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "contain",
              position: "relative",
              zIndex: 1,
              mixBlendMode: "multiply",
              filter: "drop-shadow(0px 15px 25px rgba(0,0,0,0.12))"
            }}
            animate={
              isLoading
                ? {
                    x: [0, -4, 4, -5, 5, -3, 3, 0],
                    y: [0, 2, -2, 3, -3, 1, -1, 0],
                    rotate: [0, -3, 3, -1, 1, 0],
                  }
                : isRecording
                ? {
                    scale: 1.15,
                    y: -12,
                    rotate: 4,
                  }
                : isSpeaking
                ? {
                    y: [0, -15, 0],
                    rotate: [0, -4, 4, 0],
                    scale: [1, 1.06, 1]
                  }
                : {
                    y: [0, -10, 0],
                    rotate: [0, 1.5, -1.5, 0]
                  }
            }
            transition={
              isLoading
                ? { duration: 0.35, repeat: Infinity, ease: "linear" }
                : isRecording
                ? { type: "spring", stiffness: 200, damping: 10 }
                : isSpeaking
                ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            }
          />
          
          {/* Funny Status Bubble */}
          <AnimatePresence>
            {(isLoading || isRecording || isSpeaking) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 15 }}
                style={{
                  position: "absolute",
                  top: "-25px",
                  right: "-50px",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(8px)",
                  padding: "10px 16px",
                  borderRadius: "20px",
                  borderBottomLeftRadius: "6px",
                  boxShadow: "0 10px 25px rgba(11, 31, 54, 0.15), inset 0 1px 0 rgba(255,255,255,1)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "var(--navy)",
                  zIndex: 2,
                  whiteSpace: "nowrap"
                }}
              >
                {isLoading && "Biting nails... 😬"}
                {isRecording && "I'm all ears! 👂"}
                {isSpeaking && "Blah blah blah 🗣️"}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <p className="ai-subtitle">
          My portfolio works for free. <strong>My AI twin has cloud bills.</strong>
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", width: "100%" }}
            >
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  borderRadius: "16px",
                  background: "rgba(254, 241, 238, 0.9)",
                  border: "1px solid rgba(255, 186, 186, 0.5)",
                  color: "#ba0517",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(186, 5, 23, 0.05)"
                }}
              >
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            justifyContent: "center",
            width: "100%",
            gap: "1rem",
          }}
        >
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="ai-action-btn recording"
            >
              Stop Recording
            </button>
          ) : (
            <button
              onClick={() => {
                setIsContinuousMode(true);
                startRecording();
              }}
              disabled={isLoading || isSpeaking || isGreeting}
              className="ai-action-btn"
            >
              {isLoading && "Thinking..."}
              {!isLoading && isSpeaking && "Speaking..."}
              {!isLoading && !isSpeaking && "Start Conversation"}
            </button>
          )}
        </div>

        {showPlayButton && pendingAudioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "center",
              width: "100%"
            }}
          >
            <button
              onClick={playPendingAudio}
              className="button-secondary"
            >
              Play Response
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
