# Smart Preventive Healthcare System

A lightweight preventive healthcare dashboard that helps users track basic vitals, estimate lifestyle risk, generate a care checklist, and manage health reminders.

## Features

- Manual data entry for age, height, weight, blood pressure, glucose, sleep, exercise, stress, and lifestyle risks
- AI prediction for preventive health risk scoring
- Health recommendation system with personalized action plans
- Appointment reminders for doctor visits, screenings, vaccines, and follow-ups

## Environment variables

The AI coach expects this environment variable in production:

```bash
GROQ_API_KEY=your_groq_key
```

## Run locally in VS Code

1. Open this project folder in VS Code.
2. Open the VS Code terminal.
3. Create a `.env` file from `.env.example`.
4. Add your Groq key inside `.env`.
5. Run the local server.
6. Open the localhost URL in your browser.

```bash
copy .env.example .env
npm start
```

Local URL:

```text
http://localhost:3000
```

If port `3000` is busy, run:

```bash
$env:PORT=4000; npm start
```

## Deploy

This project is static and can be deployed directly to Vercel, GitHub Pages, Netlify, or any static hosting platform.

## Medical note

This app is for awareness and education. It does not diagnose disease or replace professional medical care.
