// File: Mapping/UserMapper.cs
using System;
using Bidforge.Models;

namespace Bidforge.Mapping
{
    public static class UserMapper
    {
        // Public DTO matching (and supersetting) your previous fields
        public sealed class UserDto
        {
            public string Id { get; set; } = default!;
            public string? Email { get; set; }
            public string? Name { get; set; }
            public bool EmailConfirmed { get; set; }

            // Derived from KycStatus == "approved"
            public bool IsApproved { get; set; }

            // IdentityUser doesn't include created timestamp by default;
            // keep nullable to preserve shape used elsewhere.
            public DateTime? CreatedAt { get; set; }

            // Renamed backing fields in ApplicationUser
            public string? NicImagePath { get; set; }      // maps from NicImageUrl
            public string? SelfieImagePath { get; set; }   // maps from SelfieImageUrl

            // Not stored currently; keep for compatibility (null)
            public string? NicNumber { get; set; }

            // Extras that may be useful to UI
            public string? AvatarUrl { get; set; }
            public string KycStatus { get; set; } = "none";
        }

        public static UserDto ToDto(ApplicationUser u)
        {
            return new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                Name = u.DisplayName ?? u.Email,
                EmailConfirmed = u.EmailConfirmed,

                // Interpret approved state from KYC
                IsApproved = string.Equals(u.KycStatus, "approved", StringComparison.OrdinalIgnoreCase),

                // No CreatedAt on IdentityUser by default; leave null
                CreatedAt = null,

                // Map to old names expected by UI
                NicImagePath = u.NicImageUrl,
                SelfieImagePath = u.SelfieImageUrl,

                // Not persisted unless you add it to ApplicationUser + migration
                NicNumber = null,

                AvatarUrl = u.AvatarUrl,
                KycStatus = u.KycStatus ?? "none"
            };
        }
    }
}
