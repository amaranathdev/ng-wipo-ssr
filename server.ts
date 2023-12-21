import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { Request, Response } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
const crypto = require('./crypto-js.min.js');
const bodyParser = require('body-parser');

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  server.get('/api/me', (req: any, res: any) => {
    const func = req.params[0];
    let r = 'wrong endpoint';
  
    if (func === 'me') {
      r = me();
    } else if (func === 'you') {
      r = you();
    }
    res.status(200).json({ r });
  });

  server.post('/api/search', bodyParser.json(), async (req, res) => {
    console.log('POST /api/search => ', req.body.searchTerms);
    const data = await search(req.body.searchTerms);
    res.status(200).send(JSON.stringify(data));
  });

  const search = async (searchTerms: string) =>   {
    console.log('search() => ', searchTerms); 
    try {
        const response = await fetch('https://www.wipo.int/patinformed/api/search', {
            method: 'POST',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({searchTerms: searchTerms,})
        });
        const body = await response.text();
        const decrypted = crypto.AES.decrypt(body, '~~~~####Adr1anA####~~~~').toString(crypto.enc.Utf8)
        return JSON.parse(decrypted);
    } catch (error) {
        console.error("ERROR ============>", error);
    }
  }

  server.get('/api/getCompanies', async (req, res) => {
    const data = await getCompanies();
    res.status(200).send(JSON.stringify(data));
  });

  const getCompanies = async () => {
    try {
      const response = await fetch('https://www.wipo.int/patinformed/api/getCompanies');
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  }


  
  const me = () => {
    return 'some data from "me" endpoint';
  };
  
  const you = () => {
    return 'some data from "you" endpoint';
  };

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
