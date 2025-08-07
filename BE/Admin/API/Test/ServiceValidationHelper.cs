namespace API.Test
{
  public static class ServiceValidationHelper
  {
    public static void ValidateServices(IServiceProvider serviceProvider)
    {
      // Lấy danh sách tất cả các service đã được đăng ký
      var serviceDescriptors = serviceProvider.GetService<IServiceCollection>();

      if (serviceDescriptors != null)
      {
        foreach (var serviceDescriptor in serviceDescriptors)
        {
          try
          {
            // Resolve service từ container
            using var scope = serviceProvider.CreateScope();
            var service = scope.ServiceProvider.GetService(serviceDescriptor.ServiceType);

            // Nếu service là null và không phải dạng Optional, báo lỗi
            if (service == null && serviceDescriptor.Lifetime != ServiceLifetime.Transient)
            {
              Console.WriteLine($"[Warning] Service {serviceDescriptor.ServiceType.FullName} không được khởi tạo.");
            }
          }
          catch (Exception ex)
          {
            // Báo lỗi chi tiết nếu không resolve được service
            Console.WriteLine($"[Error] Không thể resolve service {serviceDescriptor.ServiceType.FullName}: {ex.Message}");
          }
        }
      }
    }
  }
}
