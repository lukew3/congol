import axios from 'axios';

const axiosApiInstance = axios.create();

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    const access_token = window.localstorage.getItem('access_token') ? window.localstorage.getItem('access_token') : null;
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
axiosApiInstance.interceptors.response.use((response) => {
  return response
}, async function (error) {
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    //console.log("Refreshing access token");
    const refresh_token = window.localstorage.getItem('refresh_token') ? window.localstorage.getItem('refresh_token') : null;
    await axios.post(`/api/refresh`, {},
          { headers: { Authorization: `Bearer ${refresh_token}` }}
        ).then(response => {
          window.localstorage.setItem('access_token', response.data.access_token);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access_token;
        }).catch(error => {
          console.log(error);
          axios.defaults.headers.common['Authorization'] = 'Bearer failed';
        })
    return axiosApiInstance(originalRequest);
  }
  return Promise.reject(error);
});

module.exports = {
  axiosApiInstance
};
