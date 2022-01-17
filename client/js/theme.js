const { axiosApiInstance } = require('./axiosHelper.js');

let presets = {
	'2p': [
		{
			'board-bg-color': '#EDEDED',
			'p1-color': '#0000FF',
			'p2-color': '#FF0000',
			'grid-color': '#808080',
			'page-bg': '#E0E0E0'
		}
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
  return JSON.parse(localStorage.getItem('theme')) || presets['2p'];
}

const setTheme = (newTheme) => {
	localStorage.setItem('theme', JSON.stringify(newTheme));
  var r = document.querySelector(':root');
  r.style.setProperty('--board-bg-color', newTheme['board-bg-color']);
  r.style.setProperty('--p1-color', newTheme['p1-color']);
  r.style.setProperty('--p2-color', newTheme['p2-color']);
  r.style.setProperty('--grid-color', newTheme['grid-color']);
	r.style.setProperty('--page-bg', newTheme['page-bg']);
	axiosApiInstance.post('/api/setTheme', newTheme);
}

const setThemePreset = (presetName) => {
	setTheme(presets[presetName]);
}

setTheme(getTheme());
axiosApiInstance.get('/api/getTheme').then((res) => {
	if (Object.keys(res.data).length === presets['2p'].length)
		setTheme(res.data);
})

module.exports = {
  getTheme,
  setTheme,
	setThemePreset
}
