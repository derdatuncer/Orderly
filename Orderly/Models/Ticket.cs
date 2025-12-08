using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orderly.Models
{
    [Table("tickets", Schema = "orderly")]
    public class Ticket
    {
        [Key]
        [Column("ticket_id")]
        //[DatabaseGenerated(DatabaseGeneratedOption.Identity)] eklenebilir değer artmasını engellemek için hocaya sor
        public long TicketId { get; set; }

        [Column("table_id")]
        public long? TableId { get; set; }

        [Required]
        [Column("opened_by_user_id")]
        public long OpenedByUserId { get; set; }

        [Column("closed_by_user_id")]
        public long? ClosedByUserId { get; set; }

        [Required]
        [MaxLength(16)]
        [Column("status")]
        public string Status { get; set; }

        [Required]
        [Column("opened_at")]
        public DateTime OpenedAt { get; set; }

        [Column("closed_at")]
        public DateTime? ClosedAt { get; set; }

        [Required]
        [Column("meal_ready")]
        public bool MealReady { get; set; }

        [MaxLength(16)]
        [Column("closed_payment_method")]
        public string ClosedPaymentMethod { get; set; }

        [Column("closed_total")]
        public decimal? ClosedTotal { get; set; }

        // Navigation properties
        [ForeignKey("TableId")]
        public virtual DiningTable Table { get; set; }

        [ForeignKey("OpenedByUserId")]
        public virtual User OpenedByUser { get; set; }

        [ForeignKey("ClosedByUserId")]
        public virtual User ClosedByUser { get; set; }

        public virtual ICollection<TicketItem> Items { get; set; }
    }
}

