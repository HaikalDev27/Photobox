const templates = ["template1.png", "template2.png"];
const example = ["template1.png", "template2.png"];
const templateTitles = ["Vintage Film", "Retro Wave"];
let currentIndex = 0;
let selectedTemplate = templates[0];

const stageTemplate = document.getElementById("stage-template");
const stageCamera = document.getElementById("stage-camera");
const carouselImg = document.getElementById("carouselImg");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const useTemplateBtn = document.getElementById("useTemplateBtn");
const exampleStack = document.getElementById("exampleStack");
const backBtn = document.getElementById("backBtn");

const cameraVideo = document.getElementById("camera");
const currentTemplateName = document.getElementById("currentTemplateName");
const captureBtn = document.getElementById("captureBtn");
const countdownEl = document.getElementById("countdown");

const previewPopup = document.getElementById("previewPopup");
const previewFinal = document.getElementById("previewFinal");
const saveBtn = document.getElementById("saveBtn");
const retakeBtn = document.getElementById("retakeBtn");

const savedList = document.getElementById("savedList");

function showCarousel(i){
  currentIndex = (i + templates.length) % templates.length;
  carouselImg.src = "example/" + example[currentIndex];
  selectedTemplate = "templates/" + templates[currentIndex];
  renderExampleUsage(selectedTemplate);
}
prevBtn.onclick = ()=> showCarousel(currentIndex-1);
nextBtn.onclick = ()=> showCarousel(currentIndex+1);

function renderExampleUsage(templatePath){
  exampleStack.innerHTML = "";
  for(let k=0;k<3;k++){
    const box = document.createElement("div");
    box.style.width="140px"; box.style.height="200px"; box.style.position="relative";
    box.style.borderRadius="8px"; box.style.overflow="hidden"; box.style.background="#222";
    const bg = document.createElement("div");
    bg.style.width="100%"; bg.style.height="100%"; bg.style.background=`linear-gradient(180deg,#444,#111)`;
    box.appendChild(bg);

    const overlay = document.createElement("img");
    overlay.src = templatePath;
    overlay.style.position="absolute"; overlay.style.left=0; overlay.style.top=0;
    overlay.style.width="100%"; overlay.style.height="100%"; overlay.style.objectFit="cover";
    box.appendChild(overlay);

    exampleStack.appendChild(box);
  }
}

showCarousel(0);

useTemplateBtn.onclick = async () => {
  stageTemplate.classList.add("hidden");
  stageCamera.classList.remove("hidden");
  currentTemplateName.innerText = templateTitles[currentIndex];
  await startCamera();
  startSSE(); 
};

backBtn.onclick = () => {
  stageCamera.classList.add("hidden");
  stageTemplate.classList.remove("hidden");
}

async function startCamera(){
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width:1280, height:720 }, audio:false });
    cameraVideo.srcObject = stream;
    await cameraVideo.play();
  } catch (err) {
    alert("Gagal mengakses kamera: " + err.message);
    console.error(err);
  }
}

let shutterFlashEl = null;
function flashScreen(duration = 160) {
  if (!shutterFlashEl) {
    shutterFlashEl = document.createElement("div");
    shutterFlashEl.id = "shutterFlash";
    shutterFlashEl.className = "shutter-flash";
    document.body.appendChild(shutterFlashEl);
  }
  shutterFlashEl.style.transition = `opacity ${duration}ms ease-out`;
  shutterFlashEl.style.opacity = "1";
  void shutterFlashEl.offsetWidth;
  setTimeout(() => {
    shutterFlashEl.style.opacity = "0";
    const shutter = document.getElementById("shutterFlash");
    shutter.remove();
    shutterFlashEl = null;
  }, 30);
}

function playShutter(){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(1000, ctx.currentTime);
    g.gain.setValueAtTime(1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.16);
  } catch(e){
    console.warn("audio not available", e);
    flashScreen(160);
  }
}

function playCountdown(){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(1000, ctx.currentTime);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.16);
  } catch(e){
    console.warn("audio not available", e);
  }
}

function showCountdownAnim(n){
  return new Promise(resolve=>{
    playCountdown();
    countdownEl.style.opacity = 1;
    countdownEl.innerText = n;
    countdownEl.style.transform = "scale(1.2)";
    countdownEl.style.transition = "transform 300ms ease, opacity 200ms";
    setTimeout(()=>{
      countdownEl.style.transform = "scale(1.0)";
    },80);
    setTimeout(()=>{
      countdownEl.style.opacity = 0;
      resolve();
    },900);
  });
}

function captureImage(){
  const canvas = document.createElement("canvas");
  canvas.width = 1280; canvas.height = 720;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

async function mergeImages(listOfBase64, overlaySrc){
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720 * 3;
  const ctx = canvas.getContext("2d");

  for(let i=0;i<3;i++){
    const img = await loadImage(listOfBase64[i]);
    ctx.drawImage(img, 0, 720 * i, 1280, 720);
  }
  const overlay = await loadImage(overlaySrc);
  ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function loadImage(src){
  return new Promise((res, rej)=>{
    const img = new Image();
    img.onload = ()=>res(img);
    img.onerror = e=>rej(e);
    img.src = src;
  });
}

captureBtn.onclick = async ()=>{
  captureBtn.disabled = true;
  const captures = [];
  for(let i=0;i<3;i++){
    for(let n=5; n>=1; n--){
      await showCountdownAnim(n);
    }
    playShutter();
    flashScreen(160);
    const data = captureImage();
    captures.push(data);
    await new Promise(r => setTimeout(r, 500));
  }

  const finalData = await mergeImages(captures, selectedTemplate);
  previewFinal.src = finalData;
  previewPopup.classList.remove("hidden");
  captureBtn.disabled = false;
};

saveBtn.onclick = async ()=>{
  try {
    saveBtn.disabled = true;
    const base64 = previewFinal.src;
    const res = await fetch("/save", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ imageBase64: base64 })
    });
    const data = await res.json();
    if(data && data.path){
      alert("Tersimpan: " + data.path);
    } else {
      alert("Gagal menyimpan");
    }
    previewPopup.classList.add("hidden");
  } catch(err){
    console.error(err); alert("Error saat menyimpan: "+err.message);
  } finally {
    saveBtn.disabled = false;
  }
};

retakeBtn.onclick = ()=> previewPopup.classList.add("hidden");

let evtSource = null;
function startSSE(){
  if(evtSource) return;
  evtSource = new EventSource("/events");
  evtSource.addEventListener("saved", e=>{
    try {
      const d = JSON.parse(e.data);
      addSavedItem(d.path, d.filename, d.date);
    } catch(err){ console.error(err); }
  });
  evtSource.onopen = ()=> console.log("SSE connected");
  evtSource.onerror = e=> console.warn("SSE error", e);
}

function addSavedItem(publicPath, filename, dateFolder){
  const item = document.createElement("div");
  item.className = "saved-item";
  const img = document.createElement("img");
  img.src = publicPath;
  img.alt = filename;
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `<div>${filename}</div><div>${dateFolder}</div>`;
  const del = document.createElement("button");
  del.textContent = "Hapus";
  del.style.marginLeft="auto";
  del.onclick = async ()=>{
    if(confirm("Hapus file dari disk?")) {
      // INI GIMANA ANJAY GABISA NGEHAPUS FOTO GEUNINGGG???
    }
  };

  item.appendChild(img);
  item.appendChild(meta);
  item.appendChild(del);
  savedList.prepend(item);
}

async function loadInitialSaved(){

}
loadInitialSaved();
