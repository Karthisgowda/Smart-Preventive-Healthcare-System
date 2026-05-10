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

## Run locally

Open `index.html` in a browser, or serve the folder with any static file server.

```bash
npx serve .
```

## Deploy

This project is static and can be deployed directly to Vercel, GitHub Pages, Netlify, or any static hosting platform.

## Medical note

This app is for awareness and education. It does not diagnose disease or replace professional medical care.
