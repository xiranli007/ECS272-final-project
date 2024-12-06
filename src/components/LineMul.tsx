import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import Select from 'react-select';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';

interface DataPoint {
  country: string;
  year: number;
  value: number;
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

export default function GlobalGDPLineChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ComponentSize>({ width: 0, height: 0 });
  const margin: Margin = { top: 40, right: 80, bottom: 40, left: 30 };
  const chartHeight = 500;

  const onResize = useDebounceCallback((size: ComponentSize) => setSize(size), 200);
  useResizeObserver({ ref: chartRef, onResize });

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await d3.csv('../../data/full-gdp.csv', d => {
          if (+d.Year >= 1880) {
            return {
              country: d.Entity,
              year: +d.Year,
              value: +d.public_health_expenditure_pc_gdp
            };
          }
        });
        setData(csvData.filter(Boolean) as DataPoint[]);
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (data.length === 0 || size.width === 0) return;
    d3.select('#line-svg').selectAll('*').remove();
    drawChart();
  }, [data, size, selectedCountries]);

  const handleCountrySelection = (selectedOptions: any) => {
    setSelectedCountries(selectedOptions.map((option: any) => option.value));
  };

  function drawChart() {
    const svg = d3.select('#line-svg');
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.year) as [number, number])
      .range([margin.left, size.width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value) ?? 0])
      .nice()
      .range([chartHeight - margin.bottom, margin.top]);

    const dataByCountry = d3.group(data, d => d.country);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain([...dataByCountry.keys()]);

    // Filter data based on selected countries
    const filteredData = selectedCountries.map(country => ({
      country,
      data: dataByCountry.get(country) || [],
    }));

    // Draw axes
    svg
      .append('g')
      .attr('transform', `translate(0, ${chartHeight - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

      // Add X-axis label
      svg
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('x', (size.width - margin.left - margin.right) / 2 + margin.left)
      .attr('y', chartHeight - margin.bottom + 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Year');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    // Draw lines
    filteredData.forEach(({ country, data }) => {
      svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colorScale(country))
        .attr('stroke-width', 1.5)
        .attr('class', 'country-line')
        .attr('data-country', country)
        .attr('d', d3.line<DataPoint>()
          .x(d => xScale(d.year))
          .y(d => yScale(d.value))
        );
    });

    // Add country names on the right
    const labelData = filteredData.map(({ country, data }) => {
      const lastDataPoint = data[data.length - 1];
      return {
        country,
        x: size.width - margin.right,
        y: yScale(lastDataPoint?.value ?? 0),
        color: colorScale(country)
      };
    });

    labelData.forEach(d => {
      svg
        .append('text')
        .attr('x', d.x + 5)
        .attr('y', d.y)
        .attr('fill', d.color)
        .attr('class', 'country-label')
        .attr('data-country', d.country)
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text(d.country)
        .on('mouseover', () => highlightLine(d.country))
        .on('mouseout', resetLines);
    });

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(255, 255, 255, 0.9)')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    const hoverLine = svg.append('line')
      .attr('stroke', '#888')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 4')
      .attr('y1', margin.top)
      .attr('y2', chartHeight - margin.bottom)
      .style('opacity', 0);

    svg
      .append('rect')
      .attr('width', size.width - margin.left - margin.right)
      .attr('height', chartHeight - margin.top - margin.bottom)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', onMouseMove)
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
        hoverLine.style('opacity', 0);
      });

    function highlightLine(country: string) {
      // Highlight the line and dim others
      svg.selectAll('.country-line')
        .attr('stroke-opacity', function () {
          return d3.select(this).attr('data-country') === country ? 1 : 0.1;
        });

      // Dim all labels except the hovered one
      svg.selectAll('.country-label')
        .style('opacity', function () {
          return d3.select(this).attr('data-country') === country ? 1 : 0.1;
        });
    }

    function resetLines() {
      // Reset all lines and labels to full opacity
      svg.selectAll('.country-line')
        .attr('stroke-opacity', 1);

      svg.selectAll('.country-label')
        .style('opacity', 1);
    }

    function onMouseMove(event: MouseEvent) {
      const [mouseX] = d3.pointer(event);
      const year = Math.round(xScale.invert(mouseX));

      const yearData = filteredData.map(({ country, data }) => {
        const closestData = data.find(d => d.year === year);
        return closestData ? { country, value: closestData.value } : null;
      }).filter(Boolean);

      if (yearData.length > 0) {
        yearData.sort((a, b) => b.value - a.value);

        const tooltipHtml = `
          <strong>${year}</strong><br>
          ${yearData.map(d => `
            <span style="color:${colorScale(d.country)}">●</span> ${d.country}: ${d.value.toFixed(2)}%
          `).join('<br>')}
        `;

        tooltip
          .style('opacity', 1)
          .html(tooltipHtml)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);

        hoverLine
          .attr('x1', mouseX)
          .attr('x2', mouseX)
          .style('opacity', 1);
      } else {
        tooltip.style('opacity', 0);
        hoverLine.style('opacity', 0);
      }
    }
  }

  // Generate options for dropdown menu
  const dropdownOptions = Array.from(new Set(data.map(d => d.country))).map(country => ({
    value: country,
    label: country,
  }));
  return (
    <div>
      <Select
        isMulti
        options={dropdownOptions}
        onChange={handleCountrySelection}
        placeholder="Select countries..."
        styles={{
          container: base => ({ ...base }),
        }}
      />
      <div ref={chartRef} style={{ width: '100%' }}>
        <svg id="line-svg" width="1000%" height={chartHeight}></svg>
      </div>
    </div>
  );
}