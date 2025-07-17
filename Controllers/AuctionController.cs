using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuctionSystem.Data;
using AuctionSystem.Models;

namespace AuctionSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuctionController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/auction
        [HttpGet]
        public async Task<IActionResult> GetAuctions()
        {
            var auctions = await _context.Auctions
                .Include(a => a.Seller)
                .Include(a => a.Bids)
                .ToListAsync();

            return Ok(auctions);
        }

        // POST: api/auction
        [HttpPost]
        public async Task<IActionResult> CreateAuction([FromBody] Auction auction)
        {
            auction.CurrentPrice = auction.StartingPrice;
            _context.Auctions.Add(auction);
            await _context.SaveChangesAsync();
            return Ok(auction);
        }

        // POST: api/auction/bid
        [HttpPost("bid")]
        public async Task<IActionResult> PlaceBid([FromBody] Bid bid)
        {
            var auction = await _context.Auctions.FindAsync(bid.AuctionId);
            if (auction == null) return NotFound("Auction not found");

            if (DateTime.Now > auction.EndTime)
                return BadRequest("Auction has ended");

            if (bid.Amount <= auction.CurrentPrice)
                return BadRequest("Bid must be higher than current price");

            auction.CurrentPrice = bid.Amount;
            _context.Bids.Add(bid);
            _context.Auctions.Update(auction);
            await _context.SaveChangesAsync();

            return Ok("Bid placed successfully");
        }
    }
}
