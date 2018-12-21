'use strict';

const apiKeyNPS = 'rJT2LIKjSeINJ5c68QGIQ7z620EUldTNl3XqYqni';
const apiKeyGoogle = 'AIzaSyAb1GvFsH8uPvet0rCZolXxkrzJ--zaQR8';
const apiKeyZomato = 'dd4afc6c33f1f9b15ad0b5e460b8c20a';
const searchURL = 'https://api.nps.gov/api/v1/parks';
const zomatoURL = 'https://developers.zomato.com/api/v2.1/search'

function formatQueryParams(params) {
  //Formats query parameters for API request
  const queryItems = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
  return queryItems.join('&');
};

function searchNationalParks(query) {
  //Requests from NPS API for parks by state
  // console.log('searchNationalParks ran');
  const params = {
    api_key: apiKeyNPS,
    stateCode: query,
  };
  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString;

  fetch(url)
  .then(response => {
    // console.log(response);
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJsonNPS => displayResults(responseJsonNPS))
  .catch(error => {
    $('#search-results').empty();
    $('.error-message').html(
      `<p id="error-message">An error has occurred.<br>Please enter a valid 2-letter state code.</p>`
    );
  });
};
  
function searchZomatoAPI(location, button) {
  //Requests from Zomato API for restaurants by location
  // console.log('searchZomatoAPI ran');
  let [lat, lng] = location.split(', ').map(pos => pos.substring(pos.indexOf(':') + 1, pos.length))
  const paramsZ = {
    lat: parseFloat(lat),
    lon: parseFloat(lng)
  };
  const optionsZ = {
    headers: {
      "user-key": apiKeyZomato,
      "Accept": 'application/json'
      },
    method: 'GET'
  };
  const queryString = formatQueryParams(paramsZ)
  const urlZ = zomatoURL + '?' + queryString;

  fetch(urlZ, optionsZ)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseZomato => displayMoreInfo(responseZomato, button))
    .catch(error => {
      $('.error-message').text(`Something went wrong: ${error.message}`);
    });
};

function displayResults(responseJsonNPS) {
  //Displays results of the response from NPS API
  // console.log(responseJsonNPS);
  $('#search-results').empty();
  if (responseJsonNPS.total === 0) {
    $('.error-message').html(
      `<p id="error-message">Is that a state?.<br>Please enter a valid 2-letter state code to try again!</p>`
      )
  }
  const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 6,
      center: STATE[$('#state-search').val()]
    });

  for (let i = 0; i < responseJsonNPS.data.length; i++) {
    $('#search-results').append(
      `<li class="list-item-${i}">
      <h2 id="data-link">${responseJsonNPS.data[i].fullName}</h2>
      <p>${responseJsonNPS.data[i].description}</p>
      <button type="button" id="more-info" data-latlon="${responseJsonNPS.data[i].latLong}">More Info!</button>
      <div class="hidden-results hidden">
      <a href="${responseJsonNPS.data[i].url}">${responseJsonNPS.data[i].url}</a>
      <p>Typical weather: ${responseJsonNPS.data[i].weatherInfo}</p>
      <ul id="restaurant-list"></ul>
      </li>`
    )
    
    let [lat, lng] = responseJsonNPS.data[i].latLong.split(', ').map(pos => pos.substring(pos.indexOf(':') + 1, pos.length))
    const latLon = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
    const marker = new google.maps.Marker({
      position: latLon,
      map: map,
      title: `${responseJsonNPS.data[i].fullName}`
    });
  };
  $('.results').removeClass('hidden');
};

function displayMoreInfo(responseJsonZomato, button) {
  // console.log(responseJsonZomato.restaurants)
  for (let i = 0; i < responseJsonZomato.restaurants.length; i++) {
    button.parent().find('#restaurant-list').append(
      `<li>
      <h3>${responseJsonZomato.restaurants[i].restaurant.name}</h3>
      <p>${responseJsonZomato.restaurants[i].restaurant.location.address}</p>
      <a href="${responseJsonZomato.restaurants[i].restaurant.url}">Check it out on Zomato</a>
      </li>`
    );
  };
}

function handleMoreInfo() {
// Handles user action for more information
  $('#search-results').on('click', 'button', function() {
    $(this).parent().find('.hidden-results').toggle();
    searchZomatoAPI($(this).data("latlon"), $(this));
  });
};


function handleUserSubmit() {
  //Handles user submit for search
  console.log('handleUserSubmit ran');
  $('#js-form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#state-search').val();
    searchNationalParks(searchTerm);
  });
};

$(function() {
  console.log('App loaded, awaiting user submit');
  handleUserSubmit();
  handleMoreInfo();
});