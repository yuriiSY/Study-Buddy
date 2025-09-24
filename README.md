**AI Study Buddy is a web-based application which aims to enhance a student’s learning and study routine. With the use of schedules, note summaries, quizzes and more, studying can become less of a task and become more effective.
Some of the Key Features**

-	Note Uploading
-	Quiz Generation
-	Pomodoro Timer
-	Gamified System
-	Knowledge Gap Detection
-	AI Tutoring
-	Multimodal Input
-	Peer Matching


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
