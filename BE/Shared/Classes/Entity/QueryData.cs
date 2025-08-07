using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Classes
{
  public class QueryData
  {
    /// <summary>
    /// The page that contains the data.
    /// </summary>
    public int Page { get; set; }
    /// <summary>
    /// The maximum quantity of records that we want to get.
    /// </summary>
    public int PageSize { get; set; }
    /// <summary>
    /// The field list that we want to select. Separated by comma (,).
    /// </summary>
    public string? Fields { get; set; }
    /// <summary>
    /// The sort <see cref="Sort"/> list.
    /// </summary>
    public List<Filter>? Filters { get; set; }
    /// <summary>
    /// The sort <see cref="Sort"/> list.
    /// </summary>
    public List<Sort>? Sorts { get; set; }
    public QueryData()
    {
      Page = 1;
      PageSize = 15;
    }
  }

  public class Sort
  {
    /// <summary>
    /// The field will be sorted.
    /// </summary>
    public required string Field { get; set; }
    /// <summary>
    /// Indicate the sort direction.
    /// </summary>
    public Direction Dir { get; set; }
  }

  public enum Direction
  {
    Asc = 1,
    Desc = -1
  }

  public class Filter
  {
    /// <summary>
    /// The field will be filtered.
    /// </summary>
    public string Field { get; set; }
    /// <summary>
    /// The operator <see cref="FilterOperator"/> of filter
    /// </summary>
    public FilterOperator Operator { get; set; }
    /// <summary>
    /// The filter value is represented by a JSON string
    /// Example: 
    ///   1 => "1"
    ///   [1, 2] => "[1,2]"
    ///   Date => "2023-09-23T10:08:01.202Z"
    /// </summary>
    public string? Value { get; set; }
    /// <summary>
    /// The filtering logic for the descendants filter/>
    /// </summary>
    public Logic? Logic { get; set; }
    /// <summary>
    /// The descendants filter
    /// </summary>
    public List<Filter>? Filters { get; set; }

    public Filter() { }

    public Filter(Logic logic, List<Filter> filters)
    {
      this.Logic = logic;
      this.Filters = filters;
    }

    public Filter(string field, FilterOperator op, string value)
    {
      Field = field;
      Operator = op;
      Value = value;
    }

    /// <summary>
    /// Create a filter and append to the descendants filter
    /// The caller must ensure that Filters is not null
    /// </summary>
    public Filter Add(string field, FilterOperator op, string value)
    {
      Filters.Add(new Filter(field, op, value));
      return this;
    }
  }

  public class DataGrid<T>
  {
    public required List<T> Data;

    public int Total;
  }

  public enum FilterOperator
  {
    Equal = 1,
    NotEqual,
    Lower,
    LowerOrEqual,
    Greater,
    GreaterOrEqual,

    Contains,
    NotContains,
    StartsWith,
    NotStartsWith,
    EndsWith,
    NotEndsWith,

    In,
    NotIn,

    IsNull,
    IsNotNull,
    IsTrue,
    IsFalse,

    RelationalData
}

  public enum Logic
  {
    Or = 1,
    And = 2
  }
}
