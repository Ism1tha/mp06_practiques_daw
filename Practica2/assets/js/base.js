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

const MUSIC_PLAYING = "playing";
const MUSIC_PAUSED = "paused";

/* Variables */

var userInteracted = false;

var applicationStatus = STATUS_LOADING;
var musicStatus = MUSIC_PAUSED;
var pokemonList = {};
var pokemonsTable = null;

var music = new Audio("assets/sounds/music.mp3");

var showingPokemonDetails = false;

/* Application Functions */

async function loadApplication() {
  setApplicationStatus(STATUS_LOADING);
  if(checkIfPokemonsDataExists()) {
    loadPokemonsData();
    showToast("Pokemons data loaded from local storage");
  } else {
    await fetchPokemons();
    savePokemonsData();
    showToast("Pokemons data fetched and saved to local storage");
  }
  loadMusicStatus();
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
    columns: [{ data: "name", title: "" }, { data: "name", title: "Pokemon" }, { data: "types", title: "Types" }, { data: "id", title: "Actions" }],
    columnDefs: [
      {
        targets: 1,
        render: function (data, type, row, meta) {
          return `<div class="pokemon-info">${capitalizeFirstLetter(
            data
          )} (${row.id})</div>`;
        },
      },
      {
        targets: 0,
        render: function (data, type, row, meta) {
          return `<img src="${
            row.image
          }" alt="${data}" width="30" height="30">`;
        },
      },
      {
        targets: 2,
        render: function (data, type, row, meta) {
          return row.types.map((type) => `<span class="badge ${getBadgeClass(type)}">${capitalizeFirstLetter(type)}</span>`).join(" ");
        },
      },
      {
        targets: 3,
        render: function (data, type, row, meta) {
          return `<button class="btn" onclick="showPokemonDetails('${row.url}')">View information</button> <button class="btn btn-secondary" onclick="deletePokemonFromData('${meta.row}')">Delete pokemon</button>`;
        },
      },
    ],
    language: {
      search: "",
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

function checkIfPokemonsDataExists() {
  return localStorage.getItem("pokemonList") !== null;
}

function savePokemonsData() {
  playSound("assets/sounds/save-effect.mp3");
  localStorage.setItem("pokemonList", JSON.stringify(pokemonList));
}

function loadPokemonsData() {
  pokemonList = JSON.parse(localStorage.getItem("pokemonList"));
}

function deletePokemonFromData(index) {
  pokemonList.splice(index, 1);
  savePokemonsData();
  initializePokemonsTable();
  showToast("Pokemon deleted successfully");
}

function wipePokemonsData() {
  if(applicationStatus === STATUS_LOADING) return;
  localStorage.removeItem("pokemonList");
  pokemonList = {};
  loadApplication();
  showToast("Pokemons data wiped from local storage");
}

function loadMusicStatus() {
  musicStatus = localStorage.getItem("musicStatus") || MUSIC_PAUSED;
  updateMusicButton();
}

function saveMusicStatus() {
  localStorage.setItem("musicStatus", musicStatus);
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

function toggleBackgroundMusic() {
  if (musicStatus === MUSIC_PLAYING) {
    musicStatus = MUSIC_PAUSED;
    music.pause();
  } else {
    musicStatus = MUSIC_PLAYING;
    music.play();
  }
  updateMusicButton();
  saveMusicStatus();
}

function updateMusicButton() {
  var musicButton = document.getElementById("music-btn");
  if (musicStatus === MUSIC_PLAYING) {
    musicButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="#ffffff"><path d="M10 16v-5.401A2.999 2.999 0 0 0 10 5.4V0L4.667 4H0v8h4.667z"/><path d="m13.6 3.2l-.799-.6L11.6 4.199l.8.6a4 4 0 0 1 .8.802c.503.668.8 1.497.8 2.399s-.297 1.73-.8 2.4a4 4 0 0 1-.8.8l-.8.601l1.201 1.6l.8-.601a6 6 0 0 0 1.198-1.2A5.98 5.98 0 0 0 16 8c0-1.35-.447-2.598-1.2-3.6a6 6 0 0 0-1.2-1.2"/></g></svg>';
  } else {
    musicButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="#ffffff" d="M9 0v16l-5.333-4H0V4h3.667zm2.586 8l-1.5 1.5l1.414 1.414l1.5-1.5l1.5 1.5L15.914 9.5l-1.5-1.5l1.5-1.5L14.5 5.086l-1.5 1.5l-1.5-1.5L10.086 6.5z"/></svg>';
  }
}

function playBackgroundMusic() {
  music.play();
}

function playSound(sound) {
  if(userInteracted && musicStatus === MUSIC_PLAYING) {
    var audio = new Audio(sound);
    audio.play();
  }
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
  playSound("assets/sounds/toast-effect.mp3");
  Toastify({
    text: message,
    offset: {
      x: 50,
      y: 10,
    },
    style: {
      background: "#14A44D",
    },
  }).showToast();
}

function showPokemonDetails(index) {
  playSound("assets/sounds/pc-effect.mp3");
  document.getElementById("pokemon-modal-overlay").style.display = "block";
  showingPokemonDetails = true;
}

function closePokemonDetails() {
  document.getElementById("pokemon-modal-overlay").style.display = "none";
  showingPokemonDetails = false;
}

/* Set timeout, to simulate a delay 3 seconds */

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    loadApplication();
  }, 3000);
});

/* On interact if music is playing but not reproducing play it */

document.addEventListener("click", function () {
  if(!userInteracted) userInteracted = true;
  if (musicStatus === MUSIC_PLAYING && music.paused) {
    music.play();
  }
});
