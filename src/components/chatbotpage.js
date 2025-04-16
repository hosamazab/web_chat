import { useState } from "react";
import { Mic, Send, Trash2, MessageCircle, Globe } from "lucide-react"; // Import MessageCircle for chat button

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Chat visibility state

  // Function to send a message to the chatbot
  const sendMessage = async (text, speaker) => {
    if (!text) return;  // Ensure text is defined

    setInput("");
    setLoading(true);
    // url for local server : http://127.0.0.1:8000
    // url for our server : http://91.108.80.252:10030
    try {
      if (speaker === "user") {
        setMessages((prev) => [...prev, { text, sender: speaker }]);
        const response = await fetch(`http://91.108.80.252:10036/ttt/?text=${encodeURIComponent(text)}`);
        if (!response.ok) throw new Error("Failed to fetch TTS response");
        const data = await response.json();
        const formated_text = formatText(data.output);
        setMessages((prev) => [...prev, { text: formated_text, sender: "bot" }]);
      }
      else {
        const response = await fetch(`http://91.108.80.252:10036/tts/?text=${encodeURIComponent(text)}`);
        if (!response.ok) throw new Error("Failed to fetch TTS response");
        const blob = await response.blob();
        const audioURL = URL.createObjectURL(blob);
        setMessages((prev) => [...prev, { text, sender: "bot", audio: audioURL }]);
      }
    } catch (error) {
      console.error("❌ TTS API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to format the text
  const formatText = async (text) => {
    if (!text) return "";

    // Ensure the first letter is capitalized
    text = text.charAt(0).toUpperCase() + text.slice(1);

    // Replace each period (.) with itself + a new line (`\n`)
    return text.replace(/\.\s*/g, ".\n");
  };

  //used to detect the language of the text
  let x1 = "ltr";
  let x2 = "left";
  const isArabic = (text) => {
    if (typeof text !== "string" || !text.trim()) return false;

    const firstChar = text.trim().charAt(0); // Get the first non-whitespace character
    if (/[\u0600-\u06FF]/.test(firstChar)) {
      x1 = "rtl";
      x2 = "right";
    }
    else {
      x1 = "ltr";
      x2 = "left";
    }
    return "done" // Check if it's an Arabic character
  };

  // Function to start recording audio

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        const audioURL = URL.createObjectURL(audioBlob);

        // ✅ Add Recorded Audio to Chat
        setMessages((prev) => [...prev, { sender: "user", audio: audioURL }]);

        // Prepare for STT API Request
        const formData = new FormData();
        formData.append("audio_file", audioBlob, "input.wav");

        setLoading(true);
        try {
          const response = await fetch("http://91.108.80.252:10036/stt/", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (data.transcription) sendMessage(data.transcription, "bot");
        } catch (error) {
          console.error("❌ STT API Error:", error);
        } finally {
          setLoading(false);
          setLoading(true);
        }

        setAudioChunks([]);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setAudioChunks(chunks);
    } catch (error) {
      console.error("❌ Error accessing microphone:", error);
      alert("Microphone access denied or unavailable. Please allow microphone permissions.");
    }
  };

  // Function to stop recording audio

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      setRecording(false);
    }
  };

  const handleClearChat1 = async (check) => {
    const flag = await fetch(`http://91.108.80.252:10036/flag/?check=${encodeURIComponent(check)}`);
    setMessages([]);
  };
  const sendFlagToBackend = async (check) => {
    try {
      const history_start = await fetch(`http://91.108.80.252:10036/flag/?check=${encodeURIComponent(check)}`);
    } catch (error) {
      console.error("Error sending flag:", error);
    }
  };
  const handleClearChat = () => {
    handleClearChat1(false)
  };
  const handleClick = () => {
    sendFlagToBackend(true); // Call function to send flag
    setIsOpen(!isOpen); // Toggle state
    
  };
  // Chatbot UI 
  return (
    <div style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      position: "absolute"
    }}>
      

      {/* Floating Chat Button */}
      <button
        onClick={handleClick}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#007bff",
          color: "white",
          padding: "12px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "70px",
            right: "20px",
            width: "350px",
            backgroundColor: "white",
            //backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlqN_jw9ukJmRwAtfGef332AMKAueF1O60tA&s')",
            backgroundSize: "contain",
            color: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "400px",
            overflow: "hidden",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              backgroundColor: "#2d3748",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
              borderBottom: "1px solid #4a5568",
            }}
          >
            Chatbot
          </div>

          {/* Chat messages container */}
          <div
            style={{
              height: "250px",
              overflowY: "auto",
              padding: "10px",
              borderBottom: "1px solid #4a5568",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "8px",
                  overflow: "auto",
                }}
              > <span
                style={{
                  fontSize: "12px",
                  color: "#a0aec0",
                  fontWeight: "bold",
                  marginBottom: "2px",
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                  {msg.sender === "user" ? "User" : "bot"}
                </span>
                {msg.text && (isArabic(msg.text),
                  <p
                    style={{
                      direction: x1, // Detect language direction
                      textAlign: x2, // Align text properly
                      whiteSpace: "pre-line",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: msg.sender === "user" ? "#007bff" : "#718096",
                      color: "white",
                      display: "inline-block",
                    }}
                  >
                    {msg.text}
                  </p>
                )}

                {/* 🎵 Display Recorded Audio in Chat */}
                {msg.audio && (
                  <audio
                    controls
                    autoPlay={msg.sender === "bot"&& !sessionStorage.getItem(`played-${msg.audio}`)}
                    onPlay={() => sessionStorage.setItem(`played-${msg.audio}`, "true")}
                    style={{ display: msg.sender === "bot" ? "none" : "block", marginTop: "5px", width: "100%" }}
                  >
                    <source src={msg.audio} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                )}

              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                <div className="loader"></div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "10px",
              borderTop: "1px solid #4a5568",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage(input, "user");
                }
              }}
              spellCheck="true"
              placeholder="Type a message..."
              style={{
                flex: 1,
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
                color: "black",
              }}
            />

            <button
              onClick={() => sendMessage(input, "user")}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Send size={18} />
            </button>
            <button
              onClick={recording ? stopRecording : startRecording}
              style={{
                backgroundColor: recording ? "#dc3545" : "#f8f9fa",
                color: recording ? "white" : "black",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Mic size={18} />
            </button>
            <button
              onClick={handleClearChat}
              style={{
                backgroundColor: "#ff4d4d",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Floating chat button */}
      <button
        onClick={handleClick}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#007bff",
          color: "white",
          padding: "12px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        <MessageCircle size={24} />
      </button>

      <style>
        {`
    .para {
      text-align: left;
      align-content: left;
      font-size: 20px;
      line-height: 1.5;
    }

  .div1 {
    position: relative;
    text-align: center;   
    height: 50px;
    width: 100%;
    object-fit: cover;
    }
      body {
      
      background-size: contain; /* Ensures the entire image is visible */
      background-position: top;
      background-repeat: no-repeat;
      background-color:rgb(255, 255, 255); /* Fallback color */
      min-height: 100vh;
      margin: 0;
      font-family: Arial, sans-serif;
    }

    .loader {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}
      </style>


    </div>

  );
}
