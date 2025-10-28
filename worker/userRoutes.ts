import { Hono } from "hono";
import { Env } from './core-utils';
import type { Product, ScanEvent } from '@shared/types';
import { GoogleSheetClient } from './googleSheetClient';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Scan routes
    app.post('/api/scans', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const body = await c.req.json<{ serialNumber: string, scanEvent: ScanEvent, location: string, clientId?: string }>();
        if (!body.serialNumber || !body.scanEvent || !body.location) return c.json({ success: false, error: 'Serial number, scan event, and location are required' }, 400);
        const result = await client.addScan(body.serialNumber, body.scanEvent, body.location, body.clientId);
        return c.json(result);
    });
    app.get('/api/logs', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const result = await client.getLogs();
        return c.json(result);
    });
    app.post('/api/logs/clear', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const result = await client.clearLogs();
        return c.json(result);
    });
    app.get('/api/summary', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const result = await client.getSummary();
        return c.json(result);
    });
    // Product routes
    app.get('/api/products', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const result = await client.getProducts();
        return c.json(result);
    });
    app.post('/api/products', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const product = await c.req.json<Product>();
        if (!product.id || !product.name) return c.json({ success: false, error: 'Product ID and name are required' }, 400);
        const result = await client.addProduct(product);
        return c.json(result);
    });
    app.delete('/api/products/:id', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const { id } = c.req.param();
        if (!id) return c.json({ success: false, error: 'Product ID is required' }, 400);
        const result = await client.deleteProduct(id);
        return c.json(result);
    });
    // User & Client routes
    app.get('/api/users', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const result = await client.getUsers();
        return c.json(result);
    });
    app.get('/api/b2b-clients', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const result = await client.getB2BClients();
        return c.json(result);
    });
    // Dashboard routes
    app.get('/api/cake-status', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const result = await client.getCakeStatus();
        return c.json(result);
    });
    app.get('/api/live-operations', async (c) => {
        const client = new GoogleSheetClient(c.env.GOOGLE_SCRIPT_API_KEY || '');
        const result = await client.getLiveOperationsData();
        return c.json(result);
    });
}
