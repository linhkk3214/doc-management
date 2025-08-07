using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shared.Classes;

namespace Domain.Entities
{
    [Table("Portfolios")]
    public class Portfolio : BaseEntity
    {
        [Required]
        public Guid DepartmentId { get; set; } // IdDM_Phong
        
        [Required]
        public Guid TermId { get; set; } // IdDM_NhiemKy
        
        [Required]
        public int CatalogNumber { get; set; } // Mục lục số
        
        [Required]
        public int BoxNumber { get; set; } // Hộp số
        
        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty; // Mã
        
        [Required]
        [StringLength(500)]
        public string Name { get; set; } = string.Empty; // Tên
        
        public DateTime? StartDate { get; set; } // Ngày bắt đầu
        
        public DateTime? EndDate { get; set; } // Ngày kết thúc
        
        [Required]
        public int RetentionPeriod { get; set; } // Thời hạn bảo quản (0 là vĩnh viễn)

        [StringLength(1000)]
        public string OriginalAddress { get; set; } = string.Empty; // Địa chỉ tài liệu gốc
        
        [StringLength(2000)]
        public string OriginalPath { get; set; } = string.Empty; // Đường dẫn gốc
        
        // Navigation properties
        public virtual DmPhong? Department { get; set; }
        public virtual DmNhiemKy? Term { get; set; }
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    }
}
