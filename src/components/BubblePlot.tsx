import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';

interface DataPoint {
  country: string;
  taxRevenue: number;
  healthExpenditure: number;
  population: number;
  continent: string;
}

interface ComponentSize {
  width: number;
  height: number;
}

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export default function CountryBubblePlot() {
  const [data, setData] = useState<DataPoint[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ComponentSize>({ width: 0, height: 0 });
  const margin: Margin = { top: 40, right: 120, bottom: 60, left: 80 }; // Adjusted margins for labels
  const chartHeight = 500;

  const onResize = useDebounceCallback((size: ComponentSize) => setSize(size), 200);
  useResizeObserver({ ref: chartRef, onResize });

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await d3.csv('/data/tax.csv', d => ({
          country: d.Entity as string,
          taxRevenue: +d['Tax revenues per capita (current international $)'],
          healthExpenditure: +d['Domestic general government health expenditure per capita, PPP (current international $)'],
          population: +d['Population (historical)'],
          continent: d['World regions according to OWID'] as string
        }));
        setData(csvData as DataPoint[]);
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (data.length === 0 || size.width === 0) return;
    d3.select('#bubble-svg').selectAll('*').remove();
    drawChart();
  }, [data, size]);

  function drawChart() {
    const svg = d3.select('#bubble-svg');
  
    // Tooltip setup
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #ccc')
      .style('border-radius', '8px')
      .style('padding', '10px')
      .style('box-shadow', '0 0 10px rgba(0,0,0,0.1)')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);
  
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.taxRevenue) ?? 10000])
      .range([margin.left, size.width - margin.right]);
  
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.healthExpenditure) ?? 5000])
      .range([chartHeight - margin.bottom, margin.top]);
  
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, d => d.population) ?? 40000000])
      .range([5, 40]);
  
    const colorScale = d3.scaleOrdinal()
      .domain(["Africa", "Asia", "Europe", "North America", "Oceania", "South America"])
      .range(d3.schemeTableau10);
  
    // X-axis with descriptive label
    svg.append('g')
      .attr('transform', `translate(0, ${chartHeight - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', (size.width - margin.left - margin.right) / 2 + margin.left)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Tax Revenues per Capita ($)');
  
    // Y-axis with descriptive label
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(chartHeight - margin.top - margin.bottom) / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Public Health Expenditure per Capita ($)');
  
    // Create bubbles for each country
    svg.selectAll('.bubble')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', d => `bubble ${d.continent.replace(/\s+/g, '-')}`) // Assign a class based on continent
      .attr('cx', d => xScale(d.taxRevenue) as number)
      .attr('cy', d => yScale(d.healthExpenditure) as number)
      .attr('r', d => sizeScale(d.population) as number)
      .attr('fill', d => colorScale(d.continent) as string)
      .attr('opacity', 0.7)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <strong>${d.country}</strong><br/>
          Tax Revenue: $${d.taxRevenue.toLocaleString()}<br/>
          Health Expenditure: $${d.healthExpenditure.toLocaleString()}<br/>
          Population: ${(d.population / 1e6).toFixed(2)} million
        `);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX + 10}px`)
               .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', () => {
        tooltip.transition().duration(200).style('opacity', 0);
      });
  
    // Add country names above bubbles
    svg.selectAll('.bubble-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bubble-label')
      .attr('x', d => xScale(d.taxRevenue) as number)
      .attr('y', d => yScale(d.healthExpenditure) as number - sizeScale(d.population) - 5) // Position above the bubble
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', 'black')
      .text(d => d.country);
  
    // Add legend for continents
    const legend = svg.append('g')
      .attr('transform', `translate(${size.width - margin.right + 20}, ${margin.top})`);
  
    colorScale.domain().forEach((continent, i) => {
      const yPos = i * 20;
  
      legend.append('rect')
        .attr('x', 0)
        .attr('y', yPos)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorScale(continent) as string);
  
      legend.append('text')
        .attr('x', 15)
        .attr('y', yPos + 10)
        .attr('font-size', '10px')
        .text(continent)
        .style('cursor', 'pointer')
        .on('mouseover', () => {
          // Highlight bubbles of the same continent
          svg.selectAll('.bubble')
            .attr('opacity', 0.1); // Fade out all bubbles
          svg.selectAll(`.bubble.${continent.replace(/\s+/g, '-')}`)
            .attr('opacity', 1) // Highlight the bubbles of the selected continent
            .attr('stroke', '#333')
            .attr('stroke-width', 1.5);
        })
        .on('mouseout', () => {
          // Reset opacity of all bubbles
          svg.selectAll('.bubble')
            .attr('opacity', 0.7)
            .attr('stroke', 'none');
        });
    });
  }

  return (
    <div ref={chartRef} className='chart-container'>
      <svg id='bubble-svg' width='100%' height={chartHeight}></svg>
    </div>
  );
}