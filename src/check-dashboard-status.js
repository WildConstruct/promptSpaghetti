#!/usr/bin/env node

/**
 * Dashboard Status Checker
 * 
 * Simple script to check if the secure dashboard is running and accessible.
 */

const http = require('http');
const { execSync } = require('child_process');

const DEFAULT_PORT = process.env.PORT || 8080;
const DEFAULT_HOST = process.env.HOST || 'localhost';

function checkPort(port, host = 'localhost') {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: host,
            port: port,
            path: '/login',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            resolve({
                running: true,
                status: res.statusCode,
                port: port,
                host: host
            });
        });

        req.on('error', () => {
            resolve({
                running: false,
                port: port,
                host: host
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                running: false,
                port: port,
                host: host,
                error: 'timeout'
            });
        });

        req.end();
    });
}

async function checkDashboardStatus() {
    console.log('🔍 Checking Secure Dashboard Status...\n');

    // Check common ports
    const ports = [8080, 8081, 3000, 5000];
    const results = [];

    for (const port of ports) {
        const result = await checkPort(port);
        results.push(result);
        
        if (result.running) {
            console.log(`✅ Dashboard RUNNING on port ${port}`);
            console.log(`   Login URL: http://${result.host}:${port}/login`);
            console.log(`   Status: HTTP ${result.status}`);
            
            // Try to get network IP
            try {
                const networkIP = execSync('hostname -I 2>/dev/null || hostname', { encoding: 'utf8' }).trim().split(' ')[0];
                if (networkIP && networkIP !== 'localhost') {
                    console.log(`   Network: http://${networkIP}:${port}/login`);
                }
            } catch (e) {
                // Ignore hostname errors
            }
            
            console.log('');
        } else {
            console.log(`❌ No dashboard on port ${port}`);
        }
    }

    const runningCount = results.filter(r => r.running).length;
    
    if (runningCount === 0) {
        console.log('\n🚨 Secure Dashboard is NOT running');
        console.log('\n📋 To start the dashboard:');
        console.log('   ./start-secure-dashboard.sh');
        console.log('   # or');
        console.log('   npm start');
        console.log('   # or');
        console.log('   node secure-dashboard-server.js');
        
        return false;
    } else if (runningCount > 1) {
        console.log(`\n⚠️  Multiple dashboard instances running (${runningCount})`);
        console.log('   Consider stopping duplicates to avoid conflicts');
    } else {
        console.log('\n✅ Dashboard is running and accessible!');
        
        console.log('\n📋 Default Login Credentials:');
        console.log('   Username: admin');
        console.log('   Password: dashboard123');
        console.log('   🔐 Change these in production!');
        
        console.log('\n🌟 Dashboard Features:');
        console.log('   📊 Epic Status & Progress Tracking');
        console.log('   📈 Approval History & Charts');
        console.log('   📋 Task Management & Filtering');
        console.log('   📢 Agent Broadcasting System');
        console.log('   🔐 Secure Authentication');
    }

    return runningCount > 0;
}

// Process control check
async function checkProcesses() {
    try {
        const processes = execSync('ps aux | grep "secure-dashboard-server.js" | grep -v grep', { encoding: 'utf8' });
        if (processes.trim()) {
            console.log('\n🔄 Running Dashboard Processes:');
            const lines = processes.trim().split('\n');
            lines.forEach((line, i) => {
                const parts = line.split(/\s+/);
                const pid = parts[1];
                const cpu = parts[2];
                const mem = parts[3];
                console.log(`   ${i + 1}. PID ${pid} (CPU: ${cpu}%, Memory: ${mem}%)`);
            });
        }
    } catch (e) {
        // Ignore process check errors
    }
}

// File system check
function checkFiles() {
    const fs = require('fs');
    const path = require('path');
    
    console.log('\n📁 File System Status:');
    
    const files = [
        'secure-dashboard-server.js',
        'complete-dashboard.html', 
        'package.json',
        'data/state.json',
        'data/agent-broadcast.json'
    ];
    
    files.forEach(file => {
        const exists = fs.existsSync(path.join(__dirname, file));
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    });
}

// Main execution
async function main() {
    const isRunning = await checkDashboardStatus();
    
    if (process.argv.includes('--detailed') || process.argv.includes('-d')) {
        await checkProcesses();
        checkFiles();
    }
    
    if (process.argv.includes('--json')) {
        const status = {
            running: isRunning,
            timestamp: new Date().toISOString(),
            port: DEFAULT_PORT,
            host: DEFAULT_HOST
        };
        console.log(JSON.stringify(status, null, 2));
    }

    process.exit(isRunning ? 0 : 1);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { checkDashboardStatus, checkPort };