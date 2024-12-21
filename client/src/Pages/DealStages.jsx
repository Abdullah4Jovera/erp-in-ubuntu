import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const DealStages = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const [dealStages, setDealStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDealStages = async () => {
            try {
                const response = await axios.get(`/api/deal-stages/get-all-deal-stages`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Pass token in the headers
                    },
                });
                setDealStages(response.data); // Update state with fetched deal stages
            } catch (err) {
                setError('Failed to load deal stages');
            } finally {
                setLoading(false); // Set loading to false after the API call
            }
        };

        if (token) {
            fetchDealStages(); // Fetch data when token is available
        } else {
            setLoading(false); // If no token, stop loading
            setError('No authentication token found');
        }
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Deal Stages</h2>
            <ul>
                {dealStages.map((stage) => (
                    <li key={stage.id}>{stage.name}</li> // Assuming each deal stage has an 'id' and 'name' field
                ))}
            </ul>
        </div>
    );
};

export default DealStages;
