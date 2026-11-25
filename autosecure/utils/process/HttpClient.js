const axios = require("axios");
const http = require("http");
const https = require("https");
const { HttpProxyAgent } = require('http-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

const config = require("../../../config.json");

const defaultHttpAgent = new http.Agent({ keepAlive: true, keepAliveMsecs: 15000, maxSockets: 64 });
const defaultHttpsAgent = new https.Agent({ keepAlive: true, keepAliveMsecs: 15000, maxSockets: 64 });
const proxyAgentCache = new Map();

function getProxyAgents(proxyUrl) {
    let cached = proxyAgentCache.get(proxyUrl);
    if (!cached) {
        cached = {
            httpAgent: new HttpProxyAgent(proxyUrl, { keepAlive: true, keepAliveMsecs: 15000 }),
            httpsAgent: new HttpsProxyAgent(proxyUrl, { keepAlive: true, keepAliveMsecs: 15000 })
        };
        proxyAgentCache.set(proxyUrl, cached);
    }
    return cached;
}

function isValidUrl(urlString) {
    try {
        new URL(urlString);
        return true;
    } catch (e) {
        return false;
    }
}

class HttpClient {
    constructor() {
        this.cookies = [];
        this.axios = axios.create({
            timeout: 10000,
            maxRedirects: 0,
            withCredentials: true,
            httpAgent: defaultHttpAgent,
            httpsAgent: defaultHttpsAgent,
            validateStatus: (status) => status >= 200 && status < 600,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1"
            }
        });

        this.axios.interceptors.request.use(axiosConfig => {
            if (this.cookies.length > 0) {
                axiosConfig.headers['Cookie'] = this.cookies.join("; ");
            }
            return axiosConfig;
        });

        this.axios.interceptors.response.use(response => {
            const setCookieHeader = response.headers['set-cookie'];
            if (setCookieHeader) {
                setCookieHeader.forEach(cookie => this.setCookie(cookie));
            }
            return response;
        });

        this.axios.interceptors.request.use(async (axiosConfig) => {
            if (config.useproxy === true && axiosConfig.proxy !== false && !axiosConfig.noproxy) {
                try {
                    if (config.proxy) {
                        const [PROXY_HOST, PROXY_PORT, PROXY_USER, PROXY_PASS] = config.proxy.split(':');
                        const proxyUrl = `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`;
                        const { httpAgent, httpsAgent } = getProxyAgents(proxyUrl);
                        axiosConfig.httpAgent = httpAgent;
                        axiosConfig.httpsAgent = httpsAgent;
                    }
                } catch (error) {
                    console.error('Error setting up proxy for request:', error);
                }
            }
            return axiosConfig;
        });
    }

    getCookie(cName) {
        const cookie = this.cookies.find(cookie => cookie.startsWith(`${cName}=`));
        return cookie ? cookie.split(';')[0].split('=')[1] : null;
    }

    setCookie(cookie) {
        const [cName] = cookie.split("=");
        const cookieIndex = this.cookies.findIndex(c => c.startsWith(`${cName}=`));
        if (cookieIndex !== -1) {
            this.cookies[cookieIndex] = cookie;
        } else {
            this.cookies.push(cookie);
        }
    }

    deleteCookie(cName) {
        this.cookies = this.cookies.filter(cookie => !cookie.startsWith(`${cName}=`));
    }

    clearCookies() {
        this.cookies = [];
    }

    async get(url, axiosConfig = {}, retries = 2) {
        if (!isValidUrl(url)) throw new Error(`Invalid URL ${url}`);
        return this._requestWithRetry('get', url, axiosConfig, retries);
    }

    async post(url, data, axiosConfig = {}, retries = 2) {
        if (!isValidUrl(url)) throw new Error("Invalid URL");
        return this._requestWithRetry('post', url, data, axiosConfig, retries);
    }

    async put(url, data, axiosConfig = {}, retries = 2) {
        if (!isValidUrl(url)) throw new Error("Invalid URL");
        return this._requestWithRetry('put', url, data, axiosConfig, retries);
    }

    async delete(url, axiosConfig = {}, retries = 2) {
        if (!isValidUrl(url)) throw new Error("Invalid URL");
        return this._requestWithRetry('delete', url, axiosConfig, retries);
    }

    async _requestWithRetry(method, url, ...args) {
        const retries = args[args.length - 1];
        const requestArgs = args.slice(0, -1);
        let useProxy = false;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                if (useProxy && attempt > 0) {
                    console.log(`Retry ${attempt} failed with proxy. Attempting without proxy...`);
                    const configWithoutProxy = { ...requestArgs[requestArgs.length - 1] };
                    delete configWithoutProxy.httpAgent;
                    delete configWithoutProxy.httpsAgent;
                    const finalArgs = [...requestArgs.slice(0, -1), configWithoutProxy];
                    return await this.axios[method](url, ...finalArgs);
                }
                
                return await this.axios[method](url, ...requestArgs);
            } catch (error) {
                console.log(`Retry ${attempt + 1} failed${useProxy ? ' with proxy' : ''}. ${attempt < retries - 1 ? 'Retrying.' : 'All retries exhausted.'}`);
                
                if (attempt === retries - 1) {
                    if (useProxy) {
                        try {
                            console.log('Proxy failed, attempting request without proxy...');
                            const configWithoutProxy = { ...requestArgs[requestArgs.length - 1] };
                            delete configWithoutProxy.httpAgent;
                            delete configWithoutProxy.httpsAgent;
                            const finalArgs = [...requestArgs.slice(0, -1), configWithoutProxy];
                            return await this.axios[method](url, ...finalArgs);
                        } catch (finalError) {
                            throw finalError;
                        }
                    }
                    throw error;
                }

                await new Promise(resolve => setTimeout(resolve, 350 * (attempt + 1)));
            }
        }
    }
}

module.exports = HttpClient;