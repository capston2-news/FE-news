import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const AdminSummary = ({ articles }) => {
    const labels = articles.map(a => a.title)
    const data = {
        labels,
        datasets: [
            {
                label: 'Views',
                data: articles.map(a => a.views || 0),
                backgroundColor: 'rgba(37,99,235,0.7)'
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Article Views' }
        }
    }

    return (
        <div>
            <h3>Article performance</h3>
            <Bar options={options} data={data} />
        </div>
    )
}

export default AdminSummary
