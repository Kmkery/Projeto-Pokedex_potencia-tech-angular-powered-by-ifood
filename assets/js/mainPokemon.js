const datasheetContainer = document.querySelector('#pokemonAttributesContainer')
const pokemonCard = document.querySelector('#pokemonCard')
const pokemonTitle = document.querySelector('#pokemonTitle')
const pokemonNumber = document.querySelector('#pokemonNumber')
const typesContainer = document.querySelector('#types')
const pokemonPhoto = document.querySelector('#pokemonPhoto')
const topicsTitles = document.querySelectorAll('[data-js=topic-title]')
const favoriteButton = document.querySelector('#favorite')
const objPokemon = JSON.parse(localStorage.getItem('objPokemon')) // armazena dados do pokemon clicado

/* Função que recupera status sobre se este pokémon já foi favoritado */
const setPokemonFavoriteStatus = objPokemon => {
    objPokemon.favoriteStatus = JSON.parse(localStorage.getItem(`favorite-${objPokemon.name}`))

    if(objPokemon.favoriteStatus) {
        favoriteButton.classList.add('favorited')
    }
}

/* Função que renderiza informações do card */
const renderPokemonInfosCard = ({ types, type: pokeType, name, number, photo }) => {
    pokemonCard.classList.add(pokeType)
    pokemonPhoto.src = photo
    pokemonPhoto.alt = name

    typesContainer.innerHTML = types.map(type => 
        `<li class="type ${type}">${type}</li>`
    ).join('')
    
    pokemonTitle.textContent = name
    pokemonNumber.textContent = `#${number < 10 
        ? `00${number}`
        : number >= 10 && number < 100 
            ? `0${number}`
            : number}`
    
    
}

/* Função que altera estilo dos elementos para indicar visualmente ativação/desativação */
const changeBorderColor = (elementToActive, elementsToDisable) => {
    elementsToDisable.forEach(item => {
        if(item === elementToActive){
            item.classList.remove('disabled')
            item.classList.add('actived')
            return
        }
        item.classList.remove('actived')
        item.classList.add('disabled')
    })
}

/* Função que renderiza informações da guia About */
const renderAboutContainer = ({ genus, height, weight, abilities, gender, eggGroups, egg_cycles }) => {  
   changeBorderColor(topicsTitles[0], topicsTitles)

    datasheetContainer.innerHTML =  
    `<li class="about-attributes">
        <ol class="pokemonAttribute text-two-columns">
            <li>Species</li>
            <li>${genus}</li>
        </ol>
        <ol class="pokemonAttribute text-two-columns">
            <li>Height</li>
            <li>${height}</li>
        </ol>

        <ol class="pokemonAttribute text-two-columns">
            <li>Weight</li>
            <li>${weight}</li>
        </ol>

        <ol class="pokemonAttribute text-two-columns">
            <li>Abilities</li>
            <li class="capitalize">${abilities.join(', ')}</li>
        </ol>
        <br />
        <h3>Breeding</h3>
        <ol class="pokemonAttribute text-one-and-two-columns">
            <li>Gender</li>
            <li>
                <span class="material-symbols-outlined">female</span>
                <span>${gender.femaleGender}%</span>
            </li>
            <li>
                <span class=" material-symbols-outlined">male</span>
                <span>${gender.maleGender}%</span>
            </li>
        </ol>

        <ol class="pokemonAttribute text-two-columns">
            <li>Egg groups</li>
            <li class="capitalize">${eggGroups.join(', ')}</li>
        </ol>

        <ol class="pokemonAttribute text-two-columns">
            <li>Egg cycles</li>
            <li>${egg_cycles}</li>
        </ol>
    </li>` 
    // localStorage.clear()
    return
}

/* Função para calcular % de cada status (obs: apenas estimei os valores máximos com base nos maiores valores encontrados entre os primeiros 151 pokémons) */
const calculateStatusPercentage = statValue => (statValue *100) / 250

/* Função que renderiza informações da guia Base Stats */
const renderBaseStatsContainer = ({ stats }) => {
    let totalStats = 0
    const baseStatsTitle = topicsTitles[1]

    changeBorderColor(baseStatsTitle, topicsTitles)

    datasheetContainer.innerHTML = 
    `<li class="base-stats-attributes">
        ${stats.map(({ statValue, statName }) => {
            totalStats += statValue
            
            return `<ol class="pokemonAttribute text-two-columns">
                <li class="capitalize">${statName}</li>
                <li class="barContainer">
                    <span class="barNumber">${statValue}</span>
                    <span>
                        <div class="bar" style="border-radius: .5rem; height: .625rem; margin: .5rem 0; width: ${calculateStatusPercentage(statValue).toFixed(1)}%;"></div>
                    </span>
                </li>
            </ol>`
        }).join('')}

        <ol class="pokemonAttribute text-two-columns">
            <li>Total</li>
            <li class="barContainer">
                <span class="barNumber">${totalStats}</span>
                <span>
                <div class="bar" style="border-radius: .5rem; height: .625rem; margin: .5rem 0; width: ${(totalStats*100/1500).toFixed(1)}%;"></div>
                </span>
            </li>
        </ol>
    </li>`
}

