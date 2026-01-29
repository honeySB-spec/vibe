import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Ensure file exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

export interface User {
    username: string;
    publicKey: string;
    createdAt: number;
}

export const db = {
    getUser: (username: string): User | null => {
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        return data[username] || null;
    },
    createUser: (username: string, publicKey: string): boolean => {
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        if (data[username]) return false; // Already exists

        data[username] = {
            username,
            publicKey,
            createdAt: Date.now()
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        return true;
    }
};
