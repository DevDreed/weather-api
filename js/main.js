"use strict";


let apiKeys = {};
let uid = "";

let currentWeatherData = (zipcode) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: 'apiKeys.json'
    }).then((response)=>{
      apiKeys = response;
      let authHeader = "&APPID=" + apiKeys.APPID;

      $.ajax({
        method: 'GET',
        url: `http://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&units=imperial${authHeader}`
      }).then((res)=>{
        resolve(res);
      }, (errorResponse)=>{
        console.log('errorResponse', errorResponse);
        reject(errorResponse);
      });
    }, (errorResponse)=>{
      console.log('errorResponse',errorResponse);
      reject(errorResponse);
    });
  });
};

let forecastWeatherData = (zipcode, numDays) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: 'apiKeys.json'
    }).then((response)=>{
      apiKeys = response;
      let authHeader = "&APPID=" + apiKeys.APPID;

      $.ajax({
        method: 'GET',
        url: `http://api.openweathermap.org/data/2.5/forecast/daily?zip=${zipcode},us&mode=json&units=imperial&cnt=${numDays}${authHeader}`
      }).then((res)=>{
        resolve(res);
      }, (errorResponse)=>{
        console.log('errorResponse', errorResponse);
        reject(errorResponse);
      });
    }, (errorResponse)=>{
      console.log('errorResponse',errorResponse);
      reject(errorResponse);
    });
  });
};

function createLogoutButton() {
  FbAPI.getUser(apiKeys, uid).then(function (userResponse) {
    $('#logout-container').html('');
    let currentUsername = userResponse.username;
    let logoutButton = `<button class="btn btn-danger" id="logoutButton">Logout ${currentUsername}</button>`;
    $('#logout-container').append(logoutButton);
  });
}

function addCurrentWeatherToDOM(weatherData) {
  console.log('currentWeatherData', weatherData);

  let finalHTML = `<div><span>${weatherData.name}</span></div>`;
  finalHTML += `<div>Temperature: ${weatherData.main.temp}&deg;F</div>`;
  finalHTML += `<div>Conditions: ${weatherData.weather[0].main}</div>`;
  finalHTML += `<div>Pressure: ${weatherData.main.pressure}</div>`;
  finalHTML += `<div>Wind Speed: ${weatherData.wind.speed}</div>`;

  $('#current-weather').append(finalHTML);
}

function addforecastToDOM(weatherData) {
  console.log('forecastWeatherData', weatherData);
  $('#forecast-container').html('');
  let forecasts = weatherData.list;


  let forecastHTML = forecasts.map(forecast => {
    return `<div class="forecast-card col-md-4">
    <div>High: ${forecast.temp.max}&deg;F</div>
    <div>Low: ${forecast.temp.min}&deg;F</div>
    <div>Wind Speed: ${forecast.speed}</div>
    <div>Wind Degrees: ${forecast.deg}</div>
    <div>Pressure: ${forecast.pressure}</div>
    <div>Conditions: ${forecast.weather[0].main}</div>
  </div>`;
}).join('');


  $('#forecast-container').append(forecastHTML);
}

$(document).ready(function () {

  FbAPI.firebaseCredentials().then(function (keys) {
    apiKeys = keys;
    firebase.initializeApp(apiKeys);
  });

  $('#fetch-weather-btn').on('click',()=>{
    let zipcode = $('#zipcode').val();
    currentWeatherData(zipcode).then((weatherData)=> {
      addCurrentWeatherToDOM(weatherData);
    });
  });

  $('#one-day-forcast').on('click',(e)=>{
    e.preventDefault();
    let zipcode = $('#zipcode').val();
    forecastWeatherData(zipcode, 1).then((weatherData)=> {
      addforecastToDOM(weatherData);
    });
  });

  $('#three-day-forcast').on('click',(e)=>{
    e.preventDefault();
    let zipcode = $('#zipcode').val();
    forecastWeatherData(zipcode, 3).then((weatherData)=> {
      addforecastToDOM(weatherData);
    });
  });

  $('#seven-day-forcast').on('click',(e)=>{
    e.preventDefault();
    let zipcode = $('#zipcode').val();
    forecastWeatherData(zipcode, 7).then((weatherData)=> {
      addforecastToDOM(weatherData);
    });
  });

  $('#registerButton').on('click', function () {
  let email = $('#inputEmail').val();
  let password = $('#inputPassword').val();
  let username = $('#inputUsername').val();
  let user = {
    email: email,
    password: password
  };
  FbAPI.registerUser(user).then(function (registerResponse) {
    let newUser = {
      username,
      uid: registerResponse.uid
    };
    return FbAPI.addUser(apiKeys, newUser);
  })
  .then(function (userResponse) {
    return FbAPI.loginUser(user);
  })
  .then(function (loginResponse) {
    uid = loginResponse.uid;
    createLogoutButton();
    $('#login-container').addClass('hide');
    $('#todo-container').removeClass('hide');
  });
});

$('#loginButton').on('click', function () {
  let email = $('#inputEmail').val();
  let password = $('#inputPassword').val();
  let user = {
    email: email,
    password: password
  };

  FbAPI.loginUser(user).then(function (loginResponse) {
    uid = loginResponse.uid;
    createLogoutButton();
    $('#login-container').addClass('hide');
    $('#weather-container').removeClass('hide');
  });
});

$("#logout-container").on('click', '#logoutButton', function () {
  FbAPI.logoutUser();
  uid ="";
  $('#incomplete-tasks').html('');
  $('#completed-tasks').html('');
  $('#inputEmail').val('');
  $('#inputPassword').val('');
  $('#inputUsername').val('');
  $('#login-container').removeClass('hide');
  $('#todo-container').addClass('hide');
});
});
