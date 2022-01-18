const { axiosApiInstance } = require('./axiosHelper.js');

let presets = {
	'2p': {
			'board-bg-color': '#EDEDED',
			'p1-color': '#0000FF',
			'p2-color': '#FF0000',
			'grid-color': '#808080',
			'page-bg': '#E0E0E0',
			'button-bg': '#C4C4C4',
			'text-color': '#000000'
	}
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

const setTheme = (newTheme, upload=true) => {
	localStorage.setItem('theme', JSON.stringify(newTheme));
  var r = document.querySelector(':root');
	Object.keys(newTheme).forEach((key) => {
		r.style.setProperty(`--${key}`, newTheme[key]);
		// Set values of settings colors
    $(`settingsColorPicker_${key}`).value = newTheme[key];
    $(`settingsColorText_${key}`).value = newTheme[key];
  })
	if (upload) axiosApiInstance.post('/api/setTheme', newTheme);
}

const setThemePreset = (presetName) => {
	setTheme(presets[presetName]);
}

setTheme(getTheme(), false);
axiosApiInstance.get('/api/getTheme').then((res) => {
	console.log(Object.keys(res.data).length)
	console.log(Object.keys(presets['2p']).length)
	if (Object.keys(res.data).length === Object.keys(presets['2p']).length)
		setTheme(res.data, false);
});

module.exports = {
  getTheme,
  setTheme,
	setThemePreset
}
