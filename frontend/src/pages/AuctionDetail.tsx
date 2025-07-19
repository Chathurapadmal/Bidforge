import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../Services/api';

interface Auction {
  id: number;
  title: string;
  description: string;
  currentPrice: number;
  endTime: string;
}

const AuctionDetail: React.FC = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);

  useEffect(() => {
    api.get(`/auction/${id}`).then(res => setAuction(res.data));
  }, [id]);

  const placeBid = async () => {
    try {
      await api.post('/auction/bid', {
        auctionId: id,
        userId: 1, // replace with actual logged-in user ID
        amount: bidAmount,
      });
      alert('Bid placed!');
    } catch {
      alert('Failed to place bid');
    }
  };

  if (!auction) return <p>Loading...</p>;

  return (
    <div>
      <h2>{auction.title}</h2>
      <p>{auction.description}</p>
      <p>Current Price: Rs. {auction.currentPrice}</p>
      <input type="number" value={bidAmount} onChange={e => setBidAmount(+e.target.value)} />
      <button onClick={placeBid}>Place Bid</button>
    </div>
  );
};

export default AuctionDetail;
tsx