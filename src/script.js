const clipData = [
  {
    id: 'community-health',
    title: 'Community health advisory',
    meta: '2:18 · Kinyarwanda',
    language: 'Kinyarwanda',
    synthetic: { label: 'Sample low', level: 'low', pitch: 18, breath: 24, splice: 12 },
    transcript: [
      '“If the clinic is closed, do not walk past the river. ',
      'Bring the child before sunset and ask the elder to call the field officer. ',
      'The medicine is free if you carry the form from the village hall.”'
    ],
    highlights: [
      { text: 'do not walk past the river', type: 'urgency' },
      { text: 'before sunset', type: 'urgency' },
      { text: 'The medicine is free', type: 'claim' },
      { text: 'if you carry the form', type: 'claim' }
    ]
  },
  {
    id: 'youth-radio',
    title: 'Youth radio story',
    meta: '1:42 · Swahili',
    language: 'Swahili',
    synthetic: { label: 'Sample medium', level: 'medium', pitch: 58, breath: 46, splice: 36 },
    transcript: [
      '“The local committee says the new bus route is unfair because it skips low-income neighborhoods. ',
      'The speaker warns that the decision could widen the gap in school attendance and fuel resentment in the city.”'
    ],
    highlights: [
      { text: 'unfair because it skips low-income neighborhoods', type: 'loaded' },
      { text: 'fuel resentment in the city', type: 'loaded' },
      { text: 'could widen the gap in school attendance', type: 'claim' }
    ]
  },
  {
    id: 'election-briefing',
    title: 'Election briefing',
    meta: '3:06 · Luganda',
    language: 'Luganda',
    synthetic: { label: 'Sample low', level: 'low', pitch: 22, breath: 20, splice: 18 },
    transcript: [
      '“The vote count is still open, but observers report that only a few stations have closed results. ',
      'The speaker clarifies that the final tally will be reviewed by the oversight committee before any public announcement.”'
    ],
    highlights: [
      { text: 'only a few stations have closed results', type: 'claim' },
      { text: 'before any public announcement', type: 'verification' }
    ]
  }
];

