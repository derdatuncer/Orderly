using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Http;
using Orderly.Models;

namespace Orderly.Controllers
{
    public class UsersController : ApiController
    {
        private OrderlyDbContext db = new OrderlyDbContext();

        // GET: api/users
        [HttpGet]
        [Route("api/users")]
        public IHttpActionResult GetUsers()
        {
            try
            {
                var users = db.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Select(u => new
                    {
                        userId = u.UserId,
                        username = u.Username,
                        role = u.Role,
                        createdAt = u.CreatedAt
                    })
                    .ToList();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST: api/users
        [HttpPost]
        [Route("api/users")]
        public IHttpActionResult CreateUser([FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Kullanıcı bilgileri gerekli");

                string username = data.username?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(username))
                    return BadRequest("Kullanıcı adı gerekli");

                string password = data.password?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(password))
                    return BadRequest("Şifre gerekli");

                string role = data.role?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(role))
                    return BadRequest("Rol gerekli");

                // Rol kontrolü
                if (role != "admin" && role != "waiter" && role != "kitchen")
                    return BadRequest("Geçersiz rol. Rol 'admin', 'waiter' veya 'kitchen' olmalı");

                var user = new User
                {
                    Username = username.Trim(),
                    Password = password,
                    Role = role,
                    CreatedAt = DateTime.UtcNow
                };

                db.Users.Add(user);
                db.SaveChanges();

                return Ok(new { userId = user.UserId, username = user.Username, role = user.Role });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null &&
                    ex.InnerException.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("Bu kullanıcı adı zaten kullanılıyor");
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // PUT: api/users/{id}
        [HttpPut]
        [Route("api/users/{id}")]
        public IHttpActionResult UpdateUser(long id, [FromBody] dynamic data)
        {
            try
            {
                if (data == null)
                    return BadRequest("Kullanıcı bilgileri gerekli");

                string username = data.username?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(username))
                    return BadRequest("Kullanıcı adı gerekli");

                string password = data.password?.ToString();
                string role = data.role?.ToString() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(role))
                    return BadRequest("Rol gerekli");

                // Rol kontrolü
                if (role != "admin" && role != "waiter" && role != "kitchen")
                    return BadRequest("Geçersiz rol. Rol 'admin', 'waiter' veya 'kitchen' olmalı");

                var user = db.Users.Find(id);
                if (user == null)
                    return NotFound();

                user.Username = username.Trim();
                user.Role = role;

                // Şifre değiştiriliyorsa güncelle
                if (!string.IsNullOrWhiteSpace(password))
                {
                    user.Password = password;
                }

                db.SaveChanges();

                return Ok(new { message = "Kullanıcı güncellendi" });
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.InnerException != null &&
                    ex.InnerException.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("Bu kullanıcı adı zaten kullanılıyor");
                return InternalServerError(ex);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // DELETE: api/users/{id}
        [HttpDelete]
        [Route("api/users/{id}")]
        public IHttpActionResult DeleteUser(long id)
        {
            try
            {
                var user = db.Users.Find(id);
                if (user == null)
                    return NotFound();

                // Kullanıcı aktif ticket'larda kullanılıyor mu kontrol et (opened_by veya closed_by)
                var activeTicketCount = db.Tickets
                    .Count(t => (t.OpenedByUserId == id || t.ClosedByUserId == id) &&
                               (t.Status == "open" || t.Status == "printed"));

                if (activeTicketCount > 0)
                {
                    return BadRequest("Bu kullanıcı aktif adisyonlarda kullanılıyor. Önce adisyonları kapatın.");
                }

                db.Users.Remove(user);
                db.SaveChanges();

                return Ok(new { message = "Kullanıcı silindi" });
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
