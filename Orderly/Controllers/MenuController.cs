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

        // GET: api/menu/items/{itemId}/options
        [HttpGet]
        [Route("api/menu/items/{itemId}/options")]
        public IHttpActionResult GetItemOptions(long itemId)
        {
            try
            {
                var options = db.ProductOptions
                    .Include(o => o.Values)
                    .Where(o => o.ItemId == itemId)
                    .OrderBy(o => o.SortOrder)
                    .ThenBy(o => o.OptionName)
                    .Select(o => new
                    {
                        optionId = o.OptionId,
                        optionName = o.OptionName,
                        optionType = o.OptionType,
                        sortOrder = o.SortOrder,
                        isActive = o.IsActive,
                        values = o.Values
                            .Where(v => v.IsActive)
                            .OrderBy(v => v.SortOrder)
                            .ThenBy(v => v.ValueName)
                            .Select(v => new
                            {
                                optionValueId = v.OptionValueId,
                                valueName = v.ValueName,
                                priceModifier = v.PriceModifier,
                                sortOrder = v.SortOrder
                            }).ToList()
                    })
                    .ToList();

                return Ok(options);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/menu/items/{itemId}/options
        [HttpPost]
        [Route("api/menu/items/{itemId}/options")]
        public IHttpActionResult CreateOption(long itemId, [FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Opsiyon bilgileri gerekli");

                var item = db.MenuItems.Find(itemId);
                if (item == null)
                    return NotFound();

                string optionName = data.optionName?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(optionName))
                    return BadRequest("Opsiyon adı gerekli");

                string optionType = data.optionType?.ToString() ?? "text";
                if (optionType != "select" && optionType != "text")
                    return BadRequest("Opsiyon tipi 'select' veya 'text' olmalı");

                int sortOrder = data.sortOrder != null ? Convert.ToInt32(data.sortOrder) : 0;
                bool isActive = data.isActive != null ? Convert.ToBoolean(data.isActive) : true;

                var option = new ProductOption
                {
                    ItemId = itemId,
                    OptionName = optionName.Trim(),
                    OptionType = optionType,
                    SortOrder = sortOrder,
                    IsActive = isActive
                };

                db.ProductOptions.Add(option);
                db.SaveChanges();

                return Ok(new
                {
                    optionId = option.OptionId,
                    optionName = option.OptionName,
                    optionType = option.OptionType,
                    sortOrder = option.SortOrder,
                    isActive = option.IsActive
                });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null)
                {
                    var innerMsg = ex.InnerException.InnerException.Message;
                    if (innerMsg.Contains("UNIQUE"))
                        return BadRequest("Bu ürün için bu opsiyon adı zaten kullanılıyor");
                }
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // PUT: api/menu/options/{optionId}
        [HttpPut]
        [Route("api/menu/options/{optionId}")]
        public IHttpActionResult UpdateOption(long optionId, [FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Opsiyon bilgileri gerekli");

                var option = db.ProductOptions.Find(optionId);
                if (option == null)
                    return NotFound();

                string optionName = data.optionName?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(optionName))
                    return BadRequest("Opsiyon adı gerekli");

                string optionType = data.optionType?.ToString() ?? option.OptionType;
                if (optionType != "select" && optionType != "text")
                    return BadRequest("Opsiyon tipi 'select' veya 'text' olmalı");

                int sortOrder = data.sortOrder != null ? Convert.ToInt32(data.sortOrder) : option.SortOrder;
                bool isActive = data.isActive != null ? Convert.ToBoolean(data.isActive) : option.IsActive;

                option.OptionName = optionName.Trim();
                option.OptionType = optionType;
                option.SortOrder = sortOrder;
                option.IsActive = isActive;

                db.SaveChanges();

                return Ok(new { message = "Opsiyon güncellendi" });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null)
                {
                    var innerMsg = ex.InnerException.InnerException.Message;
                    if (innerMsg.Contains("UNIQUE"))
                        return BadRequest("Bu ürün için bu opsiyon adı zaten kullanılıyor");
                }
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // DELETE: api/menu/options/{optionId}
        [HttpDelete]
        [Route("api/menu/options/{optionId}")]
        public IHttpActionResult DeleteOption(long optionId)
        {
            try
            {
                var option = db.ProductOptions.Find(optionId);
                if (option == null)
                    return NotFound();

                db.ProductOptions.Remove(option);
                db.SaveChanges();

                return Ok(new { message = "Opsiyon silindi" });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/menu/options/{optionId}/values
        [HttpPost]
        [Route("api/menu/options/{optionId}/values")]
        public IHttpActionResult CreateOptionValue(long optionId, [FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Opsiyon değeri bilgileri gerekli");

                var option = db.ProductOptions.Find(optionId);
                if (option == null)
                    return NotFound();

                if (option.OptionType != "select")
                    return BadRequest("Sadece 'select' tipindeki opsiyonlara değer eklenebilir");

                string valueName = data.valueName?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(valueName))
                    return BadRequest("Değer adı gerekli");

                decimal priceModifier = data.priceModifier != null ? Convert.ToDecimal(data.priceModifier) : 0;
                int sortOrder = data.sortOrder != null ? Convert.ToInt32(data.sortOrder) : 0;
                bool isActive = data.isActive != null ? Convert.ToBoolean(data.isActive) : true;

                var optionValue = new ProductOptionValue
                {
                    OptionId = optionId,
                    ValueName = valueName.Trim(),
                    PriceModifier = priceModifier,
                    SortOrder = sortOrder,
                    IsActive = isActive
                };

                db.ProductOptionValues.Add(optionValue);
                db.SaveChanges();

                return Ok(new
                {
                    optionValueId = optionValue.OptionValueId,
                    valueName = optionValue.ValueName,
                    priceModifier = optionValue.PriceModifier,
                    sortOrder = optionValue.SortOrder,
                    isActive = optionValue.IsActive
                });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null)
                {
                    var innerMsg = ex.InnerException.InnerException.Message;
                    if (innerMsg.Contains("UNIQUE"))
                        return BadRequest("Bu opsiyon için bu değer adı zaten kullanılıyor");
                }
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // PUT: api/menu/option-values/{valueId}
        [HttpPut]
        [Route("api/menu/option-values/{valueId}")]
        public IHttpActionResult UpdateOptionValue(long valueId, [FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Opsiyon değeri bilgileri gerekli");

                var optionValue = db.ProductOptionValues.Find(valueId);
                if (optionValue == null)
                    return NotFound();

                string valueName = data.valueName?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(valueName))
                    return BadRequest("Değer adı gerekli");

                decimal priceModifier = data.priceModifier != null ? Convert.ToDecimal(data.priceModifier) : optionValue.PriceModifier;
                int sortOrder = data.sortOrder != null ? Convert.ToInt32(data.sortOrder) : optionValue.SortOrder;
                bool isActive = data.isActive != null ? Convert.ToBoolean(data.isActive) : optionValue.IsActive;

                optionValue.ValueName = valueName.Trim();
                optionValue.PriceModifier = priceModifier;
                optionValue.SortOrder = sortOrder;
                optionValue.IsActive = isActive;

                db.SaveChanges();

                return Ok(new { message = "Opsiyon değeri güncellendi" });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null)
                {
                    var innerMsg = ex.InnerException.InnerException.Message;
                    if (innerMsg.Contains("UNIQUE"))
                        return BadRequest("Bu opsiyon için bu değer adı zaten kullanılıyor");
                }
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // DELETE: api/menu/option-values/{valueId}
        [HttpDelete]
        [Route("api/menu/option-values/{valueId}")]
        public IHttpActionResult DeleteOptionValue(long valueId)
        {
            try
            {
                var optionValue = db.ProductOptionValues.Find(valueId);
                if (optionValue == null)
                    return NotFound();

                db.ProductOptionValues.Remove(optionValue);
                db.SaveChanges();

                return Ok(new { message = "Opsiyon değeri silindi" });
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
