using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shared.Classes;

namespace Domain.Entities
{
    [Table("Documents")]
    public class Document : BaseEntity
    {
        [Required]
        public Guid PortfolioId { get; set; } // Thuộc về hồ sơ nào
        
        [Required]
        public Guid DocumentTypeId { get; set; } // Loại văn bản (DM_LoaiVanBan)
        
        public int? TrangSo { get; set; }

        [Required]
        [StringLength(1000)]
        public string Title { get; set; } = string.Empty; // Tiêu đề
        
        [StringLength(2000)]
        public string Summary { get; set; } = string.Empty; // Trích yếu
        
        [Required]
        public int DocumentNumber { get; set; } // Số văn bản
        
        [Required]
        [StringLength(100)]
        public string DocumentSymbol { get; set; } = string.Empty; // Ký hiệu văn bản
        
        [Required]
        [StringLength(500)]
        public string IssuingAgency { get; set; } = string.Empty; // Cơ quan ban hành
        
        [Required]
        public int SequenceNumber { get; set; } // Số thứ tự trong hồ sơ
        
        public DateTime? SignedDate { get; set; } // Ngày ký
        
        [StringLength(200)]
        public string Signer { get; set; } = string.Empty; // Người ký
        
        [Required]
        public int DocumentFormat { get; set; } // Loại bản (1: bản chính, 2: bản sao, etc)
        
        [Required]
        public int PageCount { get; set; } // Số lượng trang văn bản
        
        [StringLength(1000)]
        public string OriginalAddress { get; set; } = string.Empty; // Địa chỉ tài liệu gốc
        
        [StringLength(2000)]
        public string OriginalPath { get; set; } = string.Empty; // Đường dẫn gốc

        public bool IsCopy { get; set; }
        
        // Navigation property
        public virtual Portfolio? Portfolio { get; set; }
        public virtual DmLoaiVanBan? DocumentType { get; set; }
    }
}
