const images = [
  './image/Mockup1.png',
  './image/Mockup2.png',
  './image/Mockup3.png',
];

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initBooking();
});

function initCarousel(){
  const el = document.getElementById('carousel');
  images.forEach((src,i)=>{
    const img = document.createElement('img');
    img.src = src;
    if(i===0) img.classList.add('active');
    el.appendChild(img);
  });
  let idx=0;
  setInterval(()=> {
    const imgs = el.querySelectorAll('img');
    imgs[idx].classList.remove('active');
    idx = (idx+1) % imgs.length;
    imgs[idx].classList.add('active');
  }, 4200);
}

function initBooking(){
    const openBtns = [document.getElementById('open-booking'), document.getElementById('cta-book'), document.getElementById('cta-book')];
    const modal = document.getElementById('modal');
    const close = document.getElementById('modal-close');
    const cancel = document.getElementById('modal-cancel');
    const form = document.getElementById('booking-form');

    openBtns.forEach(b=>{ if(b) b.addEventListener('click', ()=> openModal())});
    if(close) close.addEventListener('click', closeModal);
    if(cancel) cancel.addEventListener('click', closeModal);
    if(modal) modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal() });
}

function openModal(){ const m=document.getElementById('modal'); m.setAttribute('aria-hidden','false'); }
function closeModal(){ const m=document.getElementById('modal'); m.setAttribute('aria-hidden','true'); document.getElementById('modal-msg').textContent=''; }

function showModalMsg(txt){ document.getElementById('modal-msg').textContent = txt; }