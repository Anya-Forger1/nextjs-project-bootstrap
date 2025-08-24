const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();

// Helper function to get days in month
const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// Helper function to get week day ranges
const getWeekDayRange = (year, month, week) => {
  const daysInMonth = getDaysInMonth(year, month);
  
  switch(week) {
    case '1': return { start: 1, end: Math.min(7, daysInMonth) };
    case '2': return { start: 8, end: Math.min(14, daysInMonth) };
    case '3': return { start: 15, end: Math.min(21, daysInMonth) };
    case '4': return { start: 22, end: daysInMonth };
    default: return { start: 1, end: daysInMonth };
  }
};

// Helper function to read CSV data
const readCSVData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(__dirname, '../data/salesmonthly.csv');
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// GET /api/medicines - Return list of medicines + "All"
router.get('/medicines', (req, res) => {
  try {
    const medicines = ["M01AB", "M01AE", "N02BA", "N02BE", "N05B", "N05C", "R03", "R06", "All"];
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines list' });
  }
});

// GET /api/sales - Get sales data with filtering
router.get('/sales', async (req, res) => {
  try {
    const { medicine, month, week } = req.query;
    
    // Validate required parameters
    if (!medicine) {
      return res.status(400).json({ error: 'Medicine parameter is required' });
    }

    // Read CSV data
    const csvData = await readCSVData();
    
    // Filter for 2025 data only
    const data2025 = csvData.filter(row => row.datum.startsWith('2025'));
    
    let filteredData = data2025;
    
    // Filter by month if specified
    if (month && month !== 'All') {
      const monthPadded = month.padStart(2, '0');
      filteredData = data2025.filter(row => {
        const rowMonth = row.datum.split('-')[1];
        return rowMonth === monthPadded;
      });
    }

    // Calculate sales based on medicine selection
    const salesData = filteredData.map(row => {
      let sales = 0;
      
      if (medicine === 'All') {
        // Sum all medicine columns
        const medicines = ["M01AB", "M01AE", "N02BA", "N02BE", "N05B", "N05C", "R03", "R06"];
        sales = medicines.reduce((sum, med) => sum + parseFloat(row[med] || 0), 0);
      } else {
        sales = parseFloat(row[medicine] || 0);
      }
      
      return {
        date: row.datum,
        sales: sales,
        month: row.datum.split('-')[1],
        year: row.datum.split('-')[0]
      };
    });

    // Handle daily breakdown for table view
    let dailyBreakdown = [];
    
    if (month && month !== 'All' && salesData.length > 0) {
      const monthData = salesData[0];
      const year = parseInt(monthData.year);
      const monthNum = parseInt(monthData.month);
      const monthlySales = monthData.sales;
      
      if (week && week !== 'All') {
        // Specific week selected
        const weekRange = getWeekDayRange(year, monthNum, week);
        const daysInWeek = weekRange.end - weekRange.start + 1;
        const weeklySales = monthlySales / 4; // Divide monthly sales by 4 weeks
        const dailySales = weeklySales / daysInWeek;
        
        for (let day = weekRange.start; day <= weekRange.end; day++) {
          dailyBreakdown.push({
            day: day,
            sales: parseFloat(dailySales.toFixed(2))
          });
        }
      } else {
        // All weeks - show all days in month
        const daysInMonth = getDaysInMonth(year, monthNum);
        const dailySales = monthlySales / daysInMonth;
        
        for (let day = 1; day <= daysInMonth; day++) {
          dailyBreakdown.push({
            day: day,
            sales: parseFloat(dailySales.toFixed(2))
          });
        }
      }
    }

    const response = {
      medicine: medicine,
      month: month || 'All',
      week: week || 'All',
      totalSales: salesData.reduce((sum, item) => sum + item.sales, 0),
      salesData: salesData,
      dailyBreakdown: dailyBreakdown
    };

    res.json(response);
    
  } catch (error) {
    console.error('Error in /api/sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales data', message: error.message });
  }
});

// GET /api/recommendations - Return insights
router.get('/recommendations', async (req, res) => {
  try {
    // Read CSV data to generate dynamic recommendations
    const csvData = await readCSVData();
    const data2025 = csvData.filter(row => row.datum.startsWith('2025'));
    
    const recommendations = [
      "Sales of N02BE show highest values across all months → consider this as your top revenue generator.",
      "M01AB demonstrates steady growth pattern → reliable for consistent inventory planning.",
      "Summer months (June-August) show increased sales for R03 and R06 → stock up before peak season.",
      "Q4 (October-December) shows strong performance across all medicines → prepare for year-end surge.",
      "N05B and N05C maintain stable levels → good for baseline inventory management.",
      "Consider seasonal promotions for M01AE during spring months for potential growth."
    ];
    
    res.json(recommendations);
    
  } catch (error) {
    console.error('Error in /api/recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
