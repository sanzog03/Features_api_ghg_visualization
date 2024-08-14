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
    let chartCanvas = this.chartCanvas;
    this.initializeChart(chartCanvas);
  }

  componentDidUpdate(prevProps, prevState) {
    // when new props is received, update the chart.
    if (this.props.selectedStation !== prevProps.selectedStation) {
      this.initializeChart();
    }
  }

  initializeChart (chartDOMRef) {
    // fetch the colelction item data from feature api.
    // filter the data.
    // display the data.

    let dataset = {
      labels: [],
      datasets: [
        {
          label: 'CO2 Concentration (ppm)',
          data: [],
          borderColor: "#ff6384",
          yAxisID: 'y',
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
      <Box sx={{height: "30em"}}>
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