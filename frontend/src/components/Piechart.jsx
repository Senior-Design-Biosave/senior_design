import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import axios from "axios";

const GREEN_COLORS = [
    "#18230F", "#27391C", "#255F38", "#1F7D53", "#DDEB9D", "#A0C878"
];

const PieChartComponent = () => {
    const [data, setData] = useState({});
    const [selectedCountry, setSelectedCountry] = useState('');

    useEffect(() => {
        axios.get("http://localhost:5000/api/piechart")
            .then(response => {
                const formattedData = {};
                response.data.forEach(row => {
                    if (!formattedData[row.country]) {
                        formattedData[row.country] = [];
                    }
                    formattedData[row.country].push(row);
                });
                setData(formattedData);
                // Set the first country as the default selection
                setSelectedCountry(Object.keys(formattedData)[0]);
            })
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    const handleCountryChange = (event) => {
        setSelectedCountry(event.target.value);
    };

    const chartData = selectedCountry && data[selectedCountry] ? data[selectedCountry] : [];
    const totalAbundance = chartData.reduce((sum, item) => sum + item.total_abundance, 0);
    const formattedChartData = chartData.map(item => ({
        name: item.species_name,
        value: parseFloat(((item.total_abundance / totalAbundance) * 100).toFixed(2))
    }));

    return (
        <div className="card" style={{  width: "97%", overflowX: "auto", textAlign: "left" }}>
            <h3>Species Abundance</h3>
            <label>Select country: </label>
            <select
                value={selectedCountry}
                onChange={handleCountryChange}
                style={{padding: "2px" }}
            >
                {Object.keys(data).map((country, index) => (
                    <option key={index} value={country}>
                        {country}
                    </option>
                ))}
            </select>

            {selectedCountry && formattedChartData.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginBottom: "10px" }}>
                    <h3>{selectedCountry}</h3>
                    <PieChart width={500} height={500}>
                        <Pie
                            data={formattedChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={230}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="none"
                        >
                            {formattedChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={GREEN_COLORS[index % GREEN_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    </PieChart>
                </div>
            )}
        </div>
    );
};

export default PieChartComponent;