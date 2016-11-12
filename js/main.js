"use strict";


let apiKeys = {};
let uid = "";
let forecasts = {};

let currentWeatherData = (zipcode) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'GET',
            url: 'apiKeys.json'
        }).then((response) => {
            apiKeys = response;
            let authHeader = "&APPID=" + apiKeys.APPID;

            $.ajax({
                method: 'GET',
                url: `http://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&units=imperial${authHeader}`
            }).then((res) => {
                resolve(res);
            }, (errorResponse) => {
                console.log('errorResponse', errorResponse);
                reject(errorResponse);
            });
        }, (errorResponse) => {
            console.log('errorResponse', errorResponse);
            reject(errorResponse);
        });
    });
};

let forecastWeatherData = (zipcode, numDays) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'GET',
            url: 'apiKeys.json'
        }).then((response) => {
            apiKeys = response;
            let authHeader = "&APPID=" + apiKeys.APPID;

            $.ajax({
                method: 'GET',
                url: `http://api.openweathermap.org/data/2.5/forecast/daily?zip=${zipcode},us&mode=json&units=imperial&cnt=${numDays}${authHeader}`
            }).then((res) => {
                forecasts = res.list;
                resolve(res);
            }, (errorResponse) => {
                console.log('errorResponse', errorResponse);
                reject(errorResponse);
            });
        }, (errorResponse) => {
            console.log('errorResponse', errorResponse);
            reject(errorResponse);
        });
    });
};

let showSavedForecasts = () => {
    $("#saved-forecasts").empty();
    let forecastsHTML = "";
    FbAPI.getForecasts(apiKeys, uid).then((forecasts) => {
        forecastsHTML = forecasts.map(forecast => {
            return `<div class="forecast-card col-md-4">
      <div>High: ${forecast.high}&deg;F</div>
      <div>Low: ${forecast.low}&deg;F</div>
      <div>Wind Speed: ${forecast.speed}</div>
      <div>Wind Degrees: ${forecast.degrees}</div>
      <div>Pressure: ${forecast.pressure}</div>
      <div>Conditions: ${forecast.conditions}</div>
      <div><button class="btn btn-danger col-xs-6 delete" data-fbid="${forecast.id}">Delete</button></div>
    </div>`;
        }).join('');
        $("#saved-forecasts").append(forecastsHTML);
    });
};

function createLogoutButton() {
    FbAPI.getUser(apiKeys, uid).then(function(userResponse) {
        $('#logout-container').html('');
        let currentUsername = userResponse.username;
        let logoutButton = `<button class="btn btn-danger" id="logoutButton">Logout ${currentUsername}</button>`;
        $('#logout-container').append(logoutButton);
    });
}

function addCurrentWeatherToDOM(weatherData) {
    $('#current-weather').empty();
    let finalHTML = `<div><span>${weatherData.name}</span></div>`;
    finalHTML += `<div>Temperature: ${weatherData.main.temp}&deg;F</div>`;
    finalHTML += `<div>Conditions: ${weatherData.weather[0].main}</div>`;
    finalHTML += `<div>Pressure: ${weatherData.main.pressure}</div>`;
    finalHTML += `<div>Wind Speed: ${weatherData.wind.speed}</div>`;
    $('#current-weather').append(finalHTML);
}

function addforecastToDOM(weatherData) {
    $('#forecast-container').empty();
    let forecasts = weatherData.list;
    let forecastHTML = forecasts.map((forecast, index) => {
        return `<div class="forecast-card col-md-4">
    <div>High: ${forecast.temp.max}&deg;F</div>
    <div>Low: ${forecast.temp.min}&deg;F</div>
    <div>Wind Speed: ${forecast.speed}</div>
    <div>Wind Degrees: ${forecast.deg}</div>
    <div>Pressure: ${forecast.pressure}</div>
    <div>Conditions: ${forecast.weather[0].main}</div>
    <div><a href="" class="save-forecast" index=${index}>Save</a></div>
  </div>`;
    }).join('');


    $('#forecast-container').append(forecastHTML);
}

