const images = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=60',
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=60',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=60'
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

    form.addEventListener('submit', (e)=> {
        e.preventDefault();
        const data = new FormData(form);
        const booking = {
            id: Date.now(),
            name: data.get('name'),
            package: data.get('package')
        };

        if(!booking.name || !booking.package){
            showModalMsg('Mohon isi Nama dan Paket.');
            return;
        }

        const phone = '6281234567890';
        const message = [
            'Halo, saya ingin booking Photobox',
            `*Nama: ${booking.name}*`,
            `*Paket: ${booking.package}*`,
        ].filter(Boolean).join('\n');

        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

        showModalMsg('Mengarahkan ke WhatsApp...');
        window.open(url, '_blank');

        setTimeout(()=>{ closeModal(); form.reset(); }, 900);
    });
}

function openModal(){ const m=document.getElementById('modal'); m.setAttribute('aria-hidden','false'); }
function closeModal(){ const m=document.getElementById('modal'); m.setAttribute('aria-hidden','true'); document.getElementById('modal-msg').textContent=''; }

function showModalMsg(txt){ document.getElementById('modal-msg').textContent = txt; }