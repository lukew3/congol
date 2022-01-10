let theme = [
	'#EDEDED',
	'blue',
	'red',
  'gray'
];

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

setTheme(theme);

module.exports = {
  getTheme,
  setTheme
}
