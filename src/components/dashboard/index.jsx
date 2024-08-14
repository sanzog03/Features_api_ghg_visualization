import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { MapBoxViewer } from '../mapboxViewer';
import { Title } from '../title';
import { ConcentrationChart } from '../chart';

export function Dashboard() {
  const [ selectedStation, setSelectedStation ] = useState("");
  const NISTStations = [];

  // fetch in the stations lon lat from the features api
  // filter the stations that belong to NIST
  // plot the NIST stations on the map

  return (
    <Box className="fullSize">
        <Title selection={selectedStation}/>
        <MapBoxViewer stations={NISTStations} setSelection={setSelectedStation}/>
        <ConcentrationChart selectedStation={selectedStation}/>
    </Box>
  );
}