using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using Orderly.Services;

namespace Orderly.Controllers
{
    public class EventsController : ApiController
    {
        // GET: api/events
        [HttpGet]
        [Route("api/events")]
        public HttpResponseMessage GetEvents()
        {
            var response = Request.CreateResponse();
            response.Content = new PushStreamContent(async (stream, content, context) =>
            {
                var writer = new StreamWriter(stream, Encoding.UTF8);
                Timer keepAliveTimer = null;
                
                try
                {
                    // Client'ı kaydet
                    EventBroadcaster.AddClient(writer);

                    // Keep-alive mesajları gönder
                    keepAliveTimer = new Timer((state) =>
                    {
                        try
                        {
                            writer.WriteLine(": keep-alive\n");
                            writer.Flush();
                        }
                        catch
                        {
                            // Client bağlantısı kesilmiş
                            EventBroadcaster.RemoveClient(writer);
                            try
                            {
                                ((Timer)state)?.Dispose();
                            }
                            catch { }
                        }
                    }, null, TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(30));

                    // Bağlantıyı açık tut
                    try
                    {
                        await Task.Delay(Timeout.Infinite);
                    }
                    catch
                    {
                        // Bağlantı kapanınca buraya gelir
                    }
                }
                finally
                {
                    // Temizleme
                    try
                    {
                        keepAliveTimer?.Dispose();
                    }
                    catch { }
                    EventBroadcaster.RemoveClient(writer);
                    try
                    {
                        writer?.Dispose();
                    }
                    catch { }
                }
            }, "text/event-stream");

            response.Headers.Add("Cache-Control", "no-cache");
            response.Headers.Add("Connection", "keep-alive");
            
            return response;
        }
    }

    // Helper class for cleanup
    public class DisposableAction : IDisposable
    {
        private readonly Action _action;

        public DisposableAction(Action action)
        {
            _action = action;
        }

        public void Dispose()
        {
            _action?.Invoke();
        }
    }
}
