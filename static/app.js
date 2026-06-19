// ===== CONFIG =====
const API_BASE_URL = "http://localhost:5000"; // Change this to your backend URL

// ===== STATE =====
const STEPS = ["Sample Details", "Upload Images", "AI Processing", "Results", "Summary"];
let currentStep = 0;
let sampleData = {};
let uploadedImages = [];
let detectionResult = null;

// ===== STEPPER =====
function renderStepper() {
  const el = document.getElementById("stepper");
  el.innerHTML = STEPS.map((s, i) => {
    const circleClass = i < currentStep ? "done" : i === currentStep ? "active" : "";
    const labelClass = i <= currentStep ? "active" : "";
    const lineClass = i < currentStep ? "done" : "";
    const circle = i < currentStep ? "✓" : i + 1;
    let html = `<div class="step-group"><div class="step-col">
      <div class="step-circle ${circleClass}">${circle}</div>
      <span class="step-label ${labelClass}">${s}</span>
    </div>`;
    if (i < STEPS.length - 1) html += `<div class="step-line ${lineClass}"></div>`;
    html += `</div>`;
    return html;
  }).join("");
}

// ===== RENDER STEP =====
function renderStep() {
  renderStepper();
  const main = document.getElementById("main-content");
  switch (currentStep) {
    case 0: renderSampleForm(main); break;
    case 1: renderImageUpload(main); break;
    case 2: renderProcessing(main); break;
    case 3: renderResults(main); break;
    case 4: renderSummary(main); break;
  }
}

// ===== STEP 0: SAMPLE FORM =====
function renderSampleForm(el) {
  el.innerHTML = `
    <div class="text-center"><h2 class="form-title">Sample Details</h2><p class="form-subtitle">Enter information about the water sample</p></div>
    <div class="card">
      <div class="form-grid form-grid-2">
        <div class="form-group"><label>Sample Name *</label><input id="sampleName" value="${sampleData.sampleName || ''}" placeholder="e.g., River Water Sample A" /></div>
        <div class="form-group"><label>Date *</label><input type="date" id="date" value="${sampleData.date || ''}" /></div>
        <div class="form-group"><label>Time</label><input type="time" id="time" value="${sampleData.time || ''}" /></div>
        <div class="form-group"><label>Location / Place *</label><input id="location" value="${sampleData.location || ''}" placeholder="e.g., Riverside Park" /></div>
        <div class="form-group"><label>River / Water Source *</label><input id="waterSource" value="${sampleData.waterSource || ''}" placeholder="e.g., Ganges River" /></div>
        <div class="form-group"><label>Water Quantity (Liters)</label><input type="number" id="quantity" value="${sampleData.quantity || ''}" placeholder="e.g., 2" /></div>
        <div class="form-group" style="grid-column: 1 / -1;"><label>Researcher / Collector Name</label><input id="researcherName" value="${sampleData.researcherName || ''}" placeholder="e.g., Dr. Jane Smith" /></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" onclick="submitSampleForm()">Next →</button></div>
    </div>`;
}

function submitSampleForm() {
  const name = document.getElementById("sampleName").value.trim();
  const date = document.getElementById("date").value;
  const location = document.getElementById("location").value.trim();
  const waterSource = document.getElementById("waterSource").value.trim();
  if (!name || !date || !location || !waterSource) { alert("Please fill in all required fields."); return; }
  sampleData = {
    sampleName: name, date, time: document.getElementById("time").value,
    location, waterSource,
    quantity: document.getElementById("quantity").value,
    researcherName: document.getElementById("researcherName").value
  };
  currentStep = 1; renderStep();
}

// ===== STEP 1: IMAGE UPLOAD =====
function renderImageUpload(el) {
  el.innerHTML = `
    <div class="text-center"><h2 class="form-title">Upload Images</h2><p class="form-subtitle">Upload microscopic water sample images</p></div>
    <div class="card">
      <div class="upload-zone" id="dropZone" onclick="document.getElementById('fileInput').click()">
        <div class="icon">📁</div>
        <p>Drag and drop images here, or <span class="link">browse</span></p>
        <p class="formats">Supported formats: JPG, PNG</p>
      </div>
      <input type="file" id="fileInput" accept=".jpg,.jpeg,.png" multiple style="display:none" />
      <div class="preview-grid" id="previewGrid"></div>
      <div class="form-actions">
        <button class="btn btn-outline" onclick="currentStep=0;renderStep()">← Back</button>
        <button class="btn btn-primary" id="processBtn" onclick="startProcessing()">Process Images →</button>
      </div>
    </div>`;

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");

  dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("dragover"); });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
  dropZone.addEventListener("drop", e => { e.preventDefault(); dropZone.classList.remove("dragover"); addFiles(e.dataTransfer.files); });
  fileInput.addEventListener("change", e => addFiles(e.target.files));

  renderPreviews();
}

