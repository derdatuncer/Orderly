using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orderly.Models
{
    [Table("product_option_values", Schema = "orderly")]
    public class ProductOptionValue
    {
        [Key]
        [Column("option_value_id")]
        public long OptionValueId { get; set; }

        [Required]
        [Column("option_id")]
        public long OptionId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("value_name")]
        public string ValueName { get; set; }

        [Required]
        [Column("price_modifier")]
        public decimal PriceModifier { get; set; }

        [Required]
        [Column("sort_order")]
        public int SortOrder { get; set; }

        [Required]
        [Column("is_active")]
        public bool IsActive { get; set; }

        [ForeignKey("OptionId")]
        public virtual ProductOption Option { get; set; }

        public virtual ICollection<TicketItemOption> TicketItemOptions { get; set; }
    }
}
