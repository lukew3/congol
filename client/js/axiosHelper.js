const axios = require('axios');

const axiosApiInstance = axios.create();

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    const access_token = localStorage.getItem('access_token');
    if (access_token) {
      config.headers = {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    } else {
      config.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
    return config;
  },
  error => {
    Promise.reject(error)
});

// Response interceptor for API calls
// Currently not being used because tokens are not expiring
/*
axiosApiInstance.interceptors.response.use((response) => {
  return response
}, async function (error) {
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    //console.log("Refreshing access token");
    const refresh_token = localStorage.getItem('refresh_token');
    await axios.post(`/api/refresh`, {},
          { headers: { Authorization: `Bearer ${refresh_token}` }}
        ).then(response => {
          localStorage.setItem('access_token', response.data.accessToken);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.accessToken;
        }).catch(error => {
          console.log(error);
          axios.defaults.headers.common['Authorization'] = 'Bearer failed';
        })
    return axiosApiInstance(originalRequest);
  }
  return Promise.reject(error);
});
*/

module.exports = {
  axiosApiInstance
};
