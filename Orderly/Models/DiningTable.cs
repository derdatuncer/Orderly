using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orderly.Models
{
    [Table("dining_tables", Schema = "orderly")]
    public class DiningTable
    {
        [Key]
        [Column("table_id")]
        public long TableId { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("table_code")]
        public string TableCode { get; set; }

        [Required]
        [MaxLength(16)]
        [Column("status")]
        public string Status { get; set; }
    }
}

