using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Api
{
    public static class AuthEvents
    {
        [FunctionName("AuthEvents")]
        public static async Task<IActionResult> RunAsync(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "authevents")]
            HttpRequest req, ILogger log)
        {   
            var body = await new StreamReader(req.Body).ReadToEndAsync();
            Console.Out.WriteLine("body = {0}", body);

            return new NoContentResult();

        }
    }
}