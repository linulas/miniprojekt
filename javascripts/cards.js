/**
 * Cards
 * Author: Linus Brännström
 */

/* eslint-env jquery, browser */
/* eslint no-console: ["warn", { allow: ["log"] }] */
var CardApp = (function () {
    // App Properties --------------------------
    const search = $('#searchTB'), // The textbox for searching cards
        searchButton = $('#cardButton'), // Button to submit search
        setSelector = document.querySelector('#set'), // Selector for card sets
        results = document.querySelector('#results'); // Element to display cards
    var cardSet = ''; // The set of the cards

    // App Methods -----------------------------
    async function init() {
        updateCards(cardSet); // Fetch Cards
        await updateSets(); // Fetch sets
        setSelector.value = 0; // Set selector to 'All'

        // register service worker
        if ('serviceWorker' in navigator) {
            try {
                navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered');
            } catch (error) {
                console.log('Service Worker registration failed');
            }
        }
    }

    // Fetches cards from api
    async function updateCards(cardSet) {
        const res = await fetch('https://api.magicthegathering.io/v1/cards' + cardSet);
        const json = await res.json();
        console.log(json.cards);

        results.innerHTML = json.cards.map(displayCard).join('\n'); // Display in browser
    }

    // Fetch sets from api
    async function updateSets() {
        const res = await fetch('https://api.magicthegathering.io/v1/sets');
        const json = await res.json();
        console.log(json.sets);

        setSelector.innerHTML = json.sets.map(src => '<option value="' + src.code + '">' + src.name + '</option>').join('\n');
        $('#set').prepend('<option value="0">All</option>');
    }

    // Create elements to display
    function displayCard(card) {
        return '<div class="card"><img src="' + card.imageUrl + '"><div>';
    }
    
    // Event listeners ---------------------------

    // Calls new api request according to selected set
    setSelector.addEventListener('change', e => {
        if (e.target.value == 0) {
            cardSet = '';
        } else {
            cardSet = '?set=' + e.target.value;
        }
        updateCards(cardSet);
    });

    return {
        init: init // Initializes the application
    };

})();

CardApp.init(); // Run application
