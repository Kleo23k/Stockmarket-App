
const KEY = "50091a9165msh046cf7d58a66076p113583jsn3c6b96f7236b"
const yahooURL = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/"
const axiosInstancePost = axios.create({
    baseURL: yahooURL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
        'x-rapidapi-key': KEY
    },
})

const axiosInstanceGet = axios.create({
    baseURL: yahooURL,
    headers: {
        "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
        "x-rapidapi-key": KEY
    },
})

const apiService = {
    async fetchQuotes(symbol) {
        try {
            const response = await axiosInstanceGet.get(`market/v2/get-quotes?region=US&symbols=${symbol}`);
            return response.data;  
        } catch (error) {
            console.error('Error fetching quotes:', error); 
        }
    },

    async fetchNews(symbol) {
        const data = { category: symbol };
        try {
            const response = await axiosInstancePost.post(`news/v2/list?region=US&snippetCount=8&s=${symbol}`, data);
            return response.data;
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    },

    async fetchScores(symbol){
        try {
            const response = await axiosInstanceGet.get(`stock/get-esg-scores?symbol=${symbol}&region=US&lang=en-US`)
            return response.data;
        } catch (error) {
            console.error("Error fetching Scores:",error)
        }
    }
};

export default apiService