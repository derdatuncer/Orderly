using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace Orderly.Models
{
    public class OrderlyDbContext : DbContext
    {
        public OrderlyDbContext() : base("OrderlyDB")
        {
            // Database initialization strategy
            Database.SetInitializer<OrderlyDbContext>(null);
        }

        public DbSet<User> Users { get; set; }
        public DbSet<DiningTable> DiningTables { get; set; }
        public DbSet<MenuCategory> MenuCategories { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketItem> TicketItems { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Remove pluralization convention
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            // Configure relationships
            modelBuilder.Entity<MenuItem>()
                .HasRequired(m => m.Category)
                .WithMany(c => c.Items)
                .HasForeignKey(m => m.CategoryId);

            modelBuilder.Entity<Ticket>()
                .HasOptional(t => t.Table)
                .WithMany()
                .HasForeignKey(t => t.TableId);

            modelBuilder.Entity<Ticket>()
                .HasRequired(t => t.OpenedByUser)
                .WithMany()
                .HasForeignKey(t => t.OpenedByUserId)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<Ticket>()
                .HasOptional(t => t.ClosedByUser)
                .WithMany()
                .HasForeignKey(t => t.ClosedByUserId)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<TicketItem>()
                .HasRequired(ti => ti.Ticket)
                .WithMany(t => t.Items)
                .HasForeignKey(ti => ti.TicketId)
                .WillCascadeOnDelete(true);

            modelBuilder.Entity<TicketItem>()
                .HasRequired(ti => ti.MenuItem)
                .WithMany()
                .HasForeignKey(ti => ti.ItemId)
                .WillCascadeOnDelete(false);

            base.OnModelCreating(modelBuilder);
        }
    }
}

