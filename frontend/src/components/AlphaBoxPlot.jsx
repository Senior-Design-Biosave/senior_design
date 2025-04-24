import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, LinearScale, CategoryScale } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import * as d3 from "d3";
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';
import annotationPlugin from 'chartjs-plugin-annotation'; // Correct import

// Register the required Chart.js components
ChartJS.register(
  BoxPlotController,
  BoxAndWiskers,
  LinearScale,
  CategoryScale,
  annotationPlugin
);

function AlphaBoxPlot() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch list of available countries
  useEffect(() => {
    axios.get("http://localhost:5000/api/countries")
      .then(response => {
        setCountries(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching countries:", err);
        setError("Failed to load country list");
        setLoading(false);
      });
  }, []);

  // Fetch data when country is selected
  useEffect(() => {
    if (selectedCountry) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/alpha-boxplot/${encodeURIComponent(selectedCountry)}`)
        .then(response => {
          const values = response.data.map(item => Number(item.alpha));
          setCountryData({
            country: selectedCountry,
            values,
            stats: calculateBoxplotStats(values),
            mean: d3.mean(values)
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching country data:", err);
          setError(`Failed to load data for ${selectedCountry}`);
          setLoading(false);
        });
    }
  }, [selectedCountry]);

  const calculateBoxplotStats = (values) => {
    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    
    if (numericValues.length === 0) {
      return {
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 0,
        outliers: []
      };
    }
    
    const sorted = [...numericValues].sort((a, b) => a - b);
    const q1 = d3.quantile(sorted, 0.25);
    const median = d3.quantile(sorted, 0.5);
    const q3 = d3.quantile(sorted, 0.75);
    const iqr = q3 - q1;
    
    const whiskerLow = Math.max(sorted[0], q1 - 1.5 * iqr);
    const whiskerHigh = Math.min(sorted[sorted.length - 1], q3 + 1.5 * iqr);
    
    return {
      min: whiskerLow,
      q1,
      median,
      q3,
      max: whiskerHigh,
      outliers: sorted.filter(v => v < whiskerLow || v > whiskerHigh)
    };
  };

  if (loading && !selectedCountry) return <div className="loading">Loading countries...</div>;
  if (error) return <div className="error">{error}</div>;

  const chartData = {
    labels: countryData ? [countryData.country] : [],
    datasets: [{
      label: 'Alpha Diversity',
      data: countryData ? [{
        min: countryData.stats.min,
        q1: countryData.stats.q1,
        median: countryData.stats.median,
        q3: countryData.stats.q3,
        max: countryData.stats.max,
        outliers: countryData.stats.outliers
      }] : [],
      backgroundColor: 'rgba(100, 181, 246, 0.6)',
      borderColor: 'rgba(25, 118, 210, 1)',
      borderWidth: 2,
      outlierColor: '#999',
      padding: 0.3,
      itemRadius: 0,
      whiskerStyle: {
        lineWidth: 2,
        color: '#424242'
      },
      medianStyle: {
        lineWidth: 2,
        color: 'red'
      }
    }]
  };  

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: () => countryData?.country || '',
          beforeBody: () => {
            if (!countryData) return [];
            return [
              `Samples: ${countryData.values.length}`,
              `Mean: ${countryData.mean.toFixed(2)}`,
              `Median: ${countryData.stats.median.toFixed(2)}`,
              `Q1: ${countryData.stats.q1.toFixed(2)}`,
              `Q3: ${countryData.stats.q3.toFixed(2)}`,
              `Range: ${countryData.stats.min.toFixed(2)} - ${countryData.stats.max.toFixed(2)}`
            ];
          },
          label: () => ''
        }
      },
      annotation: {
        annotations: countryData ? {
          medianLine: {
            type: 'line',
            yMin: -0.4,
            yMax: 0.4,
            xMin: countryData.stats.median,
            xMax: countryData.stats.median,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: `Median: ${countryData.stats.median.toFixed(2)}`,
              enabled: true,
              position: 'right',
              backgroundColor: 'rgba(255,255,255,0.8)'
            }
          }
        } : {}
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Alpha Diversity Value'
        },
        min: 0,
        max: 25,
        ticks: {
          stepSize: 5
        }
      },
      y: {
        ticks: {
          autoSkip: false
        }
      }
    }
  };

  return (
    <div className="boxplot-container" style={{ 
      width: "97%",
      height: "30%",
      padding: "20px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      marginBottom: "0px"
    }}>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="country-select" style={{ marginRight: "10px" }}>Select Country:</label>
        <select
          id="country-select"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            minWidth: "200px"
          }}
        >
          <option value="">-- Select a country --</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
      
      {selectedCountry && (
        <div style={{ 
          height: "200px",
          position: 'relative'
        }}>
          {loading ? (
            <div className="loading">Loading data for {selectedCountry}...</div>
          ) : (
            <>
              <Chart type="boxplot" data={chartData} options={options} />
              
              {/* Statistics legend */}
              <div style={{
                position: 'absolute-bottom',
                right: '20px',
                top: '20px',
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #ddd'
              }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Statistics Legend</h4>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: 'rgba(100, 181, 246, 0.6)',
                    border: '2px solid rgba(25, 118, 210, 1)',
                    marginRight: '8px'
                  }}></div>
                  <span>Interquartile Range (Q1-Q3)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '2px', 
                    backgroundColor: 'red',
                    marginRight: '8px'
                  }}></div>
                  <span>Median</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '2px', 
                    backgroundColor: '#424242',
                    marginRight: '8px'
                  }}></div>
                  <span>Whiskers (Min-Max)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%',
                    backgroundColor: '#999',
                    marginRight: '8px',
                    padding: '10px'
                  }}></div>
                  <span>Outliers</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AlphaBoxPlot;