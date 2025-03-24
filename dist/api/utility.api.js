import axios from 'axios';
import { prettyNum } from 'pretty-num';
import translate from '@vitalets/google-translate-api';
import google from '@victorsouzaleal/googlethis';
import { OrganicResult, search } from 'google-sr';
import Genius from 'genius-lyrics';
import qs from 'querystring';
import { timestampToDate } from '../utils/general.utils.js';
import { obterDadosBrasileiraoA, obterDadosBrasileiraoB } from '@victorsouzaleal/brasileirao';
import { JSDOM } from 'jsdom';
import UserAgent from 'user-agents';
import moment from 'moment-timezone';
import Fuse from 'fuse.js';
export async function animeReleases() {
    try {
        const URL_BASE = 'https://animedays.org/';
        const { data: animesResponse } = await axios.get(URL_BASE, { headers: { "User-Agent": new UserAgent().toString() } }).catch(() => {
            throw new Error("Houve um erro ao obter dados de animes, tente novamente mais tarde.");
        });
        const { window: { document } } = new JSDOM(animesResponse);
        let $animes = document.querySelectorAll('div.postbody > div:nth-child(2) > div.listupd.normal > div.excstf > article > div');
        let animes = [];
        $animes.forEach($anime => {
            var _a, _b, _c;
            let name = (_a = $anime.querySelector('a > div.tt > h2')) === null || _a === void 0 ? void 0 : _a.innerHTML;
            let episode = (_b = $anime.querySelector('a > div.limit > div.bt > span.epx')) === null || _b === void 0 ? void 0 : _b.innerHTML;
            let url = (_c = $anime.querySelector('a')) === null || _c === void 0 ? void 0 : _c.href;
            if (!name || !episode || !url)
                throw new Error("Houve um erro ao coletar os dados dos animes.");
            name = name.split("Episódio")[0];
            animes.push({
                name,
                episode,
                url
            });
        });
        return animes;
    }
    catch (err) {
        throw err;
    }
}
export async function mangaReleases() {
    try {
        const URL_BASE = 'https://mangabr.net/';
        const { data: mangasResponse } = await axios.get(URL_BASE, { headers: { "User-Agent": new UserAgent().toString() } }).catch(() => {
            throw new Error("Houve um erro ao obter dados de mangás, tente novamente mais tarde.");
        });
        const { window: { document } } = new JSDOM(mangasResponse);
        let $mangas = document.querySelectorAll('div.col-6.col-sm-3.col-md-3.col-lg-2.p-1');
        let mangas = [];
        $mangas.forEach($manga => {
            var _a, _b, _c;
            let name = (_a = $manga.querySelector('h3.chapter-title > span.series-name')) === null || _a === void 0 ? void 0 : _a.innerHTML.trim();
            let chapter = (_b = $manga.querySelector('h3.chapter-title > span.chapter-name')) === null || _b === void 0 ? void 0 : _b.innerHTML.trim();
            let url = `https://mangabr.net${(_c = $manga.querySelector('a.link-chapter')) === null || _c === void 0 ? void 0 : _c.getAttribute('href')}`;
            if (!name || !chapter)
                throw new Error("Houve um erro ao coletar os dados dos mangás.");
            mangas.push({
                name,
                chapter,
                url
            });
        });
        return mangas;
    }
    catch (err) {
        throw err;
    }
}
export async function brasileiraoTable(serie) {
    try {
        let table;
        if (serie == "A") {
            table = await obterDadosBrasileiraoA().catch(() => {
                throw new Error("Houve um erro ao obter a tabela da série A do Brasileirão, tente novamente mais tarde.");
            });
        }
        else if (serie == "B") {
            table = await obterDadosBrasileiraoB().catch(() => {
                throw new Error("Houve um erro ao obter a tabela da série B do Brasileirão, tente novamente mais tarde.");
            });
        }
        if (!table)
            throw new Error("Série não suportada");
        return table;
    }
    catch (err) {
        throw err;
    }
}
export async function moviedbTrendings(type = "movie") {
    try {
        let num = 0;
        const BASE_URL = `https://api.themoviedb.org/3/trending/${type}/day?api_key=6618ac868ff51ffa77d586ee89223f49&language=pt-BR`;
        const { data: movieDbResponse } = await axios.get(BASE_URL).catch(() => {
            throw new Error(`Houve um erro ao listar ${type === 'movie' ? "os filmes" : "as séries"}, tente novamente mais tarde.`);
        });
        const trendings = movieDbResponse.results.map((item) => {
            num++;
            return `${num}°: *${item.title || item.name}.*\n\`Sinopse:\` ${item.overview} \n`;
        }).join('\n');
        return trendings;
    }
    catch (err) {
        throw err;
    }
}
export async function calcExpression(expr) {
    try {
        const URL_BASE = 'https://api.mathjs.org/v4/';
        expr = expr.replace(/[Xx\xD7]/g, "*");
        expr = expr.replace(/\xF7/g, "/");
        expr = expr.replace(/,/g, ".");
        expr = expr.replace("em", "in");
        const { data: calcResponse } = await axios.post(URL_BASE, { expr }).catch(() => {
            throw new Error('Houve um erro ao obter resultado do cálculo, tente novamente mais tarde.');
        });
        let calcResult = calcResponse.result;
        if (calcResult == "NaN" || calcResult == "Infinity")
            throw new Error('Foi feita uma divisão por 0 ou algum outro cálculo inválido.');
        calcResult = calcResult.split(" ");
        calcResult[0] = (calcResult[0].includes("e")) ? prettyNum(calcResult[0]) : calcResult[0];
        calcResult = calcResult.join(" ");
        return calcResult;
    }
    catch (err) {
        throw err;
    }
}
export async function newsGoogle(lang = 'pt') {
    try {
        const newsList = await google.getTopNews(lang).catch(() => {
            throw new Error("Houve um erro ao obter notícias, tente novamente mais tarde.");
        });
        let newsResponse = [];
        for (let news of newsList.headline_stories) {
            newsResponse.push({
                title: news.title,
                published: news.published,
                author: news.by,
                url: news.url
            });
        }
        return newsResponse;
    }
    catch (err) {
        throw err;
    }
}
export async function translationGoogle(text, lang) {
    try {
        const translationResponse = await translate(text, { to: lang }).catch(() => {
            throw new Error('Houve um erro ao obter tradução, tente novamente mais tarde.');
        });
        return translationResponse.text;
    }
    catch (err) {
        throw err;
    }
}
export async function shortenUrl(url) {
    try {
        const URL_BASE = 'https://shorter.me/page/shorten';
        const { data: shortenResponse } = await axios.post(URL_BASE, qs.stringify({ url, alias: '', password: '' })).catch(() => {
            throw new Error(`Houve um erro ao obter link encurtado, tente novamente mais tarde.`);
        });
        if (!shortenResponse.data)
            throw new Error(`O link inserido é inválido e não foi possível encurtar.`);
        return shortenResponse.data;
    }
    catch (err) {
        throw err;
    }
}
export async function webSearchGoogle(texto) {
    try {
        const searchResults = await search({ query: texto, resultTypes: [OrganicResult] }).catch(() => {
            throw new Error("Houve um erro ao obter a pesquisa do Google, tente novamente mais tarde.");
        });
        if (!searchResults.length)
            throw new Error("Não foram encontrados resultados para esta pesquisa.");
        let searchResponse = [];
        for (let search of searchResults) {
            searchResponse.push({
                title: search.title,
                url: search.link,
                description: search.description
            });
        }
        return searchResponse;
    }
    catch (err) {
        throw err;
    }
}
export async function wheatherInfo(location) {
    try {
        const WEATHER_API_URL = `http://api.weatherapi.com/v1/forecast.json?key=516f58a20b6c4ad3986123104242805&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`;
        const { data: wheatherResult } = await axios.get(WEATHER_API_URL).catch(() => {
            throw new Error("Houve um erro ao obter dados de clima, tente novamente mais tarde.");
        });
        const { data: wheatherConditions } = await axios.get("https://www.weatherapi.com/docs/conditions.json", { responseType: 'json' }).catch(() => {
            throw new Error("Houve um erro ao obter dados de condições climáticas, tente novamente mais tarde.");
        });
        const currentCondition = wheatherConditions.find((condition) => condition.code === wheatherResult.current.condition.code).languages.find((language) => language.lang_iso == 'pt');
        let weatherResponse = {
            location: {
                name: wheatherResult.location.name,
                region: wheatherResult.location.region,
                country: wheatherResult.location.country,
                current_time: timestampToDate(wheatherResult.location.localtime_epoch * 1000)
            },
            current: {
                last_updated: timestampToDate(wheatherResult.current.last_updated_epoch * 1000),
                temp: `${wheatherResult.current.temp_c} C°`,
                feelslike: `${wheatherResult.current.feelslike_c} C°`,
                condition: wheatherResult.current.is_day ? currentCondition.day_text : currentCondition.night_text,
                wind: `${wheatherResult.current.wind_kph} Km/h`,
                humidity: `${wheatherResult.current.humidity} %`,
                cloud: `${wheatherResult.current.cloud} %`
            },
            forecast: []
        };
        wheatherResult.forecast.forecastday.forEach((forecast) => {
            const conditionDay = wheatherConditions.find((condition) => condition.code == forecast.day.condition.code).languages.find((lang) => lang.lang_iso == 'pt');
            const [year, month, day] = forecast.date.split("-");
            const forecastDay = {
                day: `${day}/${month}/${year}`,
                max: `${forecast.day.maxtemp_c} C°`,
                min: `${forecast.day.mintemp_c} C°`,
                avg: `${forecast.day.avgtemp_c} C°`,
                condition: `${conditionDay.day_text}`,
                max_wind: `${forecast.day.maxwind_kph} Km/h`,
                rain: `${forecast.day.daily_will_it_rain ? "Sim" : "Não"}`,
                chance_rain: `${forecast.day.daily_chance_of_rain} %`,
                snow: `${forecast.day.daily_will_it_snow ? "Sim" : "Não"}`,
                chance_snow: `${forecast.day.daily_chance_of_snow} %`,
                uv: forecast.day.uv
            };
            weatherResponse.forecast.push(forecastDay);
        });
        return weatherResponse;
    }
    catch (err) {
        throw err;
    }
}
export async function musicLyrics(text) {
    try {
        const geniusClient = new Genius.Client();
        const musicSearch = await geniusClient.songs.search(text).catch((err) => {
            if (err.message == "No result was found")
                throw new Error("A letra da música não foi encontrada");
            else
                throw new Error("Houve um erro ao obter a letra da música, tente novamente mais tarde.");
        });
        const musicResult = {
            title: musicSearch[0].title,
            artist: musicSearch[0].artist.name,
            image: musicSearch[0].artist.image,
            lyrics: await musicSearch[0].lyrics()
        };
        return musicResult;
    }
    catch (err) {
        throw err;
    }
}
export async function convertCurrency(currency, value) {
    try {
        const URL_BASE = 'https://economia.awesomeapi.com.br/json/last/';
        value = parseInt(value.toString().replace(",", "."));
        let params;
        if (isNaN(value))
            throw new Error('O valor não é um número válido.');
        else if (value > 1000000000000000)
            throw new Error('Quantidade muito alta, você provavelmente não tem todo esse dinheiro.');
        switch (currency) {
            case 'dolar':
                params = "USD-BRL,USD-EUR,USD-JPY";
                break;
            case 'euro':
                params = "EUR-BRL,EUR-USD,EUR-JPY";
                break;
            case 'iene':
                params = "JPY-BRL,JPY-USD,JPY-EUR";
                break;
            case 'real':
                params = "BRL-USD,BRL-EUR,BRL-JPY";
                break;
        }
        const { data: convertResponse } = await axios.get(URL_BASE + params).catch(() => {
            throw new Error('Houve um erro ao obter conversão de moeda, tente novamente mais tarde.');
        });
        let convertResult = {
            value: value,
            currency: currency,
            convertion: []
        };
        for (let convertion in convertResponse) {
            let currencyType = '';
            let currencySymbol = '';
            switch (convertResponse[convertion].codein) {
                case "BRL":
                    currencyType = "Real";
                    currencySymbol = "R$";
                    break;
                case "EUR":
                    currencyType = "Euro";
                    currencySymbol = "Є";
                    break;
                case "USD":
                    currencyType = "Dólar";
                    currencySymbol = "$";
                    break;
                case "JPY":
                    currencyType = "Iene";
                    currencySymbol = "¥";
                    break;
            }
            let arrayDateUpdated = convertResponse[convertion].create_date.split(" ")[0].split("-");
            let hourUpdated = convertResponse[convertion].create_date.split(" ")[1];
            convertResult.convertion.push({
                currency: currencyType,
                convertion_name: convertResponse[convertion].name,
                value_converted: (convertResponse[convertion].bid * value).toFixed(2),
                value_converted_formatted: `${currencySymbol} ${(convertResponse[convertion].bid * value).toFixed(2)}`,
                updated: `${arrayDateUpdated[2]}/${arrayDateUpdated[1]}/${arrayDateUpdated[0]} às ${hourUpdated}`
            });
        }
        return convertResult;
    }
    catch (err) {
        throw err;
    }
}
export async function infoDDD(ddd) {
    try {
        const URL_BASE = 'https://gist.githubusercontent.com/victorsouzaleal/ea89a42a9f912c988bbc12c1f3c2d110/raw/af37319b023503be780bb1b6a02c92bcba9e50cc/ddd.json';
        const { data: dddResponse } = await axios.get(URL_BASE).catch(() => {
            throw new Error("Houve um erro ao obter os dados do DDD, tente novamente mais tarde.");
        });
        const states = dddResponse.estados;
        const indexDDD = states.findIndex((state) => state.ddd.includes(ddd));
        if (indexDDD === -1)
            throw new Error("Este DDD não foi encontrado, certifique-se que ele é válido.");
        const response = {
            state: states[indexDDD].nome,
            region: states[indexDDD].regiao
        };
        return response;
    }
    catch (err) {
        throw err;
    }
}
export async function symbolsASCI() {
    try {
        const URL_BASE = 'https://gist.githubusercontent.com/victorsouzaleal/9a58a572233167587e11683aa3544c8a/raw/aea5d03d251359b61771ec87cb513360d9721b8b/tabela.txt';
        const { data: symbolsResponse } = await axios.get(URL_BASE).catch(() => {
            throw new Error('Houve um erro ao obter a tabela de caracteres, tente novamente mais tarde.');
        });
        return symbolsResponse;
    }
    catch (err) {
        throw err;
    }
}
export async function searchGame(gameTitle) {
    try {
        const LIBRARIES = [
            'https://hydralinks.cloud/sources/fitgirl.json',
            'https://hydralinks.cloud/sources/dodi.json',
            'https://hydralinks.cloud/sources/kaoskrew.json',
            'https://hydralinks.cloud/sources/onlinefix.json',
            'https://hydralinks.cloud/sources/steamrip.json',
            'https://hydralinks.cloud/sources/atop-games.json'
        ];
        let gamesList = [];
        for await (let library of LIBRARIES) {
            const libraryResponse = await axios.get(library, { responseType: 'json' });
            libraryResponse.data.downloads.forEach((game) => {
                gamesList.push({
                    uploader: libraryResponse.data.name,
                    ...game
                });
            });
        }
        const fuse = new Fuse(gamesList, { ignoreLocation: true, keys: ["title"], threshold: 0.1 });
        const resultList = fuse.search(gameTitle).map(result => result.item);
        resultList.forEach(result => {
            result.uploadDate = moment(result.uploadDate).format('DD/MM/YYYY');
        });
        return resultList;
    }
    catch (err) {
        throw err;
    }
}
