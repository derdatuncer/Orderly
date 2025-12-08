using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Http;
using Orderly.Models;

namespace Orderly.Controllers
{
    public class TicketsController : ApiController
    {
        private OrderlyDbContext db = new OrderlyDbContext();

        // GET: api/tickets?status=open&date=2024-10-31
        [HttpGet]
        [Route("api/tickets")]
        public IHttpActionResult GetTickets(string status = "open", string date = null)
        {
            try
            {
                // Tarih kontrolü - default bugün
                DateTime filterDate;
                if (string.IsNullOrEmpty(date))
                {
                    filterDate = DateTime.UtcNow.Date;
                }
                else
                {
                    if (!DateTime.TryParse(date, out filterDate))
                    {
                        return BadRequest("Geçersiz tarih formatı");
                    }
                    filterDate = filterDate.Date;
                }

                // Status kontrolü
                if (status != "open" && status != "closed")
                {
                    return BadRequest("Status 'open' veya 'closed' olmalı");
                }

                IQueryable<Ticket> query;

                if (status == "closed")
                {
                    // Kapalı ticket'lar için closed_at'e göre filtrele
                    query = db.Tickets
                        .Include(t => t.Table)
                        .Include(t => t.OpenedByUser)
                        .Include(t => t.ClosedByUser)
                        .Include(t => t.Items)
                        .Where(t => t.ClosedAt.HasValue &&
                                   DbFunctions.TruncateTime(t.ClosedAt.Value) == filterDate &&
                                   t.Status == "closed");
                }
                else
                {
                    // Açık ticket'lar için opened_at'e göre filtrele
                    query = db.Tickets
                        .Include(t => t.Table)
                        .Include(t => t.OpenedByUser)
                        .Include(t => t.ClosedByUser)
                        .Include(t => t.Items)
                        .Where(t => DbFunctions.TruncateTime(t.OpenedAt) == filterDate &&
                                   (t.Status == "open" || t.Status == "printed"));
                }

                var tickets = query
                    .OrderByDescending(t => t.OpenedAt)
                    .ToList()
                    .Select(t => new
                    {
                        ticketId = t.TicketId,
                        tableId = t.TableId,
                        tableCode = t.Table != null ? t.Table.TableCode : "(Silinmiş Masa)",
                        status = t.Status,
                        openedAt = t.OpenedAt,
                        closedAt = t.ClosedAt,
                        closedTotal = t.ClosedTotal,
                        closedPaymentMethod = t.ClosedPaymentMethod,
                        total = t.Items.Sum(ti => ti.LineTotal),
                        openedBy = t.OpenedByUser?.Username,
                        closedBy = t.ClosedByUser?.Username
                    })
                    .ToList();

                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET: api/tickets/{id}/items
        [HttpGet]
        [Route("api/tickets/{id}/items")]
        public IHttpActionResult GetTicketItems(long id)
        {
            try
            {
                var ticketItems = db.TicketItems
                    .Where(ti => ti.TicketId == id)
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

                var items = ticketItems.Select(ti =>
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
                }).ToList();

                return Ok(items);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/tickets/open
        [HttpPost]
        [Route("api/tickets/open")]
        public IHttpActionResult OpenTicket([FromBody] dynamic data)
        {
            try
            {
                long tableId = data.tableId;
                long userId = data.userId ?? 1; // Geçici: userId daha sonra session'dan alınacak

                // Aktif adisyon var mı kontrol et
                var existingTicket = db.Tickets
                    .FirstOrDefault(t => t.TableId == tableId && (t.Status == "open" || t.Status == "printed"));

                if (existingTicket != null)
                    return BadRequest("Bu masada zaten aktif bir adisyon var");

                var ticket = new Ticket
                {
                    TableId = tableId,
                    OpenedByUserId = userId,
                    Status = "open",
                    OpenedAt = DateTime.UtcNow,
                    MealReady = false
                };

                db.Tickets.Add(ticket);
                db.SaveChanges();

                return Ok(new { ticketId = ticket.TicketId });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/tickets/{id}/print
        [HttpPost]
        [Route("api/tickets/{id}/print")]
        public IHttpActionResult PrintTicket(long id)
        {
            try
            {
                var ticket = db.Tickets.Find(id);
                if (ticket == null || ticket.Status != "open")
                    return NotFound();

                ticket.Status = "printed";
                db.SaveChanges();

                return Ok(new { message = "Adisyon yazdırıldı" });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/tickets/{id}/reopen
        [HttpPost]
        [Route("api/tickets/{id}/reopen")]
        public IHttpActionResult ReopenTicket(long id)
        {
            try
            {
                var ticket = db.Tickets.Find(id);
                if (ticket == null)
                    return NotFound();

                if (ticket.Status != "printed")
                    return BadRequest("Sadece yazdırılmış adisyonlar geri açılabilir");

                ticket.Status = "open";
                db.SaveChanges();

                return Ok(new { message = "Adisyon tekrar açıldı" });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/tickets/{id}/cancel
        [HttpPost]
        [Route("api/tickets/{id}/cancel")]
        public IHttpActionResult CancelTicket(long id)
        {
            try
            {
                var ticket = db.Tickets
                    .Include(t => t.Items)
                    .FirstOrDefault(t => t.TicketId == id);

                if (ticket == null)
                    return NotFound();

                if (ticket.Status != "open")
                    return BadRequest("Sadece açık adisyonlar iptal edilebilir");

                // İptal edilen adisyonu tamamen sil (0 liralık adisyon olmamalı)
                db.TicketItems.RemoveRange(ticket.Items);
                db.Tickets.Remove(ticket);
                db.SaveChanges();

                return Ok(new { message = "Adisyon iptal edildi ve silindi" });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/tickets/{id}/close
        [HttpPost]
        [Route("api/tickets/{id}/close")]
        public IHttpActionResult CloseTicket(long id, [FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("İstek gövdesi boş olamaz");

                string paymentMethod = data.paymentMethod?.ToString(); // "cash" veya "credit"
                long userId = data.userId != null ? Convert.ToInt64(data.userId) : 1; // Geçici: userId session'dan alınacak

                if (string.IsNullOrWhiteSpace(paymentMethod))
                    return BadRequest("Ödeme yöntemi gerekli ('cash' veya 'credit')");

                if (paymentMethod != "cash" && paymentMethod != "credit")
                    return BadRequest("Ödeme yöntemi 'cash' veya 'credit' olmalı");

                var ticket = db.Tickets
                    .Include(t => t.Items)
                    .FirstOrDefault(t => t.TicketId == id && (t.Status == "open" || t.Status == "printed"));

                if (ticket == null)
                    return BadRequest("Adisyon kapatılamadı. Adisyon bulunamadı veya zaten kapatılmış olabilir.");

                // Toplam hesapla
                var subtotal = ticket.Items.Sum(ti => ti.LineTotal);

                // İndirim varsa uygula
                decimal discount = 0;
                if (data.discount != null)
                {
                    if (decimal.TryParse(data.discount.ToString(), out decimal parsedDiscount))
                        discount = parsedDiscount;
                }

                // Servis ücreti varsa ekle
                decimal serviceCharge = 0;
                if (data.serviceCharge != null)
                {
                    if (decimal.TryParse(data.serviceCharge.ToString(), out decimal parsedServiceCharge))
                        serviceCharge = parsedServiceCharge;
                }

                // Final toplam = ara toplam - indirim + servis ücreti
                var total = subtotal - discount + serviceCharge;
                if (total < 0) total = 0;

                // Adisyonu kapat (trigger için meal_ready = 1 de set edilmeli)
                ticket.Status = "closed";
                ticket.ClosedByUserId = userId;
                ticket.ClosedAt = DateTime.UtcNow;
                ticket.ClosedPaymentMethod = paymentMethod;
                ticket.ClosedTotal = total;
                ticket.MealReady = true;

                db.SaveChanges();

                return Ok(new { message = "Adisyon kapatıldı", total });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/tickets/{id}/items
        [HttpPost]
        [Route("api/tickets/{id}/items")]
        public IHttpActionResult AddItem(long id, [FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Ürün bilgileri gerekli");

                // itemId kontrolü
                if (data.itemId == null)
                    return BadRequest("Ürün ID gerekli");

                long itemId;
                try
                {
                    itemId = Convert.ToInt64(data.itemId);
                }
                catch
                {
                    return BadRequest("Geçersiz ürün ID");
                }

                // quantity kontrolü
                decimal quantity = 1;
                if (data.quantity != null)
                {
                    try
                    {
                        quantity = Convert.ToDecimal(data.quantity);
                        if (quantity <= 0)
                            return BadRequest("Miktar 0'dan büyük olmalı");
                    }
                    catch
                    {
                        return BadRequest("Geçersiz miktar değeri");
                    }
                }

                // unitPrice kontrolü
                if (data.unitPrice == null)
                    return BadRequest("Fiyat gerekli");

                decimal unitPrice;
                try
                {
                    unitPrice = Convert.ToDecimal(data.unitPrice);
                    if (unitPrice < 0)
                        return BadRequest("Fiyat 0'dan küçük olamaz");
                }
                catch
                {
                    return BadRequest("Geçersiz fiyat değeri");
                }

                var ticket = db.Tickets.Find(id);
                if (ticket == null)
                    return NotFound();

                // Adisyon durumunu kontrol et (sadece 'open' durumunda ürün eklenebilir)
                if (ticket.Status != "open")
                    return BadRequest("Adisyon yazdırılmış, yeni ürün eklenemez");

                // Aynı ürün zaten var mı kontrol et (aynı item_id ve unit_price)
                var existingItem = db.TicketItems
                    .FirstOrDefault(ti => ti.TicketId == id &&
                                         ti.ItemId == itemId &&
                                         ti.UnitPrice == unitPrice);

                if (existingItem != null)
                {
                    // Aynı ürün varsa quantity'yi arttır
                    // LineTotal computed column olduğu için set etmiyoruz, veritabanı otomatik hesaplayacak
                    existingItem.Quantity += quantity;
                    db.SaveChanges();

                    return Ok(new { orderItemId = existingItem.OrderItemId, updated = true });
                }

                // Ürün adını al
                var menuItem = db.MenuItems.Find(itemId);
                if (menuItem == null)
                    return BadRequest("Ürün bulunamadı");

                // Yeni ürün ekle (item_name de kaydedilir)
                // LineTotal computed column olduğu için set etmiyoruz, veritabanı otomatik hesaplayacak
                var ticketItem = new TicketItem
                {
                    TicketId = id,
                    ItemId = itemId,
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    ItemName = menuItem.ItemName,
                    CreatedAt = DateTime.UtcNow
                };

                db.TicketItems.Add(ticketItem);
                db.SaveChanges();

                return Ok(new { orderItemId = ticketItem.OrderItemId, updated = false });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                string errorMessage = "Veritabanı hatası";
                string fullError = ex.ToString();
                
                if (ex.InnerException != null)
                {
                    if (ex.InnerException.InnerException != null)
                    {
                        var innerMsg = ex.InnerException.InnerException.Message;
                        if (innerMsg.Contains("FOREIGN KEY"))
                            return BadRequest("Geçersiz adisyon veya ürün");
                        errorMessage = innerMsg;
                        fullError = innerMsg;
                    }
                    else
                    {
                        errorMessage = ex.InnerException.Message;
                        fullError = ex.InnerException.ToString();
                    }
                }
                // Development için detaylı hata mesajı - BadRequest (400) döndür
                return BadRequest($"Veritabanı hatası: {errorMessage}");
            }
            catch (System.Data.Entity.Validation.DbEntityValidationException ex)
            {
                var errorMessages = ex.EntityValidationErrors
                    .SelectMany(e => e.ValidationErrors)
                    .Select(e => e.ErrorMessage);
                return BadRequest($"Doğrulama hatası: {string.Join(", ", errorMessages)}");
            }
            catch (Exception ex)
            {
                // Development için detaylı hata mesajı - BadRequest (400) döndür, InternalServerError (500) değil
                string errorMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    errorMessage += $" | Inner: {ex.InnerException.Message}";
                }
                // Stack trace'i de ekle (development için)
                errorMessage += $" | Type: {ex.GetType().Name}";
                return BadRequest($"Hata: {errorMessage}");
            }
        }

        // DELETE: api/tickets/items/{itemId}
        [HttpDelete]
        [Route("api/tickets/items/{itemId}")]
        public IHttpActionResult RemoveItem(long itemId, [FromBody] dynamic data)
        {
            try
            {
                // Not: Bu işlem sadece admin rolü için olmalı, şimdilik kontrol yok
                var ticketItem = db.TicketItems.Find(itemId);
                if (ticketItem == null)
                    return NotFound();

                var ticketId = ticketItem.TicketId;

                // Quantity 1'den fazlaysa azalt, değilse sil
                // LineTotal computed column olduğu için set etmiyoruz, veritabanı otomatik hesaplayacak
                if (ticketItem.Quantity > 1)
                {
                    ticketItem.Quantity -= 1;
                    db.SaveChanges();
                }
                else
                {
                    db.TicketItems.Remove(ticketItem);
                    db.SaveChanges();
                }

                // Ticket'ın başka item'ı kaldı mı kontrol et
                var remainingItems = db.TicketItems.Count(ti => ti.TicketId == ticketId);

                // Eğer hiç item kalmadıysa ticket'ı tamamen sil (0 liralık adisyon olmamalı)
                if (remainingItems == 0)
                {
                    var ticket = db.Tickets.FirstOrDefault(t => t.TicketId == ticketId && 
                                                               (t.Status == "open" || t.Status == "printed"));
                    if (ticket != null)
                    {
                        db.Tickets.Remove(ticket);
                        db.SaveChanges();
                    }
                }

                return Ok(new { message = "Ürün silindi" });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/tickets/{id}/discount
        [HttpPost]
        [Route("api/tickets/{id}/discount")]
        public IHttpActionResult ApplyDiscount(long id, [FromBody] dynamic data)
        {
            try
            {
                decimal discount = data.discount ?? 0;
                // Not: İndirim sadece kapatma sırasında uygulanacak
                // Bu endpoint sadece bilgilendirme amaçlı
                return Ok(new { message = "İndirim uygulanacak", discount });
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
