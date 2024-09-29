
import apiService from "./apiService.js";
import getSector from "./dropDownItems.js";
import { verticalLinePlugin } from "./pluginChart.js";
import searchStocks from "./stocks.js";
import timeAgo from "./timeAgo.js";

const container = document.getElementById("main");
let lineChartCanvas = document.getElementById("lineChart"); 
const loadingIndicator = document.getElementById("loading");
const buttons = document.querySelectorAll(".btnGroup .btn");
const quotes = document.getElementById("quotes")
const esgChart = document.getElementById("esgChart")
const urlParams = new URLSearchParams(window.location.search);
const stockSymbol = urlParams.get("symbol");
const stockIndex = parseInt(urlParams.get("index"), 10);
const stockNews = document.getElementById("news") 

document.title = `${stockSymbol} Overview`
const KEY = "69403aa7f3msh5f6629b8e13a52bp102b14jsn5ee78012f3dd"
let chartInstance = null; 

async function getStockInformation() {
    try {
        const response = await fetch(`http://localhost:3000/${stockIndex}`);
        const companyData = await response.json();
        updateUi("Revenue",companyData, stockIndex + 1);
    } catch (error) {
        console.error(`Error fetching information`, error);
    }
}
getStockInformation();

async function getTimeSeries(filterBy) {
    try {
        const response = await fetch(`https://alpha-vantage.p.rapidapi.com/query?symbol=${stockSymbol}&function=INCOME_STATEMENT&datatype=json`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": "alpha-vantage.p.rapidapi.com",
                "x-rapidapi-key": KEY
            }
        });

        const historicalData = await response.json();
        let dates = [];
        let values = [];

        switch (filterBy) {
            case "Revenue":
                values = historicalData.annualReports.map(value => parseFloat(value.totalRevenue));
                break;
            case "Net-income":
                values = historicalData.annualReports.map(value => parseFloat(value.netIncome));
                break;
            case "Ebitda":
                values = historicalData.annualReports.map(value => parseFloat(value.ebitda));
                break;
            case "Gross-profit":
                values = historicalData.annualReports.map(value=>parseFloat(value.grossProfit))
                break;
            case "Profit-margin":
                values = historicalData.annualReports.map(value=>{
                    const netIncome = parseFloat(value.netIncome)
                    const totalRevenue = parseFloat(value.totalRevenue)
                    if(totalRevenue === 0) return
                    return (netIncome / totalRevenue) * 100
                })
                break;
            default:
                values = historicalData.annualReports.map(value => parseFloat(value.totalRevenue));
        }
        dates = historicalData.annualReports.map(date => date.fiscalDateEnding);
        return { dates, values };
    } catch (error) {
        console.error(`Error fetching data`, error);
    }
}

Chart.register(verticalLinePlugin);

async function renderChart(filterBy) {
    loadingIndicator.style.display = "flex";
    lineChartCanvas.style.opacity = "0.2"; 
    const { dates, values } = await getTimeSeries(filterBy);
    const ctx = lineChartCanvas.getContext("2d");

    if (chartInstance) {
        chartInstance.destroy(); 
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates.map(date => new Date(date)),
            datasets: [{
                label: `${filterBy} over time`,
                data: values,
                borderColor: 'yellow',
                backgroundColor: '#343e47', 
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: "year",
                        tooltipFormat: "dd/MM/yyyy",
                        displayFormats: {
                            year: "yyyy",
                            month: "MMM yyyy",
                            day: "MMM d"
                        }
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        color: "#ffffff"
                    },
                    grid: {
                        display: false 
                    }
                },
                y: {
                    ticks: {
                        callback: function(value) {
                            // Adjust formatting based on filterBy
                            if (filterBy === "Profit-margin") {
                                return `${value}%`; 
                            }
                            return `$${numeral(value).format('0a')}`;
                        },
                        font: {
                            size: 10
                        },
                        color: "#ffffff"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.3)",
                        borderWidth: 1
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    position: 'nearest',
                    callbacks: {
                        label: function(context) {
                            const date = new Date(context.parsed.x);
                            const year = date.getFullYear();
                            
                            let label = `${filterBy} in ${year}: `;
                            if (filterBy === "Profit-margin") {
                                label += `${context.raw.toFixed(2)}%`;
                            } else {
                                label += `$${numeral(context.raw).format('0.0a')}`;
                            }
                            return label;
                        }
                    }
                },
                verticalLinePlugin
            }
        }
    });

    loadingIndicator.style.display = "none";
    lineChartCanvas.style.backgroundColor = "#212529";
    lineChartCanvas.style.opacity = "1"; 
}

