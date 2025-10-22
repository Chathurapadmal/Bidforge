using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Bidforge.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// -------------------------------------
// Connection string
// -------------------------------------
var cs = builder.Configuration.GetConnectionString("DefaultConnection")
         ?? "Server=localhost,1433;Database=BidforgeDb;User Id=sa;Password=yourStrong(!)Password;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=true;Connect Timeout=60";

// -------------------------------------
// Services
// -------------------------------------
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlServer(cs, sql =>
    {
        sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(2), null);
        sql.CommandTimeout(60);
    });
});

// Data Protection (required by DataProtector token provider)
builder.Services.AddDataProtection();

// Identity (ApplicationUser has DisplayName/AvatarUrl/KYC fields)
var idBuilder = builder.Services.AddIdentityCore<ApplicationUser>(opt =>
{
    opt.User.RequireUniqueEmail = true;
    // If you want framework to block sign-in until confirmed:
    // opt.SignIn.RequireConfirmedEmail = true;

    opt.Password.RequireDigit = false;
    opt.Password.RequireUppercase = false;
    opt.Password.RequireNonAlphanumeric = false;
    opt.Password.RequiredLength = 6;

    // Ensure Identity uses the default provider for email confirmation tokens
    opt.Tokens.EmailConfirmationTokenProvider = TokenOptions.DefaultProvider;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>()
.AddSignInManager<SignInManager<ApplicationUser>>()
.AddDefaultTokenProviders(); // registers DataProtector provider etc.

// Optional: tune token lifespans
builder.Services.Configure<DataProtectionTokenProviderOptions>(o =>
{
    o.TokenLifespan = TimeSpan.FromHours(24);
});

// App services
builder.Services.AddScoped<JwtTokenService>();
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<IEmailSender, EmailSender>();

// -------------------------------------
// JWT (dev key). Replace with secure key in prod (User Secrets/KeyVault).
// -------------------------------------
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtIssuer = jwtSection["Issuer"] ?? "Bidforge";
var jwtAudience = jwtSection["Audience"] ?? "BidforgeClient";
var cookieName = jwtSection["CookieName"] ?? "auth";

// 32-byte symmetric key from hex
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
    // Also accept JWT from cookie "auth" (optional)
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

// CORS for Next.js
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .WithOrigins("http://localhost:3000", "https://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// Large multipart uploads (images/KYC)
builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 20_000_000; // 20MB
});

// MVC + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// -------------------------------------
// Pipeline
// -------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Ensure static upload folders
var env = app.Services.GetRequiredService<IWebHostEnvironment>();
var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "auctions"));
Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "avatars"));
Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "kyc"));

// app.UseHttpsRedirection(); // keep off for HTTP dev if preferred
app.UseStaticFiles();          // serves /uploads/**

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

// -------------------------------------
// DB migrate + Role seeding + Optional bootstrap admin
// -------------------------------------
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

    // Seed roles and optional bootstrap admin
    var roleMgr = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userMgr = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    async Task EnsureRole(string name)
    {
        if (!await roleMgr.RoleExistsAsync(name))
            await roleMgr.CreateAsync(new IdentityRole(name));
    }

    await EnsureRole("User");
    await EnsureRole("Admin");

    var adminEmail = builder.Configuration["BootstrapAdmin:Email"];
    var adminPass = builder.Configuration["BootstrapAdmin:Password"];

    if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPass))
    {
        var admin = await userMgr.FindByEmailAsync(adminEmail);
        if (admin is null)
        {
            admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                DisplayName = "Admin"
            };
            var res = await userMgr.CreateAsync(admin, adminPass);
            if (res.Succeeded)
            {
                await userMgr.AddToRoleAsync(admin, "Admin");
                logger.LogInformation("Bootstrap admin created: {Email}", adminEmail);
            }
            else
            {
                logger.LogWarning("Failed to create bootstrap admin: {Err}", string.Join("; ", res.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            if (!await userMgr.IsInRoleAsync(admin, "Admin"))
            {
                await userMgr.AddToRoleAsync(admin, "Admin");
                logger.LogInformation("Bootstrap admin promoted: {Email}", adminEmail);
            }
        }
    }
}

// -------------------------------------
// Debug endpoint list (dev helper)
// -------------------------------------
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

// Controllers
app.MapControllers();

app.Run();
