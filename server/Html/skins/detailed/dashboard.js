﻿Funbit.Ets.Telemetry.Dashboard.prototype.initialize = function (skinConfig, utils) {
    //
    // skinConfig - a copy of the skin configuration from config.json
    // utils - an object containing several utility functions (see skin tutorial for more information)
    //

    // this function is called before everything else, 
    // so you may perform any DOM or resource initializations / image preloading here

    utils.preloadImages([
        'images/bg-off.png', 'images/bg-on.png',
        'images/blinker-left-off.png', 'images/blinker-left-on.png',
        'images/blinker-right-off.png', 'images/blinker-right-on.png',
        'images/cruise-off.png', 'images/cruise-on.png',
        'images/highbeam-off.png', 'images/highbeam-on.png',
        'images/lowbeam-off.png', 'images/lowbeam-on.png',
        'images/parklights-off.png', 'images/parklights-on.png',
        'images/trailer-off.png', 'images/trailer-on.png'
    ]);

    // return to menu by a click
    $(document).add('body').on('click', function () {
        window.history.back();
    });
}

Funbit.Ets.Telemetry.Dashboard.prototype.filter = function (data, utils) {
    //
    // data - telemetry data JSON object
    // utils - an object containing several utility functions (see skin tutorial for more information)
    //

    // This filter is used to change telemetry data 
    // before it is displayed on the dashboard.
    // You may convert km/h to mph, kilograms to tons, etc.

    data.hasJob = data.jobMarket != '';
    // round truck speed
    data.truck.speedRounded = Math.abs(data.truck.speed > 0
        ? Math.floor(data.truck.speed)
        : Math.round(data.truck.speed));
    data.truck.cruiseControlSpeedRounded = data.truck.cruiseControlOn
        ? Math.floor(data.truck.cruiseControlSpeed)
        : 0;
    // convert kg to t
    data.cargo.mass = data.hasJob ? (Math.round(data.cargo.mass / 1000.0) + 't') : '';
    // format odometer data as: 00000.0
    data.truck.odometer = utils.formatFloat(data.truck.odometer, 1);
    // convert gear to readable format
    data.truck.gear = data.truck.displayedGear; // use displayed gear
    data.truck.gear = data.truck.gear > 0
        ? 'D' + data.truck.gear
        : (data.truck.gear < 0 ? 'R' + Math.abs(data.truck.gear) : 'N');
    // convert rpm to rpm * 100
    data.truck.engineRpm = data.truck.engineRpm / 100;
    // calculate wear
    var wearSumPercent = data.truck.wearChassis * 100;
    wearSumPercent = Math.min(wearSumPercent, 100);
    data.truck.wearSum = Math.round(wearSumPercent) + '%';
    data.cargo.damage = Math.round(data.cargo.damage * 100) + '%';
	
    var nextRestStopTimeDate = new Date(data.game.nextRestStopTime);
    // nextRestStopTimeDate = minutes_with_leading_zeros(nextRestStopTimeDate);
    var hours = nextRestStopTimeDate.getUTCHours();   
    var minutes = (nextRestStopTimeDate.getUTCMinutes() < 10 ? '0' : '') + nextRestStopTimeDate.getUTCMinutes();
    // (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes()
    data.nextRestStopHhMm = hours + ':' + minutes;
    
    var JobRemainingTime = new Date(data.job.remainingTime);
    // JobRemainingTime = minutes_with_leading_zeros(JobRemainingTime);
    var hours = JobRemainingTime.getUTCHours();   
    var minutes = (JobRemainingTime.getUTCMinutes() < 10 ? '0' : '') + JobRemainingTime.getUTCMinutes();
    data.JobRemainingTimeHhMm = hours + ':' + minutes;
    
	var connectedTrailers = 0;
	wearSumPercent = 0;
	for (var i = 1; i <= data.game.maxTrailerCount; i++) {
		if (data['trailer' + i].present) {
			connectedTrailers++;
			wearSumPercent += data['trailer' + i].wearChassis * 100;
		}
	}
	data.job.trailerDamagePercent = Math.floor(wearSumPercent / connectedTrailers) + '%';
    // return changed data to the core for rendering
    return data;
};

Funbit.Ets.Telemetry.Dashboard.prototype.render = function (data, utils) {
    //
    // data - same data object as in the filter function
    // utils - an object containing several utility functions (see skin tutorial for more information)
    //

    // we don't have anything custom to render in this skin,
    // but you may use jQuery here to update DOM or CSS
}

function minutes_with_leading_zeros(dt) 
{ 
    return (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes();
}
