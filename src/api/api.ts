let $api: {(message: string, params?: {[key: string]: any}): string};

$api = (service: string, params?: {[key: string]: any}): string => {
    const services: {[service: string]: any} = {
        // Endpoints

    };
    if (typeof services[service] === 'string') {
        services[service] = {path: String(services[service])};
    }

    let url = services[service].path;
    if (params) {
        let query_params: {[key: string]: any} = {};
        let has_query_params = false;

        for (const [key, value] of Object.entries(params)) {
            let replaced = false;
            url = url.replaceAll('{' + key + '}', () => {
                replaced = true;
                return value;
            });
            if (!replaced) {
                has_query_params = true;
                query_params[key] = value;
            }
        }

        if (has_query_params) {
            let param = new URLSearchParams(query_params);
            url += '?' + param.toString();
        }
    }
    url = url.replaceAll('{lang}');

    return url;
};

export {$api};
