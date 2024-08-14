import { Component, Fragment } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import './index.css';

import { BASEMAP_STYLES, BASEMAP_ID_DEFAULT } from './helper';

const accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const mapboxStyleBaseUrl = process.env.REACT_APP_MAPBOX_STYLE_URL;

export class MapBoxViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentViewer: null,
            selectedStation: null
        }
    }

    componentDidMount() {
        mapboxgl.accessToken = accessToken;
        let mapboxStyleUrl = 'mapbox://styles/mapbox/streets-v12';
        if (mapboxStyleBaseUrl) {
            let styleId = BASEMAP_STYLES.findIndex(style => style.id === BASEMAP_ID_DEFAULT);
            mapboxStyleUrl = `${mapboxStyleBaseUrl}/${BASEMAP_STYLES[styleId].mapboxId}`;
        }

        const map = new mapboxgl.Map({
            container: 'mapbox-container',
            style: mapboxStyleUrl,
            center: [-94.676392, 39.106667], // Center of the USA
            zoom: 4.8 // Adjust zoom level to fit the USA
        });
        this.setState({currentViewer: map});
        
        // show the whole map of usa and show all the NIST stations
        // this.plotStations(map, this.props.stations);
    }

    plotStations = (map, stations) => {
        stations.forEach(station => {
            const { name, center, geojson } = station;
            const [lon,  lat] = center;
            const el = document.createElement('div');
            el.className = 'marker';
            
            let marker = this.addMarker(map, el, name, lon, lat);

            marker.getElement().addEventListener('click', () => {
                this.setState({selectedStation: name});
                this.props.setSelection(name);
            });
        });
    }

    addMarker = (map, element, name, lon, lat) => {
        let marker = new mapboxgl.Marker(element)
        .setLngLat([lon, lat])
        // .setPopup(new mapboxgl.Popup({ offset: 25 })
        // .setText(name)
        .addTo(map);

        const tooltipContent = `<strong>${name}<strong>`;
        const popup = new mapboxgl.Popup().setHTML(tooltipContent);
        marker.setPopup(popup);
        marker.getElement().addEventListener("mouseenter", () => {
            popup.addTo(map);
        });
        marker.getElement().addEventListener("mouseleave", () => {
            popup.remove();
        });

        return marker;
    }

    render() {
        return (
            <Box component="main" className="map-section">
                <Grid container className="fullSize">
                    <Grid item xs={12}>
                        <div id="mapbox-container" className='fullSize' style={{ position: "absolute" }}></div>
                        {/* <div id="mapbox-container" className='fullSize' style={{ position: "relative", width: "auto", height: "1024px" }}></div> */}
                    </Grid>
                </Grid>
            </Box>
        );    
    }
}