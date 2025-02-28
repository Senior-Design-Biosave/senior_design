import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import * as d3 from "d3";
import "leaflet/dist/leaflet.css";

// Function to create a continuous color scale
const getColorScale = (min, max) => {
  return d3.scaleSequential(d3.interpolatePlasma).domain([max, min]);
};

// Heatmap Layer Component
const HeatmapLayer = ({ data, minValue, maxValue }) => {
  const colorScale = getColorScale(minValue, maxValue);

  return (
    <>
      {data.map(([lat, lon, value], index) => (
        <CircleMarker
          key={index}
          center={[lat, lon]}
          radius={10}
          fillColor={colorScale(value)}
          color="black"
          weight={1}
          fillOpacity={1}
        >
          <Popup>Value: {value}</Popup>
        </CircleMarker>
      ))}
    </>
  );
};

// Legend Component with Continuous Gradient and 5 Steps
const Legend = ({ title, min, max, isInteger }) => {
  const steps = 5;
  const stepSize = (max - min) / (steps - 1);
  const colorScale = getColorScale(min, max);

  const gradientStyle = {
    background: `linear-gradient(to bottom, ${Array.from({ length: steps })
      .map((_, i) => colorScale(min + i * stepSize))
      .join(", ")})`,
    height: "150px",
    width: "20px",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        width: "100px",
        height: "auto",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        zIndex: "1000",
        textAlign: "center",
      }}
    >
      <h4 style={{ marginBottom: "5px" }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={gradientStyle}></div>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: "10px" }}>
          {Array.from({ length: steps }).map((_, i) => {
            const value = min + i * stepSize;
            return (
              <div key={i} style={{ marginBottom: "15px" }}>
                {isInteger ? Math.round(value) : value.toFixed(5)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Heatmap = () => {
  // Static Alpha data
  const alphaData = [
    [18.22525025, 42.4240741, 5],
    [18.22595008, 42.42186662, 9],
    [18.31224355, 42.35712796, 2],
    [18.32217987, 42.34759678, 11],
    [18.31406841, 42.33921717, 10],
    [18.3197066, 42.36362232, 7],
    [18.3260928, 42.38317489, 5],
    [18.30725987, 42.3779133, 4],
    [18.29188181, 42.38254852, 9],
    [18.28270755, 42.3747054, 12],
    [18.28973234, 42.36046777, 13],
    [18.27883626, 42.36254926, 8],
    [18.20375557, 42.41117204, 12],
    [18.19779432, 42.40842026, 16],
    [18.34154803, 42.29544026, 0],
    [18.30787701, 42.26477778, 13],
    [18.29645788, 42.27279251, 10],
    [18.29264, 42.33671, 9],
    [18.2512442, 42.33673004, 7],
    [18.22005653, 42.35583242, 12],
    [18.20981339, 42.3820875, 2],
    [18.14186443, 42.36443943, 7],
    [18.13376944, 42.38045108, 0],
    [18.16491823, 42.37653507, 10],
    [18.16618653, 42.43947291, 0],
    [18.18653807, 42.43394855, 10],
    [18.20498355, 42.41739587, 4],
    [18.24816278, 42.41182016, 9],
    [18.27246163, 42.38623023, 4],
    [18.30314919, 42.39374645, 3],
    [18.30845351, 42.20423019, 0],
    [18.27142586, 42.17653873, 10],
    [18.21838563, 42.19403431, 0],
    [18.18503133, 42.20182224, 14],
    [18.22180337, 42.23219991, 5],
    [18.1955147, 42.25315553, 13],
    [18.32096937, 42.2420157, 19],
    [18.25934916, 42.22640446, 12],
    [18.18248099, 42.32569007, 12],
    [18.13317834, 42.30604076, 9],
    [18.24434962, 42.20865903, 13],
    [18.13448071, 42.35097693, 11],
    [18.19835796, 42.46060952, 2],
    [18.30758368, 42.19683752, 15],
    [18.26772, 42.43733, 0],
    [18.33510703, 42.40212539, 6],
    [18.24200291, 42.44456962, 6],
    [18.18293539, 42.37166554, 13],
    [18.17663257, 42.34320349, 9],
    [18.15218705, 42.32961659, 9],
    [18.11675245, 42.28664761, 11],
    [18.10980117, 42.27281588, 6],
    [18.22972662, 42.31520723, 9],
    [18.20629452, 42.2905168, 7],
    [18.17831426, 42.28047461, 5],
    [18.15827122, 42.2700832, 9],
    [18.13755299, 42.2779977, 0],
    [18.10992218, 42.3039243, 6],
    [18.26067406, 42.13791115, 12],
    [18.2736539, 42.21021563, 10]
]

  // Static Beta data
    const betaData = [
    [18.22525025, 42.4240741, 0.00245],
    [18.22595008, 42.42186662, 0.0121],
    [18.31224355, 42.35712796, 0.002188],
    [18.32217987, 42.34759678, 0.001452],
    [18.31406841, 42.33921717, 0.033531],
    [18.3197066, 42.36362232, 0.002164],
    [18.3260928, 42.38317489, 0.002203],
    [18.30725987, 42.3779133, 0.002219],
    [18.29188181, 42.38254852, 0.002105],
    [18.28270755, 42.3747054, 0.014188],
    [18.28973234, 42.36046777, 0.037591],
    [18.27883626, 42.36254926, 0.001062],
    [18.20375557, 42.41117204, 0.001166],
    [18.19779432, 42.40842026, 0.017651],
    [18.34154803, 42.29544026, 0.002257],
    [18.30787701, 42.26477778, 0.018953],
    [18.29645788, 42.27279251, 0.001618],
    [18.29264, 42.33671, 0.000685],
    [18.2512442, 42.33673004, 0.001299],
    [18.22005653, 42.35583242, 0.08878],
    [18.20981339, 42.3820875, 0.00189],
    [18.14186443, 42.36443943, 0.002287],
    [18.13376944, 42.38045108, 0.002257],
    [18.16491823, 42.37653507, 0.001778],
    [18.16618653, 42.43947291, 0.002257],
    [18.18653807, 42.43394855, 0.002401],
    [18.20498355, 42.41739587, 0.002047],
    [18.24816278, 42.41182016, 0.006013],
    [18.27246163, 42.38623023, 0.002222],
    [18.30314919, 42.39374645, 0.002211],
    [18.30845351, 42.20423019, 0.002257],
    [18.27142586, 42.17653873, 0.003209],
    [18.21838563, 42.19403431, 0.002257],
    [18.18503133, 42.20182224, 0.005179],
    [18.22180337, 42.23219991, 0.002073],
    [18.1955147, 42.25315553, 0.142363],
    [18.32096937, 42.2420157, 0.055692],
    [18.25934916, 42.22640446, 0.019513],
    [18.18248099, 42.32569007, 0.094049],
    [18.13317834, 42.30604076, 0.21017],
    [18.24434962, 42.20865903, 0.018527],
    [18.13448071, 42.35097693, 0.00064],
    [18.19835796, 42.46060952, 0.002328],
    [18.30758368, 42.19683752, 0.007793],
    [18.26772, 42.43733, 0.002257],
    [18.33510703, 42.40212539, 0.002217],
    [18.24200291, 42.44456962, 0.002084],
    [18.18293539, 42.37166554, 0.04558],
    [18.17663257, 42.34320349, 0.003699],
    [18.15218705, 42.32961659, 0.039113],
    [18.11675245, 42.28664761, 0.001213],
    [18.10980117, 42.27281588, 0.003019],
    [18.22972662, 42.31520723, 0.002133],
    [18.20629452, 42.2905168, 0.027516],
    [18.17831426, 42.28047461, 0.019782],
    [18.15827122, 42.2700832, 0.007252],
    [18.13755299, 42.2779977, 0.002257],
    [18.10992218, 42.3039243, 0.002092],
    [18.26067406, 42.13791115, 0.001894],
    [18.2736539, 42.21021563, 0.000815],
  ];
  

  // Min and Max Values
  const alphaMin = 0;
  const alphaMax = 19;
  const betaMin = 0.00064;
  const betaMax = 0.21017;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
      {/* Alpha Diversity Map */}
      <div style={{ position: "relative", width: "48%" }}>
        <MapContainer center={[18.3, 42.4]} zoom={10} style={{ height: "500px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <HeatmapLayer data={alphaData} minValue={alphaMin} maxValue={alphaMax} />
        </MapContainer>
        <Legend min={alphaMin} max={alphaMax} isInteger={true} title="Alpha"/>
      </div>

      {/* Beta Diversity Map */}
      <div style={{ position: "relative", width: "48%" }}>
        <MapContainer center={[18.3, 42.4]} zoom={10} style={{ height: "500px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <HeatmapLayer data={betaData} minValue={betaMin} maxValue={betaMax} />
        </MapContainer>
        <Legend min={betaMin} max={betaMax} isInteger={false} title="Beta"/>
      </div>
    </div>
  );
};

export default Heatmap;
