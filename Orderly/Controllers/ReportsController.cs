using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Http;
using Orderly.Models;

namespace Orderly.Controllers
{
    public class ReportsController : ApiController
    {
        private OrderlyDbContext db = new OrderlyDbContext();

        // GET: api/reports/daily-revenue
        [HttpGet]
        [Route("api/reports/daily-revenue")]
        public IHttpActionResult GetDailyRevenue(string startDate = null, string endDate = null)
        {
            try
            {
                DateTime start = DateTime.UtcNow.Date;
                DateTime end = DateTime.UtcNow.Date;

                if (!string.IsNullOrEmpty(startDate))
                {
                    if (!DateTime.TryParse(startDate, out start))
                        return BadRequest("Geçersiz başlangıç tarihi formatı");
                    start = start.Date;
                }

                if (!string.IsNullOrEmpty(endDate))
                {
                    if (!DateTime.TryParse(endDate, out end))
                        return BadRequest("Geçersiz bitiş tarihi formatı");
                    end = end.Date;
                }

                var dailyRevenue = db.Tickets
                    .Where(t => t.Status == "closed" && t.ClosedAt.HasValue)
                    .Where(t => DbFunctions.TruncateTime(t.ClosedAt.Value) >= start &&
                               DbFunctions.TruncateTime(t.ClosedAt.Value) <= end)
                    .GroupBy(t => DbFunctions.TruncateTime(t.ClosedAt.Value))
                    .Select(g => new
                    {
                        date = g.Key,
                        ticketCount = g.Count(),
                        totalRevenue = g.Sum(t => t.ClosedTotal ?? 0),
                        cashRevenue = g.Sum(t => t.ClosedPaymentMethod == "cash" ? (t.ClosedTotal ?? 0) : 0),
                        creditRevenue = g.Sum(t => t.ClosedPaymentMethod == "credit" ? (t.ClosedTotal ?? 0) : 0)
                    })
                    .OrderBy(r => r.date)
                    .ToList();

                return Ok(dailyRevenue);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET: api/reports/revenue-growth
        [HttpGet]
        [Route("api/reports/revenue-growth")]
        public IHttpActionResult GetRevenueGrowth(string startDate = null, string endDate = null)
        {
            try
            {
                DateTime start = DateTime.UtcNow.AddDays(-30).Date;
                DateTime end = DateTime.UtcNow.Date;

                if (!string.IsNullOrEmpty(startDate))
                {
                    if (!DateTime.TryParse(startDate, out start))
                        return BadRequest("Geçersiz başlangıç tarihi formatı");
                    start = start.Date;
                }

                if (!string.IsNullOrEmpty(endDate))
                {
                    if (!DateTime.TryParse(endDate, out end))
                        return BadRequest("Geçersiz bitiş tarihi formatı");
                    end = end.Date;
                }

                // Günlük hasılat verilerini al
                var dailyRevenue = db.Tickets
                    .Where(t => t.Status == "closed" && t.ClosedAt.HasValue)
                    .Where(t => DbFunctions.TruncateTime(t.ClosedAt.Value) >= start &&
                               DbFunctions.TruncateTime(t.ClosedAt.Value) <= end)
                    .GroupBy(t => DbFunctions.TruncateTime(t.ClosedAt.Value))
                    .Select(g => new
                    {
                        Date = g.Key,
                        Revenue = g.Sum(t => t.ClosedTotal ?? 0)
                    })
                    .OrderBy(r => r.Date)
                    .ToList();

                // Önceki gün verilerini hesapla
                var result = new List<object>();
                for (int i = 0; i < dailyRevenue.Count; i++)
                {
                    var current = dailyRevenue[i];
                    decimal? previousRevenue = null;
                    decimal? growthPercentage = null;

                    if (i > 0)
                    {
                        previousRevenue = dailyRevenue[i - 1].Revenue;
                        if (previousRevenue > 0)
                        {
                            growthPercentage = ((current.Revenue - previousRevenue.Value) / previousRevenue.Value) * 100;
                        }
                    }

                    result.Add(new
                    {
                        date = current.Date,
                        revenue = current.Revenue,
                        previousRevenue = previousRevenue,
                        growthPercentage = growthPercentage
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET: api/reports/summary
        [HttpGet]
        [Route("api/reports/summary")]
        public IHttpActionResult GetSummary(string startDate = null, string endDate = null)
        {
            try
            {
                DateTime start = DateTime.UtcNow.Date;
                DateTime end = DateTime.UtcNow.Date;

                if (!string.IsNullOrEmpty(startDate))
                {
                    if (!DateTime.TryParse(startDate, out start))
                        return BadRequest("Geçersiz başlangıç tarihi formatı");
                    start = start.Date;
                }

                if (!string.IsNullOrEmpty(endDate))
                {
                    if (!DateTime.TryParse(endDate, out end))
                        return BadRequest("Geçersiz bitiş tarihi formatı");
                    end = end.Date;
                }

                var tickets = db.Tickets
                    .Where(t => t.Status == "closed" && t.ClosedAt.HasValue)
                    .Where(t => DbFunctions.TruncateTime(t.ClosedAt.Value) >= start &&
                               DbFunctions.TruncateTime(t.ClosedAt.Value) <= end)
                    .ToList();

                var summary = new
                {
                    totalTickets = tickets.Count,
                    totalRevenue = tickets.Sum(t => t.ClosedTotal ?? 0),
                    avgTicketValue = tickets.Count > 0 ? tickets.Average(t => t.ClosedTotal ?? 0) : 0,
                    cashRevenue = tickets.Where(t => t.ClosedPaymentMethod == "cash").Sum(t => t.ClosedTotal ?? 0),
                    creditRevenue = tickets.Where(t => t.ClosedPaymentMethod == "credit").Sum(t => t.ClosedTotal ?? 0),
                    cashCount = tickets.Count(t => t.ClosedPaymentMethod == "cash"),
                    creditCount = tickets.Count(t => t.ClosedPaymentMethod == "credit")
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET: api/reports/top-selling-products
        [HttpGet]
        [Route("api/reports/top-selling-products")]
        public IHttpActionResult GetTopSellingProducts(string startDate = null, string endDate = null)
        {
            try
            {
                DateTime start = DateTime.UtcNow.Date;
                DateTime end = DateTime.UtcNow.Date;

                if (!string.IsNullOrEmpty(startDate))
                {
                    if (!DateTime.TryParse(startDate, out start))
                        return BadRequest("Geçersiz başlangıç tarihi formatı");
                    start = start.Date;
                }

                if (!string.IsNullOrEmpty(endDate))
                {
                    if (!DateTime.TryParse(endDate, out end))
                        return BadRequest("Geçersiz bitiş tarihi formatı");
                    end = end.Date;
                }

                var topProducts = db.TicketItems
                    .Where(ti => ti.Ticket.Status == "closed" && ti.Ticket.ClosedAt.HasValue)
                    .Where(ti => DbFunctions.TruncateTime(ti.Ticket.ClosedAt.Value) >= start &&
                               DbFunctions.TruncateTime(ti.Ticket.ClosedAt.Value) <= end)
                    .Where(ti => ti.ItemId.HasValue)
                    .GroupBy(ti => new { ti.ItemId, ti.ItemName })
                    .Select(g => new
                    {
                        itemId = g.Key.ItemId,
                        itemName = g.Key.ItemName ?? "Bilinmeyen Ürün",
                        totalQuantity = g.Sum(ti => ti.Quantity),
                        totalRevenue = g.Sum(ti => ti.LineTotal),
                        orderCount = g.Count()
                    })
                    .OrderByDescending(p => p.totalQuantity)
                    .Take(50)
                    .ToList();

                // Kategori bilgilerini al
                var itemIds = topProducts.Select(p => p.itemId.Value).ToList();
                var menuItems = db.MenuItems
                    .Include(mi => mi.Category)
                    .Where(mi => itemIds.Contains(mi.ItemId))
                    .ToList()
                    .ToDictionary(mi => mi.ItemId, mi => new { 
                        categoryName = mi.Category != null ? mi.Category.CategoryName : "Kategori Yok",
                        price = mi.Price
                    });

                var result = topProducts.Select(p => new
                {
                    itemId = p.itemId,
                    itemName = p.itemName,
                    categoryName = p.itemId.HasValue && menuItems.ContainsKey(p.itemId.Value) 
                        ? menuItems[p.itemId.Value].categoryName 
                        : "Kategori Yok",
                    totalQuantity = p.totalQuantity,
                    totalRevenue = p.totalRevenue,
                    orderCount = p.orderCount,
                    averagePrice = p.totalQuantity > 0 ? p.totalRevenue / p.totalQuantity : 0
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // Raw SQL sonuçları için helper class
        public class RevenueGrowthResult
        {
            public DateTime Date { get; set; }
            public decimal Revenue { get; set; }
            public decimal? PreviousRevenue { get; set; }
            public decimal? GrowthPercentage { get; set; }
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
