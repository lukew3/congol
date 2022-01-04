const loadUser = (username=undefined) => {
  if (!username)
    username = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
  console.log(username)
}
