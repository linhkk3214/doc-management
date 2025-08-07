using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Classes
{
  public interface IMethodResult
  {
    /// <summary>
    /// Trạng thái thành công hay không
    /// </summary>
    bool Success { get; set; }
    string? Error { get; set; }
    /// <summary>
    /// Mã lỗi trả về (trong trường hợp trả về qua http thì đây là http status code)
    /// </summary>
    int Status { get; set; }
  }
  /// <summary>
  /// Mọi kết quả trả về của Repository
  /// </summary>
  /// <typeparam name="T"></typeparam>
  public interface IMethodResult<T> : IMethodResult
  {
    /// <summary>
    /// Output trả về nếu thành công
    /// </summary>
    T? Data { get; set; }
    int Total { get; set; }
  }

  public class MethodResult<T> : IMethodResult<T>
  {
    public bool Success { get; set; } = true;
    public T? Data { get; set; }
    public string? Error { get; set; }
    public int Status { get; set; }
    public int Total { get; set; }

    public static MethodResult<T> ResultWithData(T data, int totalRecord = 0,
        [CallerFilePath] string filePath = "", [CallerLineNumber] int lineNumber = 0, [CallerMemberName] string caller = ""
    )
    {
      var a = new MethodResult<T>()
      {
        Data = data,
        Total = totalRecord
      };
      return a;
    }

    public static MethodResult<T> ResultWithError(string error, int? status = 500,
        [CallerFilePath] string filePath = "", [CallerLineNumber] int lineNumber = 0, [CallerMemberName] string caller = ""
    )
    {
      return new MethodResult<T>()
      {
        Success = false,
        Error = error,
        Status = status.Value
      };
    }

    public static MethodResult<T> ResultWithException(Exception ex,
        [CallerFilePath] string filePath = "", [CallerLineNumber] int lineNumber = 0, [CallerMemberName] string caller = ""
    )
    {
      return new MethodResult<T>()
      {
        Success = false,
        Status = 500
      };
    }

    public static MethodResult<T> ResultWithNotFound(
        [CallerFilePath] string filePath = "", [CallerLineNumber] int lineNumber = 0, [CallerMemberName] string caller = ""
    )
    {
      return ResultWithError("Không tìm thấy dữ liệu đã yêu cầu", 400, filePath: filePath, lineNumber: lineNumber, caller: caller);
    }
  }
}
