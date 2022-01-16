let presets = {
	'2p': [
		'#EDEDED',
		'#0000FF',
		'#FF0000',
	  '#808080'
	],
	'solo': [
		'#EDEDED',
		'#000000',
		null,
	  '#808080'
	]
}

const getTheme = () => {
  return theme;
}

const setTheme = (newTheme) => {
  theme = newTheme;
  var r = document.querySelector(':root');
  r.style.setProperty('--board-bg-color', newTheme[0]);
  r.style.setProperty('--p1-color', newTheme[1]);
  r.style.setProperty('--p2-color', newTheme[2]);
  r.style.setProperty('--grid-color', newTheme[3]);
}

const setThemePreset = (presetName) => {
	setTheme(presets[presetName]);
}

setTheme(presets['2p']);

module.exports = {
  getTheme,
  setTheme,
	setThemePreset
}
