using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Orderly.Services
{
    public class EventBroadcaster
    {
        private static readonly List<StreamWriter> _clients = new List<StreamWriter>();
        private static readonly object _lock = new object();

        public static void AddClient(StreamWriter client)
        {
            lock (_lock)
            {
                _clients.Add(client);
            }
        }

        public static void RemoveClient(StreamWriter client)
        {
            lock (_lock)
            {
                if (_clients.Contains(client))
                {
                    _clients.Remove(client);
                }
            }
        }

        public static void Broadcast(string eventType, object data)
        {
            lock (_lock)
            {
                var jsonData = Newtonsoft.Json.JsonConvert.SerializeObject(data);
                var message = $"event: {eventType}\ndata: {jsonData}\n\n";

                var clientsToRemove = new List<StreamWriter>();

                foreach (var client in _clients)
                {
                    try
                    {
                        if (client != null && client.BaseStream != null && client.BaseStream.CanWrite)
                        {
                            client.Write(message);
                            client.Flush();
                        }
                        else
                        {
                            clientsToRemove.Add(client);
                        }
                    }
                    catch
                    {
                        clientsToRemove.Add(client);
                    }
                }

                foreach (var client in clientsToRemove)
                {
                    _clients.Remove(client);
                    try
                    {
                        client?.Dispose();
                    }
                    catch { }
                }
            }
        }
    }
}
