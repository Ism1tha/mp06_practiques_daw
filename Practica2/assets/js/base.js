/**
 * Main JS file for the application for the second practice of the MP06 module (INS Montsià)
 * Author: Ismael Semmar Galvez
 *
 */

/* Constants */
const API_URL = "https://pokeapi.co/api/v2";

const STATUS_LOADING = "loading";
const STATUS_LOADED = "loaded";
const STATUS_ERROR = "error";

/* Variables */
var applicationStatus = STATUS_LOADING;
var pokemonList = {};

var pokemonsTable = null;

/* Application Functions */

async function loadApplication() {
  setApplicationStatus(STATUS_LOADING);
  if(checkIfDataExists()) {
    loadData();
    setApplicationStatus(STATUS_LOADED);
    showToast("Pokemons data loaded from local storage");
  } else {
    await fetchPokemons();
    saveData();
    alert("Pokemons data loaded from API and saved to local storage");
  }
  setApplicationStatus(STATUS_LOADED);
  initializePokemonsTable();
}

async function fetchPokemons() {
  try {
    const response = await fetch(API_URL + "/pokemon?limit=151");
    const data = await response.json();
    pokemonList = data.results;
    for (pokemon of pokemonList) {
      var pokemonData = await fetchPokemonBaseData(pokemon.url);
      pokemon.id = extractPokemonId(pokemon.url);
      pokemon.image = pokemonData.image;
      pokemon.sound = pokemonData.sound;
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
      sound: data.cries.legacy,
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
      if (window.innerWidth > 768) {
        setupBackgroundPokemons();
      }
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

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function extractPokemonId(url) {
  var splitUrl = url.split("/");
  return splitUrl[splitUrl.length - 2];
}

function getBadgeClass(type) {
  return `badge-${type.replace(" ", "-").toLowerCase()}`;
}


/* Data Storage Functions */

function checkIfDataExists() {
  return localStorage.getItem("pokemonList") !== null;
}

function saveData() {
  localStorage.setItem("pokemonList", JSON.stringify(pokemonList));
}

function loadData() {
  pokemonList = JSON.parse(localStorage.getItem("pokemonList"));
}

function deletePokemon(index) {
  pokemonList.splice(index, 1);
  saveData();
  initializePokemonsTable();
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

function setupBackgroundPokemons() {
  var backgroundPokemons = document.querySelectorAll(".background-pokemon");
  backgroundPokemons.forEach((backgroundPokemon) => {
    backgroundPokemon.style.display = "block";
    var randomX = Math.floor(Math.random() * 90);
    var randomY = Math.floor(Math.random() * 90);
    backgroundPokemon.style.transform = `translate(${randomX}vw, ${randomY}vh)`;
    setTimeout(() => {
      moveBackgroundPokemonRandomly(backgroundPokemon);
    }, 2000);
  });
}

function moveBackgroundPokemonRandomly(element) {
  var randomX = Math.floor(Math.random() * 80);
  var randomY = Math.floor(Math.random() * 80);
  element.style.transform = `translate(${randomX}vw, ${randomY}vh)`;
  setTimeout(() => {
    moveBackgroundPokemonRandomly(element);
  }, 20000);
}

function showToast(message) {
  Toastify({
    text: message,
    offset: {
      x: 50, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
      y: 10 // vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
    style: {
      background: "#fcc410",
    },
  }).showToast();
}

/* Set timeout, to simulate a delay 3 seconds */

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    loadApplication();
  }, 3000);
});
