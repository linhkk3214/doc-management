using System.IdentityModel.Tokens.Jwt;
using IdentityServer4.Configuration;
using Microsoft.IdentityModel.Logging;
using Auth;
using Auth.Extensions;
using Auth.DataAccess;
using Microsoft.AspNetCore.Identity;
using Auth.DataAccess.Models;

var builder = WebApplication.CreateBuilder(args);

JwtSecurityTokenHandler.DefaultMapInboundClaims = false;
IdentityModelEventSource.ShowPII = true;

// Add services to the container.
builder.Services.AddControllersWithViews();
//AuthenticationExtensions.AddAuthentication(builder.Services);
builder.Services.AddAuthorization();
builder.Services.AddCors(opt =>
{
  opt.AddDefaultPolicy(op => op.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddAuthDbContext(builder.Configuration);
builder.Services.AddIdentityServer(opt =>
{
  opt.UserInteraction = new UserInteractionOptions() { ConsentUrl = "https://localhost:6996" };
})
  .AddDeveloperSigningCredential()
  .AddInMemoryIdentityResources(Config.IdentityResources)
  .AddInMemoryApiScopes(Config.ApiScopes)
  .AddInMemoryClients(Config.Clients)
  .AddTestUsers(TestUsers.Users);
  //.AddAspNetIdentity<Users>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
  app.UseExceptionHandler("/Home/Error");
  // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
  app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseCors();
app.UseIdentityServer();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

//AddUserTest.AddUser(app, new Users
//{
//  UserName = "linhdh",
//  Email = "admin@example.com",
//  EmailConfirmed = true,
//  Password = "123456a@A"
//});
app.Run();

