using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orderly.Models
{
    [Table("ticket_items", Schema = "orderly")]
    public class TicketItem
    {
        [Key]
        [Column("order_item_id")]
        public long OrderItemId { get; set; }

        [Required]
        [Column("ticket_id")]
        public long TicketId { get; set; }

        [Column("item_id")]
        public long? ItemId { get; set; }

        [MaxLength(120)]
        [Column("item_name")]
        public string ItemName { get; set; }

        [Required]
        [Column("quantity")]
        public decimal Quantity { get; set; }

        [Required]
        [Column("unit_price")]
        public decimal UnitPrice { get; set; }

        [Column("line_total")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public decimal LineTotal { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        [ForeignKey("TicketId")]
        public virtual Ticket Ticket { get; set; }

        [ForeignKey("ItemId")]
        public virtual MenuItem MenuItem { get; set; }
    }
}

