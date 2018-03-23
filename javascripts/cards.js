/**
 * Cards
 * Author: Linus Brännström
 */

/* eslint-env jquery, browser */
/* eslint no-console: ["warn", { allow: ["log"] }] */
var CardApp = (function () {
    // App Properties --------------------------
    const search = document.querySelector('#searchTB'), // The textbox for searching cards
        searchButton = document.querySelector('#searchButton'), // Button to submit search
        setSelector = document.querySelector('#set'), // Selector for card sets
        results = document.querySelector('#results'); // Element to display cards
    var apiQuery = ''; // The set of the cards

    // App Methods -----------------------------
    async function init() {
        updateCards(apiQuery); // Fetch Cards
        await updateSets(); // Fetch sets
        setSelector.value = 0; // Set selector to 'All'

        // register service worker
        /*if ('serviceWorker' in navigator) {
            try {
                navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered');
            } catch (error) {
                console.log('Service Worker registration failed');
            }
        }*/
    }

    // Fetches cards from api
    async function updateCards(cardSet) {
        const res = await fetch('https://api.magicthegathering.io/v1/cards' + cardSet);
        const json = await res.json();
        console.log(json.cards);
        
        results.innerHTML = '';
        
        for(var i = 0; i < json.cards.length; i++) {
            displayCard(json.cards[i])
        }

        //results.innerHTML = json.cards.map(displayCard).join('\n'); // Display in browser
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
        var title = document.createElement('h5');
        var image = document.createElement('img');
        var description = document.createElement('p');
        var cardItem = document.createElement('div');
        
        title.innerHTML = card.name;
        image.src = card.imageUrl;
        description.innerHTML = 'Set: ' + card.setName + '</br> Rarity: ' + card.rarity + '</br> Artist: ' + card.artist;
        cardItem.className = 'card-group-item col-md-6 col-lg-4';
        cardItem.appendChild(title);
        cardItem.appendChild(image);
        cardItem.appendChild(description);
        
        results.appendChild(cardItem);
    }
    
    // Event listeners ---------------------------

    // Calls new api request according to selected set
    setSelector.addEventListener('change', e => {
        if (e.target.value == 0) {
            apiQuery = '';
        } else {
            apiQuery = '?set=' + e.target.value.replace(' ', '_');
        }
        updateCards(apiQuery);
    });
    
    searchButton.addEventListener('click', function() {
        if(search != '') {
            apiQuery = '?name=' + search.value;
            updateCards(apiQuery);
        }
    });

    return {
        init: init // Initializes the application
    };

})();

CardApp.init(); // Run application
