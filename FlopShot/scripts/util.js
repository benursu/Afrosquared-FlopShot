//////////////////////////////////////////////////////////////////////////
// require/import

const R = require('Reactive');
const Time = require('Time');



//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// framework

//////////////////////////////////////////////////////////////////////////
// sleep

export const sleep = (ms) => {
	return new Promise(resolve => { Time.setTimeout(resolve, ms) }); 
}



//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// number operations

//////////////////////////////////////////////////////////////////////////
// randomFloatBetween
export const randomFloatBetween = (min, max) => {
	return Math.random() * (max - min) + min;
}

//////////////////////////////////////////////////////////////////////////
// randomIntBetween
export const randomIntBetween = (min, max) => {
	// min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min);
}

//////////////////////////////////////////////////////////////////////////
// randomBoolean
export const randomBoolean = () => {
	if(Math.random() < 0.5){
		return true;
	}else{
		return false;
	}
}

//////////////////////////////////////////////////////////////////////////
// roundTo
/**
 * Rounds given number to the nearest line hight
 * @param {int || float} x - The number you want to round
 * @param {int} y - The number you want to round to
 * @return {int} The rounded value
 */
 export const roundTo = (x, y) => {
    return Math.round(x / y) * y;
}



//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// array operations

//////////////////////////////////////////////////////////////////////////
// shuffleArray

export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
	return array;
}



//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// graphing utils

//////////////////////////////////////////////////////////////////////////
// graphing operations

export const degToRad = (degrees) => {
	return degrees * (Math.PI/180);	
}

export const radToDeg = (radians) => {
	return radians * (180/Math.PI);
}

export const normalizeAngle = (radians) => {
    return radians - rotation360() * Math.floor(radians / rotation360());
}   

`
*nx, ny
.     -
.           -
.  angle          -
*cx,cy.................*x,y
`
export const rotate2dDegrees = (cx, cy, x, y, angle, clockwise = true) => {
	var radians = (Math.PI / 180) * angle;

	if(!clockwise){
        var radians = (Math.PI / -180) * angle;
    }else{
        var radians = (Math.PI / 180) * angle;
    }

	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
	var ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
	return {x: nx, y: ny};
}

export const rotate2dRadians = (cx, cy, x, y, radians, clockwise = true) => {
	if(!clockwise){
        radians = -radians;
	}

	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
	var ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
	return {x: nx, y: ny};
}

export const distanceBetween2d = (pos1, pos2) => {
    return Math.sqrt( Math.pow((pos1.x- pos2.x), 2) + Math.pow((pos1.y-pos2.y), 2) );
} 

export const angleBetween2d = (pos1, pos2) => {
    return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
} 

export const getPositionAlongTheLine = (pos1, pos2, percentage) => {
    return {x: pos1.x * (1.0 - percentage) + pos2.x * percentage, y: pos1.y * (1.0 - percentage) + pos2.y * percentage};
}

//////////////////////////////////////////////////////////////////////////
// graphing constants

export const rotation45 = () => {
	return Math.PI / 4;
}

export const rotation90 = () => {
	return Math.PI / 2;
}

export const rotation180 = () => {
	return Math.PI;
}

export const rotation270 = () => {
	return (Math.PI / 4) + (Math.PI / 2);
}

export const rotation360 = () => {
	return Math.PI * 2;
}

export const vectorForward = () => {
	return R.vector(1, 0, 0);
}



//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// grammar operations

export const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
