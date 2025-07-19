import React, { useEffect, useState } from 'react';
import api from '../Services/api';

interface Auction {
    id: number;
    title: string;
    description: string;
    currentPrice: number;
    endTime: string;
}

const Home: React.FC = () => {
    const [auctions, setAuctions] = useState<Auction[]>([]);

    useEffect(() => {
        api.get('/auction').then(res => setAuctions(res.data));
    }, []);

    return (
        <div>
            <h2>Live Auctions</h2>
            {auctions.map(a => (
                <div key={a.id}>
                    <h3>{a.title}</h3>
                    <p>{a.description}</p>
                    <p>Current Bid: Rs. {a.currentPrice}</p>
                    <p>Ends at: {new Date(a.endTime).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
};

export default Home;
