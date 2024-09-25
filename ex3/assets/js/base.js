/**
 * Main JS file for the application for the second practice of the MP06 module (INS Montsià)
 * Author: Ismael Semmar Galvez
 *
 */

/* Constants */

const API_URL = "https://pokeapi.co/api/v2";

const STATUS_LOADING = "loading";
const STATUS_LOADED = "loaded";

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
    if(await fetchPokemons()) {
      savePokemonsData();
      showToast("Pokemons data fetched and saved to local storage");
    }
    else {
      setTimeout(() => {
        loadApplication();
      }, 3000);
      return; 
    }
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
    return true;
  } catch (error) {
    showToast("Error fetching pokemons data");
    return false;
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
    columns: [{ data: "name", title: "Pokemon" }, { title: "Types" }, { title: "Audio" }, { title: "Actions" }],
    columnDefs: [
      {
        targets: 0,
        render: function (data, type, row, meta) {
          return `<div class="pokemon-info">
          <img src="${row.image}" alt="${capitalizeFirstLetter(data)}" width="25" height="25">
          ${capitalizeFirstLetter(
            data
          )} (${row.id})</div>`;
        },
      },
      {
        targets: 1,
        render: function (data, type, row, meta) {
          return row.types.map((type) => `<span class="badge ${getBadgeClass(type)}">${capitalizeFirstLetter(type)}</span>`).join(" ");
        }
      },
      {
        targets: 2,
        render: function (data, type, row, meta) {
          return `<button class="btn btn-third" onclick="playPokemonSound('${row.sound}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="#ffffff"><path d="M10 16v-5.401A2.999 2.999 0 0 0 10 5.4V0L4.667 4H0v8h4.667z"/><path d="m13.6 3.2l-.799-.6L11.6 4.199l.8.6a4 4 0 0 1 .8.802c.503.668.8 1.497.8 2.399s-.297 1.73-.8 2.4a4 4 0 0 1-.8.8l-.8.601l1.201 1.6l.8-.601a6 6 0 0 0 1.198-1.2A5.98 5.98 0 0 0 16 8c0-1.35-.447-2.598-1.2-3.6a6 6 0 0 0-1.2-1.2"/></g></svg>
          </button>`;
        },
      },
      {
        targets: 3,
        render: function (data, type, row, meta) {
          return `<button class="btn btn-primary" onclick="showPokemonDetails('${row.url}')"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="#ffffff"><path d="M8 10a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/><path d="m15.356 7.478l.027.051l.235.471l-.236.47l-.026.052a13 13 0 0 1-.464.794a14 14 0 0 1-1.399 1.853C12.303 12.492 10.427 14 8 14s-4.302-1.508-5.493-2.831A14 14 0 0 1 .644 8.522l-.027-.051L.382 8l.235-.47a6 6 0 0 1 .125-.232a14 14 0 0 1 1.765-2.467C3.697 3.508 5.573 2 8 2s4.302 1.508 5.493 2.831a14 14 0 0 1 1.863 2.647m-12.558.768c.276.436.68 1.013 1.195 1.585C5.053 11.008 6.427 12 8 12s2.948-.992 4.007-2.169A12 12 0 0 0 13.354 8a12 12 0 0 0-1.347-1.831C10.947 4.992 9.573 4 8 4s-2.948.992-4.007 2.169A12 12 0 0 0 2.646 8q.068.113.152.246"/></g></svg></button> <button class="btn btn-secondary" onclick="deletePokemonFromData('${meta.row}')"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="#ffffff"><path d="M7 7v5h2V7z"/><path d="M11 0H5v3H0v2h1.165l1.553 8.537A3 3 0 0 0 5.669 16h4.662a3 3 0 0 0 2.952-2.463L14.835 5H16V3h-5zM9 3H7V2h2zM4.685 13.179L3.198 5h9.604l-1.487 8.179a1 1 0 0 1-.984.821H5.669a1 1 0 0 1-.984-.821"/></g></svg></button>`;
        },
      },
    ],
    language: {
      search: "",
      searchPlaceholder: 'Pikachu, Bulbasaur, Charmander...',
    },
    headerCallback: function(thead) {
      //$(thead).hide();  // Hides the table header
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
