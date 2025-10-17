using System.Text;
using Bidforge.Data;
using Bidforge.Models;
using Bidforge.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---------- EF + Identity ----------
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opts =>
{
    // dev-friendly password rules; tighten for prod
    opts.Password.RequireDigit = false;
    opts.Password.RequireUppercase = false;
    opts.Password.RequireNonAlphanumeric = false;

    opts.User.RequireUniqueEmail = true;
    opts.SignIn.RequireConfirmedEmail = true; // must verify email to log in
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Email token lifespan (optional)
builder.Services.Configure<DataProtectionTokenProviderOptions>(o =>
    o.TokenLifespan = TimeSpan.FromDays(2));

// ---------- JWT ----------
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var jwtKey = builder.Configuration["Jwt:Key"]
             ?? throw new InvalidOperationException("Jwt:Key missing");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.Zero
        };

        // Read JWT from HttpOnly cookie "access_token"
        opts.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (string.IsNullOrEmpty(ctx.Token))
                {
                    var cookie = ctx.Request.Cookies["access_token"];
                    if (!string.IsNullOrEmpty(cookie))
                        ctx.Token = cookie;
                }
                return Task.CompletedTask;
            },
            // Return JSON instead of empty body on 401/403
            OnChallenge = async ctx =>
            {
                ctx.HandleResponse();
                ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                ctx.Response.ContentType = "application/json";
                await ctx.Response.WriteAsync("""{"message":"Unauthorized"}""");
            },
            OnForbidden = async ctx =>
            {
                ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                ctx.Response.ContentType = "application/json";
                await ctx.Response.WriteAsync("""{"message":"Forbidden"}""");
            }
        };

        opts.SaveToken = true;
    });

builder.Services.AddAuthorization();

// ---------- Email sending ----------
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<IEmailSender, MailKitEmailSender>();

// ---------- MVC / Controllers ----------
builder.Services.AddControllers();

// ---------- CORS (Next.js dev) ----------
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .WithOrigins(
            "http://localhost:3000", "https://localhost:3000",
            "http://127.0.0.1:3000", "https://127.0.0.1:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// ---------- Swagger (dev only) ----------
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ---------- Apply migrations & seed ----------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    // DB migrate
    var db = services.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    // Seed Admin role (and attach to an existing admin email if provided)
    var roleMgr = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userMgr = services.GetRequiredService<UserManager<ApplicationUser>>();

    const string adminRole = "Admin";
    if (!await roleMgr.RoleExistsAsync(adminRole))
        await roleMgr.CreateAsync(new IdentityRole(adminRole));

    var adminEmail = builder.Configuration["Seed:AdminEmail"]; // set in appsettings.Development.json
    if (!string.IsNullOrWhiteSpace(adminEmail))
    {
        var admin = await userMgr.FindByEmailAsync(adminEmail);
        if (admin != null && !await userMgr.IsInRoleAsync(admin, adminRole))
            await userMgr.AddToRoleAsync(admin, adminRole);
    }
}

app.Run();
