using Auth.DataAccess.Models;
using Microsoft.AspNetCore.Identity;

namespace Auth
{
  public static class AddUserTest
  {
    public static void AddUser(WebApplication app, Users user)
    {
      Task.Run(async () =>
      {
        using (var scope = app.Services.CreateScope())
        {
          var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Users>>();

          try
          {
            // Check nếu user đã tồn tại
            var existingUser = await userManager.FindByNameAsync(user.UserName);
            if (existingUser == null)
            {
              // Tạo user + password (Identity sẽ tự hash)
              var result = await userManager.CreateAsync(user, user.Password);

              if (result.Succeeded)
                Console.WriteLine("✔ User 'admin' đã được tạo thành công!");
              else
                Console.WriteLine("❌ Tạo user thất bại: " + string.Join(", ", result.Errors.Select(e => e.Description)));
            }
            else
            {
              Console.WriteLine("⚠ User đã tồn tại");
            }
          }
          catch (Exception ex)
          {

          }
        }
      });
    }
  }
}