function addFiles(files) {
  for (const f of files) {
    if (!f.type.match(/image\/(jpeg|png)/)) continue;
    uploadedImages.push(f);
  }
  renderPreviews();
}

function renderPreviews() {
  const grid = document.getElementById("previewGrid");
  if (!grid) return;
  grid.innerHTML = "";
  uploadedImages.forEach((file, i) => {
    const div = document.createElement("div");
    div.className = "preview-item";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    const btn = document.createElement("button");
    btn.className = "remove"; btn.textContent = "×";
    btn.onclick = e => { e.stopPropagation(); uploadedImages.splice(i, 1); renderPreviews(); };
    div.appendChild(img); div.appendChild(btn); grid.appendChild(div);
  });
}

// ===== STEP 2: PROCESSING =====
function startProcessing() {
  if (uploadedImages.length === 0) { alert("Please upload at least one image."); return; }
  currentStep = 2; renderStep();
}

function renderProcessing(el) {
  const steps = ["Image Preprocessing", "Segmentation", "Microplastic Detection", "Classification"];
  el.innerHTML = `
    <div class="processing">
      <div class="spinner-wrap"><div class="spinner"></div><span class="emoji">🔬</span></div>
      <div class="text-center">
        <h2 class="form-title">AI is processing microscopic images...</h2>
        <p class="form-subtitle">Sending images to the server for analysis</p>
      </div>
      <div class="space-y-sm" style="width:100%;max-width:24rem;">
        ${steps.map((s, i) => `<div class="step-item" id="proc-${i}">
          <div class="icon"><div class="circle"></div></div><span>${s}</span>
        </div>`).join("")}
      </div>
      <p id="processingError" style="color:var(--danger);display:none;margin-top:1rem;text-align:center;"></p>
    </div>`;

  callDetectionAPI();
}

// ===== API CALL =====
async function callDetectionAPI() {
  const steps = ["Image Preprocessing", "Segmentation", "Microplastic Detection", "Classification"];
  const errorEl = document.getElementById("processingError");

  // Animate steps while API is working
  let idx = 0;
  const durations = [800, 1000, 1200, 800];
  let animationDone = false;
  let apiDone = false;
  let apiResult = null;
  let apiError = null;

  function advanceUI() {
    if (idx > 0) {
      const prev = document.getElementById("proc-" + (idx - 1));
      if (prev) {
        prev.classList.remove("active"); prev.classList.add("done");
        prev.querySelector(".icon").innerHTML = "✓";
      }
    }
    if (idx >= steps.length) {
      animationDone = true;
      checkComplete();
      return;
    }
    const cur = document.getElementById("proc-" + idx);
    if (cur) {
      cur.classList.add("active");
      cur.querySelector(".icon").innerHTML = '<div class="spinner" style="width:1.25rem;height:1.25rem;border-width:2px;position:static;"></div>';
    }
    idx++;
    setTimeout(advanceUI, durations[idx - 1]);
  }

  function checkComplete() {
    if (!animationDone || !apiDone) return;

    if (apiError) {
      if (errorEl) {
        errorEl.style.display = "block";
        errorEl.textContent = "⚠️ " + apiError;
      }
      // Add retry button
      const main = document.getElementById("main-content");
      const retryBtn = document.createElement("div");
      retryBtn.className = "form-actions";
      retryBtn.style.marginTop = "1rem";
      retryBtn.innerHTML = `
        <button class="btn btn-outline" onclick="currentStep=1;renderStep()">← Back</button>
        <button class="btn btn-primary" onclick="currentStep=2;renderStep()">🔄 Retry</button>
      `;
      main.appendChild(retryBtn);
      return;
    }

    detectionResult = apiResult;
    setTimeout(() => { currentStep = 3; renderStep(); }, 500);
  }

  // Start UI animation
  advanceUI();

  // Build FormData for API
  const formData = new FormData();
  formData.append("sampleData", JSON.stringify(sampleData));
  uploadedImages.forEach((file, i) => {
    formData.append("images", file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/detect`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Server error (${response.status}): ${errBody}`);
    }

    const data = await response.json();

    // Expected response format:
    // {
    //   particleCount: number,
    //   types: [{ name: string, count: number, percentage: number }],
    //   concentration: "Low" | "Medium" | "High",
    //   riskLevel: "low" | "moderate" | "high",
    //   riskPercentage: number
    // }
    apiResult = {
      particleCount: data.particleCount ?? 0,
      types: data.types ?? [],
      concentration: data.concentration ?? "Low",
      riskLevel: data.riskLevel ?? "low",
      riskPercentage: data.riskPercentage ?? 0,
    };
  } catch (err) {
    console.error("API call failed:", err);
    apiError = err.message || "Failed to connect to the server. Make sure your backend is running.";
  }

  apiDone = true;
  checkComplete();
}

