using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orderly.Models
{
    [Table("users", Schema = "orderly")]
    public class User
    {
        [Key]
        [Column("user_id")]
        public long UserId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("username")]
        public string Username { get; set; }

        [Required]
        [MaxLength(256)]
        [Column("password")]
        public string Password { get; set; }

        [Required]
        [MaxLength(16)]
        [Column("role")]
        public string Role { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}