/* Função que renderiza informações da guia Evolution */
const renderEvolutionContainer = ({ evolutionChain }) =>{
    const hasNoEvolutionImage = !evolutionChain[0].evolutionImage
    const evolutionTitle = topicsTitles[2]
    
    changeBorderColor(evolutionTitle, topicsTitles)

    if(hasNoEvolutionImage){
        datasheetContainer.innerHTML = 
        `<li class="evolution-attributes">
            <h3>Evolution Chain</h3>
            <ol class="pokemonAttribute no-image">
                <li>
                    <span>${evolutionChain[0].name} não possui evolução.</span>
                </li>
            </ol>
        </li>`
        
            return
        }
    datasheetContainer.innerHTML = 
    `<li class="evolution-attributes">
        <h3>Evolution Chain</h3>
        <ol class="pokemonAttribute text-three-columns">
            <li class="evolution-title"><b>From</b></li>
            <li class="evolution-title"><b>Level</b></li>                      
            <li class="evolution-title"><b>To</b></li>
        </ol>

        ${evolutionChain.map(({ maxLevel, image, name, evolutionImage, nextEvolutionName }) => maxLevel
            ? `<ol class="pokemonAttribute image-three-columns">    
                <li class="evolution-image-container">
                    <div>
                        <img src=${image} alt="${name}">
                        <span class="capitalize">${name}</span>
                    </div>
                </li>
                <li class="levelup"><span>${maxLevel < 10 ? `0${maxLevel}` : maxLevel}</span></li>                      
                <li class="evolution-image-container">
                    <div>
                        <img src=${evolutionImage} alt="${nextEvolutionName}">
                        <span class="capitalize">${nextEvolutionName}</span>
                    </div>
                </li>
            </ol>` 

            : `<ol class="pokemonAttribute image-three-columns">    
                <li class="evolution-image-container">
                    <div>
                        <img src=${image} alt="${name}">
                        <span class="capitalize">${name}</span>
                    </div>
                </li>
                <li class="levelup">N/D</li>                      
                <li class="evolution-image-container">
                    <div>
                        <img src=${evolutionImage} alt="${nextEvolutionName}">
                        <span class="capitalize">${nextEvolutionName}</span>
                    </div>
                </li>
            </ol>`
        ).join('')}

    </li>`
}

/* Função que renderiza informações da guia Moves */
const renderMovesContainer = ({ moves }) => {
    const movesTitle = topicsTitles[3]
    changeBorderColor(movesTitle, topicsTitles)

    datasheetContainer.innerHTML =
    `<li class="moves-attributes">
        <h3>Moves</h3>
        <ol class="pokemonAttribute-list">
            ${moves.map(move => `<li>${move}</li>`).join('')}
        </ol>
    </li>`
}

/* Função que compara o elemento clicado com os elementos correspondentes às guias da página */
const compareElements = (target, element) => 
       target === element || target.parentElement === element
    

/* Manipula a exibição do conteúdo das guias */
const handleTabRendering = ({ target }) => { 
    const [aboutTitle, baseStatsTitle, evolutionTitle, movesTitle] = topicsTitles 

    if(compareElements(target, aboutTitle)) {
        renderAboutContainer(objPokemon)
    } else if(compareElements(target, baseStatsTitle)){
        renderBaseStatsContainer(objPokemon)
    } else if(compareElements(target, evolutionTitle)){
        renderEvolutionContainer(objPokemon)
    } else if(compareElements(target, movesTitle)){
        renderMovesContainer(objPokemon)
    } 
}

/* Manipula o status favorito dos pokémons */
const handleFavoritePokemons = () => {
    favoriteButton.classList.toggle('favorited')
    
    if(!objPokemon.favoriteStatus){
        localStorage.setItem(`favorite-${objPokemon.name}`, JSON.stringify('yes')) // sinaliza valor de favorite deste pokémon e guarda localmente
        return
    }

    localStorage.setItem(`favorite-${objPokemon.name}`, JSON.stringify(''))
}

setPokemonFavoriteStatus(objPokemon)
renderPokemonInfosCard(objPokemon)
renderAboutContainer(objPokemon)

topicsTitles.forEach(topic => topic.addEventListener('click', handleTabRendering))
favoriteButton.addEventListener('click', handleFavoritePokemons)
