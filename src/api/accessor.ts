import axios, {AxiosError, AxiosResponse} from 'axios';

const $axios = axios.create({
    baseURL: '',
});

$axios.interceptors.request.use(
    async config => {
        // const token = await AsyncStorage.getItem('token');
        // if (config.url && token) {
        //   config.headers['X-Authorization'] = `Bearer ${token}`;
        // }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    },
);

$axios.interceptors.response.use(
    async (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    },
);

export default $axios;