$(document).ready(function() {

    FbAPI.firebaseCredentials().then(function(keys) {
        apiKeys = keys;
        firebase.initializeApp(apiKeys);
    });

    $('#fetch-weather-btn').on('click', () => {
        let zipcode = $('#zipcode').val();
        currentWeatherData(zipcode).then((weatherData) => {
            addCurrentWeatherToDOM(weatherData);
        });
    });

    $('#one-day-forcast').on('click', (e) => {
        e.preventDefault();
        let zipcode = $('#zipcode').val();
        forecastWeatherData(zipcode, 1).then((weatherData) => {
            addforecastToDOM(weatherData);
        });
    });

    $('#three-day-forcast').on('click', (e) => {
        e.preventDefault();
        let zipcode = $('#zipcode').val();
        forecastWeatherData(zipcode, 3).then((weatherData) => {
            addforecastToDOM(weatherData);
        });
    });

    $('#seven-day-forcast').on('click', (e) => {
        e.preventDefault();
        let zipcode = $('#zipcode').val();
        forecastWeatherData(zipcode, 7).then((weatherData) => {
            addforecastToDOM(weatherData);
        });
    });

    $(document).on('click', '.save-forecast', (e) => {
        e.preventDefault();
        let index = e.target.getAttribute('index');
        let forecast = forecasts[index];
        let newForecast = {
            uid,
            high: forecast.temp.max,
            low: forecast.temp.min,
            speed: forecast.speed,
            degrees: forecast.deg,
            pressure: forecast.pressure,
            conditions: forecast.weather[0].main,
        };
        FbAPI.addForecast(apiKeys, newForecast).then(()=> showSavedForecasts());

    });

    $(document).on('click', '.delete', function() {
        let itemId = $(this).data("fbid");
        FbAPI.deleteForecast(apiKeys, itemId).then(function() {
            showSavedForecasts();
        });
    });

    $('#show-saved-forecasts-btn').on('click', ()=>{
        if($('#saved-forecasts-container').hasClass('hide')){
            $('#saved-forecasts-container').removeClass('hide');
            $('#show-saved-forecasts-btn').text("Hide Saved Forecasts");
        }else{
            $('#saved-forecasts-container').addClass('hide');
            $('#show-saved-forecasts-btn').text("Show Saved Forecasts");
        }
    });

    $('#registerButton').on('click', function() {
        let email = $('#inputEmail').val();
        let password = $('#inputPassword').val();
        let username = $('#inputUsername').val();
        let user = {
            email: email,
            password: password
        };
        FbAPI.registerUser(user).then(function(registerResponse) {
                let newUser = {
                    username,
                    uid: registerResponse.uid
                };
                return FbAPI.addUser(apiKeys, newUser);
            })
            .then(function(userResponse) {
                return FbAPI.loginUser(user);
            })
            .then(function(loginResponse) {
                uid = loginResponse.uid;
                createLogoutButton();
                showSavedForecasts();
                $('#login-container').addClass('hide');
                $('#todo-container').removeClass('hide');
            });
    });

    $('#loginButton').on('click', function() {
        let email = $('#inputEmail').val();
        let password = $('#inputPassword').val();
        let user = {
            email: email,
            password: password
        };

        FbAPI.loginUser(user).then(function(loginResponse) {
            uid = loginResponse.uid;
            createLogoutButton();
            showSavedForecasts();
            $('#login-container').addClass('hide');
            $('#weather-container').removeClass('hide');
        });
    });

    $("#logout-container").on('click', '#logoutButton', function() {
        FbAPI.logoutUser();
        uid = "";
        $('#incomplete-tasks').html('');
        $('#completed-tasks').html('');
        $('#inputEmail').val('');
        $('#inputPassword').val('');
        $('#inputUsername').val('');
        $('#login-container').removeClass('hide');
        $('#todo-container').addClass('hide');
    });
});
