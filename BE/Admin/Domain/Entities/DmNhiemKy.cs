using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shared.Classes;

namespace Domain.Entities
{
    [Table("DM_NhiemKy")]
    public class DmNhiemKy : BaseEntity
    {
        [Required]
        [StringLength(500)]
        public string Ten { get; set; } = string.Empty; // Tên

        // Navigation properties
        public virtual ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    }
}