async function getQuotes() {
    quotes.innerHTML = "";
    try {
        const data = await apiService.fetchQuotes(stockSymbol)
        const { regularMarketPreviousClose, regularMarketOpen, bid, ask, regularMarketDayRange, fiftyTwoWeekRange, regularMarketVolume, averageDailyVolume3Month, marketCap, beta, trailingPE, epsTrailingTwelveMonths } = data.quoteResponse.result[0];
        const div = document.createElement("div");
        div.classList.add("row");
        div.innerHTML = `
            <div class="col-md-4 col-6">
                <div class="quote-row">
                    <h1>Previous Close</h1>
                    <p>${regularMarketPreviousClose}</p>
                </div>
                <hr class="doted-line">
                <div class="quote-row">
                    <h1>Open</h1>
                    <p>${regularMarketOpen}</p>
                </div>
                <hr class="doted-line">
                <div class="quote-row">
                    <h1>Bid</h1>
                    <p>${bid}</p>
                </div>
                <hr class="doted-line">
                <div class="quote-row">
                    <h1>Ask</h1>
                    <p>${ask}</p>
                </div>
                <hr class="doted-line">
            </div>
            <div class="col-md-4 col-6">
                <div class="quote-row">
                    <h1>Day's Range</h1>
                    <p>${regularMarketDayRange}</p>
                </div>
                <hr class="doted-line">
                <div class="quote-row">
                    <h1>52 Week Range</h1>
                    <p>${fiftyTwoWeekRange}</p>
                </div>
                <hr class="doted-line">
                <div class="quote-row">
                    <h1>Volume</h1>
                    <p>${numeral(regularMarketVolume).format("0.0a")}</p>
                </div>
                <hr class="doted-line">
                <div class="quote-row">
                    <h1>Avg. Volume</h1>
                    <p>${numeral(averageDailyVolume3Month).format("0.0a")}</p>
                </div>
                <hr class="doted-line">
            </div>
            <div class="col-md-4 col-12">
                <div class="quote-row-responsive">
                    <h1>Market Cap (intraday)</h1>
                    <p>${numeral(marketCap).format("0.0a")}</p>
                </div>
                <hr class="doted-line">
                <div class="quote-row-responsive">
                    <h1>Beta (5Y Monthly)</h1>
                    <p>${beta}</p>
                </div>
                <hr class="doted-line">
                <div class="quote-row-responsive">
                    <h1>PE Ratio</h1>
                    <p>${trailingPE.toFixed(2)}</p>
                </div>
                <hr class="doted-line">
                <div class="quote-row-responsive">
                    <h1>EPS</h1>
                    <p>${epsTrailingTwelveMonths}</p>
                </div>
                <hr class="doted-line">
            </div>
          
        `;
        quotes.appendChild(div);
        
    } catch (error) {
        console.error("Error fetching quotes", error);
    } 
}


async function getNews() {
    try {
        const news  = await apiService.fetchNews(stockSymbol)
        const { data: { main: { stream } } } = news;

        if (!stream || stream.length === 0) {
            console.error("No news items found.");
            return;
        }
        const row = document.createElement("div");
        const NewsTitle = document.createElement("div")
        NewsTitle.innerHTML = `<div class="py-2 Title"><strong> Recent News: ${stockSymbol}</strong></div><hr class="horizontal-fade">`
        row.className = "row"; 

        stream.forEach((item, index) => {
            const { content: { clickThroughUrl, provider, pubDate, thumbnail, title } } = item;
            const formattedDate = timeAgo(pubDate);
            
            if (!clickThroughUrl || !clickThroughUrl.url) {
                console.error(`Unavailable URL for item with index of: ${index}`);
                return;
            }
            const url = clickThroughUrl.url;
            const col = document.createElement("div");
            
            col.className = "col-md-6 col-12 py-3"; 
            col.innerHTML = `
                <a href="${url}"  target="_blank" class="d-flex flex-row" id="newsTag">
                    <div class="d-flex flex-column me-3">
                        <h1>${title}</h1>
                        <p>By ${provider.displayName} ● ${formattedDate}</p>
                    </div>
                    <div>
                        <img src="${thumbnail?.resolutions[0].url}" alt="${index} image" id="thumbnail"/>
                    </div>
                </a>
                <hr class="doted-line">
            `;

            row.appendChild(col); 
        });
        stockNews.appendChild(NewsTitle)
        stockNews.appendChild(row); 
        
    } catch (error) {
        console.error("Error fetching stock news:", error);
    }
}

