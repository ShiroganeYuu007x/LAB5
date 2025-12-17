let explorerController = null;

async function searchPokemon() {
    const search = document.getElementById('explorer-search').value.trim().toLowerCase();
    const grid = document.getElementById('explorer-grid');
    const status = document.getElementById('explorer-status');
    

    if (!search) {
        status.innerHTML = '⚠️ กรุณาใส่ชื่อหรือ ID';
        return;
    }

    // Cancel previous request
    if (explorerController) {
        explorerController.abort();
    }
    explorerController = new AbortController();

    grid.innerHTML = '<p style="color: #6a6a6a;">🔍 กำลังค้นหา...</p>';
    status.innerHTML = `<span class="spinner"></span> Loading...`;

    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${search}`,
            { signal: explorerController.signal }
        );

        if (!response.ok) {
            throw new Error(response.status === 404 ? 'ไม่พบ Pokemon นี้!' : `HTTP ${response.status}`);
        }

        const pokemon = await response.json();

        grid.innerHTML = '';
        displayPokemonInExplorer(pokemon);
        status.innerHTML = `✅ พบ: ${pokemon.name}`;

    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }
        grid.innerHTML = '';
        status.innerHTML = `❌ ${error.message}`;
    }
}

async function getRandomPokemon() {
    const grid = document.getElementById('explorer-grid');
    const status = document.getElementById('explorer-status');

    // Cancel previous request
    if (explorerController) {
        explorerController.abort();
    }
    explorerController = new AbortController();

    grid.innerHTML = '<p style="color: #6a6a6a;">🎲 กำลังสุ่ม...</p>';
    status.innerHTML = `<span class="spinner"></span> Loading 6 random Pokemon...`;

    const randomIds = Array.from(
        { length: 6 },
        () => Math.floor(Math.random() * 898) + 1
    );

    try {
        const results = await Promise.allSettled(
            randomIds.map(id =>
                fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
                    signal: explorerController.signal
                }).then(r => r.json())
            )
        );

        grid.innerHTML = '';

        const successful = results.filter(r => r.status === 'fulfilled');
        successful.forEach(r => displayPokemonInExplorer(r.value));

        status.innerHTML = `✅ โหลด ${successful.length}/6 Pokemon สำเร็จ`;

    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }
        grid.innerHTML = '';
        status.innerHTML = `❌ ${error.message}`;
    }
}

function displayPokemonInExplorer(pokemon) {
    const grid = document.getElementById('explorer-grid');
    const typeColors = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0',
        electric: '#F8D030', grass: '#78C850', ice: '#98D8D8',
        fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
        flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8',
        dark: '#705848', steel: '#B8B8D0', fairy: '#EE99AC'
    };

    const mainType = pokemon.types[0].type.name;
    const bgColor = typeColors[mainType] || '#68A090';

    const card = document.createElement('div');
    card.className = 'data-card';
    card.style.background = `linear-gradient(135deg, ${bgColor}40 0%, ${bgColor}20 100%)`;
    card.innerHTML = `
                <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                     alt="${pokemon.name}"
                     onerror="this.src='${pokemon.sprites.front_default}'">
                <h5>#${String(pokemon.id).padStart(3, '0')} ${pokemon.name.toUpperCase()}</h5>
                <p style="margin-bottom: 5px;">
                    ${pokemon.types.map(t => `<span style="background: ${typeColors[t.type.name]}; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">${t.type.name}</span>`).join(' ')}
                </p>
                <p>Height: ${pokemon.height / 10}m | Weight: ${pokemon.weight / 10}kg</p>
                <p>base_experience: ${pokemon.base_experience}</p>
                <p style="font-size: 0.8rem; color: #888;">
                    HP: ${pokemon.stats[0].base_stat} | ATK: ${pokemon.stats[1].base_stat} | DEF: ${pokemon.stats[2].base_stat}
                </p>
            `;
    grid.appendChild(card);
}

// Enter key search
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('explorer-search')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPokemon();
    });
    document.getElementById('pokemon-search')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') runPokemonDemo();
    });
});