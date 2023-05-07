const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const message = document.querySelector('[data-js="message"]')

const maxRecords = 151
const limit = 10
let offset = 0;
let objPokemons = [] //apenas para armazenar temporariamente todos os pokemons listados

const convertPokemonToLi = ({ number, types, type: pokeType, name, photo }) =>
    `<li data-pokemon="pok-${number}" class="pokemon ${pokeType}">
        <span data-pokemon="pok-${number}" class="number">#${number}</span>
        <span data-pokemon="pok-${number}" class="name capitalize">${name}</span>

        <div data-pokemon="pok-${number}" class="detail">
            <ol data-pokemon="pok-${number}" class="types">
                ${types.map((type) => `<li data-pokemon="pok-${number}" class="type ${type}">${type}</li>`).join('')}
            </ol>

            <img data-pokemon="pok-${number}" src="${photo}"
                    alt="${name}">
        </div>
    </li>`

const loadPokemonItens = async (offset, limit) => {
    let newHtml = ''
    message.classList.add('message')
    message.textContent = 'Carregando pokemons, aguarde por favor...'
    try{
        const pok = await pokeApi.getPokemons(offset, limit)
        if(!pok.length){        
            throw new Error('Não foi possível completar a lista')
        }
        // const pokeData = await pok.json()
        newHtml = pok.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newHtml

        pok.map(pokemon => objPokemons.push(pokemon))
        localStorage.setItem('limit', objPokemons.length)

        message.classList.remove('message')
        message.textContent = ''

    }catch(error){
        alert(error)
    }
}




// function loadPokemonItens(offset, limit) {
//     let newHtml = ''
//     message.classList.add('message') 
//     message.textContent = "Carregando, aguarde por favor..." // mensagem enquanto carrega lista

//     pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
//         newHtml = pokemons.map(convertPokemonToLi).join('')
//         pokemonList.innerHTML += newHtml 

//         pokemons.map(pokemon => objPokemons.push(pokemon))
//         localStorage.setItem('limit', objPokemons.length) // este limite será usado quando retornarmos a esta página para continuar onde parou no acesso anterior

//     }).then(() => {
//         message.classList.remove('message')
//         message.textContent = ''
//     })
// }

// Teste se há dados armazenados em localStorage
if(JSON.parse(localStorage.getItem('limit'))){ //Se houver, vai continuar com base onde parou da última vez e  armazenar novo limite toda vez que atualizarmos a página. 
    const newLimit = JSON.parse(localStorage.getItem('limit'))

    loadPokemonItens(offset, newLimit)
    offset = newLimit-limit
    
    if(newLimit === maxRecords) {
        loadMoreButton.remove()
    }

} else { // Se não houver, vai realizar a primeira requisição para renderizar e vai armazenar o limite usado
    loadPokemonItens(offset, limit)
}
    
loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        
        loadPokemonItens(offset, newLimit)      
        loadMoreButton.parentElement.removeChild(loadMoreButton)

    } else {
        loadPokemonItens(offset, limit)
    }
})

pokemonList.addEventListener('click', event => {  
    if(!event.target.dataset.pokemon){ // se clicar em elemento que não contenha o dataset, retorna
        return
    }

    let id= (event.target.dataset.pokemon).slice(4) - 1 // armazena o número de identificação do pokemon

    localStorage.setItem('objPokemon', JSON.stringify(objPokemons[id])) // acessa o objeto do pokemon clicado
    window.location.href = "./pokemon.html"
})