const clipList = document.getElementById('clipList');
const transcriptArea = document.getElementById('transcriptArea');
const flagsArea = document.getElementById('flagsArea');
const syntheticBadge = document.getElementById('syntheticBadge');
const languageBadge = document.getElementById('languageBadge');
const pitchMeter = document.getElementById('pitchMeter');
const breathMeter = document.getElementById('breathMeter');
const spliceMeter = document.getElementById('spliceMeter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const routeBtn = document.getElementById('routeBtn');
const verifierControls = document.getElementById('verifierControls');
const signBtn = document.getElementById('signBtn');
const sampleBtn = document.getElementById('sampleBtn');
const fileInput = document.getElementById('fileInput');
const attestLog = document.getElementById('attestLog');
const customCaseForm = document.getElementById('customCaseForm');
const caseTitleInput = document.getElementById('caseTitle');
const caseLanguageInput = document.getElementById('caseLanguage');
const caseTranscriptInput = document.getElementById('caseTranscript');
const caseRiskInput = document.getElementById('caseRisk');
const caseFlagsInput = document.getElementById('caseFlags');
const steps = [...document.querySelectorAll('.step')];

let currentStep = 1;
let selectedClip = clipData[0];

function normalizeCaseFromInputs() {
  const title = caseTitleInput.value.trim() || 'Custom review case';
  const language = caseLanguageInput.value.trim() || 'User-defined language';
  const transcript = caseTranscriptInput.value.trim() || 'No transcript provided yet. Add custom input to showcase your message.';
  const flagText = caseFlagsInput.value.trim();
  const flags = flagText ? flagText.split(',').map((flag) => flag.trim()).filter(Boolean) : ['Urgency', 'Needs review'];
  const riskValue = caseRiskInput.value || 'medium';

  const riskMap = {
    low: { label: 'Low', level: 'low', pitch: 22, breath: 28, splice: 18 },
    medium: { label: 'Medium', level: 'medium', pitch: 52, breath: 46, splice: 36 },
    high: { label: 'High', level: 'high', pitch: 82, breath: 74, splice: 62 }
  };

  return {
    id: 'custom-case',
    title,
    meta: `Custom case · ${language}`,
    language,
    synthetic: riskMap[riskValue],
    transcript: [transcript],
    highlights: flags.map((flag, index) => ({
      text: flag,
      type: index % 2 === 0 ? 'urgency' : 'verification'
    }))
  };
}

function renderClipList() {
  clipList.innerHTML = clipData
    .map(
      (clip) => `
        <li>
          <button class="clip-item ${clip.id === selectedClip.id ? 'active' : ''}" type="button" data-clip-id="${clip.id}">
            <span class="clip-main">
              <strong>${clip.title}</strong>
              <small>${clip.meta}</small>
            </span>
            <span class="clip-badge">${clip.highlights.length}</span>
          </button>
        </li>
      `
    )
    .join('');

  clipList.querySelectorAll('.clip-item').forEach((button) => {
    button.addEventListener('click', () => {
      selectedClip = clipData.find((clip) => clip.id === button.dataset.clipId) || clipData[0];
      renderClipList();
      renderTranscript();
    });
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTranscript() {
  const text = escapeHtml(selectedClip.transcript.join(''));
  let html = text;

  selectedClip.highlights.forEach((highlight) => {
    const pattern = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(pattern, 'gi'), (match) => `<mark class="highlight ${highlight.type}">${escapeHtml(match)}</mark>`);
  });

  transcriptArea.innerHTML = html;

  flagsArea.innerHTML = selectedClip.highlights
    .map((flag) => `<span class="flag ${flag.type === 'claim' || flag.type === 'loaded' ? 'warning' : 'success'}">${flag.type}</span>`)
    .join('');

  languageBadge.textContent = selectedClip.language;

  const synth = selectedClip.synthetic;
  syntheticBadge.textContent = synth.label;
  syntheticBadge.className = `risk-${synth.level}`;
  pitchMeter.style.width = `${synth.pitch}%`;
  breathMeter.style.width = `${synth.breath}%`;
  spliceMeter.style.width = `${synth.splice}%`;
}

function updateSteps() {
  const stepEls = [...document.querySelectorAll('.step')];
  stepEls.forEach((step, index) => {
    const active = index + 1 === currentStep;
    step.classList.toggle('active', active);
  });

  prevBtn.disabled = currentStep === 1;
  nextBtn.textContent = currentStep === 4 ? 'Finish' : 'Next';
}

function routeToVerifier() {
  verifierControls.classList.remove('hidden');
  const muted = document.querySelector('#verifierArea .muted');
  if (muted) {
    muted.textContent = 'Review route prepared. Check the transcript and signal indicators, then assign a context label for the verification record.';
  }
}

function addAttestation() {
  const name = document.getElementById('verifierName').value.trim() || 'Anonymous verifier';
  const decision = document.getElementById('verifierDecision').value;
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const label = decision.charAt(0).toUpperCase() + decision.slice(1);
  entry.innerHTML = `<strong>${name}</strong><span>${label} label recorded in the attestation log.</span>`;
  attestLog.prepend(entry);
}

prevBtn.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep -= 1;
    updateSteps();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentStep < 4) {
    currentStep += 1;
    updateSteps();
    return;
  }

  alert('Walkthrough complete. The community verifier attestation is ready for review.');
});

sampleBtn.addEventListener('click', () => {
  selectedClip = clipData[1];
  renderClipList();
  renderTranscript();
  routeToVerifier();
});

customCaseForm.addEventListener('submit', (event) => {
event.preventDefault();
const customCase = normalizeCaseFromInputs();

const existingIndex = clipData.findIndex((clip) => clip.id === customCase.id);
if (existingIndex >= 0) {
  clipData.splice(existingIndex, 1);
}

clipData.unshift(customCase);
selectedClip = customCase;
renderClipList();
renderTranscript();
routeToVerifier();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  selectedClip = {
    id: 'upload-clip',
    title: file.name,
    meta: `${(file.size / 1024 / 1024).toFixed(2)} MB · uploaded`,
    language: 'Local dialect',
    synthetic: { label: 'Sample medium', level: 'medium', pitch: 62, breath: 54, splice: 41 },
    transcript: ['The uploaded message has been added to the review queue. Community verifiers should examine urgency language and confirm whether the source is attributable before labeling the clip.'],
    highlights: [
      { text: 'Community verifiers should examine urgency language', type: 'urgency' },
      { text: 'confirm whether the source is attributable', type: 'verification' }
    ]
  };

  renderClipList();
  renderTranscript();
  routeToVerifier();
});

routeBtn.addEventListener('click', routeToVerifier);
signBtn.addEventListener('click', addAttestation);

renderClipList();
renderTranscript();
updateSteps();
