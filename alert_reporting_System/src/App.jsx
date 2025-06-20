import { useState, useRef } from 'react';
import './App.css';
import React from 'react';

function App() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [mediaStream, setMediaStream] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [alertVisible, setAlertVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleTextChange = (value) => { 
    setDescription(value);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files.length === 0) {
      console.log("No file selected");
      return;
    }
    const selectedFile = event.target.files[0];
    setImage(selectedFile);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);

      
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          setMediaStream(null);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied or error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        console.log("Location:", latitude, longitude);
      },
      (error) => {
        alert("Unable to retrieve your location. Please allow permission.");
        console.error("Geolocation error:", error);
      }
    );
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!description.trim()) {
    alert("Please describe the incident before submitting.");
    return; 
  }
  setIsLoading(true);
  const formData = new FormData();
  formData.append("description", description); 

 
  if (image) formData.append("image", image);
  if (audioBlob) formData.append("audio", audioBlob, "recording.webm");
  if (location.latitude && location.longitude) {
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
  }

  try {
    const response = await fetch("http://192.168.115.147:8000/report/", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      console.log("Submitted successfully");

  
      setDescription("");
      setImage(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setLocation({ latitude: null, longitude: null });
      setIsRecording(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
        setIsLoading(false);
        window.location.reload(); 
      }, 3000);
    } else {
      console.error("Failed to submit:", response.statusText);
    }
  } catch (err) {
    console.error("Error submitting:", err);
  }
};

  return (
    <>
      <div className='rounded-lg border-1 max-w-2xl mx-auto mt-20'>
        <div className='bg-red-500 rounded-t-lg mb-10 px-10 py-10 text-white text-3xl text-center flex-col'>
          🚨 Emergency Reporting System
          <div className='text-xl'>Anonymous • Fast • Secure</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="w-full max-w-xl mx-auto">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Describe the Incident</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={description}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="What is happening? Be as specific as possible ..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <div className='flex mt-10 mb-10 max-w-md mx-auto w-full space-x-4'>
            <button onClick={handleButtonClick} className="inline-flex items-center justify-center border font-medium py-2 px-10 rounded-lg border-stone-500 text-stone-700 hover:opacity-60">📷 Photo</button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {!isRecording ? (
              <button type="button" onClick={startRecording} className="inline-flex items-center justify-center border font-medium py-2 px-10 rounded-lg border-stone-500 text-stone-700 hover:opacity-60">🎙️ Start Voice</button>
            ) : (
              <button type="button" onClick={stopRecording} className="inline-flex items-center justify-center border font-medium py-2 px-10 rounded-lg border-red-500 text-red-800 bg-red-200 hover:opacity-60">⏹️ Stop Recording</button>
            )}

            <button type="button" onClick={handleGetLocation} className="inline-flex items-center justify-center border font-medium py-2 px-10 rounded-lg border-stone-500 text-stone-700 hover:opacity-60">📍 Location</button>
          </div>
            {audioUrl && (
              <div className="text-center mt-6 mb-10">
                <p className="mb-2 font-medium text-gray-700">🎧 Voice Preview:</p>
                <audio controls src={audioUrl} className="mx-auto w-full max-w-md" />
                <button
                  type="button"
                  onClick={() => {
                    setAudioUrl(null);
                    setAudioBlob(null);
                  }}
                  className="mt-2 text-red-600 hover:underline text-sm"
                >
                  ❌ Delete Recording
                </button>
              </div>
            )}            
          <div className='flex justify-center mt-10 mx-10 mb-10'>
<button
  type="submit"
  disabled={isLoading}
  className={`w-full h-16 text-xl font-bold rounded-2xl text-white ${
    isLoading ? "bg-gray-400" : "bg-red-400 hover:bg-red-700"
  }`}
>
  {isLoading ? (
    <div className="flex justify-center items-center space-x-2">
      <svg
        className="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
      <span>Submitting...</span>
    </div>
  ) : (
    "Submit"
  )}
</button>
          </div>
        </form>

        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
          <div className="font-semibold mb-2">🔒 Privacy & Anonymity</div>
          <ul className="space-y-1">
            <li>• No personal information is collected</li>
            <li>• Reports are sent directly to verified authorities</li>
            <li>• Location data is optional and can be disabled</li>
            <li>• All data is encrypted and secure</li>
          </ul>
        </div>
      </div>

     
    </>
  );
}

export default App;
