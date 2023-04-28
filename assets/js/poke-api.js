const pokeApi = {}

const convertPokeApiDetailToPokemon = ({ id, name, types:typ, sprites, height, weight, abilities, moves, stats, species }) => {
    const pokemon = new Pokemon()

    pokemon.number = id
    pokemon.name = name
    const types = typ.map(typeSlot => typeSlot.type.name) 
    const [type] = types
    pokemon.types = types
    pokemon.type = type
    pokemon.photo = sprites.other.dream_world.front_default

/* ----------- início das atualizações ---------- */

    pokemon.height = height
    pokemon.weight = weight
    pokemon.abilities = abilities.map(getAndConvertAbilities)
    pokemon.moves = moves.map(getAndConvertMoves)
    pokemon.stats = stats.map(getAndConvertStats)
    
    pokeApi.getPokemonSpecies(species.url)
        .then(pokeSpeciesData =>convertOtherInfos(pokeSpeciesData, pokemon))
    
    return pokemon
}

/* Função para iterar as habilidades */
const getAndConvertAbilities = pokemonAbility => pokemonAbility.ability.name 
/* Função para iterar os moves */
const getAndConvertMoves = pokemonMove =>pokemonMove.move.name 
/* Função para iterar os stats */
const getAndConvertStats =  pokemonStat => ({
    statName: pokemonStat.stat.name, 
    statValue: pokemonStat.base_stat
})
    
/* Fetch para obter especies (link para evolution chain é obtido aqui) */
pokeApi.getPokemonSpecies = pokemonSpeciesUrl => 
    fetch(pokemonSpeciesUrl).then(pokeSpeciesData => pokeSpeciesData.json())   

/* Função para armazenar dados sobre reprodução no objeto Pokemon */
const getBreedingInfos = ({ egg_groups, genera, gender_rate, hatch_counter }, pokemon) => {
    pokemon.eggGroups = egg_groups.map(egg => egg.name)
    pokemon.genus = genera[7].genus
    pokemon.gender = {
        femaleGender: gender_rate *(100/8),
        maleGender: 100 - gender_rate*(100/8)
    },
    pokemon.egg_cycles = hatch_counter
}

/* Função que chama as funções de armazenamento de informação de reprodução e evolução */
const convertOtherInfos = (pokeSpecies, pokemon) => {     
    getBreedingInfos(pokeSpecies, pokemon)
    
    const getEvolutionChainImages = pokeApi.getPokemonEvolutionChain(pokeSpecies.evolution_chain.url)
        .then(evolutionChainData => convertEvolutionChain(evolutionChainData, pokemon))
        
    getEvolutionChainImages.then(getCurrentImageLink)
    getEvolutionChainImages.then(getEvolutionImageLink)
}

/* Função que obtém os dados sobre evolution chain */
pokeApi.getPokemonEvolutionChain = evolutionChainUrl => 
    fetch(evolutionChainUrl).then(evolutionChainData => evolutionChainData.json())

/* Função que armazena os dados sobre evolution chain no objeto Pokemon */
const convertEvolutionChain = ({ chain }, pokemon) =>{

    if(!chain.evolves_to[0]) { // se não houver a propriedade citada, cria o objeto abaixo
        pokemon.evolutionChain =  
            [
                {
                    name: chain.species.name,
                    maxLevel: '',
                    // nextEvolutionName: '', // nem todos os pokemons possuem evolução, assim, se não houver, o getEvolutionImageLink() resolve
                    evolutionImage: ''
                }
            ]
        return pokemon.evolutionChain
    }
    
    // se houver a propriedade chain.evolves_to, cria o objeto abaixo
    pokemon.evolutionChain = [ 
        {
            name: chain.species.name, 
            maxLevel: chain.evolves_to[0].evolution_details[0].min_level, 
            nextEvolutionName: chain.evolves_to[0].species.name,
            evolutionImage:''
        }
    ]
        
    if(chain.evolves_to[0].evolves_to[0]) { // se houver a propriedade citada, cria o objeto abaixo
        console.log(chain.evolves_to[0].species.name) // apenas para conferência no console
        pokemon.evolutionChain.push(
            {
                name: chain.evolves_to[0].species.name, 
                maxLevel: chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level,                 
                nextEvolutionName: chain.evolves_to[0].evolves_to[0].species.name,
                evolutionImage:''
            }
        )
    }

    return pokemon.evolutionChain
}
        

/* Obtém o link de imagem atual do pokemon */
const getCurrentImageLink = evolutionChainConverted => {
    evolutionChainConverted.map(evolution => {
        const url = `https://pokeapi.co/api/v2/pokemon/${evolution.name}`
        return fetch(url)
            .then(pokemonEvolutionData => pokemonEvolutionData.json())
            .then(pokemonEvolutionData => convertEvolutionImages(pokemonEvolutionData, evolution)
        )
    })
}

/* Obtém o link de imagem da evolução do pokemon */
const getEvolutionImageLink = evolutionChainConverted => {
    evolutionChainConverted.map(evolution => {
        if(evolution.hasOwnProperty('nextEvolutionName')){
            const url = `https://pokeapi.co/api/v2/pokemon/${evolution.nextEvolutionName}`
            return fetch(url)
            .then(pokemonEvolutionData =>pokemonEvolutionData.json())
            .then(pokemonEvolutionData => convertNextEvolutionImages(pokemonEvolutionData, evolution))
            
        } else
        return
    })
    
}
 
/* Armazena o link da imagem no objeto Pokemon */
const convertEvolutionImages = (pokImage, evolutionChainConverted) => evolutionChainConverted.image = pokImage.sprites.other.dream_world.front_default

/* Armazena o link da imagem no objeto Pokemon */
const convertNextEvolutionImages = (pokImage, evolutionChainConverted) => evolutionChainConverted.evolutionImage = pokImage.sprites.other.dream_world.front_default

/* ----------- fim das atualizações ---------- */

pokeApi.getPokemonDetail = pokemon => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon)
}

pokeApi.getPokemons = (offset = 0, limit = 10) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails)
}



