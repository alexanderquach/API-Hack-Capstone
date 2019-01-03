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
    fields: 'addresses'
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
      `<p id="error-message">An error has occurred.<br>Please try again.</p>`
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

let previnfowindow = null;
let previnfowindowA = null; 

function displayResults(responseJsonNPS) {
  //Displays results of the response from NPS API
  // console.log(responseJsonNPS);
  $('#search-results').empty();
  if (responseJsonNPS.total === 0) {
    $('.error-message').html(
      `<p id="error-message">An error has occured, please try again!</p>`
      )
  }
  
  const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 6,
      center: STATE[$('#state-search').val()]
    });

  for (let i = 0; i < responseJsonNPS.data.length; i++) {
    if (responseJsonNPS.data[i].weatherInfo === "") {
      $('#search-results').append(
      `<li>
        <h4 id="data-link">${responseJsonNPS.data[i].fullName}</h4>
        <button type="button" class="btn btn-outline-info btn-sm" data-latlon="${responseJsonNPS.data[i].latLong}" id="more-info">More Info!</button>
        <div class="hidden-results hidden">
          <p>Description: ${responseJsonNPS.data[i].description}</p>
          <p>Website: <a href="${responseJsonNPS.data[i].url}">${responseJsonNPS.data[i].url}</a></p>
          <p>Typical weather: No data available</p>
          <h6 class="list-header">Restaurant List</h6>
          <div class="container-fluid" id="restaurant-div">
            <div class="list-group restaurant-list">
              <ul id="restaurant-list"></ul>
            </div>
          </div>
        </div>
      </li>`
      )
    }
    else {
      $('#search-results').append(
      `<li>
        <h4 id="data-link">${responseJsonNPS.data[i].fullName}</h4>
        <button type="button" class="btn btn-outline-info btn-sm" data-latlon="${responseJsonNPS.data[i].latLong}" id="more-info">More Info!</button>
        <div class="hidden-results hidden">
          <p>Description: ${responseJsonNPS.data[i].description}</p>
          <p>Website: <a href="${responseJsonNPS.data[i].url}">${responseJsonNPS.data[i].url}</a></p>
          <p>Typical weather: ${responseJsonNPS.data[i].weatherInfo}</p>
          <h6 class="list-header">Restaurant List</h6>
          <div class="container-fluid" id="restaurant-div">
            <div class="list-group restaurant-list">
              <ul id="restaurant-list"></ul>
            </div>
          </div>
        </div>
      </li>`
      )
    }

    const contentString = '<div id="content">'+
      `<h5>${responseJsonNPS.data[i].fullName}</h5>`+
      `<a href="${responseJsonNPS.data[i].directionsUrl}" target="_blank">Directions</a>`+
      '</div>';

    const infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    const contentStringA =  '<div id="content">'+
      `<h5>${responseJsonNPS.data[i].fullName}</h5>`+
      '<a href="https://www.google.com/maps" target="_blank">Directions</a>'+
      '</div>';

    const infowindowA = new google.maps.InfoWindow({
      content: contentStringA
    });

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

    marker.addListener('click', function() {
      if (previnfowindow) {
        previnfowindow.close();
      };
      if (previnfowindowA) {
        previnfowindowA.close();
      };
      if (responseJsonNPS.data[i].directionsUrl === "") {
        infowindowA.open(map, marker);
        previnfowindowA = infowindowA
      }
      else {
        infowindow.open(map, marker);
        previnfowindow = infowindow
      };
    });
    
    map.addListener('click', function() {
      if (infowindow) {
        infowindow.close();
      };
      if (infowindowA) {
        infowindowA.close();
      };
    });
  };
  $('.results-map').removeClass('hidden');
  $('.results').removeClass('hidden');
};

function displayMoreInfo(responseJsonZomato, button) {
  // console.log(responseJsonZomato.restaurants)
  for (let i = 0; i < responseJsonZomato.restaurants.length; i++) {
    button.parent().find('#restaurant-list').append(
      `<div id="restaurant-item">
        <li class="list-group-item restaurant-item">
          <h5>${responseJsonZomato.restaurants[i].restaurant.name}</h5>
          <p>Address: ${responseJsonZomato.restaurants[i].restaurant.location.address}</p>
          <a href="${responseJsonZomato.restaurants[i].restaurant.url}" target="_blank"><button type="button" class="btn btn-outline-danger btn-sm">Zomato</button></a>
        </li>
      </div>`
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
  // console.log('handleUserSubmit ran');
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