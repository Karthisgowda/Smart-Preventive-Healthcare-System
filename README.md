# Smart Preventive Healthcare System

A lightweight preventive healthcare dashboard that helps users track basic vitals, estimate lifestyle risk, generate a care checklist, and manage health reminders.

## Features

- Prevention score from BMI, blood pressure, glucose, sleep, exercise, stress, and lifestyle risk factors
- Personalized recommendations for healthier habits and screening follow-up
- Local vitals log stored in the browser
- Reminder center for checkups, vaccines, medication, and screening tasks
- Symptom triage helper for general guidance
- AI preventive care coach powered by a protected serverless API route
- Downloadable preventive care checklist
- Responsive light and dark interface

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
