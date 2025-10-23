// File: Program.cs
using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Bidforge.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Http.Metadata;   // <-- for IHttpMethodMetadata
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;         // EndpointDataSource, RouteEndpoint
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ----------------------------------------------------
// Connection string
// ----------------------------------------------------
var cs = builder.Configuration.GetConnectionString("DefaultConnection")
         ?? "Server=localhost,1433;Database=BidforgeDb;User Id=chathura;Password=7895123;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=true;Connect Timeout=60";

// ----------------------------------------------------
// Services
// ----------------------------------------------------

// EF Core
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlServer(cs, sql =>
    {
        sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(2), null);
        sql.CommandTimeout(60);
    });
});

// Identity (Core) + Roles
builder.Services.AddIdentityCore<ApplicationUser>(opt =>
{
    opt.User.RequireUniqueEmail = true;
    opt.Password.RequireDigit = false;
    opt.Password.RequireUppercase = false;
    opt.Password.RequireNonAlphanumeric = false;
    opt.Password.RequiredLength = 6;

    // We enforce email confirmation in the controller at login.
    opt.SignIn.RequireConfirmedEmail = false;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>()
.AddSignInManager<SignInManager<ApplicationUser>>()
.AddDefaultTokenProviders(); // needed for email confirmation tokens

// Align Identity's claim types (role, user id) with what we validate in JWT
builder.Services.PostConfigure<IdentityOptions>(opt =>
{
    opt.ClaimsIdentity.RoleClaimType = ClaimTypes.Role;               // standard role claim
    opt.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;   // user id
});

// ---- Email sender (MailKit) ----
// Ensure you have a concrete EmailSender : IEmailSender that uses Smtp settings from appsettings.json
builder.Services.AddScoped<IEmailSender, EmailSender>();

// ---- JWT token service (emits both ClaimTypes.Role and "role") ----
builder.Services.AddScoped<JwtTokenService>();

// ---------------- JWT config ----------------
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtIssuer = jwtSection["Issuer"] ?? "Bidforge";
var jwtAudience = jwtSection["Audience"] ?? "BidforgeClient";
var cookieName = jwtSection["CookieName"] ?? "auth";

// 32-byte+ hex key for HMAC
var keyHex = jwtSection["KeyHex"]
             ?? "a06f684c8ed4b8cd631643301ea09ffde645a7940ebc7c660d0bfef5fe270294"; // dev only
var keyBytes = Convert.FromHexString(keyHex);
if (keyBytes.Length < 32)
    throw new InvalidOperationException($"JWT key must be >= 32 bytes; got {keyBytes.Length}.");

var signingKey = new SymmetricSecurityKey(keyBytes);

builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(o =>
{
    o.RequireHttpsMetadata = false; // dev over http
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
        ClockSkew = TimeSpan.FromSeconds(30),

        // IMPORTANT: we treat ClaimTypes.Role as the role claim type.
        // (JwtTokenService also emits "role", so clients can still read it easily.)
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.NameIdentifier
    };
    o.Events = new JwtBearerEvents
    {
        OnMessageReceived = ctx =>
        {
            // If no Authorization header, try cookie
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

// CORS for frontends
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p =>
        p.WithOrigins(
            "http://localhost:3000",
            "https://localhost:3000",
            "http://127.0.0.1:3000",
            "http://192.168.1.104:3000",
            "https://192.168.1.104:3000"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
    );
});

// Large multipart for image uploads
builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 50_000_000; // 50 MB
});

// MVC + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ----------------------------------------------------
// Pipeline
// ----------------------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

// ----------------------------------------------------
// DB migrate + seed roles + optional bootstrap admin
// ----------------------------------------------------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    var db = services.GetRequiredService<AppDbContext>();
    var userMgr = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleMgr = services.GetRequiredService<RoleManager<IdentityRole>>();

    try
    {
        db.Database.Migrate();
        logger.LogInformation("Database migrated successfully.");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Migrate() failed, falling back to EnsureCreated().");
        db.Database.EnsureCreated();
        logger.LogInformation("Database ensured via EnsureCreated.");
    }

    // Seed roles
    async Task EnsureRoleAsync(string roleName)
    {
        if (!await roleMgr.RoleExistsAsync(roleName))
        {
            await roleMgr.CreateAsync(new IdentityRole(roleName));
            logger.LogInformation("Created role {Role}", roleName);
        }
    }

    await EnsureRoleAsync("Admin");
    await EnsureRoleAsync("User");

    // Optional: bootstrap admin from config
    var adminEmail = builder.Configuration["BootstrapAdmin:Email"];
    var adminPass = builder.Configuration["BootstrapAdmin:Password"];
    if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPass))
    {
        var existing = await userMgr.FindByEmailAsync(adminEmail);
        if (existing is null)
        {
            var admin = new ApplicationUser
            {
                Email = adminEmail,
                UserName = adminEmail,
                DisplayName = "Administrator",
                EmailConfirmed = true
            };
            var res = await userMgr.CreateAsync(admin, adminPass);
            if (res.Succeeded)
            {
                await userMgr.AddToRoleAsync(admin, "Admin");
                await userMgr.AddToRoleAsync(admin, "User");
                logger.LogInformation("Bootstrapped admin {Email}", adminEmail);
            }
            else
            {
                logger.LogError("Failed to create bootstrap admin: {Errs}",
                    string.Join("; ", res.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            var roles = await userMgr.GetRolesAsync(existing);
            if (!roles.Contains("Admin"))
                await userMgr.AddToRoleAsync(existing, "Admin");
            if (!roles.Contains("User"))
                await userMgr.AddToRoleAsync(existing, "User");
        }
    }
}

// ----------------------------------------------------
// Diagnostics
// ----------------------------------------------------

// List endpoints
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

// DB ping
app.MapGet("/db/ping", async (AppDbContext db) =>
{
    try
    {
        var ok = await db.Database.ExecuteSqlRawAsync("SELECT 1");
        return Results.Ok(new { ok = ok == -1, provider = db.Database.ProviderName });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

// Who am I (requires auth) – single mapping, no ambiguity
app.MapGet("/api/_debug/whoami", (ClaimsPrincipal user) =>
{
    var id = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
    var email = user.FindFirstValue(ClaimTypes.Email) ?? user.FindFirstValue("email");
    var roles = user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray();
    // include "role" claims too if any
    var extra = user.FindAll("role").Select(c => c.Value).ToArray();
    roles = roles.Concat(extra).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
    return Results.Ok(new { id, email, roles });
}).RequireAuthorization();

// MVC Controllers
app.MapControllers();

app.Run();