async function getScores() {
    try {
        const data = await apiService.fetchScores(stockSymbol);
        const { quoteSummary: { result } } = data;
        if (!result?.[0]?.esgScores) return;
        const {
            environmentScore,
            socialScore,
            governanceScore,
            peerEnvironmentPerformance,
            peerGovernancePerformance,
            peerSocialPerformance,
            peerGroup,
            esgPerformance,
            percentile,
            totalEsg
        } = result[0].esgScores;

        const formatScore = (score) => score?.raw ? score.raw.toFixed(1) : 'N/A';

        // Format individual ESG scores
        const formattedEnv = formatScore(environmentScore);
        const formattedSoc = formatScore(socialScore);
        const formattedGov = formatScore(governanceScore);
        const formattedPercentile = formatScore(percentile);
        const formattedTotalEsg = formatScore(totalEsg);

        // Format peer performance averages
        const peerEnv = formatScore(peerEnvironmentPerformance?.avg);
        const peerGov = formatScore(peerGovernancePerformance?.avg);
        const peerSoc = formatScore(peerSocialPerformance?.avg);

        const checkAverage = (score, average) => {
            if (score === average) {
                return `Same as peer average of ${average}`;
            } else if (score > average) {
                return `Above peer average of ${average}`;
            } else {
                return `Below peer average of ${average}`;
            }
        };

        const getColor = (score) => {
            if (score < 30) return 'red';
            if (score >= 30 && score < 60) return 'orange';
            return 'green';
        };

        //Title for the ESG chart
        const ScoreTitle = document.createElement("div");
        ScoreTitle.innerHTML = `
            <div class="py-2 Title">
                ESG Score for ${stockSymbol} in ${peerGroup} peer group
            </div>
            <hr class="horizontal-fade">
        `;

        //Main ESG score container
        const div = document.createElement("div");
        div.innerHTML = `
            <div class="score-container row">
                <!-- Environment Score -->
                <div class="bar col-md-3 col-6" id="environmentBar">
                    <div class="container">
                        <span>Environment Score</span>
                        <div class="outer-bar">
                            <div class="inner-bar" style="width: ${formattedEnv}%; background-color: ${getColor(formattedEnv)};"></div>
                        </div>
                        <span class="score">${formattedEnv}/100</span>
                        <span id="average">${checkAverage(formattedEnv, peerEnv)}</span>
                    </div>
                </div>

                <!-- Social Score -->
                <div class="bar col-md-3 col-6" id="socialBar">
                    <div class="container">
                        <span>Social Score</span>
                        <div class="outer-bar">
                            <div class="inner-bar" style="width: ${formattedSoc}%; background-color: ${getColor(formattedSoc)};"></div>
                        </div>
                        <span class="score">${formattedSoc}/100</span>
                        <span id="average">${checkAverage(formattedSoc, peerSoc)}</span>
                    </div>
                </div>

                <!-- Governance Score -->
                <div class="bar col-md-3 col-6" id="governanceBar">
                    <div class="container">
                        <span>Governance Score</span>
                        <div class="outer-bar">
                            <div class="inner-bar" style="width: ${formattedGov}%; background-color: ${getColor(formattedGov)};"></div>
                        </div>
                        <span class="score">${formattedGov}/100</span>
                        <span id="average">${checkAverage(formattedGov, peerGov)}</span>
                    </div>
                </div>

                <!-- Total ESG Risk Score -->
                <div class="bar col-md-3 col-6" id="totalRiskScore">
                    <div class="container">
                        <span>Total ESG Risk Score</span>
                        <div class="Esg-Percentile d-flex justify-content-start align-items-center py-2">
                            <span id="totalESG">${formattedTotalEsg}</span>
                            <hr id="vertical-line">
                            <span class="percentile grey-color">${formattedPercentile}th Percentile</span>
                        </div>
                        <span class="esgPerformance grey-color">${esgPerformance}</span>
                    </div>
                </div>
            </div>
        `;

        esgChart.appendChild(ScoreTitle);
        esgChart.appendChild(div);

    } catch (error) {
        console.error("Error fetching stock scores:", error);
    }
}



function updateUi(filterBy = "Revenue", data, index) {
    const { City, Currentprice, Marketcap, Fulltimeemployees, Longbusinesssummary,Longname, Symbol, Sector, logoUrl } = data
    const row = document.createElement("div");
    row.innerHTML = `
       <div class="row  py-5 " id="company-information">
            <div class="col-md-3 col-6">
                <img src="${logoUrl}" alt="${Symbol} image">
                <h4>${Longname}</h4>
                <p>${Symbol}</p>
            </div>
            <div class="col-md-3 col-6">
                <h4>Rank</h4>
                <p>#${index}</p>
                <h4>Share price</h4>
                <p>$${Currentprice}</p>
            </div>
            <div class="col-md-3 col-6">
                <h4>Marketcap</h4>
                <p>$${numeral(Marketcap).format('0.0a')}</p>
                 <h4>Category</h4>
                
                <a>${Sector}</a>
            </div>
            <div class="col-md-3 col-6">
                <h4>City</h4>
                <p>${City}</p>
                <h4>Employees</h4>
                <p>${Fulltimeemployees.toLocaleString()}</p>
            </div>
            <div class="row py-3">    
                <div class=col>
                    <h4>Company Overview</h4>
                    <p>${Longbusinesssummary}</p>
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
}

buttons.forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        const filterBy = e.target.getAttribute("data-rank");
        renderChart(filterBy);
    });
});
getScores()
getSector()
searchStocks()
renderChart("Revenue")
getQuotes()
getNews()