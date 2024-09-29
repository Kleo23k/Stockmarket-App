# Stocks Market Web App

This project displays a ranked list of companies by various financial metrics such as Market Cap, EBITDA, and more. 
The app allows users to search and filter stocks by name or sector, and view detailed stock information, including news, quotes, ESG score and more.
Additionally, the app features dynamic charts that change based on selected metrics like Revenue, Net Income , and other financial metrics.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Data Sources](#data-sources)
- [Dependencies](#dependencies)
- [Tools](#Tools)



## Installation

1. **Clone the repository and change directory:**
   ```bash
   git clone https://github.com/Kleo23k/Stocks.git
   cd Stocks
   
2. **Ensure you have Node.js installed. Install json-server globally**:
   ```bash
   npm install -g json-server

3. **If you encounter an error related to PowerShell's execution policy while running json-server, temporarily adjust the policy by running:**
   ```bash
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

4. **Open `stocks.html`:**
   - If you are using Visual Studio Code, right-click on `stocks.html` and select **Open with Live Server**. 

5. **Start the JSON Server to simulate the backend API with the provided `companies.json` file:**
     ```bash
     json-server --watch companies.json

## Usage
  - The app fetches data from the mock server (json-server),external APIS and displays it in a table format.
  - Navigate through pages using the "Next" and "Previous" buttons to explore more companies.
  - Use the search bar to filter stocks by company name or ticker.
  - Click on a company name to see more detailed information about the stock like esg score,news and chart.

  
## Features
  - View and Rank Stocks: Browse companies ranked by various financial metrics (Market Cap, EBITDA, Revenue Growth).
  - Search: Quickly search for companies by name or ticker.
  - Interactive Charts: Visualize key financial metrics with dynamic charts that update based on net income, employees, or revenue.
  - Pagination: Navigate through multiple pages of stock data.
  - Sector Filter: Filter companies by business sector.
  - Sortable Columns: Sort companies by market cap, employees, or revenue growth.

  
## Data Sources
The stock data is sourced from the companies.json file and served via json-server but more data is sourced from external APIS like Yahu Financials and Alpha Vantage.

## Tools
  - json-server: A simple, mock REST API server.
  - Bootstrap: Frontend CSS framework for styling.
  - Numeral.js: JavaScript library for formatting numbers.
  - Chart.js: Library for rendering interactive charts.


