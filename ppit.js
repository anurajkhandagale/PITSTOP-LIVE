const http = require('http');

const port = 8080;

const htmlErrorPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unhandled Runtime Error</title>
    <style>
        body {
            background-color: #111;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 2rem;
        }
        .error-container {
            background-color: #222;
            border-left: 5px solid #ff4d4f;
            padding: 2rem;
            border-radius: 4px;
            max-width: 1200px;
            margin: 0 auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #ff4d4f;
            margin-top: 0;
            font-size: 24px;
        }
        h2 {
            color: #ffccc7;
            font-size: 18px;
            font-weight: normal;
            line-height: 1.5;
        }
        .stack-trace {
            background-color: #000;
            padding: 1.5rem;
            border-radius: 6px;
            overflow-x: auto;
            color: #a6adc8;
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            line-height: 1.6;
            margin-top: 1.5rem;
            border: 1px solid #333;
        }
        .highlight {
            color: #ff4d4f;
            font-weight: bold;
        }
        .dim {
            color: #666;
        }
        .terminal-like {
            color: #e2e8f0;
        }
        .file-path {
            color: #93c5fd;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>Unhandled Runtime Error</h1>
        <h2>Error: unable to run program demo pack over upgrade it to use the program</h2>
        
        <div class="stack-trace">
<span class="highlight">Error: unable to run program demo pack over upgrade it to use the program</span>
    <span class="terminal-like">at</span> checkLicense (<span class="file-path">d:\\new-pit-stop-live\\node_modules\\@demo-pack\\core\\license.js</span>:42:15)
    <span class="terminal-like">at</span> Module._compile (node:internal/modules/cjs/loader:1254:14)
    <span class="terminal-like">at</span> Object.Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    <span class="terminal-like">at</span> Module.load (node:internal/modules/cjs/loader:1117:32)
    <span class="terminal-like">at</span> Function.Module._load (node:internal/modules/cjs/loader:958:12)
    <span class="terminal-like">at</span> Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    <span class="terminal-like">at</span> node:internal/main/run_main_module:23:47
<span class="dim">    ... 15 more lines internal to Node.js</span>
        </div>
        <p style="margin-top: 2rem; color: #888; font-size: 12px;">Next.js (14.2.3) | Demo Pack Initialization Error</p>
    </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(htmlErrorPage);
});

server.listen(port, () => {
    // Fake Next.js startup logs
    console.log(`\n> Ready - started server on url: http://localhost:${port}`);
    console.log(`> event - compiled client and server successfully in 1245 ms (154 modules)`);
    console.log(`> wait  - compiling...`);
    
    // Simulate a crash a couple seconds later
    setTimeout(() => {
        console.error(`\n⨯ error - unhandledRejection: Error: unable to run program demo pack over upgrade it to use the program`);
        console.error(`    at checkLicense (d:\\new-pit-stop-live\\node_modules\\@demo-pack\\core\\license.js:42:15)`);
        console.error(`    at Module._compile (node:internal/modules/cjs/loader:1254:14)`);
        console.error(`\n> Visit http://localhost:${port} in your browser to view the full error overlay.\n`);
    }, 2000);
});
