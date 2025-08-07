using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Shared
{
  public static class StartupExtensions
  {
    public static void ConfigureBase(this WebApplicationBuilder builder)
    {
      builder.Services.AddControllers();
      // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
      builder.Services.AddEndpointsApiExplorer();
      builder.Services.AddSwaggerGen()
                      .AddLogging(logging =>
                      {
                        logging.AddConsole();
                      })
                      .AddCors(opt =>
                      {
                        opt.AddDefaultPolicy(builder =>
                        {
                          builder//.WithOrigins("http://localhost:4200", "http://localhost:4300") // URL của frontend
                              .AllowAnyOrigin()
                              .AllowAnyHeader()
                              .AllowAnyMethod();
                        });
                      })
                      ;
      builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opt =>
        {
          opt.Authority = "https://localhost:6996";
          opt.RequireHttpsMetadata = false; // Đặt thành false khi phát triển trên localhost
          opt.TokenValidationParameters = new TokenValidationParameters
          {
            ValidateAudience = false, // Bỏ qua xác thực Audience
            ValidateIssuer = true, // Xác thực Issuer (Identity Server)
          };
        })
        //.AddAuthentication(options =>
        //{
        //  options.DefaultScheme = "Bearer";
        //  options.DefaultChallengeScheme = defaultScheme;
        //})
        //.AddCookie(options =>
        //{
        //  options.Cookie.Name = "Cookies";
        //  options.LoginPath = "/Account/Login";
        //})
        //.AddOpenIdConnect(defaultScheme, options =>
        //{
        //  options.Authority = "http://localhost:5001";

        //  options.ClientId = "mvc";
        //  options.ClientSecret = "secret";
        //  options.ResponseType = "code";

        //  options.SaveTokens = true;

        //  //options.Scope.Add("profile");
        //  //options.GetClaimsFromUserInfoEndpoint = true;
        //})
        ;
      builder.Services.AddAuthorization();
    }

    public static void ConfigureBase(this WebApplication app)
    {
      // Configure the HTTP request pipeline.
      if (app.Environment.IsDevelopment())
      {
        app.UseSwagger();
        app.UseSwaggerUI();
      }

      app.UseHttpsRedirection();

      app.UseAuthentication();
      app.UseAuthorization();

      app.UseCors();

      app.MapControllers();
      app.MapGraphQL();

      //string appName = app.Configuration["App:Name"];
      //if (string.IsNullOrEmpty(appName))
      //  throw new Exception("Missing configuration App:Name");
      //ServiceFactory.SetServiceProvider(appName, app.Services);
    }
  }
}