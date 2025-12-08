using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Http;
using Orderly.Models;

namespace Orderly.Controllers
{
    public class MenuController : ApiController
    {
        private OrderlyDbContext db = new OrderlyDbContext();

        // GET: api/menu
        [HttpGet]
        [Route("api/menu")]
        public IHttpActionResult GetMenu()
        {
            try
            {
                var categories = db.MenuCategories
                    .Include(c => c.Items)
                    .OrderBy(c => c.SortOrder)
                    .ThenBy(c => c.CategoryName)
                    .Select(c => new
                    {
                        categoryId = c.CategoryId,
                        categoryName = c.CategoryName,
                        sortOrder = c.SortOrder,
                        items = c.Items.OrderBy(i => i.ItemName).Select(i => new
                        {
                            itemId = i.ItemId,
                            itemName = i.ItemName,
                            price = i.Price
                        }).ToList()
                    })
                    .ToList();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET: api/menu/categories
        [HttpGet]
        [Route("api/menu/categories")]
        public IHttpActionResult GetCategories()
        {
            try
            {
                var categories = db.MenuCategories
                    .OrderBy(c => c.SortOrder)
                    .ThenBy(c => c.CategoryName)
                    .Select(c => new
                    {
                        categoryId = c.CategoryId,
                        categoryName = c.CategoryName,
                        sortOrder = c.SortOrder
                    })
                    .ToList();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/menu/categories
        [HttpPost]
        [Route("api/menu/categories")]
        public IHttpActionResult CreateCategory([FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Kategori adı gerekli");

                string categoryName = data.categoryName?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(categoryName))
                    return BadRequest("Kategori adı gerekli");

                //dynamic döndüğü için Convert.ToInt32 kullanıyoruz
                int sortOrder = data.sortOrder != null ? Convert.ToInt32(data.sortOrder) : 0;

                var category = new MenuCategory
                {
                    CategoryName = categoryName.Trim(),
                    SortOrder = sortOrder
                };

                db.MenuCategories.Add(category);
                db.SaveChanges();

                return Ok(new { categoryId = category.CategoryId, categoryName = category.CategoryName, sortOrder = category.SortOrder });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null &&
                    ex.InnerException.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("Bu kategori adı zaten kullanılıyor");
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // PUT: api/menu/categories/{id}
        [HttpPut]
        [Route("api/menu/categories/{id}")]
        public IHttpActionResult UpdateCategory(long id, [FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Kategori bilgileri gerekli");

                var category = db.MenuCategories.Find(id);
                if (category == null)
                    return NotFound();

                string categoryName = data.categoryName?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(categoryName))
                    return BadRequest("Kategori adı gerekli");

                int sortOrder = data.sortOrder != null ? Convert.ToInt32(data.sortOrder) : 0;

                category.CategoryName = categoryName.Trim();
                category.SortOrder = sortOrder;

                db.SaveChanges();

                return Ok(new { message = "Kategori güncellendi" });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null &&
                    ex.InnerException.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("Bu kategori adı zaten kullanılıyor");
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // DELETE: api/menu/categories/{id}
        [HttpDelete]
        [Route("api/menu/categories/{id}")]
        public IHttpActionResult DeleteCategory(long id)
        {
            try
            {
                var category = db.MenuCategories
                    .Include(c => c.Items)
                    .FirstOrDefault(c => c.CategoryId == id);

                if (category == null)
                    return NotFound();

                if (category.Items != null && category.Items.Count > 0)
                {
                    return BadRequest("Bu kategoride ürünler var. Önce ürünleri silin.");
                }

                db.MenuCategories.Remove(category);
                db.SaveChanges();

                return Ok(new { message = "Kategori silindi" });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/menu/items
        [HttpPost]
        [Route("api/menu/items")]
        public IHttpActionResult CreateItem([FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Ürün bilgileri gerekli");

                long categoryId = Convert.ToInt64(data.categoryId);
                string itemName = data.itemName?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(itemName))
                    return BadRequest("Ürün adı gerekli");

                decimal price = Convert.ToDecimal(data.price ?? 0);
                if (price < 0)
                    return BadRequest("Fiyat 0'dan küçük olamaz");

                var item = new MenuItem
                {
                    CategoryId = categoryId,
                    ItemName = itemName.Trim(),
                    Price = price
                };

                db.MenuItems.Add(item);
                db.SaveChanges();

                return Ok(new { itemId = item.ItemId, categoryId = item.CategoryId, itemName = item.ItemName, price = item.Price });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null)
                {
                    var innerMsg = ex.InnerException.InnerException.Message;
                    if (innerMsg.Contains("UNIQUE"))
                        return BadRequest("Bu kategoride bu ürün adı zaten kullanılıyor");
                    if (innerMsg.Contains("FOREIGN KEY"))
                        return BadRequest("Geçersiz kategori");
                }
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // PUT: api/menu/items/{id}
        [HttpPut]
        [Route("api/menu/items/{id}")]
        public IHttpActionResult UpdateItem(long id, [FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Ürün bilgileri gerekli");

                var item = db.MenuItems.Find(id);
                if (item == null)
                    return NotFound();

                long categoryId = Convert.ToInt64(data.categoryId);
                string itemName = data.itemName?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(itemName))
                    return BadRequest("Ürün adı gerekli");

                decimal price = Convert.ToDecimal(data.price ?? 0);
                if (price < 0)
                    return BadRequest("Fiyat 0'dan küçük olamaz");

                item.CategoryId = categoryId;
                item.ItemName = itemName.Trim();
                item.Price = price;

                db.SaveChanges();

                return Ok(new { message = "Ürün güncellendi" });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null)
                {
                    var innerMsg = ex.InnerException.InnerException.Message;
                    if (innerMsg.Contains("UNIQUE"))
                        return BadRequest("Bu kategoride bu ürün adı zaten kullanılıyor");
                    if (innerMsg.Contains("FOREIGN KEY"))
                        return BadRequest("Geçersiz kategori");
                }
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // DELETE: api/menu/items/{id}
        [HttpDelete]
        [Route("api/menu/items/{id}")]
        public IHttpActionResult DeleteItem(long id)
        {
            try
            {
                var item = db.MenuItems.Find(id);
                if (item == null)
                    return NotFound();

                // Ürün aktif ticket'larda kullanılıyor mu kontrol et
                var activeTicketCount = db.TicketItems
                    .Include(ti => ti.Ticket)
                    .Count(ti => ti.ItemId == id && 
                                (ti.Ticket.Status == "open" || ti.Ticket.Status == "printed"));

                if (activeTicketCount > 0)
                {
                    return BadRequest("Bu ürün aktif adisyonlarda kullanılıyor. Önce adisyonları kapatın.");
                }

                db.MenuItems.Remove(item);
                db.SaveChanges();

                return Ok(new { message = "Ürün silindi" });
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