// ===== STEP 3: RESULTS =====
function renderResults(el) {
  const r = detectionResult;
  const concClass = r.concentration === "Low" ? "safe" : r.concentration === "Medium" ? "moderate" : "danger";

  el.innerHTML = `
    <div class="text-center"><h2 class="form-title">Detection Results</h2><p class="form-subtitle">AI analysis complete</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">🔬</div><p class="stat-value">${r.particleCount}</p><p class="stat-label">Particles Detected</p></div>
      <div class="stat-card"><div class="stat-icon">⚠️</div><p class="stat-value ${concClass}">${r.concentration}</p><p class="stat-label">Concentration Level</p></div>
      <div class="stat-card"><div class="stat-icon">✅</div><p class="stat-value">${r.types.length}</p><p class="stat-label">Types Identified</p></div>
    </div>
    <div class="card mt-6 space-y">
      <h3 style="font-family:var(--font-display);font-size:1.125rem;font-weight:600;">Microplastic Types</h3>
      ${r.types.map(t => `<div class="type-bar-wrap">
        <div class="type-bar-header"><span class="name">${t.name}</span><span class="count">${t.count} (${t.percentage}%)</span></div>
        <div class="type-bar"><div class="type-bar-fill" style="width:${t.percentage}%"></div></div>
      </div>`).join("")}
    </div>
    <div class="card mt-6">
      <div class="gauge">
        <h3>Water Risk Assessment</h3>
        <div class="gauge-bar"><div class="gauge-fill ${r.riskLevel}" style="width:${r.riskPercentage}%"></div></div>
        <div class="gauge-labels"><span>Safe</span><span>Moderate</span><span>High Risk</span></div>
        <p class="gauge-level ${r.riskLevel}">${r.riskLevel.charAt(0).toUpperCase() + r.riskLevel.slice(1)} Risk — ${r.riskPercentage}%</p>
      </div>
    </div>
    <div class="form-actions mt-6"><button class="btn btn-primary" onclick="currentStep=4;renderStep()">View Summary →</button></div>`;
}

// ===== STEP 4: SUMMARY =====
function renderSummary(el) {
  const r = detectionResult;
  const d = sampleData;
  const riskClass = r.riskLevel === "safe" ? "badge-safe" : r.riskLevel === "moderate" ? "badge-moderate" : "badge-danger";

  let imagesHtml = "";
  uploadedImages.forEach(f => {
    imagesHtml += `<img src="${URL.createObjectURL(f)}" alt="${f.name}" />`;
  });

  el.innerHTML = `
    <div class="text-center"><h2 class="form-title">Analysis Summary</h2><p class="form-subtitle">Complete overview of the detection analysis</p></div>
    <div class="card space-y">
      <div class="summary-section">
        <h3>📋 Sample Information</h3>
        <div class="summary-row"><span class="label">Sample Name</span><span>${d.sampleName}</span></div>
        <div class="summary-row"><span class="label">Date</span><span>${d.date}</span></div>
        ${d.time ? `<div class="summary-row"><span class="label">Time</span><span>${d.time}</span></div>` : ""}
        <div class="summary-row"><span class="label">Location</span><span>${d.location}</span></div>
        <div class="summary-row"><span class="label">Water Source</span><span>${d.waterSource}</span></div>
        ${d.quantity ? `<div class="summary-row"><span class="label">Quantity</span><span>${d.quantity} Liters</span></div>` : ""}
        ${d.researcherName ? `<div class="summary-row"><span class="label">Researcher</span><span>${d.researcherName}</span></div>` : ""}
      </div>
      <div class="summary-section">
        <h3>📷 Uploaded Images</h3>
        <div class="summary-images">${imagesHtml}</div>
      </div>
      <div class="summary-section">
        <h3>🔬 Detection Results</h3>
        <div class="summary-row"><span class="label">Total Particles</span><span>${r.particleCount}</span></div>
        <div class="summary-row"><span class="label">Types</span><span>${r.types.map(t => t.name).join(", ")}</span></div>
        <div class="summary-row"><span class="label">Concentration</span><span>${r.concentration}</span></div>
        <div class="summary-row"><span class="label">Risk Level</span><span class="badge ${riskClass}">${r.riskLevel.charAt(0).toUpperCase() + r.riskLevel.slice(1)} Risk</span></div>
      </div>
    </div>
    <div class="form-actions mt-6">
      <button class="btn btn-outline" onclick="window.print()">📄 Download Report (PDF)</button>
      <button class="btn btn-primary" onclick="resetAll()">🔬 Analyze New Sample</button>
    </div>`;
}

function resetAll() {
  sampleData = {}; uploadedImages = []; detectionResult = null;
  currentStep = 0; renderStep();
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", renderStep);
