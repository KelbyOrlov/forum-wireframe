(function(){
  const qs=(s,el=document)=>el.querySelector(s);
  const qsa=(s,el=document)=>Array.from(el.querySelectorAll(s));

  // Drawer
  function closeDrawer(){
    const sidebar = qs('.sidebar');
    const overlay = qs('.overlay');
    if(sidebar) sidebar.classList.remove('open');
    if(overlay) overlay.classList.remove('show');
  }
  qsa('[data-drawer-open]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const sidebar = qs('.sidebar');
      const overlay = qs('.overlay');
      if(sidebar) sidebar.classList.add('open');
      if(overlay) overlay.classList.add('show');
    });
  });
  qsa('[data-drawer-close]').forEach(btn=>btn.addEventListener('click', closeDrawer));
  qsa('.overlay').forEach(o=>o.addEventListener('click', closeDrawer));
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });

  // Mode via URL param (better shareability/SEO)
  const MODE_KEY='site_mode';
  const MODE_A='drugs';
  const MODE_B='corruption';
  const url = new URL(location.href);
  const qp = url.searchParams.get('mode');
  let mode = (qp===MODE_A||qp===MODE_B) ? qp : null;
  const saved = localStorage.getItem(MODE_KEY);
  if(!mode) mode = (saved===MODE_B)?MODE_B:MODE_A;

  function applyMode(){
    qsa('[data-mode-a][data-mode-b]').forEach(el=>{
      el.textContent = (mode===MODE_A) ? el.getAttribute('data-mode-a') : el.getAttribute('data-mode-b');
    });
    qsa('[data-mode-btn]').forEach(btn=>{
      const m = btn.getAttribute('data-mode-btn');
      btn.classList.toggle('active', m===mode);
      btn.setAttribute('aria-pressed', (m===mode) ? 'true' : 'false');
    });
    document.documentElement.setAttribute('data-mode', mode);
  }
  applyMode();

  function setMode(next){
    localStorage.setItem(MODE_KEY, next);
    const u = new URL(location.href);
    u.searchParams.set('mode', next);
    location.href = u.toString();
  }
  qsa('[data-mode-btn]').forEach(btn=>{
    btn.addEventListener('click', ()=> setMode(btn.getAttribute('data-mode-btn')));
  });

  // Propagate mode to internal links
function shouldSkip(a){
  const href=a.getAttribute('href')||'';
  if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return true;
  if(href.startsWith('http://')||href.startsWith('https://')||href.startsWith('javascript:')) return true;
  return false;
}
qsa('a[href]').forEach(a=>{
  if(shouldSkip(a)) return;
  const href=a.getAttribute('href');
  const parts=href.split('#');
  const path=parts[0];
  const hash=parts[1]?'#'+parts[1]:'';
  try{
    const u=new URL(path, location.href);
    if(u.origin!==location.origin) return;
    u.searchParams.set('mode', mode);

    const basePath = location.pathname.split('/').slice(0,2).join('/') + '/'; // "/forum-wireframe/"
    const cleanPath = u.pathname.startsWith(basePath) ? u.pathname.slice(basePath.length) : u.pathname.replace(/^\//,'');
    a.setAttribute('href', cleanPath + u.search + hash);

  }catch(e){}
});

  // Dots menus
  function closeAllMenus(){ qsa('.menu.open').forEach(m=>m.classList.remove('open')); }
  document.addEventListener('click', (e)=>{
    const t=e.target;
    const inDots=t.closest && t.closest('[data-dots]');
    if(!inDots) closeAllMenus();
  });
  qsa('[data-dots]').forEach(w=>{
    const btn=qs('button', w); const menu=qs('.menu', w);
    if(btn&&menu){
      btn.addEventListener('click', (e)=>{
        e.preventDefault(); e.stopPropagation();
        const open=menu.classList.contains('open');
        closeAllMenus();
        if(!open) menu.classList.add('open');
      });
    }
  });

  // Submit type switcher
  const sel=qs('#postType');
  if(sel){
    const show=()=>{
      const v=sel.value;
      qsa('[data-type]').forEach(el=> el.style.display = (el.getAttribute('data-type')===v)?'':'none');
    };
    sel.addEventListener('change', show); show();
  }
})();
