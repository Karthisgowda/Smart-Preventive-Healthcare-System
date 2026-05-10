const STORAGE_KEYS = {
  records: "sph_records",
  reminders: "sph_reminders",
  plan: "sph_latest_plan",
  theme: "sph_theme",
};

const recommendations = {
  bmi: "Aim for a balanced plate, regular movement, and monthly weight tracking.",
  bp: "Monitor blood pressure twice a week and reduce salt-heavy packaged foods.",
  glucose: "Plan a fasting glucose or HbA1c review with a clinician and choose high-fiber meals.",
  sleep: "Protect a consistent sleep window and limit screens before bedtime.",
  exercise: "Build toward at least 150 minutes of moderate activity each week.",
  stress: "Schedule short breathing breaks, outdoor walks, or guided relaxation.",
  smoking: "Tobacco support improves heart and lung outcomes quickly. Consider a quit plan.",
  familyHistory: "Family history makes routine screening more important. Keep annual checkups active.",
  sedentary: "Stand, stretch, or walk for 3 minutes every hour during long sitting periods.",
};

const triageGuidance = {
  chest:
    "Chest pain, pressure, breathing trouble, sweating, or pain spreading to the arm or jaw can be urgent. Seek emergency care immediately.",
  fever:
    "Hydrate, rest, and monitor temperature. Seek care for very high fever, confusion, breathing trouble, rash, dehydration, or fever lasting more than 3 days.",
  headache:
    "Track timing, sleep, hydration, and triggers. Sudden severe headache, weakness, vision changes, neck stiffness, or confusion needs urgent medical attention.",
  fatigue:
    "Review sleep, nutrition, stress, hydration, and activity. Persistent fatigue may need screening for anemia, thyroid issues, diabetes, or infection.",
};

const form = document.querySelector("#assessmentForm");
const scoreValue = document.querySelector("#scoreValue");
const scoreRing = document.querySelector("#scoreRing");
const riskLevel = document.querySelector("#riskLevel");
const riskSummary = document.querySelector("#riskSummary");
const recommendationList = document.querySelector("#recommendations");
const heroScore = document.querySelector("#heroScore");
const heroMessage = document.querySelector("#heroMessage");
const metricRisk = document.querySelector("#metricRisk");
const metricHabits = document.querySelector("#metricHabits");
const metricReminders = document.querySelector("#metricReminders");
const recordForm = document.querySelector("#recordForm");
const reminderForm = document.querySelector("#reminderForm");
const recordList = document.querySelector("#recordList");
const reminderList = document.querySelector("#reminderList");
const downloadPlan = document.querySelector("#downloadPlan");
const themeToggle = document.querySelector("#themeToggle");
const coachForm = document.querySelector("#coachForm");
const coachOutput = document.querySelector("#coachOutput");

const load = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function calculateRisk(data) {
  const heightMeters = data.height / 100;
  const bmi = data.weight / (heightMeters * heightMeters);
  const factors = [];
  let risk = 0;
  let habits = 0;

  if (data.age >= 45) risk += 8;
  if (bmi < 18.5 || bmi >= 25) {
    risk += bmi >= 30 ? 16 : 9;
    factors.push(recommendations.bmi);
  } else {
    habits += 1;
  }

  if (data.systolic >= 130) {
    risk += data.systolic >= 140 ? 18 : 10;
    factors.push(recommendations.bp);
  } else {
    habits += 1;
  }

  if (data.glucose >= 100) {
    risk += data.glucose >= 126 ? 18 : 10;
    factors.push(recommendations.glucose);
  } else {
    habits += 1;
  }

  if (data.sleep < 7) {
    risk += 8;
    factors.push(recommendations.sleep);
  } else {
    habits += 1;
  }

  if (data.exercise < 150) {
    risk += 12;
    factors.push(recommendations.exercise);
  } else {
    habits += 1;
  }

  if (data.stress === "medium") {
    risk += 6;
    factors.push(recommendations.stress);
  }
  if (data.stress === "high") {
    risk += 13;
    factors.push(recommendations.stress);
  }
  if (data.smoking) {
    risk += 15;
    factors.push(recommendations.smoking);
  }
  if (data.familyHistory) {
    risk += 10;
    factors.push(recommendations.familyHistory);
  }
  if (data.sedentary) {
    risk += 8;
    factors.push(recommendations.sedentary);
  }

  const score = Math.max(5, Math.min(100, 100 - risk));
  const level = score >= 80 ? "Low risk" : score >= 60 ? "Moderate risk" : "Higher attention needed";
  const uniqueFactors = [...new Set(factors)];

  if (uniqueFactors.length === 0) {
    uniqueFactors.push("Keep your current habits steady and schedule routine preventive screenings.");
  }

  return { bmi, score, level, factors: uniqueFactors, riskCount: uniqueFactors.length, habits };
}

function getFormData() {
  const data = new FormData(form);
  return {
    age: Number(data.get("age")),
    height: Number(data.get("height")),
    weight: Number(data.get("weight")),
    systolic: Number(data.get("systolic")),
    glucose: Number(data.get("glucose")),
    sleep: Number(data.get("sleep")),
    exercise: Number(data.get("exercise")),
    stress: data.get("stress"),
    smoking: data.has("smoking"),
    familyHistory: data.has("familyHistory"),
    sedentary: data.has("sedentary"),
  };
}

