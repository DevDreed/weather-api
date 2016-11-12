"use strict";

var FbAPI = (function (oldFirebase) {

  oldFirebase.getForecasts = function (apiKeys, uid) {
    return new Promise((resolve, reject) => {
      $.ajax({
        method:'GET',
        url:`${apiKeys.databaseURL}/forecasts.json?orderBy="uid"&equalTo="${uid}"`
      }).then((response)=>{
        let items = [];
         Object.keys(response).map(key => {
           response[key].id = key;
           items.push(response[key]);
         });
        resolve(items);
      }, (error) => {
        console.log(error);
      });
    });
  };

  oldFirebase.addForecast = function (apiKeys, newItem) {
    return new Promise((resolve, reject) => {
      $.ajax({
        method:'POST',
        url:`${apiKeys.databaseURL}/forecasts.json`,
        data: JSON.stringify(newItem),
        dataType: 'json'
      }).then((response)=>{
        console.log("response from POST", response);
        resolve(response);
      }, (error) => {
        console.log(error);
      });
    });
  };

  oldFirebase.deleteForecast = function (apiKeys, itemId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        method:'DELETE',
        url:`${apiKeys.databaseURL}/forecasts/${itemId}.json`
      }).then((response)=>{
        console.log("response from DELETE", response);
        resolve(response);
      }, (error) => {
        console.log(error);
      });
    });
  };

  return oldFirebase;
})(FbAPI || {});
