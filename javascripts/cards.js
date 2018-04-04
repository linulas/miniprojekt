/**
 * App: Cards
 * Author: Linus Brännström
 */

/* eslint-env jquery, browser */
/* eslint no-console: ["warn", { allow: ["log"] }] */

var CardApp = (function () {
    // App Properties --------------------------
    const search = document.querySelector('#searchTB'), // The textbox for searching cards
        applicationServerPublicKey = 'BPTHkzoXCGIiObvu0ny5tPDYavyX7AV6YRvnLoNSoflUbgwtSWQpurtndRctvptiC8HHKMj9-2bzSd0hq2tGktU',
        searchButton = document.querySelector('#searchButton'), // Button to submit search
        setSelector = document.querySelector('#set'), // Selector for card sets
        pushButton = document.querySelector('.js-push-btn'),
        results = document.querySelector('#results'); // Element to display cards
    var apiQuery = ''; // The set of the cards

    let isSubscribed = false, // Boolean for user subscription
        swRegistration = null; // Holds the registered serviceworker

    // App Methods -----------------------------
    function init() {

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            console.log('Service Worker and Push is supported');

            navigator.serviceWorker.register('sw.js')
                .then(function (swReg) {
                    console.log('Service Worker is registered', swReg);

                    swRegistration = swReg;
                    // Check if the user is Subscribed and set Pushbutton accordingly
                    initializeUI();
                })
                .catch(function (error) {
                    console.error('Service Worker Error', error);
                });
        } else {
            console.warn('Push messaging is not supported');
            pushButton.textContent = 'Push Not Supported';
            pushButton.disabled = true;
        }

        updateCards(apiQuery); // Fetch Cards
        updateSets(); // Fetch sets
    }

    // Fetches cards from api
    async function updateCards(queryParameter) {
        const res = await fetch('https://api.magicthegathering.io/v1/cards' + queryParameter);
        const json = await res.json();
        console.log(json.cards);

        results.innerHTML = '';

        for (var i = 0; i < json.cards.length; i++) {
            displayCard(json.cards[i])
        }
    }

    // Fetch sets from api
    async function updateSets() {
        const res = await fetch('https://api.magicthegathering.io/v1/sets');
        const json = await res.json();
        console.log(json.sets);

        setSelector.innerHTML = json.sets.map(src => '<option value="' + src.code + '">' + src.name + '</option>').join('\n');
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

    // Set the initial subscription value
    function initializeUI() {
        swRegistration.pushManager.getSubscription()
            .then(function (subscription) {
                isSubscribed = !(subscription === null);

                if (isSubscribed) {
                    console.log('User IS subscribed.');
                } else {
                    console.log('User is NOT subscribed.');
                }
                updateBtn();
            });
    }

    // Updates the Push notification button
    function updateBtn() {
        if (Notification.permission === 'denied') {
            pushButton.textContent = 'Push Messaging Blocked.';
            pushButton.disabled = true;
            updateSubscriptionOnServer(null);
            return;
        }

        if (isSubscribed) {
            pushButton.textContent = 'Disable Push Messaging';
        } else {
            pushButton.textContent = 'Enable Push Messaging';
        }

        pushButton.disabled = false;
    }

    // Convert string to UInt8Array
    function urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Subscripbes the user to push notifications
    function subscribeUser() {
        const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
        swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            })
            .then(function (subscription) {
                console.log('User is subscribed.');

                updateSubscriptionOnServer(subscription);

                isSubscribed = true;

                updateBtn();
            })
            .catch(function (err) {
                console.log('Failed to subscribe the user: ', err);
                updateBtn();
            });
    }

    // Shows or hides info on how to demonstrate notifications
    function updateSubscriptionOnServer(subscription) {
        const subscriptionJson = document.querySelector('.js-subscription-json');
        const subscriptionDetails =
            document.querySelector('.js-subscription-details');

        if (subscription) {
            subscriptionJson.textContent = JSON.stringify(subscription);
            subscriptionDetails.classList.remove('is-invisible');
        } else {
            subscriptionDetails.classList.add('is-invisible');
        }
    }

    // Unsubscribes the user from notifications
    function unsubscribeUser() {
        swRegistration.pushManager.getSubscription()
            .then(function (subscription) {
                if (subscription) {
                    return subscription.unsubscribe();
                }
            })
            .catch(function (error) {
                console.log('Error unsubscribing', error);
            })
            .then(function () {
                updateSubscriptionOnServer(null);

                console.log('User is unsubscribed.');
                isSubscribed = false;

                updateBtn();
            });
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

    // Listen for clicks on the search button
    searchButton.addEventListener('click', function () {
        if (search != '') {
            apiQuery = '?name=' + search.value; // Manipulate the API reqeust
            updateCards(apiQuery); // Update cards with the updated API request
        }
    });

    // Listen for clicks on the subscription button
    pushButton.addEventListener('click', function () {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });

    return {
        init: init // Initializes the application
    };

})();

CardApp.init(); // Run application