function renderPlan(plan) {
  const degrees = Math.round((plan.score / 100) * 360);
  scoreValue.textContent = plan.score;
  scoreRing.style.background = `conic-gradient(var(--primary) ${degrees}deg, var(--line) ${degrees}deg)`;
  riskLevel.textContent = plan.level;
  riskSummary.textContent = `BMI ${plan.bmi.toFixed(1)}. Prevention score ${plan.score}/100 based on lifestyle and vitals.`;
  heroScore.textContent = plan.score;
  heroMessage.textContent = plan.level;
  metricRisk.textContent = plan.riskCount;
  metricHabits.textContent = plan.habits;
  recommendationList.innerHTML = plan.factors.map((item) => `<li>${item}</li>`).join("");
}

function formatCoachAnswer(answer) {
  return answer
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split("\n")
    .filter(Boolean)
    .map((line) => `<p>${line.replace(/^[-*]\s*/, "")}</p>`)
    .join("");
}

function renderRecords() {
  const records = load(STORAGE_KEYS.records, []);
  recordList.innerHTML = records.length
    ? records
        .map(
          (record, index) => `
          <div class="stack-item">
            <span><strong>${record.label}</strong><br>${record.value}<br><small>${record.date}</small></span>
            <button data-delete-record="${index}" type="button" aria-label="Delete ${record.label}">x</button>
          </div>`
        )
        .join("")
    : `<p class="triage-output">No vitals added yet.</p>`;
}

function renderReminders() {
  const reminders = load(STORAGE_KEYS.reminders, []);
  metricReminders.textContent = reminders.length;
  reminderList.innerHTML = reminders.length
    ? reminders
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(
          (reminder, index) => `
          <div class="stack-item">
            <span><strong>${reminder.task}</strong><br>${new Date(reminder.date).toDateString()}</span>
            <button data-delete-reminder="${index}" type="button" aria-label="Delete ${reminder.task}">x</button>
          </div>`
        )
        .join("")
    : `<p class="triage-output">Add screening, vaccine, medicine, or checkup reminders.</p>`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const plan = calculateRisk(getFormData());
  save(STORAGE_KEYS.plan, plan);
  renderPlan(plan);
});

recordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(recordForm);
  const records = load(STORAGE_KEYS.records, []);
  records.unshift({
    label: data.get("label"),
    value: data.get("value"),
    date: new Date().toLocaleString(),
  });
  save(STORAGE_KEYS.records, records.slice(0, 12));
  recordForm.reset();
  renderRecords();
});

reminderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(reminderForm);
  const reminders = load(STORAGE_KEYS.reminders, []);
  reminders.push({ task: data.get("task"), date: data.get("date") });
  save(STORAGE_KEYS.reminders, reminders);
  reminderForm.reset();
  renderReminders();
});

document.addEventListener("click", (event) => {
  const recordIndex = event.target.dataset.deleteRecord;
  const reminderIndex = event.target.dataset.deleteReminder;

  if (recordIndex !== undefined) {
    const records = load(STORAGE_KEYS.records, []);
    records.splice(Number(recordIndex), 1);
    save(STORAGE_KEYS.records, records);
    renderRecords();
  }

  if (reminderIndex !== undefined) {
    const reminders = load(STORAGE_KEYS.reminders, []);
    reminders.splice(Number(reminderIndex), 1);
    save(STORAGE_KEYS.reminders, reminders);
    renderReminders();
  }
});

document.querySelectorAll("[data-symptom]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#triageOutput").textContent = triageGuidance[button.dataset.symptom];
  });
});

downloadPlan.addEventListener("click", () => {
  const plan = load(STORAGE_KEYS.plan, null);
  if (!plan) return;

  const checklist = [
    "Smart Preventive Healthcare System Checklist",
    `Prevention score: ${plan.score}/100`,
    `Risk level: ${plan.level}`,
    `BMI: ${plan.bmi.toFixed(1)}`,
    "",
    "Recommended actions:",
    ...plan.factors.map((item) => `- ${item}`),
  ].join("\n");

  const blob = new Blob([checklist], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "preventive-health-checklist.txt";
  link.click();
  URL.revokeObjectURL(url);
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  save(STORAGE_KEYS.theme, document.body.classList.contains("dark") ? "dark" : "light");
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    coachForm.elements.question.value = button.dataset.prompt;
    coachForm.requestSubmit();
  });
});

coachForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = new FormData(coachForm).get("question").trim();
  const profile = getFormData();
  const plan = calculateRisk(profile);
  save(STORAGE_KEYS.plan, plan);
  renderPlan(plan);

  coachOutput.textContent = "Thinking through your preventive plan...";
  coachForm.querySelector("button").disabled = true;

  try {
    const response = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, profile, plan }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "AI coach unavailable.");
    }
    coachOutput.innerHTML = formatCoachAnswer(data.answer);
  } catch (error) {
    coachOutput.textContent =
      "The AI coach could not respond right now. Please try again after deployment settings are ready.";
  } finally {
    coachForm.querySelector("button").disabled = false;
  }
});

if (load(STORAGE_KEYS.theme, "light") === "dark") {
  document.body.classList.add("dark");
}

const savedPlan = load(STORAGE_KEYS.plan, null);
if (savedPlan) {
  renderPlan(savedPlan);
} else {
  renderPlan(calculateRisk(getFormData()));
}
renderRecords();
renderReminders();
