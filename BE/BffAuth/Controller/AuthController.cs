using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace BffAuth.Controller
{
  [ApiController]
  [Route("auth")]
  public class AuthController : ControllerBase
  {
    private readonly IHttpClientFactory _httpClientFactory;

    public AuthController(IHttpClientFactory httpClientFactory)
    {
      _httpClientFactory = httpClientFactory;
    }

    [HttpPost("exchange-token")]
    public async Task<IActionResult> ExchangeToken([FromBody] CodeDto dto)
    {
      var client = _httpClientFactory.CreateClient();

      var parameters = new Dictionary<string, string>
      {
        {"grant_type", "authorization_code"},
        {"code", dto.Code},
        {"redirect_uri", dto.RedirectUri},
        {"client_id", "angular-client"},
        {"code_verifier", dto.CodeVerifier}
      };

      var response = await client.PostAsync("https://localhost:6969/connect/token", new FormUrlEncodedContent(parameters));

      if (!response.IsSuccessStatusCode)
        return BadRequest("Token exchange failed");

      var tokenResult = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
      var accessToken = tokenResult.RootElement.GetProperty("access_token").GetString();

      // Set access_token vào HttpOnly Cookie
      Response.Cookies.Append("access_token", accessToken, new CookieOptions
      {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Lax,
        Domain = "localhost"
      });

      return Ok(new { message = "Token exchanged and cookie set!" });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
      Response.Cookies.Delete("access_token", new CookieOptions { Domain = "localhost" });
      return Ok(new { message = "Logged out" });
    }
  }

  public class CodeDto
  {
    public string Code { get; set; }
    public string RedirectUri { get; set; }
    public string CodeVerifier { get; set; }
  }
}
