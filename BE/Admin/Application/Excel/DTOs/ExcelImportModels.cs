using System.ComponentModel.DataAnnotations;

namespace Application.Excel.DTOs
{
    public class ExcelImportResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int ImportedDocuments { get; set; }
        public int ImportedPortfolios { get; set; }
        public int ImportedDocumentTypes { get; set; }
        public int ImportedDepartments { get; set; }
        public int ImportedTerms { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
    }

    public class ExcelDocumentRow
    {
        // Cột D: Tên phông 
        public string TenPhong { get; set; } = string.Empty;
        
        // Cột E: Phông số
        public string PhongSo { get; set; } = string.Empty;
        
        // Cột F: Nhiệm kỳ 
        public string NhiemKy { get; set; } = string.Empty;
        
        // Cột G: Mục lục số 
        public int MucLucSo { get; set; }
        
        // Cột H: Hộp số 
        public int HopSo { get; set; }
        
        // Cột I: Hồ sơ số
        public string HoSoSo { get; set; } = string.Empty;
        
        // Cột J: Thời hạn bảo quản 
        public string ThoiHanBaoQuan { get; set; } = string.Empty;
        
        // Cột K: Tiêu đề hồ sơ 
        public string TieuDeHoSo { get; set; } = string.Empty;
        
        // Cột L: Ngày bắt đầu 
        public DateTime? NgayBatDau { get; set; }
        
        // Cột M: Ngày kết thúc 
        public DateTime? NgayKetThuc { get; set; }
        
        // Cột N: Tổng số văn bản trong hồ sơ 
        public int TongSoVanBan { get; set; }
        
        // Cột O: Số tờ (của hồ sơ)
        public int SoTo { get; set; }
        
        // Cột P: Số trang (của hồ sơ)
        public int SoTrang { get; set; }
        
        // Cột R: Tên cơ quan, tổ chức ban hành văn bản 
        public string CoQuanBanHanh { get; set; } = string.Empty;
        
        // Cột S: Số của văn bản 
        public int SoVanBan { get; set; }
        
        // Cột T: Ký hiệu của văn bản 
        public string KyHieuVanBan { get; set; } = string.Empty;

        public string SoKyHieu
        {
            get => $"{SoVanBan}/{KyHieuVanBan}";
        }
        
        // Cột X: Ngày ký 
        public DateTime? NgayKy { get; set; }
        
        // Cột Y: Thể loại văn bản 
        public string TheLoaiVanBan { get; set; } = string.Empty;
        
        // Cột Z: Ký hiệu tên loại văn bản 
        public string KyHieuLoaiVanBan { get; set; } = string.Empty;
        
        // Cột AA: Trích yếu nội dung 
        public string TrichYeu { get; set; } = string.Empty;
        
        // Cột AB: Người ký 
        public string NguoiKy { get; set; } = string.Empty;
        
        // Cột AC: Loại bản 
        public string LoaiBan { get; set; } = string.Empty;
        
        // Cột AD: Số lượng trang của văn bản 
        public int SoLuongTrangVanBan { get; set; }
        
        // Cột AG: Địa chỉ tài liệu gốc 
        public string DiaChiTaiLieuGoc { get; set; } = string.Empty;
        
        // Cột AI: Số thứ tự văn bản trong hồ sơ 
        public int SoThuTuTrongHoSo { get; set; }
        
        // Cột AQ: Path gốc 
        public string PathGoc { get; set; } = string.Empty;

        // Computed properties
        public bool IsCover => !string.IsNullOrEmpty(PathGoc) && PathGoc.ToUpper().EndsWith("BIA.PDF");
        public bool IsDocument => !IsCover;
    }
}
