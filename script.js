'use strict';

const apiKeyNPS = 'rJT2LIKjSeINJ5c68QGIQ7z620EUldTNl3XqYqni';
const apiKeyGoogle = 'AIzaSyAb1GvFsH8uPvet0rCZolXxkrzJ--zaQR8';
const apiKeyDarkSky = '71a39d91a1a563b787338385e4ff3e63';
const apiKeyZomato = 'dd4afc6c33f1f9b15ad0b5e460b8c20a';
const searchURL = 'https://api.nps.gov/api/v1/parks';
const darkSkyURL = 'https://api.darksky.net/forecast';
const zomatoURL = ''

function formatQueryParams(params) {
  //Formats query parameters for API request
  const queryItems = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
  return queryItems.join('&');
};

function searchNationalParks(query) {
  //Requests from NPS API for parks by state
  console.log('searchNationalParks ran');
  const params = {
    api_key: apiKeyNPS,
    stateCode: query,
  };
  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString;

  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJsonNPS => displayResults(responseJsonNPS))
    .catch(error => {
      $('#search-results').empty();
      $('.error-message').html(
        `<p id="error-message">An error has occurred.<br>Please enter a valid 2-letter state code.</p>
        <button type="button" class="error-restart" value="Restart">`
        );
    });
};

function displayResults(responseJsonNPS) {
  //Displays results of the response from NPS API
  console.log(responseJsonNPS);
  $('#search-results').empty();
  for (let i = 0; i < responseJsonNPS.data.length; i++) {
    $('#search-results').append(
      `<li class="list-item">
      <a href="${responseJsonNPS.data[i].url}>${responseJsonNPS.data[i].fullName}</a>
      <p>${responseJsonNPS.data[i].description}</p>
      </li>`
    )
  };
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
});