using Shared.Classes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using Shared.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Shared.MediatR.Queries;
using MediatR;

namespace Shared.Classes
{
  [ApiController]
  [Route("[controller]")]
  public abstract class BaseController<T, T2> : ControllerBase where T : IBaseService<T2> where T2 : BaseEntity
  {
    private readonly IMediator _mediator;
    private readonly T _service;

    private protected IMediator Mediator => _mediator;
    private protected T Service => _service;

    public BaseController(IServiceProvider serviceProvider, IMediator mediator)
    {
      this._mediator = mediator;
      _service = serviceProvider.GetRequiredService<T>();
    }

#if DEBUG
    [HttpGet("CheckAlive")]
    public string TestAlive()
    {
      return "Ok";
    }
#endif

    //[Authorize]
    [HttpPost("GetData")]
    public async Task<IActionResult> GetData(QueryData queryData)
    {
      return ResponseResult(
          string.IsNullOrEmpty(queryData.Fields) ? await _service.GetData(queryData, null)
          : await _service.GetDataDynamic(queryData, default)
      );
    }

    protected virtual IActionResult ResponseResult(IMethodResult result)
    {
      if (!result.Success && result.Status > 0)
      {
        if (result.Status == 403)
          return Forbid();
        else if (result.Status == 404)
          return NotFound(result);
        else if (result.Status == 409)
          return StatusCode((int)HttpStatusCode.Conflict);
      }

      return Ok(result);
    }
  }
}
