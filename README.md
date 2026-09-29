# ✈️ Travel Planner Agent

An AI-powered travel planning application that generates personalized travel itineraries based on the destination, trip duration, number of travelers, budget, and interests.

The application uses an agent-based backend to plan trips, calculate estimated expenses, and generate a structured day-by-day itinerary through an LLM. A Next.js frontend provides an interactive interface for users to view their travel plans and budget breakdown.

## 🚀 Features

* 🌍 Personalized travel itinerary generation
* 📅 Day-by-day trip planning
* 💰 Budget estimation and expense breakdown
* 👥 Supports multiple travelers
* 🎯 Interest-based activity recommendations
* 🏨 Accommodation planning
* 🍴 Food and dining recommendations
* 🚗 Local transportation planning
* 🤖 LLM-powered itinerary generation
* 🧠 Agent-based travel planning workflow
* 💬 Conversation-based trip planning
* 📊 Budget summary with remaining budget
* 🖥️ Interactive Next.js frontend
* ⚡ FastAPI backend

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │      Next.js        │
                    └──────────┬──────────┘
                               │
                               │ API Request
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Agent Workflow    │
                    │      LangGraph      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ Trip       │   │ Budget     │   │ Travel     │
       │ Planner    │   │ Calculator │   │ Tools      │
       └────────────┘   └────────────┘   └────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │       Groq LLM      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Generated Itinerary│
                    └─────────────────────┘
```

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI
* LangChain
* LangGraph
* Pydantic

### AI

* Groq
* LLM-based itinerary generation
* Agent-based planning workflow

### Development

* Git
* GitHub
* Node.js
* Python

## 📂 Project Structure

```text
Travel-Planner-Agent/
│
├── agent/
│   ├── nodes.py
│   └── ...
│
├── backend/
│   ├── main.py
│   └── ...
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── ...
│
├── tools/
│   └── ...
│
├── requirements.txt
├── .gitignore
└── README.md
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Khwaish-Shah0207/Travel-Planner-Agent.git
cd Travel-Planner-Agent
```

### 2. Create a Python virtual environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Linux/macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

## 🔐 Environment Variables

Create a `.env` file in the project root.

```env
GROQ_API_KEY=your_groq_api_key
```

Add any other API keys required by the tools used in the project.

**Do not commit your `.env` file to GitHub.**

Your `.gitignore` should contain:

```gitignore
.env
venv/
__pycache__/
node_modules/
.next/
```

## ▶️ Running the Project

### Start the Backend

From the project root:

```bash
uvicorn backend.main:app --reload
```

The FastAPI server will run at:

```text
http://localhost:8000
```

### Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

Open the frontend in your browser and enter your travel requirements.

## 🧳 How It Works

The user provides:

* Destination
* Number of days
* Number of travelers
* Total budget
* Travel interests

The backend processes these requirements through the agent workflow.

The workflow:

1. Receives the travel request.
2. Extracts and validates the trip requirements.
3. Plans the trip according to the user's interests.
4. Calculates estimated travel expenses.
5. Retrieves relevant travel information through available tools.
6. Generates a day-by-day itinerary using the LLM.
7. Returns the final itinerary to the frontend.
8. The frontend displays the itinerary and budget breakdown.

## 💰 Budget Planning

The generated travel plan includes estimated expenses for:

* Accommodation
* Food
* Transportation
* Activities
* Total estimated cost
* Remaining budget

The frontend presents these values in a dedicated budget summary along with the daily itinerary.

## 📅 Example Input

```text
Destination: Goa
Duration: 4 days
Travelers: 2
Budget: ₹40,000
Interests:
- Beaches
- Food
- Adventure
- Nightlife
```

The system generates a personalized itinerary containing activities for each day along with estimated costs.

## 🔌 API

### POST `/plan-trip`

Generates a personalized travel itinerary.

Example request:

```json
{
  "destination": "Goa",
  "days": 4,
  "travelers": 2,
  "budget": 40000,
  "interests": [
    "Beaches",
    "Food",
    "Adventure"
  ]
}
```

The response contains the generated itinerary, planning steps, conversation ID, and trip details.

## 🎯 Project Goal

The goal of Travel Planner Agent is to simplify trip planning by combining:

* Generative AI
* Agentic workflows
* Budget planning
* Personalized recommendations
* Interactive web interfaces

Instead of manually researching destinations, accommodations, activities, transportation, and expenses, users can provide their requirements and receive a complete travel plan through a single application.

## 🔮 Future Improvements

* Real-time flight and hotel prices
* Live weather integration
* Maps and route visualization
* Hotel and restaurant booking
* Flight booking integration
* Multi-city trip planning
* Currency conversion
* Real-time travel alerts
* More travel information tools
* User accounts and saved trips
* Export itinerary as PDF
* Mobile application

## 👩‍💻 Author

**Khwaish Shah**

GitHub:
https://github.com/Khwaish-Shah0207

## 📄 License

This project is intended for educational and development purposes.
