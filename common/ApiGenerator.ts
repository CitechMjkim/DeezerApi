import axios from 'axios';

export function setupApiInterceptors() {
  // 요청 로그
  axios.interceptors.request.use(request => {
    console.log('API Request:', {
      url: request.url,
      method: request.method,
      data: request.data,
      headers: request.headers,
    });
    return request;
  });

  // 응답 로그
  axios.interceptors.response.use(
    response => {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
      return response;
    },
    error => {
      if (error.response) {
        console.log('API Error Response:', {
          url: error.response.config.url,
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        console.log('API Error:', error.message);
      }
      return Promise.reject(error);
    }
  );
} 