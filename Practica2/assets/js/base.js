/**
 * Main JS file for the application for the second practice of the MP06 module (INS Montsià)
 * Author: Ismael Semmar Galvez
 *
 */

/* Constants */
const API_URL = "https://api.themoviedb.org/3/";

const STATUS_LOADING = "loading";
const STATUS_LOADED = "loaded";
const STATUS_ERROR = "error";

/* Variables */
var applicationStatus = STATUS_LOADING;
var pokemonList = {};

var pokemonsTable = null;

/* Functions */

async function loadApplication() {
  setApplicationStatus(STATUS_LOADING);
  await fetchPokemons();
  setApplicationStatus(STATUS_LOADED);
  initializePokemonsTable();
}

async function fetchPokemons() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const data = await response.json();
    pokemonList = data.results;
    for (pokemon of pokemonList) {
      var pokemonData = await fetchPokemonBaseData(pokemon.url);
      pokemon.id = extractPokemonId(pokemon.url);
      pokemon.image = pokemonData.image;
      pokemon.types = pokemonData.types;
    }
    console.log("Pokemons fetched", pokemonList);
  } catch (error) {
    console.error("Error fetching pokemons", error);
  }
}

async function fetchPokemonBaseData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    var pokemonData = {
      image: data.sprites.front_default,
      types: data.types.map((item) => item.type.name),
    };
    return pokemonData;
  } catch (error) {
    console.log(error);
  }
}

function setApplicationStatus(status) {
  applicationStatus = status;
  switch (status) {
    case STATUS_LOADING:
      showPreloader();
      hidePokemonList();
      break;
    case STATUS_LOADED:
      hidePreloader();
      showPokemonList();
      break;
    case STATUS_ERROR:
      console.error("Error setting application status");
      break;
  }
}

function initializePokemonsTable() {
  if (pokemonsTable) {
    pokemonsTable.destroy();
  }
  pokemonsTable = $("#pokemons-table").DataTable({
    data: pokemonList,
    ordering: false,
    lengthChange: false,
    columns: [{ data: "name", title: "Pokemon" }, { title: 'Pokemon Type'}, { title: 'Actions' }],
    columnDefs: [
      {
        targets: 0,
        render: function (data, type, row, meta) {
          return `<div class="pokemon-info"><img src="${
            row.image
          }" alt="${data}" width="25" height="25"> ${capitalizeFirstLetter(
            data
          )} (${row.id})</div>`;
        },
      },
      {
        targets: 1,
        render: function (data, type, row, meta) {
          return row.types.map((type) => `<span class="badge ${getBadgeClass(type)}">${capitalizeFirstLetter(type)}</span>`).join(" ");
        },
      },
      {
        targets: 2,
        render: function (data, type, row, meta) {
          return `<button class="btn" onclick="showPokemonDetails('${row.url}')">View information</button> <button class="btn btn-secondary" onclick="deletePokemon('${data}')">Delete pokemon</button>`;
        },
      },
    ],
    language: {
      searchPlaceholder: 'Pikachu, Bulbasaur, Charmander...',
  }
  });
}

capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

function extractPokemonId(url) {
  var splitUrl = url.split("/");
  return splitUrl[splitUrl.length - 2];
}

/* Function to get the class for the color of the badge, lowercase and spaces replaced by hyphens */
function getBadgeClass(type) {
  return `badge-${type.replace(" ", "-").toLowerCase()}`;
}

/* UX Functions */

function hidePreloader() {
  document.getElementById("preloader").style.display = "none";
}

function showPreloader() {
  document.getElementById("preloader").style.display = "block";
}

function hidePokemonList() {
  document.getElementById("main-content").style.display = "none";
}

function showPokemonList() {
  document.getElementById("main-content").style.display = "block";
}

function playSound(sound) {
  var audio = new Audio(sound);
  audio.play();
}

/* Set timeout, to simulate a delay 3 seconds */

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    loadApplication();
  }, 3000);
});
