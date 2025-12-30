using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orderly.Models
{
    [Table("product_options", Schema = "orderly")]
    public class ProductOption
    {
        [Key]
        [Column("option_id")]
        public long OptionId { get; set; }

        [Required]
        [Column("item_id")]
        public long ItemId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("option_name")]
        public string OptionName { get; set; }

        [Required]
        [MaxLength(16)]
        [Column("option_type")]
        public string OptionType { get; set; } // 'select' or 'text'

        [Required]
        [Column("sort_order")]
        public int SortOrder { get; set; }

        [Required]
        [Column("is_active")]
        public bool IsActive { get; set; }

        [ForeignKey("ItemId")]
        public virtual MenuItem MenuItem { get; set; }

        public virtual ICollection<ProductOptionValue> Values { get; set; }
        public virtual ICollection<TicketItemOption> TicketItemOptions { get; set; }
    }
}
