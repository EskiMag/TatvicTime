(function () { 'use strict';

	var msInS = 1000;
	var msInM = msInS * 60;
	var msInH = msInM * 60;
	var backgroundColors = ["black", "blue", "red", "white", "yellow"];
	var textColors = ["white", "white", "black", "black", "black"];
	var tatvaNames = ["ÁKAŠA", "VAYU", "TEJAS", "PRITHIVI", "APAS"];
	var tatvasCount = tatvaNames.length;
	var tatvaLengthInM = 24;
	var tatvaLengthInS = tatvaLengthInM * 60;
	var tatvaLengthInMs = tatvaLengthInS * 1000;

	var Tatvic = {
		cachedPosition: null,
		updatingInterval: null,
	};

	Tatvic.handleError = function (error) {
		window.document.body.innerText = "ERROR: " + JSON.stringify(error);
	}

	Tatvic.rescheduleInterval = function () {
		clearInterval(Tatvic.updatingInterval);
	    Tatvic.updatingInterval = setInterval(Tatvic.updateData, 1000);
	}

	Tatvic.handlePosition = function (position) {
		Tatvic.cachedPosition = position;
		Tatvic.hideLoaderAndShowData();
	}

	Tatvic.hideLoaderAndShowData = function () {
		Tatvic.updateData();
		window.document.getElementById("loader").style.visibility = "hidden";
		window.document.getElementById("tatvic-data").style.visibility = "visible";
		Tatvic.rescheduleInterval();
	}

	Tatvic.updateData = function () {
		var nowDate = new Date();
		var sunrise = Tatvic.sunriseForDateAndPosition(nowDate, Tatvic.cachedPosition);
		var tatvaIndex = Tatvic.tatvaIndexForDateAndPosition(nowDate, Tatvic.cachedPosition);
		var tatvaName = tatvaNames[tatvaIndex];
		var msLeft = Tatvic.msUntilEndOfActualTatvaForPosition(Tatvic.cachedPosition);

		Tatvic.updateColorsWithTatvaIndex(tatvaIndex);

		Tatvic.updateTimeLeftWithMs(msLeft);
		Tatvic.updateTatvaNameWithTatvaName(tatvaName);
		Tatvic.updateSunriseWithSunrise(sunrise);
		Tatvic.updatePositionWithPosition(Tatvic.cachedPosition);
	}

	Tatvic.updateTimeLeftWithMs = function (msLeft) {
		window.document.getElementById('until-next-tatva').innerText = Tatvic.msToTime(msLeft);
	}

	Tatvic.updateColorsWithTatvaIndex = function (tatvaIndex) {
		window.document.body.style.backgroundColor = backgroundColors[tatvaIndex];
		window.document.body.style.color = textColors[tatvaIndex];	
	}

	Tatvic.updateSunriseWithSunrise = function (sunrise) {
		window.document.getElementById('sunrise-time').innerText = Tatvic.timeFromDate(sunrise);	
	}

	Tatvic.updateTatvaNameWithTatvaName = function (tatvaName) {
		window.document.getElementById('actual-tatva').innerText = tatvaName;
	}

	Tatvic.updatePositionWithPosition = function (position) {
		window.document.getElementById('latitude').innerText = position.coords.latitude;
		window.document.getElementById('longitude').innerText = position.coords.longitude;
	}

	Tatvic.sunriseForDateAndPosition = function (date, position) {
		var times = SunCalc.getTimes(date, position.coords.latitude, position.coords.longitude);
		return times.sunrise;
	}

	Tatvic.msSinceSunriseForDateAndPosition = function (date, position) {
		var sunriseForDate = Tatvic.sunriseForDateAndPosition(date, position);	
		var msFromSunrise = new Date() - sunriseForDate;

		return msFromSunrise;
	}

	Tatvic.msUntilEndOfActualTatvaForPosition = function (position) {
		var msFromSunrise = Tatvic.msSinceSunriseForDateAndPosition(new Date(), position);
		var msAlreadyPassedFromActualTatva = msFromSunrise % tatvaLengthInMs;
		var msLeftForActualTatva = tatvaLengthInMs - msAlreadyPassedFromActualTatva;

		return msLeftForActualTatva;
	}

	Tatvic.tatvaIndexForDateAndPosition = function (date, position) {
		var msFromSunrise = Tatvic.msSinceSunriseForDateAndPosition(date, position);
		var actualTatvaIndex = msFromSunrise / tatvaLengthInMs;
		var tatvaOfTheDayIndex = Math.floor(actualTatvaIndex);
		var actualTatvaIndex = tatvaOfTheDayIndex % tatvasCount;

		return actualTatvaIndex;
	}

	Tatvic.timeFromDate = function (date) {
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();

	    return Tatvic.formatHMS(h, m, s);
	}

	Tatvic.msToTime = function (ms){
		var time = "";
		
		var h = Math.floor(ms / msInH);
		ms -= h * msInH;
		var m = Math.floor(ms / msInM);
		ms -= m * msInM;
		var s = Math.floor(ms / msInS);
		ms -= s * msInS;

		return Tatvic.formatHMS(h, m, s);
	}

	Tatvic.formatHMS = function (h, m, s) {
		return Tatvic.zeroPad(h) + ":" + Tatvic.zeroPad(m) + ":" + Tatvic.zeroPad(s);	
	}

	Tatvic.zeroPad = function (number){
		return ("00" + number).slice(-2);
	}

// export as AMD module / Node module / browser variable
if (typeof define === 'function' && define.amd) define(Tatvic);
else if (typeof module !== 'undefined') module.exports = Tatvic;
else window.Tatvic = Tatvic;

}());