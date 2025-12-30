using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orderly.Models
{
    [Table("menu_items", Schema = "orderly")]
    public class MenuItem
    {
        [Key]
        [Column("item_id")]
        public long ItemId { get; set; }

        [Required]
        [Column("category_id")]
        public long CategoryId { get; set; }

        [Required]
        [MaxLength(120)]
        [Column("item_name")]
        public string ItemName { get; set; }

        [Required]
        [Column("price")]
        public decimal Price { get; set; }

        [ForeignKey("CategoryId")]
        public virtual MenuCategory Category { get; set; }

        public virtual ICollection<ProductOption> Options { get; set; }
    }
}

