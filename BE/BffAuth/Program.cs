var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Enable Cookie Auth
builder.Services.AddAuthentication("cookie")
    .AddCookie("cookie", options =>
    {
      options.Cookie.Name = "access_token";
      options.Cookie.HttpOnly = true;
      options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // nên bật khi dùng https
      options.Cookie.SameSite = SameSiteMode.Lax; // hoặc Strict nếu không cần redirect qua lại
      options.Cookie.Domain = "localhost"; // ✅ domain trong local
    });

builder.Services.AddControllers();
builder.Services.AddHttpClient(); // Để call IdentityServer4

builder.Services.AddCors(options =>
{
  options.AddPolicy("allow_spa", policy =>
  {
    policy.WithOrigins("https://localhost:4200")
          .AllowCredentials()
          .AllowAnyHeader()
          .AllowAnyMethod();
  });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseCors("allow_spa");
app.MapControllers();

app.Run();
