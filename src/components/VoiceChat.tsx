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
      
      // Set up audio analyzer for waveform visualization
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      
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
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      console.log("Array buffer size:", arrayBuffer.byteLength);
      
      // Decode audio data using the established AudioContext
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      console.log("Audio buffer decoded, duration:", audioBuffer.duration, "seconds");
      console.log("Audio buffer channels:", audioBuffer.numberOfChannels);
      console.log("Audio buffer sample rate:", audioBuffer.sampleRate);
      
      // Check if buffer has actual audio data
      const channelData = audioBuffer.getChannelData(0);
      let hasAudio = false;
      let maxSample = 0;
      for (let i = 0; i < Math.min(channelData.length, 1000); i++) {
        if (Math.abs(channelData[i]) > 0.001) {
          hasAudio = true;
        }
        if (Math.abs(channelData[i]) > maxSample) {
          maxSample = Math.abs(channelData[i]);
        }
      }
      console.log("Buffer has audio data:", hasAudio, "Max sample:", maxSample);
      
      // Stop any previous audio source
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
      
      // Create new audio source
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      audioSourceRef.current = source;
      
      // Add gain node for volume control
      const gainNode = audioContextRef.current!.createGain();
      gainNode.gain.value = 1.0; // Maximum volume
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current!.destination);
      
      console.log("Audio chain connected: source -> gain -> destination");
      console.log("Destination:", audioContextRef.current!.destination);
      
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
      console.log("Audio started playing at time:", audioContextRef.current!.currentTime);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsSpeaking(false);
      setShowPlayButton(true);
      audioSourceRef.current = null;
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

  // Update audio levels from analyzer (recording) or simulate (speaking)
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

      if (isRecording && analyserRef.current) {
        // Use real analyzer data for recording
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        for (let i = 0; i < 20; i++) {
          const startIndex = Math.floor(i * dataArray.length / 20);
          const endIndex = Math.floor((i + 1) * dataArray.length / 20);
          let sum = 0;
          for (let j = startIndex; j < endIndex; j++) {
            sum += dataArray[j];
          }
          levels[i] = sum / (endIndex - startIndex) / 255; // Normalize to 0-1
        }
      } else if (isSpeaking) {
        // Simulate waveform for speaking
        for (let i = 0; i < 20; i++) {
          levels[i] = Math.random() * 0.5 + 0.3;
        }
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
            onClick={handleClose}
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

        {(isRecording || isSpeaking) && (
          <div className="waveform-container">
            {audioLevels.map((level, index) => (
              <div
                key={index}
                className="waveform-bar"
                style={{
                  height: `${Math.max(level * 100, 5)}%`,
                  backgroundColor: isRecording ? '#0176d3' : '#2e844a',
                }}
              />
            ))}
          </div>
        )}

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

      .waveform-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        height: 40px;
        margin: 15px 0;
      }

      .waveform-bar {
        width: 4px;
        border-radius: 2px;
        transition: height 0.05s ease;
        min-height: 5px;
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
