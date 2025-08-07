using System;
using System.Collections.Generic;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure;

public partial class AdminDbContext : DbContext
{
    public AdminDbContext(DbContextOptions<AdminDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<City> Cities { get; set; }

    public virtual DbSet<District> Districts { get; set; }

    public virtual DbSet<Portfolio> Portfolios { get; set; }

    public virtual DbSet<Document> Documents { get; set; }

    public virtual DbSet<DmPhong> DmPhongs { get; set; }

    public virtual DbSet<DmLoaiVanBan> DmLoaiVanBans { get; set; }

    public virtual DbSet<DmNhiemKy> DmNhiemKys { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Check if using PostgreSQL
        var isPostgreSQL = Database.IsNpgsql();

        modelBuilder.Entity<City>(entity =>
        {
            entity.ToTable("City");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Code).HasMaxLength(125);

            // Use database-specific default value for Created timestamp
            if (isPostgreSQL)
            {
                entity.Property(e => e.Created).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            }
            else
            {
                entity.Property(e => e.Created).HasDefaultValueSql("(getdate())");
            }

            entity.Property(e => e.Deleted).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Type).HasDefaultValue(2);
        });

        modelBuilder.Entity<District>(entity =>
        {
            entity.ToTable("District");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Code).HasMaxLength(125);

            // Use database-specific default value for Created timestamp
            if (isPostgreSQL)
            {
                entity.Property(e => e.Created).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            }
            else
            {
                entity.Property(e => e.Created).HasDefaultValueSql("(getdate())");
            }

            entity.Property(e => e.Deleted).HasDefaultValue(true);

            // Use database-specific decimal types
            if (isPostgreSQL)
            {
                entity.Property(e => e.HappyRate).HasColumnType("numeric(18, 2)");
                entity.Property(e => e.Population).HasColumnType("numeric(18, 0)");
            }
            else
            {
                entity.Property(e => e.HappyRate).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.Population).HasColumnType("decimal(18, 0)");
            }

            entity.Property(e => e.Name).HasMaxLength(255);

            entity.HasOne(d => d.IdCityNavigation).WithMany(p => p.Districts)
                .HasForeignKey(d => d.IdCity)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_District_City");
        });

        modelBuilder.Entity<Portfolio>(entity =>
        {
            entity.ToTable("Portfolio");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Code).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(500);

            // Use database-specific default value for Created timestamp
            if (isPostgreSQL)
            {
                entity.Property(e => e.Created).HasDefaultValueSql("NOW()  AT TIME ZONE 'UTC'");
            }
            else
            {
                entity.Property(e => e.Created).HasDefaultValueSql("(getdate())");
            }

            // Configure foreign key relationships
            entity.HasOne(d => d.Department).WithMany(p => p.Portfolios)
                .HasForeignKey(d => d.DepartmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Portfolio_DmPhong");

            entity.HasOne(d => d.Term).WithMany(p => p.Portfolios)
                .HasForeignKey(d => d.TermId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Portfolio_DmNhiemKy");
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.ToTable("Document");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.TrangSo);
            entity.Property(e => e.Title).HasMaxLength(1000);
            entity.Property(e => e.Summary).HasMaxLength(2000);
            entity.Property(e => e.DocumentSymbol).HasMaxLength(100);
            entity.Property(e => e.IssuingAgency).HasMaxLength(500);
            entity.Property(e => e.Signer).HasMaxLength(200);
            entity.Property(e => e.OriginalAddress).HasMaxLength(1000);
            entity.Property(e => e.OriginalPath).HasMaxLength(2000);

            // Use database-specific default value for Created timestamp
            if (isPostgreSQL)
            {
                entity.Property(e => e.Created).HasDefaultValueSql("NOW()  AT TIME ZONE 'UTC'");
            }
            else
            {
                entity.Property(e => e.Created).HasDefaultValueSql("(getdate())");
            }

            entity.HasOne(d => d.Portfolio).WithMany(p => p.Documents)
                .HasForeignKey(d => d.PortfolioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Document_Portfolio");

            entity.HasOne(d => d.DocumentType).WithMany(p => p.Documents)
                .HasForeignKey(d => d.DocumentTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Document_DmLoaiVanBan");
        });

        modelBuilder.Entity<DmPhong>(entity =>
        {
            entity.ToTable("DM_Phong");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Ma).HasMaxLength(50);
            entity.Property(e => e.Ten).HasMaxLength(500);

            // Use database-specific default value for Created timestamp
            if (isPostgreSQL)
            {
                entity.Property(e => e.Created).HasDefaultValueSql("NOW()  AT TIME ZONE 'UTC'");
            }
            else
            {
                entity.Property(e => e.Created).HasDefaultValueSql("(getdate())");
            }
        });

        modelBuilder.Entity<DmLoaiVanBan>(entity =>
        {
            entity.ToTable("DM_LoaiVanBan");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Ma).HasMaxLength(50);
            entity.Property(e => e.Ten).HasMaxLength(500);

            // Use database-specific default value for Created timestamp
            if (isPostgreSQL)
            {
                entity.Property(e => e.Created).HasDefaultValueSql("NOW()  AT TIME ZONE 'UTC'");
            }
            else
            {
                entity.Property(e => e.Created).HasDefaultValueSql("(getdate())");
            }
        });

        modelBuilder.Entity<DmNhiemKy>(entity =>
        {
            entity.ToTable("DM_NhiemKy");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Ten).HasMaxLength(500);

            // Use database-specific default value for Created timestamp
            if (isPostgreSQL)
            {
                entity.Property(e => e.Created).HasDefaultValueSql("NOW()  AT TIME ZONE 'UTC'");
            }
            else
            {
                entity.Property(e => e.Created).HasDefaultValueSql("(getdate())");
            }
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
