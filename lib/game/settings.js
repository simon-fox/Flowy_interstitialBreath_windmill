/* Game constants, asset paths, etc */

/* sizes: screen */
var screenWidth = 320;
var screenHeight = 568;
var screenScale = 1;

/* gamplay */
var paths = {
  breatheFeedback: 'media/Text_GoodGreatPerfect_132x83px_3f.png',
  breatheText: 'media/breatheBubble_146x51.png',
  font: 'media/invasionFont.png',
};

var _Settings = {
  anchor: '#canvas',
  fps: 60,
  gravity: 0,

 

  screen: {
    width: screenWidth,
    height: screenHeight,
    scale: screenScale
  },

  

  imageDefinitions: {


    breatheInText: {
      type: 'single',
      path: paths.breatheText,
      index: 0,
      width: 146,
      height: 51
    },

    breatheOutText: {
      type: 'single',
      path: paths.breatheText,
      index: 1,
      width: 146,
      height: 51
    },

    breatheFeedbackGood: {
      type: 'single',
      path: paths.breatheFeedback,
      index: 0,
      width: 132,
      height: 83
    },

    breatheFeedbackGreat: {
      type: 'single',
      path: paths.breatheFeedback,
      index: 1,
      width: 132,
      height: 83
    },

    breatheFeedbackPerfect: {
      type: 'single',
      path: paths.breatheFeedback,
      index: 2,
      width: 132,
      height: 83
    }

   
  }
};

ig.module('game.settings'
).requires(
).defines(
	function() {
		settings = _Settings;
	}
);

