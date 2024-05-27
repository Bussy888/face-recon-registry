# Face Recognition Sign-In App

## Overview
This project is a web-based application that uses face recognition technology to facilitate user sign-up and sign-in processes. It leverages `React.js` for the frontend and `Local Storage` for the database. The face recognition functionality is powered by the `face-api.js` library.

## Features
- **User Sign-Up:** Users can register by providing their details (name, email, mobile number, and gender) along with a captured image of their face.
- **Face Descriptor Storage:** The application extracts face descriptors from the captured image and stores them in the local storage for simplicity. In a production environment, these would typically be stored in a database.
- **User Sign-In:** Users can sign in by scanning their face. The application compares the captured face descriptors with the stored descriptors to authenticate users.
- **Last Sign-In Time:** Upon successful sign-in, the application records the current timestamp and displays the user's last sign-in time.

## Live Url

Check Live : https://face-based-authentication.netlify.app/

## Technologies Used
- **Frontend:** React.js
- **Database:** Local Storage
- **Face Recognition:** face-api.js
- **Styles:** Tailwind CSS

## Getting Started
To run this project locally, follow these steps:

### Prerequisites
- Node.js and npm installed

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mdshoaib126/face-based-authentication.git
   cd face-recognition-sign-in

2. **Install frontend dependencies:**
    ```bash
    cd frontend
    npm install

3. **Run:**
    ```bash
    npm start

### Models for face-api.js
Make sure to download the required models for face-api.js and place them in the /models directory of your public folder:

tiny_face_detector_model
face_landmark_68_model
face_recognition_model 

### Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.