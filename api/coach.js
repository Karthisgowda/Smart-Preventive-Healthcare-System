const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function buildLocalRecommendation(question, profile, plan) {
  const tips = [];

  if (profile.exercise < 150) {
    tips.push("Increase weekly exercise gradually toward 150 minutes of moderate activity.");
  }
  if (profile.sleep < 7) {
    tips.push("Keep a regular sleep schedule and aim for at least 7 hours of sleep.");
  }
  if (profile.systolic >= 130) {
    tips.push("Track blood pressure regularly and reduce salt-heavy packaged foods.");
  }
  if (profile.glucose >= 100) {
    tips.push("Prefer high-fiber meals and discuss glucose screening with a clinician.");
  }
  if (profile.smoking) {
    tips.push("Create a tobacco quit plan and ask a healthcare professional about support options.");
  }
  if (profile.familyHistory) {
    tips.push("Keep routine preventive checkups active because family history can increase risk.");
  }

  if (tips.length === 0) {
    tips.push("Maintain your current healthy habits and continue routine preventive checkups.");
  }

  return [
    `Prediction summary: ${plan.level || "Assessment completed"} with a prevention score of ${plan.score || "--"}/100.`,
    `You asked: ${question}`,
    "Recommended next steps:",
    ...tips.map((tip) => `- ${tip}`),
    "- Add appointment reminders for annual checkup, dental visit, eye checkup, and any doctor-advised screening.",
    "This is educational guidance only. For personal medical decisions, consult a qualified clinician.",
  ].join("\n");
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;

  try {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    const question = String(body.question || "").trim();
    const profile = body.profile || {};
    const plan = body.plan || {};

    if (!question) {
      sendJson(response, 400, { error: "Question is required." });
      return;
    }

    if (!apiKey) {
      sendJson(response, 200, {
        answer: buildLocalRecommendation(question, profile, plan),
        mode: "local",
      });
      return;
    }

    const prompt = [
      "You are a preventive healthcare education assistant for a student project.",
      "Do not diagnose disease, prescribe medicine, or claim certainty.",
      "Give concise, practical, safe guidance in bullet points.",
      "Tell the user to seek urgent care for emergency symptoms and to consult a clinician for personal medical decisions.",
      "",
      `Current profile: ${JSON.stringify(profile)}`,
      `Calculated prevention plan: ${JSON.stringify(plan)}`,
      `User question: ${question}`,
    ].join("\n");

    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You provide educational preventive health guidance. Keep answers short, cautious, and action-oriented.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.35,
        max_tokens: 550,
      }),
    });

    if (!groqResponse.ok) {
      const details = await groqResponse.text();
      sendJson(response, 502, { error: "AI coach request failed.", details: details.slice(0, 240) });
      return;
    }

    const data = await groqResponse.json();
    const answer = data.choices?.[0]?.message?.content?.trim();
    sendJson(response, 200, { answer: answer || "No AI answer was returned." });
  } catch (error) {
    sendJson(response, 500, { error: "AI coach failed to respond." });
  }
};
