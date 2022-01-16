const { axiosApiInstance } = require('./axiosHelper.js');

let presets = {
	'2p': [
		'#EDEDED',
		'#0000FF',
		'#FF0000',
	  '#808080',
		'#E0E0E0'
	],
	/*
	'solo': [
		'#EDEDED',
		'#000000',
		null,
	  '#808080'
	]
	*/
}

const getTheme = () => {
  return JSON.parse(localStorage.getItem('theme'));
}

const setTheme = (newTheme) => {
	localStorage.setItem('theme', JSON.stringify(newTheme));
  var r = document.querySelector(':root');
  r.style.setProperty('--board-bg-color', newTheme[0]);
  r.style.setProperty('--p1-color', newTheme[1]);
  r.style.setProperty('--p2-color', newTheme[2]);
  r.style.setProperty('--grid-color', newTheme[3]);
	r.style.setProperty('--page-bg', newTheme[4]);
}

const setThemePreset = (presetName) => {
	setTheme(presets[presetName]);
}

setTheme(getTheme());
axiosApiInstance.get('/api/getTheme').then((res) => {
	setTheme(res.data);
})

module.exports = {
  getTheme,
  setTheme,
	setThemePreset
}
