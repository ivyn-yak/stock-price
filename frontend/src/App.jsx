import React, { useEffect, useState, useRef } from "react";
import LineGraph from "./components/LineGraph";
import axios from "axios";

const App = () => {
  const getDate100DaysAgo = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) {
      throw new Error('Invalid date string');
    }
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const date100DaysAgo = new Date(date.getTime() - 150 * millisecondsPerDay);
  
    const formattedDate = date100DaysAgo.toISOString().split('T')[0];
    
    return formattedDate;
  };

  const fetchData = async ({ stock, startDate, endDate }) => {
    const newStartDate = getDate100DaysAgo(startDate)

    console.log("here", startDate, newStartDate)

    try {
      const response = await axios.post(`http://localhost:8000`, {
        stock: stock,
        start: startDate,
        past_100: newStartDate,
        end: endDate,
      });

      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const [result, setResult] = useState({});
  const chartRef = useRef(null);

  const [stockInput, setStockInput] = useState('GOOG');
  const [startInput, setStartInput] = useState('2019-01-01');
  const [endInput, setEndInput] = useState('2024-01-01');

  const handleStockChange = (event) => {
    setStockInput(event.target.value);
  };

  const handleStartChange = (event) => {
    setStartInput(event.target.value);
  };

  const handleEndChange = (event) => {
    setEndInput(event.target.value);
  };

  const handleSubmit = () => {
    fetchData({ stock: stockInput, startDate: startInput, endDate: endInput })
      .then((data) => {
        const formattedData = formatData(data);
        setResult(formattedData);

        if (chartRef.current) {
          chartRef.current.destroy();
        }


        console.log(startInput, endInput)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    fetchData({ stock: stockInput, startDate: startInput, endDate: endInput })
      .then((data) => {
        const formattedData = formatData(data);
        setResult(formattedData);

        console.log(formattedData)
        console.log(result)

        if (chartRef.current) {
          chartRef.current.destroy();
        }
      })
      .catch((error) => {
        console.log(error);
      });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    console.log(result); 
  }, [result]);

  return (
    <div className="w-full p-10">
      <div className="flex mb-2">
        <h1 className="text-3xl p-1 px-4">Stock</h1>
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
          value={stockInput}
          onChange={handleStockChange}
        />
      </div>
      <div className="flex mb-2">
        <h1 className="text-xl p-1 px-4">Start</h1>
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
          value={startInput}
          onChange={handleStartChange}
        />
        <h1 className="text-xl p-1 px-4">End</h1>
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
          value={endInput}
          onChange={handleEndChange}
        />
        <button type='submit' onClick={handleSubmit} className="gap-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500">Submit</button>
      </div>

      {result && result.labels && <LineGraph data={result} ref={chartRef} />}
    </div>
  );
};

function formatData(jsonObj) {
  if (!jsonObj || !jsonObj.y_pred || !jsonObj.y || !jsonObj.date) {
    return { labels: [], datasets: [] };
  }

  const y_pred = jsonObj.y_pred;
  const y = jsonObj.y;
  const date = jsonObj.date;

  const date_values = Object.values(date);

  console.log(date_values);

  const data = {
    labels: date_values,
    datasets: [
      {
        label: "Predicted",
        data: y_pred.map(item => item[0]) || [],
        borderColor: "rgb(75, 192, 192)",
      },
      {
        label: "Actual",
        data: y,
        borderColor: "red",
      },
    ],
  };

  return data;
}

export default App;
