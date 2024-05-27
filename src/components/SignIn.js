import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const SignIn = () => {
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [signInSuccess, setSignInSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const initializeFaceApi = async () => {
    try {
      await faceapi.tf.setBackend('webgl');
      await faceapi.tf.ready();
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to CPU backend');
      await faceapi.tf.setBackend('cpu');
      await faceapi.tf.ready();
    }

    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    initializeFaceApi().then(startVideo);
  }, []);

  const handleSignIn = async () => {
    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (detections) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      for (const user of users) {
        const storedDescriptor = new Float32Array(Object.values(user.faceDescriptor));
        const distance = faceapi.euclideanDistance(detections.descriptor, storedDescriptor);
        if (distance < 0.6) { // Adjust threshold as necessary
            const currentTime = new Date().toISOString();
            user.lastSignIn = currentTime;
            localStorage.setItem('users', JSON.stringify(users));

          setSignInSuccess(true);
          setUserData(user);
          setIsCameraActive(false);
          return;
        }
      }
      alert('Face not recognized. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-600">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {isCameraActive ? (
          <div className="text-center">
            <video ref={videoRef} autoPlay muted className="w-full h-auto rounded-lg mb-4"></video>
            <button onClick={handleSignIn} className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600">
              Sign In
            </button>
          </div>
        ) : signInSuccess && userData ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome, {userData.name}!</h2>
            <p className="mb-2"><strong>Email:</strong> {userData.email}</p>
            <p className="mb-2"><strong>Mobile:</strong> {userData.mobile}</p>
            <p className="mb-2"><strong>Gender:</strong> {userData.gender}</p>
            <p className="mb-2"><strong>Last Sign-In:</strong> {new Date(userData.lastSignIn).toLocaleString()}</p>
            
            <button onClick={() => setIsCameraActive(true)} className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 mt-4">
              Sign Out
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-red-500">Face not recognized. Please try again.</p>
            <button onClick={() => setIsCameraActive(true)} className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 mt-4">
              Retry
            </button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

export default SignIn;