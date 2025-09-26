# AI Study Buddy

AI Study Buddy is a simple app to help students study better. It combines tools like uploading notes (text, PDFs, images, audio, videos), making quizzes, using a Pomodoro timer, earning rewards, finding weak spots, chatting with an AI tutor, connecting with study partners, and discussing topics in a community forum (like StackOverflow). The app is built to be fast, grow with more users, and easy to update.

## What It Does

- **Upload Notes**: Add text, PDFs or images(like lecture slides or handwritten notes). The app reads them with AI.
- **Audio/Video Support**: Upload lecture audio or videos to get transcripts, summaries, or quizzes.
- **Quizzes**: Creates practice quizzes from your notes to help you learn.
- **Pomodoro Timer**: Helps you focus with timed study and break sessions.
- **Rewards**: Earn points, badges, and climb the leaderboard for studying.
- **Find Weak Spots**: Shows what you need to study more based on your notes.
- **AI Tutor**: Ask questions and get clear answers, like a personal tutor.
- **Study Partners**: Connects you with students studying similar topics.
- **Community Forum**: Discuss topics, ask questions, and share tips.

## Team
Team of 4 members:
- [**Anika Siddiqui**](https://github.com/merelyaname) - Frontend Developer
- **Rumaysa Babulkhair**
- **Rumaysa Babulkhair**
- **Rumaysa Babulkhair**


📖 Further documentation can be found in the [Documentation branch](https://github.com/yuriiSY/FinalTeamProject/tree/Documentation).

📄 **MIT License**

# Final Project

## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (Comes with Node.js)
- [Docker](https://www.docker.com/products/docker-desktop/) 

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/yuriiSY/FinalTeamProject.git
```

### 3. Run containers

```bash
docker compose up -d
cd FinalTeamProject
cd backend
```

### 3. Install Dependencies
Navigate to the project directory and install the necessary dependencies:

```bash
cd FinalTeamProject
cd backend
npm install
```

### 4. Set Up Environment Variables
Create a .env file in the root directory and add the required environment variables.

```bash
DB_HOST = 
PORT=
```

### 5. Start the Server
To start the development server, run the following command:

```bash
npm run dev
```
This will start the server using nodemon which automatically restarts the server when changes are detected.

Alternatively, to run the server without nodemon:

```bash
npm start
```
