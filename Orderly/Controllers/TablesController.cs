using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Http;
using Orderly.Models;

namespace Orderly.Controllers
{
    public class TablesController : ApiController
    {
        private OrderlyDbContext db = new OrderlyDbContext();

        // GET: api/tables
        [HttpGet]
        [Route("api/tables")]
        public IHttpActionResult GetTables()
        {
            try
            {
                // Tüm masaları getir
                var tables = db.DiningTables
                    .OrderBy(t => t.TableCode)
                    .ToList();

                // Aktif ticket'ları getir (her masa için en son aktif ticket)
                var allActiveTickets = db.Tickets
                    .Include(t => t.Items)
                    .Where(t => t.TableId.HasValue && (t.Status == "open" || t.Status == "printed"))
                    .OrderByDescending(t => t.OpenedAt)
                    .ToList()
                    .GroupBy(t => t.TableId.Value)
                    .Select(g => g.First())
                    .ToList();

                var result = tables.Select(t => 
                {
                    var activeTicket = allActiveTickets.FirstOrDefault(tk => tk.TableId == t.TableId);
                    
                    return new
                    {
                        tableId = t.TableId,
                        tableCode = t.TableCode,
                        status = activeTicket != null ? activeTicket.Status : "closed",
                        hasActiveTicket = activeTicket != null,
                        ticketId = activeTicket?.TicketId,
                        mealReady = activeTicket?.MealReady ?? false,
                        openedAt = activeTicket?.OpenedAt,
                        total = activeTicket != null ? activeTicket.Items.Sum(ti => ti.LineTotal) : 0
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/tables
        [HttpPost]
        [Route("api/tables")]
        public IHttpActionResult CreateTable([FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Masa kodu gerekli");

                string tableCode = data.tableCode?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(tableCode))
                    return BadRequest("Masa kodu gerekli");

                var table = new DiningTable
                {
                    TableCode = tableCode.Trim(),
                    Status = "closed"
                };

                db.DiningTables.Add(table);
                db.SaveChanges();

                return Ok(new { tableId = table.TableId, tableCode = table.TableCode, status = table.Status });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null &&
                    ex.InnerException.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("Bu masa kodu zaten kullanılıyor");
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // DELETE: api/tables/{id}
        [HttpDelete]
        [Route("api/tables/{id}")]
        public IHttpActionResult DeleteTable(long id)
        {
            try
            {
                var table = db.DiningTables.Find(id);
                if (table == null)
                    return NotFound();

                // Aktif ticket'ları bul ve sil (iptal et)
                var activeTickets = db.Tickets
                    .Include(t => t.Items)
                    .Where(t => t.TableId == id && (t.Status == "open" || t.Status == "printed"))
                    .ToList();

                foreach (var ticket in activeTickets)
                {
                    // Ticket items'ı sil (cascade delete ile otomatik olabilir ama manuel de yapabiliriz)
                    db.TicketItems.RemoveRange(ticket.Items);
                    db.Tickets.Remove(ticket);
                }

                // Masayı sil - Kapalı ticket'lar ON DELETE SET NULL sayesinde korunur (table_id NULL olur)
                db.DiningTables.Remove(table);
                db.SaveChanges();

                return Ok(new { message = "Masa silindi" });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET: api/tables/{id}/details
        [HttpGet]
        [Route("api/tables/{id}/details")]
        public IHttpActionResult GetTableDetails(long id)
        {
            try
            {
                var table = db.DiningTables.Find(id);
                if (table == null)
                    return NotFound();

                var tableInfo = new
                {
                    tableId = table.TableId,
                    tableCode = table.TableCode,
                    status = table.Status
                };

                // Aktif adisyon ve ürünleri
                var activeTicket = db.Tickets
                    .Include(t => t.Items)
                    .Where(t => t.TableId == id && (t.Status == "open" || t.Status == "printed"))
                    .OrderByDescending(t => t.OpenedAt)
                    .FirstOrDefault();

                object ticketInfo = null;
                List<object> items = new List<object>();

                if (activeTicket != null)
                {
                    ticketInfo = new
                    {
                        ticketId = activeTicket.TicketId,
                        status = activeTicket.Status,
                        openedAt = activeTicket.OpenedAt,
                        mealReady = activeTicket.MealReady,
                        total = activeTicket.Items.Sum(ti => ti.LineTotal)
                    };

                    // Ticket items'ı getir (item_name zaten kaydedilmiş)
                    var ticketItems = activeTicket.Items
                        .OrderBy(ti => ti.CreatedAt)
                        .ToList();

                    // Kategori bilgilerini al (tüm item_id'ler için tek seferde)
                    var itemIds = ticketItems
                        .Where(ti => ti.ItemId.HasValue)
                        .Select(ti => ti.ItemId.Value)
                        .Distinct()
                        .ToList();

                    var menuItems = db.MenuItems
                        .Include(mi => mi.Category)
                        .Where(mi => itemIds.Contains(mi.ItemId))
                        .ToList()
                        .ToDictionary(mi => mi.ItemId, mi => mi);

                    // Items'ı oluştur
                    items = ticketItems.Select(ti =>
                    {
                        string categoryName = "(Silinmiş Kategori)";
                        if (ti.ItemId.HasValue && menuItems.ContainsKey(ti.ItemId.Value))
                        {
                            var menuItem = menuItems[ti.ItemId.Value];
                            if (menuItem.Category != null)
                            {
                                categoryName = menuItem.Category.CategoryName;
                            }
                        }

                        return new
                        {
                            orderItemId = ti.OrderItemId,
                            quantity = ti.Quantity,
                            unitPrice = ti.UnitPrice,
                            lineTotal = ti.LineTotal,
                            itemName = ti.ItemName ?? "(Silinmiş Ürün)",
                            categoryName = categoryName
                        };
                    }).ToList<object>();
                }

                return Ok(new
                {
                    table = tableInfo,
                    ticket = ticketInfo,
                    items = items
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
