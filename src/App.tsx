import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import HealthcareBubblePlot from './components/BubblePlot';
import GDPLineChart from './components/LineMul';
import PercentageTileChart from './components/Percentage';
import './App.css';
import React, { useState } from 'react';

function App() {
  const developingCountries = [
    "Bangladesh",
    "Brazil",
    "Cambodia",
    "China",
    "Egypt",
    "Ethiopia",
    "Ghana",
    "India",
    "Indonesia",
    "Kenya",
    "Mozambique",
    "Nepal",
    "Nigeria",
    "Pakistan",
    "Philippines",
    "South Africa",
    "Tanzania",
    "Uganda",
    "Vietnam",
    "Zambia",
  ];


  const developedCountries = [
    "Australia",
    "Austria",
    "Belgium",
    "Canada",
    "Denmark",
    "Finland",
    "France",
    "Germany",
    "Ireland",
    "Israel",
    "Japan",
    "Netherlands",
    "New Zealand",
    "Norway",
    "Singapore",
    "South Korea",
    "Sweden",
    "Switzerland",
    "United Kingdom",
    "United States",
  ];


  return (
    <div>
      <h1>A Global Analysis of Healthcare Expenditure Trends and Socioeconomic Impact</h1>

      <div className="word-container">
        <h1>The Economic Landscape of Global Healthcare Spending</h1>
        <p>
        Good health is one of the most important parts of a good life, and investing in healthcare is key to keeping people healthy. Over the past few decades, the amount of money spent on healthcare worldwide has gone up steadily compared to global income, but not all countries spend the same. Developed nations like the United States put a much larger share of their GDP into healthcare—often nearly double what low-income countries spend. This big gap raises the question: what drives healthcare spending in different countries?

        </p>

        <p>
        In this project, we’re tackling two main goals. First, we’re diving into a long-term dataset (1880–2021) to explore trends in how much governments spend on healthcare as a percentage of GDP across the world. We’ll also look for patterns tied to major historical events. Second, we’re digging into the factors that influence healthcare spending, like tax revenue, and comparing how high-income and low-income countries approach it. By the end, we hope to better understand what drives healthcare spending, uncover inequalities, and shed light on how different nations invest in their people’s health over time.
        </p>

        <h1>Global Healthcare Investment: Economic Patterns, Disparities, and Influences</h1>
        <h2>Are there distinct patterns in healthcare funding between developed and developing nations?</h2>
              <h3>Line Chart: GDP per Capita vs. Government Healthcare Expenditure</h3>
              <p>
                Government health expenditure as a share of GDP, 1880 to 2021. This metric captures spending on
                government-funded healthcare systems and social health insurance.
              </p>
              <GDPLineChart />

        <h2>How do national economies influence healthcare spending?</h2>
            <h3>Percentage Area Chart</h3>
            <p>
            The healthcare expenditure as a percentage of GDP for various countries across different continents, 
            grouped by regions
            </p>
            <PercentageTileChart/>

        <h2>Does higher GDP per capita or greater tax revenue translate into increased investment in healthcare systems?</h2>

              <h3>Scatter Plot: Tax Revenue vs. Healthcare Spending 2021</h3>
              <p>
                This bubble plot visualizes the relationship between tax revenue, healthcare spending, and population 
                across regions. Bubble size represents population, and color distinguishes different regions.
              </p>
              <HealthcareBubblePlot />
        <h1>Observation</h1>
        <h2>Line Plot</h2>
        <ul>
        <li>
          <strong>Developing vs. Developed Country Data:</strong>
          <ul>
            <li>Developing countries have data starting from 2000.</li>
            <li>Developed countries, including the United States, have data available as far back as 1880.</li>
          </ul>
        </li>
        <li>
          <strong>United States: Key Healthcare Spending Trends:</strong>
          <ul>
            <li>
              <strong>1996-1999: Decrease in Healthcare Spending as a Share of GDP</strong>
              <ul>
                <li>
                  Despite overall increases in healthcare spending, GDP grew faster due to the rapid U.S. economic expansion driven by technology advancements, rising productivity, and strong consumer spending.
                </li>
                <li>
                  The <strong>Balanced Budget Act of 1997 (BBA)</strong> introduced significant cost-saving measures:
                  <ul>
                    <li>Reduced Medicare payments to providers.</li>
    
                  </ul>
                </li>
              </ul>
            </li>
            <li>
              <strong>1999-2013: Gradual Increase in Healthcare Spending</strong>
              <ul>
                <ul>
                  <li>Population growth.</li>
                  <li>An aging population requiring more healthcare services.</li>
                  <li>Rising healthcare service prices.</li>
                </ul>
              </ul>
            </li>
            <li>
              <strong>2013-2014: Sudden Increase in Healthcare Spending</strong>
              <ul>
                <li>
                  Marked by the implementation of the <strong>Affordable Care Act (ACA)</strong> (Obamacare):
                  <ul>
                    <li>Expanded Medicaid eligibility to individuals with incomes up to 138% of the federal poverty level.</li>
                  
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <strong>Global Trends in Healthcare Spending:</strong>
          <ul>
            <li>Most countries exhibit an upward trend in healthcare spending.</li>
            <li>
              The increase was particularly pronounced around <strong>2020</strong>, due to the global impact of the COVID-19 pandemic.
            </li>
          </ul>
        </li>
      </ul>

      <h2>Percentage Area Chart</h2>
      <h3>Tuvalu: Healthcare Spending (26.3% of GDP in 2021)</h3>
      <ul>
        <li>
          <strong>Geographical Challenges:</strong>
          <ul>
            <li>Remote island nation with healthcare services spread across dispersed atolls.</li>
            <li>Elevated costs for delivering medical care and resources due to geographical isolation.</li>
          </ul>
        </li>
        <li>
          <strong>High Prevalence of Non-Communicable Diseases (NCDs):</strong>
          <ul>
            <li>Includes chronic illnesses like diabetes, cardiovascular diseases, and respiratory conditions.</li>
            <li>
              Linked to lifestyle factors such as poor diet, physical inactivity, and tobacco/alcohol use.
            </li>
          </ul>
        </li>
      </ul>

      <h2>Scatter Plot</h2>
      <h3>Luxembourg: High Tax Revenue and Low Healthcare Expenditure (% of GDP)</h3>
      <ul>
        <li>
          <strong>High GDP Per Capita: </strong>
          <ul>
                <li>
                  Higher tax collection from corporations and individuals without imposing excessive tax rates.
                </li>
                <li>
                  Lower percentage of GDP spent on healthcare, even with substantial per capita healthcare spending,
                  because the GDP denominator is very large.
                </li>
          </ul>
        </li>
      </ul>

      </div>     
    </div>
  );
};

export default App
