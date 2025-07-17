using AuctionSystem.Data;
using AuctionSystem.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace AuctionSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register(User user)
        {
            if (_context.Users.Any(u => u.Email == user.Email))
                return BadRequest("User already exists");

            user.PasswordHash = ComputeSha256Hash(user.PasswordHash);
            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("User registered successfully");
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] User credentials)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == credentials.Email);
            if (user == null || user.PasswordHash != ComputeSha256Hash(credentials.PasswordHash))
                return Unauthorized("Invalid credentials");

            // Later: generate JWT here
            return Ok(new { message = "Login successful", role = user.Role });
        }

        private string ComputeSha256Hash(string rawData)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                var builder = new StringBuilder();
                foreach (var b in bytes)
                    builder.Append(b.ToString("x2"));
                return builder.ToString();
            }
        }
    }
}
