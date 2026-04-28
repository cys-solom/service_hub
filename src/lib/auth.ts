import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const getJWTSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
};

export interface JWTPayload {
    id: string;
    email: string;
    name: string;
}

export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, getJWTSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, getJWTSecret()) as JWTPayload;
    } catch {
        return null;
    }
}

export function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    const cookie = request.cookies.get('admin_token');
    return cookie?.value || null;
}

export function authenticateRequest(request: NextRequest): JWTPayload | null {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
}
