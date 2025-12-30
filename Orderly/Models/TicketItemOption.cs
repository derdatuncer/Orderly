using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orderly.Models
{
    [Table("ticket_item_options", Schema = "orderly")]
    public class TicketItemOption
    {
        [Key]
        [Column("ticket_item_option_id")]
        public long TicketItemOptionId { get; set; }

        [Required]
        [Column("ticket_item_id")]
        public long TicketItemId { get; set; }

        [Column("option_id")]
        public long? OptionId { get; set; }

        [Column("option_value_id")]
        public long? OptionValueId { get; set; }

        [MaxLength(500)]
        [Column("custom_text")]
        public string CustomText { get; set; }

        [Required]
        [Column("price_modifier")]
        public decimal PriceModifier { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [ForeignKey("TicketItemId")]
        public virtual TicketItem TicketItem { get; set; }

        [ForeignKey("OptionId")]
        public virtual ProductOption Option { get; set; }

        [ForeignKey("OptionValueId")]
        public virtual ProductOptionValue OptionValue { get; set; }
    }
}
