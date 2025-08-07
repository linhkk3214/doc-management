using static IdentityServer4.IdentityServerConstants;
namespace Auth.Extensions
{
  public static class AuthenticationExtensions
  {
    public static void AddAuthentication(this IServiceCollection services)
    {
      services.AddAuthentication(options =>
      {
        options.DefaultScheme = "Cookies";
        options.DefaultChallengeScheme = "oidccc";
      })
        .AddCookie(options =>
        {
          options.Cookie.Name = "Cookies";
          options.LoginPath = "/Account/Login";
        })
        .AddOpenIdConnect("oidccc", options =>
        {
          options.Authority = "https://localhost:5001";

          options.ClientId = "mvc";
          options.ClientSecret = "secret";
          options.ResponseType = "code";

          options.SaveTokens = true;

          options.Scope.Add(StandardScopes.Profile);
          options.Scope.Add(StandardScopes.OpenId);
          options.Scope.Add(StandardScopes.OfflineAccess);
          //options.GetClaimsFromUserInfoEndpoint = true;
        });
    }
  }
}
