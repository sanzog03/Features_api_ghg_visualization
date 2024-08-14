import { Component, createRef } from 'react';
import Chart from 'chart.js/auto';
import Box from '@mui/material/Box';
import { plugin, options } from './helper';

import './index.css';

export class ConcentrationChart extends Component {
  constructor(props) {
    super(props);
    this.initializeChart = this.initializeChart.bind(this);
    this.update = this.updateChart.bind(this);
    this.chart = null;
  }

  componentDidMount() {
    this.populateChart();
  }

  componentDidUpdate(prevProps, prevState) {
    // when new props is received, initialize the chart with data.
    if (this.props.selectedStationId !== prevProps.selectedStationId) {
      // fetch the data from the api and then initialize the chart.
      this.fetchStationData(this.props.selectedStationId).then(data => {
        const { time, concentration, stationName } = data;
        this.updateChart(concentration, time, stationName);
      });
    }
  }

  populateChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    // fetch the data from the api and then initialize the chart.
    this.fetchStationData(this.props.selectedStationId).then(data => {
      const { time, concentration, stationName } = data;
      this.initializeChart(this.chartCanvas, concentration, time, stationName);
    });
  }

  async fetchStationData(stationId) {
    try {
      // fetch in the collection from the features api
      const response = await fetch(`https://dev.ghg.center/api/features/collections/${stationId}/items?limit=10000`);
      if (!response.ok) {
        throw new Error('Error in Network');
      }
      const result = await response.json();
      const { title, features } = result;
      const stationName = this.getStationName(title);
      const { time, concentration } = this.dataPreprocess(features);
      return { time, concentration, stationName };
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  dataPreprocess(features) {
    const time = [];
    const concentration = [];
    features.forEach((feature) => {
      if (feature && feature.properties) {
        time.push(feature.properties.datetime);
        concentration.push(feature.properties.co2_ppm);
      }
    });
    return {time, concentration};
  }

  initializeChart(chartDOMRef, data=[], labels=[], stationName="") {
    let dataset = {
      labels: labels,
      datasets: [
        {
          label: 'CO2 Concentration (ppm)',
          data: data,
          borderColor: "#ff6384",
          yAxisID: 'y',
          showLine: false
        }
      ]
    };

    this.chart = new Chart(chartDOMRef, {
      type: 'line',
      data: dataset,
      options: options,
      plugins: [plugin]
    });

    if (stationName) {
      this.chart.options.plugins.title.text = ` NIST CO2 (${stationName})`;
    } else {
      this.chart.options.plugins.title.text = ` NIST CO2`;
    }
  }

  updateChart(data, label, stationName) {
    if (this.chart) {
      // update that value in the chart.
      this.chart.data.labels = label;
      this.chart.data.datasets[0].data = data;
      if (stationName) {
        this.chart.options.plugins.title.text = ` NIST CO2 (${stationName})`;
      } else {
        this.chart.options.plugins.title.text = ` NIST CO2`;
      }

      // update the chart
      this.chart.update();
    }
  }

  getStationName(title) {
    let titleParts = title.split("_");
    let stationName = titleParts[titleParts.length - 2];
    let ghg = titleParts[titleParts.length - 1];
    return stationName.toUpperCase();
  }

  render() {
    return (
      <Box sx={{height: "30em"}} id="chart-box">
          <div id="chart-container" className='fullSize'>
            <canvas
              id = "chart"
              className='fullWidth'
              style={{width: "100%", height: "100%"}}
              ref={chartCanvas => (this.chartCanvas = chartCanvas)}
            />
          </div>
      </Box>
    );
  }
}