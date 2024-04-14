import React, { useEffect, useRef, useState } from "react";
import "./MapItUp.css"; // Importing CSS styles for the component
import "ol/ol.css"; // Importing OpenLayers CSS styles
import Map from "ol/Map"; // Importing the Map component from OpenLayers
import View from "ol/View"; // Importing the View component from OpenLayers
import TileLayer from "ol/layer/Tile"; // Importing TileLayer component from OpenLayers
import OSM from "ol/source/OSM"; // Importing OSM (OpenStreetMap) source component from OpenLayers
import { Draw, Modify, Snap } from "ol/interaction"; // Importing drawing, modification, and snapping interactions from OpenLayers
import { Vector as VectorLayer } from "ol/layer"; // Importing VectorLayer component from OpenLayers
import { Vector as VectorSource } from "ol/source"; // Importing VectorSource component from OpenLayers

const MapItUp = () => {
  // Using React hooks for managing state and references
  const mapContainerRef = useRef(null); // Reference to the map container div
  const drawLayerRef = useRef(null); // Reference to the vector layer used for drawing
  const mapRef = useRef(null); // Reference to the map instance
  const [measurement, setMeasurement] = useState(null); // State for storing measurement information

  // useEffect hook to run once when the component mounts
  useEffect(() => {
    // Creating a new OpenLayers map instance
    const map = new Map({
      target: mapContainerRef.current, // Setting the map container as the target
      layers: [
        new TileLayer({
          source: new OSM(), // Adding a tile layer with OpenStreetMap as the source
        }),
      ],
      view: new View({
        center: [0, 0], // Setting the initial center of the map
        zoom: 2, // Setting the initial zoom level
      }),
    });

    // Storing the map instance in the useRef variable
    mapRef.current = map;

    // Creating a vector layer for drawing features
    const drawLayer = new VectorLayer({
      source: new VectorSource(), // Creating a vector source for the layer
    });
    map.addLayer(drawLayer); // Adding the vector layer to the map
    drawLayerRef.current = drawLayer; // Storing the vector layer in a useRef variable

    // Creating interaction for modifying drawn features
    const modify = new Modify({ source: drawLayer.getSource() });
    map.addInteraction(modify); // Adding modification interaction to the map

    // Creating interaction for snapping to existing features
    const snap = new Snap({ source: drawLayer.getSource() });
    map.addInteraction(snap); // Adding snap interaction to the map

    // Cleanup function to remove the map when the component unmounts
    return () => {
      map.setTarget(null); // Removing the map from the target element
    };
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  // Function to add drawing interaction based on the geometry type
  const addDrawingInteraction = (geometryType) => {
    // Creating a new drawing interaction
    const draw = new Draw({
      source: drawLayerRef.current.getSource(), // Setting the source for the drawn features
      type: geometryType, // Setting the type of geometry to be drawn
    });

    // Event listener for when a drawing is completed
    draw.on("drawend", (event) => {
      const geometry = event.feature.getGeometry(); // Getting the geometry of the drawn feature
      let measurementText;
      // Calculating measurement based on the geometry type
      if (geometryType === "Polygon") {
        const area = geometry.getArea(); // Calculating area for polygons
        measurementText = `Area: ${area.toFixed(2)} square meters`;
      } else if (geometryType === "LineString") {
        const length = geometry.getLength(); // Calculating length for lines
        measurementText = `Length: ${length.toFixed(2)} meters`;
      }
      setMeasurement(measurementText); // Setting the measurement state
    });

    drawLayerRef.current.getSource().clear(); // Clearing any existing drawn features
    mapRef.current.addInteraction(draw); // Adding the drawing interaction to the map
  };

  // Event handlers for drawing different geometries
  const handleDrawPolygon = () => {
    addDrawingInteraction("Polygon"); // Adding drawing interaction for polygons
  };

  const handleDrawPoint = () => {
    addDrawingInteraction("Point"); // Adding drawing interaction for points
  };

  const handleDrawLine = () => {
    addDrawingInteraction("LineString"); // Adding drawing interaction for lines
  };

  // Rendering JSX elements for the component
  return (
    <div style={{ padding: "10px" }}>
      <header style={{ fontSize: "26px" }}>Assignment for Ottermap:</header>
      {/* Div container for the map */}
      <div className="map-container" ref={mapContainerRef}></div>
      {/* Container for buttons */}
      <div className="buttons-container">
        {/* Button for drawing polygons */}
        <button onClick={handleDrawPolygon}>Check Area</button>
        {/* Button for drawing points */}
        <button onClick={handleDrawPoint}>Pin Point</button>
        {/* Button for drawing lines */}
        <button onClick={handleDrawLine}>Line Length</button>
        {/* Displaying measurement information */}
        <div style={{ fontSize: "20px", textAlign: "center" }}>
          {measurement && <div>{measurement}</div>}
        </div>
      </div>
    </div>
  );
};

export default MapItUp;
