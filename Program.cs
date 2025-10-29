using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Bidforge.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// -------------------------------
// Connection string
// -------------------------------
var cs = builder.Configuration.GetConnectionString("DefaultConnection")
         ?? "Server=localhost,1433;Database=BidforgeDb;User Id=chathura;Password=7895123;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=true;Connect Timeout=60";

// -------------------------------
// Services
// -------------------------------
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlServer(cs, sql =>
    {
        sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(2), null);
        sql.CommandTimeout(60);
    });
});

// Identity (ApplicationUser with DisplayName/AvatarUrl)
builder.Services.AddIdentityCore<ApplicationUser>(opt =>
{
    opt.User.RequireUniqueEmail = true;
    opt.Password.RequireDigit = false;
    opt.Password.RequireUppercase = false;
    opt.Password.RequireNonAlphanumeric = false;
    opt.Password.RequiredLength = 6;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>()
.AddSignInManager<SignInManager<ApplicationUser>>();

builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<UserApprovalService>();

// -------------------------------
// JWT (dev key)
// -------------------------------
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtIssuer = jwtSection["Issuer"] ?? "Bidforge";
var jwtAudience = jwtSection["Audience"] ?? "BidforgeClient";
var cookieName = jwtSection["CookieName"] ?? "auth";

// 32-byte key (hex)
var keyBytes = Convert.FromHexString("a06f684c8ed4b8cd631643301ea09ffde645a7940ebc7c660d0bfef5fe270294");
if (keyBytes.Length < 32) throw new InvalidOperationException("JWT key must be >= 32 bytes.");
var signingKey = new SymmetricSecurityKey(keyBytes);

builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(o =>
{
    o.RequireHttpsMetadata = false; // dev
    o.SaveToken = true;
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = signingKey,
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30)
    };
    // Optional: allow JWT via cookie "auth" (if you add it later)
    o.Events = new JwtBearerEvents
    {
        OnMessageReceived = ctx =>
        {
            if (string.IsNullOrEmpty(ctx.Token) &&
                ctx.Request.Cookies.TryGetValue(cookieName, out var t) &&
                !string.IsNullOrEmpty(t))
            {
                ctx.Token = t;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// CORS for Next.js at localhost:3000
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .WithOrigins("http://localhost:3000", "https://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// Large multipart uploads
builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 20_000_000; // 20MB
});

// MVC + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// -------------------------------
// Pipeline
// -------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Ensure static folders (images)
var env = app.Services.GetRequiredService<IWebHostEnvironment>();
var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "auctions"));
Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "avatars"));
Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "nic"));

// app.UseHttpsRedirection(); // keep off for local HTTP testing
app.UseStaticFiles();          // serves /uploads/**

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

// -------------------------------
// DB init (migrate or ensure created)
// -------------------------------
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.Migrate();
        logger.LogInformation("Database migrated successfully.");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Migrate() failed, falling back to EnsureCreated()");
        db.Database.EnsureCreated();
        logger.LogInformation("Database ensured via EnsureCreated.");
    }
}

// -------------------------------
// Debug endpoint list
// -------------------------------
app.MapGet("/_endpoints", (EndpointDataSource es) =>
{
    var items = es.Endpoints
        .OfType<RouteEndpoint>()
        .Select(e =>
        {
            var methods = e.Metadata.GetMetadata<IHttpMethodMetadata>()?.HttpMethods
                          ?? Array.Empty<string>();
            return new
            {
                route = e.RoutePattern.RawText,
                methods = methods.Count > 0 ? string.Join(",", methods) : "(any)"
            };
        });
    return Results.Json(items);
});

// Controllers (Auctions, Profile, Notifications, Bids, etc.)
app.MapControllers();

app.Run();
