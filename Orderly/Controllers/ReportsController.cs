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

        // GET: api/reports/daily-revenue?startDate=2024-10-01&endDate=2024-10-31
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

        // GET: api/reports/revenue-growth?startDate=2024-10-01&endDate=2024-10-31
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

                // Entity Framework'te LAG window function yok, bu yüzden raw SQL kullanıyoruz
                var revenueGrowth = db.Database.SqlQuery<RevenueGrowthResult>(@"
                    WITH DailyRevenue AS (
                        SELECT 
                            CAST(closed_at AS DATE) as date,
                            SUM(closed_total) as revenue
                        FROM orderly.tickets
                        WHERE status = 'closed'
                            AND closed_at IS NOT NULL
                            AND CAST(closed_at AS DATE) >= @p0
                            AND CAST(closed_at AS DATE) <= @p1
                        GROUP BY CAST(closed_at AS DATE)
                    )
                    SELECT 
                        date,
                        revenue,
                        LAG(revenue) OVER (ORDER BY date) as previous_revenue,
                        CASE 
                            WHEN LAG(revenue) OVER (ORDER BY date) > 0 
                            THEN ((revenue - LAG(revenue) OVER (ORDER BY date)) / LAG(revenue) OVER (ORDER BY date)) * 100
                            ELSE NULL
                        END as growth_percentage
                    FROM DailyRevenue
                    ORDER BY date", start, end).ToList();

                var result = revenueGrowth.Select(r => new
                {
                    date = r.Date,
                    revenue = r.Revenue,
                    previousRevenue = r.PreviousRevenue,
                    growthPercentage = r.GrowthPercentage
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET: api/reports/summary?startDate=2024-10-01&endDate=2024-10-31
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

        // Raw SQL sonuçları için helper class
        private class RevenueGrowthResult
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
