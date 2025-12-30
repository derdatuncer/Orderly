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
        public DbSet<ProductOption> ProductOptions { get; set; }
        public DbSet<ProductOptionValue> ProductOptionValues { get; set; }
        public DbSet<TicketItemOption> TicketItemOptions { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

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
                .HasOptional(ti => ti.MenuItem)
                .WithMany()
                .HasForeignKey(ti => ti.ItemId)
                .WillCascadeOnDelete(false);

            // ProductOption relationships
            modelBuilder.Entity<ProductOption>()
                .HasRequired(po => po.MenuItem)
                .WithMany(mi => mi.Options)
                .HasForeignKey(po => po.ItemId)
                .WillCascadeOnDelete(true);

            modelBuilder.Entity<ProductOptionValue>()
                .HasRequired(pov => pov.Option)
                .WithMany(po => po.Values)
                .HasForeignKey(pov => pov.OptionId)
                .WillCascadeOnDelete(true);

            modelBuilder.Entity<TicketItemOption>()
                .HasRequired(tio => tio.TicketItem)
                .WithMany(ti => ti.Options)
                .HasForeignKey(tio => tio.TicketItemId)
                .WillCascadeOnDelete(true);

            modelBuilder.Entity<TicketItemOption>()
                .HasOptional(tio => tio.Option)
                .WithMany(po => po.TicketItemOptions)
                .HasForeignKey(tio => tio.OptionId)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<TicketItemOption>()
                .HasOptional(tio => tio.OptionValue)
                .WithMany(pov => pov.TicketItemOptions)
                .HasForeignKey(tio => tio.OptionValueId)
                .WillCascadeOnDelete(false);

            base.OnModelCreating(modelBuilder);
        }
    }
}

