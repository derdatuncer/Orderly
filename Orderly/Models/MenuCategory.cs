using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orderly.Models
{
    [Table("menu_categories", Schema = "orderly")]
    public class MenuCategory
    {
        [Key]
        [Column("category_id")]
        public long CategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("category_name")]
        public string CategoryName { get; set; }

        [Required]
        [Column("sort_order")]
        public int SortOrder { get; set; }

        // Navigation property
        public virtual ICollection<MenuItem> Items { get; set; }
    }
}

