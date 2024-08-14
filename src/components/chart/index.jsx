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
      this.populateChart();
    }
  }

  populateChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    // fetch the data from the api and then initialize the chart.
    this.fetchStationData(this.props.selectedStationId).then(data => {
      const { time, concentration, title } = data;
      this.initializeChart(this.chartCanvas, concentration, time);
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
      const { time, concentration } = this.dataPreprocess(features);
      return { time, concentration, title };
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

  initializeChart(chartDOMRef, data=[], labels=[]) {
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
  }

  updateChart(label, data) {
    if (this.chart) {
      // update that value in the chart.
      this.chart.data.labels.push(label);
      this.chart.data.datasets[0].data.push(data);

      // update the chart
      this.chart.update('none');
    }
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