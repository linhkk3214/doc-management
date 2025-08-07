using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shared.Classes;

namespace Domain.Entities
{
    [Table("DM_Phong")]
    public class DmPhong : BaseEntity
    {
        [Required]
        public int STT { get; set; } // Số thứ tự

        [Required]
        [StringLength(50)]
        public string Ma { get; set; } = string.Empty; // Mã

        [Required]
        [StringLength(500)]
        public string Ten { get; set; } = string.Empty; // Tên

        // Navigation properties
        public virtual ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    }
}
