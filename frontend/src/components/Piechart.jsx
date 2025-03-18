import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import axios from "axios";

const GREEN_COLORS = [
    "#18230F", "#27391C", "#255F38", "#1F7D53", "#DDEB9D", "#A0C878"
];

const PieChartComponent = () => {
    const [data, setData] = useState({});

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
            })
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    return (
        <div>
            <h2>Species Abundance Per Country</h2>
            {Object.keys(data).map((country, index) => {
                const totalAbundance = data[country].reduce((sum, item) => sum + item.total_abundance, 0);
                const chartData = data[country].map(item => ({
                    name: item.species_name,
                    value: parseFloat(((item.total_abundance / totalAbundance) * 100).toFixed(2))
                }));

                return (
                    <div key={index} style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h3>{country}</h3>
                        <PieChart width={400} height={400}>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="none"  // Remove the white outline
                                strokeWidth={0}  // Remove the dividing lines
                                //label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={GREEN_COLORS[index % GREEN_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => `${value.toFixed(2)}%`} />
                        </PieChart>
                    </div>
                );
            })}
        </div>
    );
};

export default PieChartComponent;
