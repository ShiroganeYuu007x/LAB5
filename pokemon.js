// pokemon.js - UI for the Tailwind-styled Pokemon Explorer
(function(){
  if (typeof PokemonExplorer === 'undefined') {
    console.error('PokemonExplorer class not found. Ensure app4.js is loaded');
    return;
  }

  const explorer = new PokemonExplorer();
  const searchInput = document.getElementById('explorer-search');
  const btnSearch = document.getElementById('btn-search');
  const btnRandom = document.getElementById('btn-random');
  const btnRandomSm = document.getElementById('btn-random-sm');
  const statusEl = document.getElementById('explorer-status');
  const gridEl = document.getElementById('explorer-grid');

  function setStatus(msg, type){
    statusEl.textContent = msg || '';
    statusEl.className = 'mt-4 text-sm ' + (type === 'error' ? 'text-rose-400' : type === 'success' ? 'text-emerald-300' : 'text-amber-300');
  }

  function clearGrid(){ gridEl.innerHTML = ''; }
  function toTitleCase(s){ if(!s) return s; return s.charAt(0).toUpperCase()+s.slice(1); }

  function createBadge(text){
    const b = document.createElement('span');
    b.className = 'inline-block bg-slate-700/40 text-xs text-slate-100 px-2 py-1 rounded-full mr-1';
    b.textContent = text;
    return b;
  }

  function renderCard(p){
    const card = document.createElement('article');
    card.className = 'bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-4 shadow-sm border border-slate-700 flex flex-col';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'poke-img bg-slate-900/40 rounded-md mb-3';
    const img = document.createElement('img');
    img.alt = p.name || 'pokemon';
    img.src = p.image || '';
    img.className = 'max-h-28';
    img.onerror = () => { img.src = 'https://via.placeholder.com/150?text=No+Image'; };
    imgWrap.appendChild(img);

    const title = document.createElement('h3');
    title.className = 'text-sm font-semibold text-rose-400';
    title.innerHTML = `#${String(p.id).padStart(3,'0')} ${toTitleCase(p.name)}`;

    const badges = document.createElement('div');
    badges.className = 'mt-2 mb-2';
    (p.types || []).forEach(t => badges.appendChild(createBadge(t)));

    const meta = document.createElement('div');
    meta.className = 'text-xs text-slate-400';
    meta.textContent = `Height: ${p.height}m | Weight: ${p.weight}kg`;

    const stats = document.createElement('div');
    stats.className = 'mt-2 text-xs text-slate-400 flex gap-3';
    const hp = (p.stats && (p.stats.hp || p.stats['hp'])) ? (p.stats.hp || p.stats['hp']) : '-';
    const atk = (p.stats && (p.stats.attack || p.stats.atk || p.stats['attack'])) ? (p.stats.attack || p.stats.atk || p.stats['attack']) : '-';
    const def = (p.stats && (p.stats.defense || p.stats.def || p.stats['defense'])) ? (p.stats.defense || p.stats.def || p.stats['defense']) : '-';
    stats.textContent = `HP: ${hp} | ATK: ${atk} | DEF: ${def}`;

    card.appendChild(imgWrap);
    card.appendChild(title);
    card.appendChild(badges);
    card.appendChild(meta);
    card.appendChild(stats);

    return card;
  }

  // now supports optional targetCount to display loaded/target status
  function renderGrid(list, targetCount){
    clearGrid();
    const loaded = list ? list.length : 0;
    if (!list || !list.length) {
      if (typeof targetCount === 'number') setStatus(`โหลด ${loaded}/${targetCount} Pokemon สำเร็จ`, 'error');
      else setStatus('ไม่มีผลลัพธ์', 'error');
      return;
    }
    if (typeof targetCount === 'number') setStatus(`โหลด ${loaded}/${targetCount} Pokemon สำเร็จ`, 'success');
    else setStatus(`โหลด ${loaded}/${loaded} Pokemon สำเร็จ`, 'success');
    list.forEach(p => gridEl.appendChild(renderCard(p)));
  }

  async function handleSearch(){
    const q = (searchInput.value || '').trim();
    if (!q) { setStatus('กรุณากรอกชื่อหรือ id', 'error'); return; }
    setStatus('กำลังค้นหา...', 'info');
    explorer.cancelPendingRequest();
    try{
      const data = await explorer.fetchPokemon(q);
      console.debug('search result', data && data.id);
      renderGrid([data], 1);
    }catch(err){
      setStatus(err.message || 'เกิดข้อผิดพลาด', 'error');
      clearGrid();
      console.error('search error', err);
    }
  }

  async function handleRandom(){
    const target = 6;
    setStatus(`กำลังสุ่มโปเกมอน ${target} ตัว...`, 'info');
    explorer.cancelPendingRequest();
    try{
      const list = await explorer.fetchRandom(target);
      console.debug('random list length', list && list.length);
      renderGrid(list, target);
    }catch(err){
      setStatus('เกิดข้อผิดพลาดในการดึงข้อมูล', 'error');
      console.error('random error', err);
    }
  }

  // Events
  btnSearch.addEventListener('click', handleSearch);
  btnRandom && btnRandom.addEventListener('click', handleRandom);
  btnRandomSm && btnRandomSm.addEventListener('click', handleRandom);
  searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') handleSearch(); });

  // init
  // delay first load slightly to ensure scripts are parsed
  setTimeout(handleRandom, 120);
})();
